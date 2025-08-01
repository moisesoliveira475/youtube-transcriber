"""
Service wrapper para operações de transcrição
Encapsula a lógica existente do main.py para uso via API
"""
import os
import sys
import threading
import traceback
from pathlib import Path
from typing import Dict, Any, List
from src.config import AUDIO_DIR, TRANSCRIPT_DIR, DEFAULT_EXCEL_FILENAME
from api.services.job_manager import job_manager

# Add project root to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)


class TranscriptionService:
    def __init__(self):
        # Import existing functions
        try:
            from src.main import process_all
            from src.download_audio import download_audio
            from src.utils.extract_video_id import extract_video_id
            self.process_all = process_all
            self.download_audio = download_audio
            self.extract_video_id = extract_video_id
        except ImportError as e:
            print(f"Error importing modules: {e}")
            raise
    
    def start_transcription_job(self, urls: List[str], options: Dict[str, Any]) -> str:
        """
        Inicia um job de transcrição em background
        
        Args:
            urls: Lista de URLs do YouTube
            options: Opções de transcrição (playlist_mode, ignore_existing, etc.)
        
        Returns:
            job_id: ID do job criado
        """
        # Cria job no job manager
        job_data = {
            'urls': urls,
            'options': options,
            'total_urls': len(urls)
        }
        
        job_id = job_manager.create_job('transcription', job_data)
        
        # Executa em background thread
        thread = threading.Thread(
            target=self._run_transcription,
            args=(job_id, urls, options),
            daemon=True
        )
        thread.start()
        
        return job_id
    
    def _run_transcription(self, job_id: str, urls: List[str], options: Dict[str, Any]):
        """
        Executa o processo de transcrição em background
        """
        try:
            job_manager.update_job(job_id, status='processing', step='Starting transcription...')
            job_manager.add_log(job_id, "Job iniciado para transcrição de vídeos.")
            job_manager.add_step(job_id, "download", "Download do Áudio", status="pending", message="Aguardando download...")
            job_manager.add_step(job_id, "transcription", "Transcrição", status="pending", message="Aguardando transcrição...")
            job_manager.add_step(job_id, "split", "Divisão em Blocos", status="pending", message="Aguardando divisão...")
            job_manager.add_step(job_id, "excel", "Exportação Excel", status="pending", message="Aguardando exportação...")
            job_manager.add_step(job_id, "ai-analysis", "Análise IA (Opcional)", status="pending", message="Aguardando análise IA...")

            # Se não for only_excel, precisa criar arquivo videos.txt
            process_options = {
                'only_excel': options.get('only_excel', False),
                'playlist_mode': options.get('playlist_mode', False),
                'video_id_filter': options.get('video_id_filter'),
                'ignore_existing': options.get('ignore_existing', False),
                'use_whisper': options.get('use_whisper', False),
                'ai_analysis': options.get('ai_analysis', False),
                'target_person': options.get('target_person')
            }
            if not process_options['only_excel']:
                videos_file = Path(project_root) / "videos.txt"
                with open(videos_file, 'w', encoding='utf-8') as f:
                    for url in urls:
                        f.write(f"{url}\n")
                job_manager.add_log(job_id, f"Arquivo videos.txt criado com {len(urls)} URLs.")
                job_manager.update_step_status(job_id, "download", "in-progress", message="Baixando áudio...")
                job_manager.update_job(job_id, step=f'Processing {len(urls)} URLs...', progress=10)

            # Download do áudio
            # (Ideal: hook/callback para cada vídeo, mas aqui é simplificado)
            job_manager.add_log(job_id, "Iniciando download do áudio.")
            job_manager.update_step_status(job_id, "download", "in-progress", message="Baixando áudio...")
            # ...existing code...
            result = self.process_all(
                audio_dir=str(AUDIO_DIR),
                transcript_dir=str(TRANSCRIPT_DIR),
                excel_name=DEFAULT_EXCEL_FILENAME,
                **process_options
            )
            job_manager.add_log(job_id, "Download do áudio concluído.")
            job_manager.update_step_status(job_id, "download", "completed", message="Download concluído.")
            job_manager.update_step_status(job_id, "transcription", "in-progress", message="Transcrevendo áudio...")
            job_manager.add_log(job_id, "Iniciando transcrição.")
            # (O process_all executa tudo, mas para feedback, marcamos as etapas)
            job_manager.update_step_status(job_id, "transcription", "completed", message="Transcrição concluída.")
            job_manager.update_step_status(job_id, "split", "in-progress", message="Dividindo em blocos...")
            job_manager.add_log(job_id, "Dividindo transcrição em blocos.")
            job_manager.update_step_status(job_id, "split", "completed", message="Divisão concluída.")
            job_manager.update_step_status(job_id, "excel", "in-progress", message="Exportando para Excel...")
            job_manager.add_log(job_id, "Exportando para Excel.")
            job_manager.update_step_status(job_id, "excel", "completed", message="Exportação concluída.")
            if process_options.get('ai_analysis'):
                job_manager.update_step_status(job_id, "ai-analysis", "in-progress", message="Executando análise IA...")
                job_manager.add_log(job_id, "Executando análise IA.")
                job_manager.update_step_status(job_id, "ai-analysis", "completed", message="Análise IA concluída.")
            else:
                job_manager.update_step_status(job_id, "ai-analysis", "pending", message="Análise IA não solicitada.")
            job_manager.update_job(job_id, step='Finishing up...', progress=90)
            # Prepara resultado
            result_data = {
                'success': True,
                'excel_file': result if isinstance(result, str) else None,
                'processed_urls': len(urls)
            }
            job_manager.add_log(job_id, "Processamento finalizado.")
            job_manager.complete_job(job_id, result_data)
        except Exception as e:
            error_msg = f"Error in transcription: {str(e)}"
            print(f"Transcription error for job {job_id}: {error_msg}")
            print(traceback.format_exc())
            job_manager.add_log(job_id, f"Erro: {error_msg}")
            job_manager.fail_job(job_id, error_msg)
    
    def transcribe_single_video(self, url: str, options: Dict[str, Any]) -> str:
        """
        Wrapper para transcrever um único vídeo
        """
        return self.start_transcription_job([url], options)
    
    def get_video_info(self, url: str) -> Dict[str, Any]:
        """
        Extrai informações básicas de um vídeo do YouTube
        """
        try:
            video_id = self.extract_video_id(url)
            return {
                'success': True,
                'video_id': video_id,
                'url': url
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'url': url
            }

# Instância global do serviço
transcription_service = TranscriptionService()
