"""
Gertry:
    from ..utils.logger import get_logger
    from ..config import SUMMARIES_DIR
except ImportError:
    from utils.logger import get_logger
    from config import SUMMARIES_DIRor de resumos de vídeo usando IA.
"""
from pathlib import Path
from typing import Optional
from .vertex_client import VertexAIClient
from .prompt_templates import PromptTemplates
from ..utils.logger import setup_logger
from ..config import SUMMARIES_DIR

logger = setup_logger(__name__)


class SummaryGenerator:
    """Gera resumos de vídeos usando IA."""
    
    def __init__(self):
        """Inicializa o gerador de resumos."""
        self.client = VertexAIClient()
        self.summaries_dir = Path(SUMMARIES_DIR)
        self.summaries_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_summary_file_path(self, video_id: str) -> Path:
        """
        Retorna o caminho do arquivo de resumo.
        
        Args:
            video_id: ID do vídeo
            
        Returns:
            Caminho para o arquivo de resumo
        """
        return self.summaries_dir / f"{video_id}_summary.txt"
    
    def _load_full_transcription(self, video_id: str) -> Optional[str]:
        """
        Carrega a transcrição completa do vídeo.
        
        Args:
            video_id: ID do vídeo
            
        Returns:
            Texto completo da transcrição ou None se não encontrado
        """
        try:
            from ..config import WORDS_DIR
        except ImportError:
            from config import WORDS_DIR
        
        txt_file = Path(WORDS_DIR) / f"{video_id}.txt"
        
        if txt_file.exists():
            try:
                with open(txt_file, 'r', encoding='utf-8') as f:
                    return f.read().strip()
            except Exception as e:
                logger.error(f"Erro ao ler transcrição de {video_id}: {e}")
                return None
        
        logger.warning(f"Arquivo de transcrição não encontrado: {txt_file}")
        return None
    
    def has_summary(self, video_id: str) -> bool:
        """
        Verifica se já existe resumo para o vídeo.
        
        Args:
            video_id: ID do vídeo
            
        Returns:
            True se o resumo já existe
        """
        return self._get_summary_file_path(video_id).exists()
    
    def load_summary(self, video_id: str) -> Optional[str]:
        """
        Carrega resumo existente do vídeo.
        
        Args:
            video_id: ID do vídeo
            
        Returns:
            Resumo do vídeo ou None se não existir
        """
        summary_file = self._get_summary_file_path(video_id)
        
        if summary_file.exists():
            try:
                with open(summary_file, 'r', encoding='utf-8') as f:
                    return f.read().strip()
            except Exception as e:
                logger.error(f"Erro ao carregar resumo de {video_id}: {e}")
                return None
        
        return None
    
    async def generate_summary(self, video_id: str, force_regenerate: bool = False) -> Optional[str]:
        """
        Gera resumo para um vídeo.
        
        Args:
            video_id: ID do vídeo
            force_regenerate: Se True, regenera mesmo se já existir
            
        Returns:
            Resumo gerado ou None em caso de erro
        """
        summary_file = self._get_summary_file_path(video_id)
        
        # Verifica se já existe e não deve regenerar
        if not force_regenerate and summary_file.exists():
            logger.info(f"Resumo já existe para {video_id}, carregando existente")
            return self.load_summary(video_id)
        
        # Carrega transcrição completa
        full_transcription = self._load_full_transcription(video_id)
        if not full_transcription:
            logger.error(f"Não foi possível carregar transcrição para {video_id}")
            return None
        
        try:
            logger.info(f"Gerando resumo para {video_id}")
            
            # Gera prompt e chama IA
            prompt = PromptTemplates.get_summary_prompt(full_transcription)
            summary = await self.client.generate_content_async(prompt)
            
            # Salva resumo
            with open(summary_file, 'w', encoding='utf-8') as f:
                f.write(summary)
            
            logger.info(f"Resumo salvo para {video_id}")
            return summary
            
        except Exception as e:
            logger.error(f"Erro ao gerar resumo para {video_id}: {e}")
            return None
    
    async def generate_summaries_for_videos(self, video_ids: list, force_regenerate: bool = False) -> dict:
        """
        Gera resumos para múltiplos vídeos.
        
        Args:
            video_ids: Lista de IDs de vídeos
            force_regenerate: Se True, regenera mesmo se já existir
            
        Returns:
            Dicionário com video_id -> resumo
        """
        summaries = {}
        
        for video_id in video_ids:
            summary = await self.generate_summary(video_id, force_regenerate)
            if summary:
                summaries[video_id] = summary
            else:
                logger.warning(f"Falha ao gerar resumo para {video_id}")
        
        return summaries
