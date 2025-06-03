"""
Módulo de configuração de logging para o YouTube Transcriber.
Fornece funcionalidades para logging consistente em todo o aplicativo.
"""
import logging
from logging.handlers import RotatingFileHandler
import sys
from src.config import LOG_LEVEL, LOG_FORMAT, LOG_FILE

def setup_logger(name):
    """
    Configura e retorna um logger com o nome especificado.
    
    Args:
        name (str): Nome do logger, geralmente o nome do módulo (__name__).
        
    Returns:
        logging.Logger: Objeto logger configurado.
    """
    # Converte string de nível para constante do logging
    level_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL
    }
    level = level_map.get(LOG_LEVEL, logging.INFO)
    
    # Cria o logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Evita duplicação de handlers
    if not logger.handlers:
        # Handler para console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_formatter = logging.Formatter(LOG_FORMAT)
        console_handler.setFormatter(console_formatter)
        
        # Handler para arquivo
        try:
            file_handler = RotatingFileHandler(
                LOG_FILE,
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5,
                encoding="utf-8"
            )
            file_handler.setLevel(level)
            file_formatter = logging.Formatter(LOG_FORMAT)
            file_handler.setFormatter(file_formatter)
            
            # Adiciona os handlers ao logger
            logger.addHandler(console_handler)
            logger.addHandler(file_handler)
        except Exception as e:
            # Se não for possível criar o handler de arquivo, apenas usa o console
            logger.addHandler(console_handler)
            logger.warning(f"Não foi possível configurar o log para arquivo: {e}")
    
    return logger
