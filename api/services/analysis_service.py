"""
Service wrapper para análise de IA
Encapsula a lógica existente do ai_analysis para uso via API
"""
import os
import sys
import threading
import traceback
from pathlib import Path
from typing import Dict, Any, Optional

# Add project root to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.config import EXCEL_OUTPUT_DIR
from api.services.job_manager import job_manager

class AnalysisService:
    def __init__(self):
        # Import existing AI analysis classes
        try:
            from src.ai_analysis import ContentClassifier
            self.ContentClassifier = ContentClassifier
        except ImportError as e:
            print(f"Error importing AI analysis modules: {e}")
            self.ContentClassifier = None
    
    def start_analysis_job(self, excel_file: str, options: Dict[str, Any]) -> str:
        """
        Inicia um job de análise de IA em background
        
        Args:
            excel_file: Caminho para o arquivo Excel
            options: Opções de análise (target_person, with_explanation, etc.)
        
        Returns:
            job_id: ID do job criado
        """
        if not self.ContentClassifier:
            raise ValueError("AI Analysis modules not available")
        
        # Cria job no job manager
        job_data = {
            'excel_file': excel_file,
            'options': options
        }
        
        job_id = job_manager.create_job('analysis', job_data)
        
        # Executa em background thread
        thread = threading.Thread(
            target=self._run_analysis,
            args=(job_id, excel_file, options),
            daemon=True
        )
        thread.start()
        
        return job_id
    
    def _run_analysis(self, job_id: str, excel_file: str, options: Dict[str, Any]):
        """
        Executa o processo de análise de IA em background
        """
        try:
            job_manager.update_job(job_id, status='processing', step='Starting AI analysis...')
            
            # Resolve caminho completo do arquivo Excel
            if not os.path.isabs(excel_file):
                excel_path = EXCEL_OUTPUT_DIR / excel_file
            else:
                excel_path = Path(excel_file)
            
            if not excel_path.exists():
                raise FileNotFoundError(f"Excel file not found: {excel_path}")
            
            job_manager.update_job(job_id, step='Initializing AI classifier...', progress=10)
            
            # Inicializa o classificador
            classifier = self.ContentClassifier()
            
            # Prepara opções
            analysis_options = {
                'target_person': options.get('target_person'),
                'with_explanation': options.get('with_explanation', False),
                'resume': options.get('resume', False)
            }
            
            job_manager.update_job(job_id, step='Running AI analysis...', progress=20)
            
            # Executa a análise
            result_file = classifier.analyze_excel_file(
                str(excel_path),
                **analysis_options
            )
            
            job_manager.update_job(job_id, step='Finishing analysis...', progress=90)
            
            # Prepara resultado
            result_data = {
                'success': True,
                'input_file': str(excel_path),
                'output_file': result_file,
                'analysis_options': analysis_options
            }
            
            job_manager.complete_job(job_id, result_data)
            
        except Exception as e:
            error_msg = f"Error in AI analysis: {str(e)}"
            print(f"Analysis error for job {job_id}: {error_msg}")
            print(traceback.format_exc())
            job_manager.fail_job(job_id, error_msg)
    
    def list_available_excel_files(self) -> list:
        """
        Lista arquivos Excel disponíveis para análise
        """
        excel_files = []
        
        if EXCEL_OUTPUT_DIR.exists():
            for file_path in EXCEL_OUTPUT_DIR.glob("*.xlsx"):
                if not file_path.name.endswith('_ai_analysis.xlsx'):
                    excel_files.append({
                        'filename': file_path.name,
                        'path': str(file_path),
                        'size': file_path.stat().st_size,
                        'modified': file_path.stat().st_mtime
                    })
        
        # Ordena por data de modificação (mais recente primeiro)
        excel_files.sort(key=lambda x: x['modified'], reverse=True)
        return excel_files

# Instância global do serviço
analysis_service = AnalysisService()
