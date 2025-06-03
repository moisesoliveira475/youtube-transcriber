"""
Módulo para extração de IDs de vídeos do YouTube a partir de URLs ou geração de IDs para arquivos locais.
Suporta diversos formatos de URL incluindo padrões normais, youtu.be e embedded, além de arquivos locais.
"""
import re
import os
from src.utils.logger import setup_logger
from src.config import is_local_file, is_youtube_url

# Configurar logger para este módulo
logger = setup_logger(__name__)

def extract_video_id(url_or_path):
    """
    Extrai o ID de um vídeo do YouTube a partir da URL ou gera um ID para arquivo local.
    
    Args:
        url_or_path (str): URL do vídeo do YouTube ou caminho para arquivo local.
        
    Returns:
        str or None: ID do vídeo ou ID gerado para arquivo local, None se não for possível extrair/gerar.
    """
    if not url_or_path or not isinstance(url_or_path, str):
        logger.warning(f"URL/caminho inválido fornecido para extração: {url_or_path}")
        return None
    
    url_or_path = url_or_path.strip()
    
    # Verifica se é um arquivo local
    if is_local_file(url_or_path):
        # Gera um ID baseado no nome do arquivo
        filename = os.path.basename(url_or_path)
        name_without_ext = os.path.splitext(filename)[0]
        # Remove caracteres especiais e espaços, mantém apenas alfanuméricos, hífens e underscores
        clean_name = "".join(c for c in name_without_ext if c.isalnum() or c in ('-', '_'))
        # Limita o tamanho e adiciona prefixo para identificar como arquivo local
        clean_name = clean_name[:50]  # Limita a 50 caracteres
        video_id = f"local_{clean_name}"
        logger.debug(f"ID gerado para arquivo local: {video_id} do arquivo: {url_or_path}")
        return video_id
    
    # Se não for arquivo local, tenta extrair ID do YouTube
    if not is_youtube_url(url_or_path):
        logger.warning(f"Entrada não é uma URL do YouTube nem um arquivo local válido: {url_or_path}")
        return None
    
    # Tenta diferentes padrões de URL
    patterns = [
        r"[?&]v=([\w-]+)",           # Formato padrão: youtube.com/watch?v=ID
        r"youtu\.be/([\w-]+)",        # Formato curto: youtu.be/ID
        r"youtube\.com/embed/([\w-]+)",  # Formato embedded: youtube.com/embed/ID
        r"youtube\.com/v/([\w-]+)",   # Formato antigo: youtube.com/v/ID
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url_or_path)
        if match:
            video_id = match.group(1)
            logger.debug(f"ID extraído com sucesso: {video_id} da URL: {url_or_path}")
            return video_id
    
    logger.warning(f"Não foi possível extrair o ID do vídeo da URL: {url_or_path}")
    return None
