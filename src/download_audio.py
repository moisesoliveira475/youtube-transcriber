"""
Módulo para download de áudio de vídeos do YouTube e cópia de arquivos locais.
Fornece funcionalidades para ler URLs/caminhos de arquivos e baixar áudio em formato WAV ou copiar arquivos locais.
"""
import os
import shutil
from yt_dlp import YoutubeDL
import argparse
from pathlib import Path
from src.utils.logger import setup_logger
from src.config import VIDEOS_FILE, DOWNLOAD_FORMAT, AUDIO_FORMAT, AUDIO_QUALITY, is_local_file

# Configurar logger para este módulo
logger = setup_logger(__name__)

def read_urls(file_path=VIDEOS_FILE):
    """
    Lê URLs de vídeos do YouTube e caminhos de arquivos locais de um arquivo de texto.
    
    Args:
        file_path (str or Path): Caminho para o arquivo contendo as URLs/caminhos, uma por linha.
        
    Returns:
        list: Lista de URLs de vídeos e caminhos de arquivos, sem linhas vazias ou comentários.
    """
    try:
        file_path = Path(file_path)
        if not file_path.exists():
            logger.error(f"Arquivo {file_path} não encontrado.")
            return []
            
        with open(file_path, 'r', encoding='utf-8') as f:
            # Remove linhas vazias e comentários (iniciados com //)
            entries = [line.strip() for line in f 
                      if line.strip() and not line.strip().startswith('//')]
        
        logger.info(f"Carregadas {len(entries)} entradas do arquivo {file_path}")
        return entries
    except Exception as e:
        logger.error(f"Erro ao ler arquivo de URLs/caminhos {file_path}: {e}")
        return []

def download_audio(url_or_path, output_name, no_playlist=True):
    """
    Baixa o áudio de um vídeo do YouTube ou copia arquivo local para pasta de áudios.
    
    Args:
        url_or_path (str): URL do vídeo do YouTube ou caminho para arquivo local.
        output_name (str or Path): Caminho de saída para salvar o arquivo de áudio.
        no_playlist (bool): Se True, ignora playlists e baixa apenas o vídeo especificado.
        
    Returns:
        bool: True se o download/cópia foi bem-sucedido, False caso contrário.
    """
    # Se for arquivo local, apenas copia para a pasta de áudios
    if is_local_file(url_or_path):
        source_path = url_or_path.strip()
        logger.info(f"Copiando arquivo local: {source_path}")
        
        try:
            # Garantir que o diretório de saída existe
            output_path = Path(output_name)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Determina a extensão do arquivo de origem
            source_ext = Path(source_path).suffix.lower()
            
            # Define o caminho de destino mantendo a extensão original
            if source_ext in ['.mp4', '.wav', '.m4a', '.mp3', '.aac']:
                # Remove a extensão do output_name se houver e adiciona a extensão original
                output_name_no_ext = str(output_path.with_suffix(''))
                dest_path = output_name_no_ext + source_ext
            else:
                dest_path = str(output_path)
            
            # Copia o arquivo se ainda não existir
            if not os.path.exists(dest_path):
                shutil.copy2(source_path, dest_path)
                logger.info(f"Arquivo copiado com sucesso: {dest_path}")
            else:
                logger.info(f"Arquivo já existe: {dest_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao copiar arquivo local {source_path}: {str(e)}")
            return False
    
    # Se for URL do YouTube, faz o download normal
    logger.info(f"Iniciando download do áudio: {url_or_path}")
    
    # Garantir que o diretório de saída existe
    output_path = Path(output_name)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Configurações para o yt-dlp
    ydl_opts = {
        'format': DOWNLOAD_FORMAT,
        'extract_audio': True,
        'audio_format': AUDIO_FORMAT,
        'audio_quality': AUDIO_QUALITY,
        'outtmpl': str(output_name),
        'quiet': False,
        'ignoreerrors': True,  # Ignora erros e continua com outros downloads
        'nooverwrites': False, # Sobrescreve arquivos existentes
    }
    
    if no_playlist:
        ydl_opts['noplaylist'] = True
        
    try:
        with YoutubeDL(ydl_opts) as ydl:
            logger.debug(f"Baixando áudio de: {url_or_path}")
            info = ydl.extract_info(url_or_path, download=True)
            
            # Verifica se o download foi bem-sucedido
            if info and 'title' in info:
                logger.info(f"Download concluído: {info['title']}")
                return True
            else:
                logger.warning("Download concluído, mas sem informações do vídeo")
                return True
    except Exception as e:
        logger.error(f"Erro ao baixar {url_or_path}: {str(e)}")
        return False

def main():
    """
    Função principal para download de áudios quando executado como script.
    Lê as URLs de vídeos do YouTube e caminhos de arquivos locais de um arquivo e processa os áudios.
    """
    parser = argparse.ArgumentParser(description="Baixa áudios do YouTube ou copia arquivos locais.")
    parser.add_argument("-l", "--list", action="store_true", 
                        help="Permite baixar playlists inteiras (por padrão, só baixa o vídeo individual)")
    parser.add_argument("-f", "--file", default=str(VIDEOS_FILE), 
                        help=f"Arquivo contendo URLs de vídeos ou caminhos de arquivos (padrão: {VIDEOS_FILE})")
    parser.add_argument("-o", "--output-dir", default="audios", 
                        help="Diretório para salvar os áudios baixados/copiados (padrão: audios)")
    parser.add_argument("-v", "--verbose", action="store_true", 
                        help="Mostrar mensagens detalhadas de log")
    args = parser.parse_args()
    
    # Garantir que o diretório de saída existe
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Carregar URLs e caminhos de arquivos
    entries = read_urls(args.file)
    if not entries:
        logger.error(f"Nenhuma entrada encontrada. Verifique {args.file}.")
        return
    
    logger.info(f"Iniciando processamento de {len(entries)} entradas")
    
    # Processar cada URL ou arquivo
    from src.utils.extract_video_id import extract_video_id
    for i, entry in enumerate(entries, 1):
        logger.info(f"[{i}/{len(entries)}] Processando: {entry}")
        
        # Obter ID do vídeo para nome do arquivo
        video_id = extract_video_id(entry)
        if not video_id:
            logger.warning(f"Não foi possível extrair/gerar o ID. Usando índice como nome: {i}")
            video_id = f"audio_{i}"
            
        # Determinar extensão baseada no tipo de entrada
        if is_local_file(entry):
            # Para arquivos locais, mantém a extensão original
            source_ext = os.path.splitext(entry)[1]
            audio_file = os.path.join(args.output_dir, f"{video_id}{source_ext}")
        else:
            # Para URLs do YouTube, usa o formato padrão
            audio_file = os.path.join(args.output_dir, f"{video_id}.{AUDIO_FORMAT}")
            
        success = download_audio(entry, audio_file, no_playlist=not args.list)
        
        if success:
            logger.info(f"[{i}/{len(entries)}] Processamento concluído: {audio_file}")
        else:
            logger.error(f"[{i}/{len(entries)}] Falha no processamento: {entry}")
    
    logger.info("Processo de download/cópia finalizado.")

if __name__ == "__main__":
    main()
