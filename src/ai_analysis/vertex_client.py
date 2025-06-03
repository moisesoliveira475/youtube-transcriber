"""
Cltry:
    from ..utils.logger import get_logger
    from ..config import (
        AI_MODEL, AI_CONCURRENT_REQUESTS, AI_REQUEST_DELAY, 
        AI_MAX_RETRIES, AI_BASE_RETRY_DELAY
    )
except ImportError:
    from utils.logger import get_logger
    from config import (
        AI_MODEL, AI_CONCURRENT_REQUESTS, AI_REQUEST_DELAY, 
        AI_MAX_RETRIES, AI_BASE_RETRY_DELAY
    ) para Vertex AI utilizando Gemini models.
"""
import asyncio
from typing import List
from vertexai.generative_models import GenerativeModel, HarmCategory, HarmBlockThreshold, SafetySetting
from ..utils.logger import setup_logger
from ..config import (
    AI_MODEL, AI_CONCURRENT_REQUESTS, AI_REQUEST_DELAY, 
    AI_MAX_RETRIES, AI_BASE_RETRY_DELAY
)

logger = setup_logger(__name__)


class VertexAIClient:
    """Cliente para interação com Vertex AI Gemini models."""
    
    def __init__(self):
        """Inicializa o cliente Vertex AI."""
        self.model = GenerativeModel(AI_MODEL)
        self.semaphore = asyncio.Semaphore(AI_CONCURRENT_REQUESTS)
        
        # Configurações de segurança para evitar bloqueios
        self.safety_settings = [
            SafetySetting(category=HarmCategory.HARM_CATEGORY_HARASSMENT, threshold=HarmBlockThreshold.BLOCK_NONE),
            SafetySetting(category=HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold=HarmBlockThreshold.BLOCK_NONE),
            SafetySetting(category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold=HarmBlockThreshold.BLOCK_NONE),
            SafetySetting(category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold=HarmBlockThreshold.BLOCK_NONE),
        ]
    
    def _generate_content(self, prompt: str) -> str:
        """
        Gera conteúdo usando o modelo Vertex AI.
        
        Args:
            prompt: Prompt para geração
            
        Returns:
            Resposta do modelo
            
        Raises:
            Exception: Em caso de erro na geração
        """
        try:
            response = self.model.generate_content(prompt, safety_settings=self.safety_settings)
            return response.text.strip()
        except Exception as e:
            error_msg = str(e)
            if "429 Resource exhausted" in error_msg:
                raise Exception("429 Resource exhausted")
            logger.error(f"Erro ao gerar conteúdo: {e}")
            raise
    
    async def generate_content_async(self, prompt: str) -> str:
        """
        Gera conteúdo de forma assíncrona com retry e rate limiting.
        
        Args:
            prompt: Prompt para geração
            
        Returns:
            Resposta do modelo
        """
        attempt = 1
        
        while attempt <= AI_MAX_RETRIES:
            async with self.semaphore:
                await asyncio.sleep(AI_REQUEST_DELAY)
                try:
                    response = await asyncio.to_thread(self._generate_content, prompt)
                    return response
                except Exception as e:
                    if "429 Resource exhausted" in str(e):
                        delay = AI_BASE_RETRY_DELAY * (2 ** (attempt - 1))
                        logger.warning(f"Rate limit atingido (tentativa {attempt}/{AI_MAX_RETRIES}). "
                                     f"Aguardando {delay} segundos.")
                        await asyncio.sleep(delay)
                        attempt += 1
                        if attempt > AI_MAX_RETRIES:
                            logger.error(f"Falha após {AI_MAX_RETRIES} tentativas.")
                            raise Exception("Limite de tentativas excedido")
                    else:
                        logger.error(f"Erro ao gerar conteúdo: {e}")
                        raise
    
    async def generate_multiple_content_async(self, prompts: List[str]) -> List[str]:
        """
        Gera múltiplos conteúdos de forma assíncrona.
        
        Args:
            prompts: Lista de prompts
            
        Returns:
            Lista de respostas do modelo
        """
        tasks = [self.generate_content_async(prompt) for prompt in prompts]
        return await asyncio.gather(*tasks)
