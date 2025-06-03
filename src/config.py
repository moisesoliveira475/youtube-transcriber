"""
Arquivo de configuração centralizada para o YouTube Transcriber.
Contém constantes e parâmetros de configuração usados em todo o projeto.
"""
import os
from pathlib import Path

# Diretórios padrão
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AUDIO_DIR = BASE_DIR / "audios"
TRANSCRIPT_DIR = BASE_DIR / "transcripts"
WORDS_DIR = TRANSCRIPT_DIR / "words"
SECTIONS_DIR = TRANSCRIPT_DIR / "sections"
EXCEL_OUTPUT_DIR = BASE_DIR / "excel_output"
VIDEOS_FILE = BASE_DIR / "videos.txt"

# Configurações de transcrição
DEFAULT_WHISPER_MODEL = "medium"           # Tamanho do modelo Whisper original
DEFAULT_FASTER_WHISPER_MODEL = "large-v3"     # Tamanho do modelo Faster-Whisper
USE_FASTER_WHISPER_BY_DEFAULT = True       # Se True, usa Faster-Whisper por padrão
LANGUAGE = "pt"                            # Idioma padrão para transcrição

# Configurações de segmentação de texto
TARGET_WORDS_PER_BLOCK = 130               # Número alvo de palavras por bloco na divisão
WORDS_TOLERANCE = 50                       # Tolerância no número de palavras por bloco

# Configurações de Excel
DEFAULT_EXCEL_FILENAME = "transcricoes.xlsx"

# Configuração de logging
LOG_LEVEL = "INFO"                         # Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_FILE = BASE_DIR / "youtube_transcriber.log"

# Configurações de download
DOWNLOAD_FORMAT = "bestaudio"
AUDIO_FORMAT = "wav"
AUDIO_QUALITY = 0

# Formatos de áudio suportados para arquivos locais
SUPPORTED_AUDIO_FORMATS = ['.mp4', '.wav', '.m4a', '.mp3', '.aac']

# Configurações de IA
AI_ANALYSIS_ENABLED = False                    # Por padrão desabilitado
AI_MODEL = "gemini-2.0-flash-lite-001"        # Modelo Vertex AI
AI_CONCURRENT_REQUESTS = 5                     # Limite de requisições simultâneas
AI_REQUEST_DELAY = 0.5                         # Tempo entre requisições (segundos)
AI_SAVE_INTERVAL = 100                         # Salvar progresso a cada N registros
AI_MAX_RETRIES = 5                             # Máximo de tentativas por requisição
AI_BASE_RETRY_DELAY = 10                       # Delay base para retry (segundos)

# Contexto adicional para análise
ANALYSIS_CONTEXT = """
Contexto adicional: Análise de conteúdo em vídeos do YouTube para identificar 
possíveis casos de calúnia, injúria e difamação contra pessoas específicas.
Focus em detectar ataques à honra, reputação e dignidade pessoal.
"""

# Nome da pessoa a ser analisada (substituir [NOME_DA_PESSOA] nos prompts)
TARGET_PERSON_NAME = "João Silva"                        # Nome para teste da análise IA

# Configurações de classificação
CLASSIFICATION_WITH_EXPLANATION = False        # Se True, inclui explicações detalhadas (mais caro)

# Diretório para resumos de vídeos
SUMMARIES_DIR = TRANSCRIPT_DIR / "summaries"

def is_local_file(line):
    """
    Verifica se a linha é um caminho para arquivo local de áudio.
    
    Args:
        line (str): Linha de texto para verificar
        
    Returns:
        bool: True se for um arquivo local existente, False caso contrário
    """
    line = line.strip()
    if not line:
        return False
    
    # Verifica se termina com extensão de áudio suportada
    has_audio_extension = any(line.lower().endswith(ext) for ext in SUPPORTED_AUDIO_FORMATS)
    
    # Verifica se o arquivo existe
    file_exists = os.path.exists(line)
    
    return has_audio_extension and file_exists

def is_youtube_url(line):
    """
    Verifica se a linha é uma URL do YouTube.
    
    Args:
        line (str): Linha de texto para verificar
        
    Returns:
        bool: True se for uma URL do YouTube, False caso contrário
    """
    line = line.strip().lower()
    return 'youtube.com' in line or 'youtu.be' in line
