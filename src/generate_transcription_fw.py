"""
Módulo para transcrição de áudio usando o modelo Faster-Whisper.
Fornece funcionalidades para transcrever arquivos de áudio em texto
com suporte a timestamps de palavras, usando uma implementação mais rápida do Whisper.
"""
import os
import time
import json
from tqdm import tqdm
import traceback
from faster_whisper import WhisperModel
from src.utils.logger import setup_logger
from src.config import WORDS_DIR, DEFAULT_FASTER_WHISPER_MODEL, LANGUAGE

# Configurar logger para este módulo
logger = setup_logger(__name__)

def read_audio_files(audio_dir):
    """
    Lista todos os arquivos de áudio suportados em um diretório.
    
    Args:
        audio_dir (str): Caminho do diretório contendo os arquivos de áudio.
        
    Returns:
        list: Lista de nomes de arquivos de áudio no diretório.
    """
    try:
        from src.config import SUPPORTED_AUDIO_FORMATS
        supported_files = []
        for f in os.listdir(audio_dir):
            if any(f.lower().endswith(ext) for ext in SUPPORTED_AUDIO_FORMATS):
                supported_files.append(f)
        return supported_files
    except Exception as e:
        logger.error(f"Erro ao listar arquivos de áudio em {audio_dir}: {e}")
        return []

def transcribe_audio(audio_path, base_name):
    """
    Transcreve um arquivo de áudio usando o modelo Faster-Whisper.
    Suporta múltiplos formatos: WAV, MP4, M4A, MP3, AAC.
    
    Args:
        audio_path (str): Caminho para o arquivo de áudio a ser transcrito.
        base_name (str): Nome base para os arquivos de saída.
        
    Returns:
        bool: True se a transcrição foi bem-sucedida, False caso contrário.
    """
    logger.info(f"Iniciando transcrição do áudio (faster-whisper): {audio_path}")
    
    # Verificar se o arquivo existe
    if not os.path.exists(audio_path):
        logger.error(f"Arquivo de áudio não encontrado: {audio_path}")
        return False
    
    # Verificar formato suportado
    from src.config import SUPPORTED_AUDIO_FORMATS
    file_ext = os.path.splitext(audio_path)[1].lower()
    if file_ext not in SUPPORTED_AUDIO_FORMATS:
        logger.error(f"Formato de áudio não suportado: {file_ext}")
        return False
    
    logger.info(f"Formato detectado: {file_ext}")
    
    try:
        # Detectar GPU
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Log de informações do dispositivo
        if device == "cuda":
            logger.info(f"Carregando modelo Faster-Whisper (device: {device})...")
            logger.info(f"GPU disponível: {torch.cuda.get_device_name(0)}")
            logger.info(f"Memória total da GPU: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
            torch.cuda.empty_cache()
        else:
            logger.info(f"Carregando modelo Faster-Whisper (device: {device})...")
            
        # Definir tamanho do modelo e tipo de computação
        model_size = DEFAULT_FASTER_WHISPER_MODEL
        compute_type = "float16" if device == "cuda" else "int8"
        
        logger.info(f"Carregando modelo tamanho: {model_size}, compute_type: {compute_type}")
        model = WhisperModel(model_size, device=device, compute_type=compute_type)
        logger.info("Modelo carregado. Iniciando transcrição...")
        
        # Configurar monitoramento de GPU se disponível
        if device == "cuda":
            def gpu_monitor():
                while not stop_monitor[0]:
                    mem = torch.cuda.memory_allocated(0) / 1024**2
                    logger.debug(f"[GPU] Memória alocada: {mem:.2f} MB")
                    time.sleep(1)
            
            import threading
            stop_monitor = [False]
            monitor_thread = threading.Thread(target=gpu_monitor)
            monitor_thread.start()
        
        # Realizar transcrição
        with tqdm(total=1, desc="Transcrevendo", bar_format='{l_bar}{bar}| {elapsed} {postfix}') as pbar:
            result = model.transcribe(
                audio_path,
                language=LANGUAGE,
                beam_size=5,
                best_of=5,
                word_timestamps=True
            )
            # Desempacotar o gerador em segmentos
            segments, info = result
            segments = list(segments)  # Força execução do gerador para lista
            pbar.update(1)
        
        # Finalizar monitoramento da GPU
        if device == "cuda":
            stop_monitor[0] = True
            monitor_thread.join()
            logger.debug("Monitoramento de GPU finalizado")
        
        # Concatenar texto dos segmentos
        text = " ".join(seg.text for seg in segments)
        
        # Criar diretório de saída se não existir
        os.makedirs(WORDS_DIR, exist_ok=True)
        
        # Salvar texto completo
        output_txt = os.path.join(WORDS_DIR, f"{base_name}.txt")
        with open(output_txt, 'w', encoding='utf-8') as f:
            f.write(text)
        
        # Preparar dados de segmentos para JSON
        output_json = os.path.join(WORDS_DIR, f"{base_name}.json")
        segments_json = []
        
        for seg in segments:
            # Criar dicionário para cada segmento
            seg_dict = {
                "id": getattr(seg, "id", None),
                "start": seg.start,
                "end": seg.end,
                "text": seg.text,
            }
            
            # Adicionar informações de palavras se disponíveis
            if hasattr(seg, "words") and seg.words:
                seg_dict["words"] = [
                    {
                        "word": w.word,
                        "start": w.start,
                        "end": w.end,
                        "probability": getattr(w, "probability", None)
                    } for w in seg.words
                ]
                
            segments_json.append(seg_dict)
        
        # Salvar JSON de segmentos
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(segments_json, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Transcrição salva em {output_txt} e segmentos em {output_json}")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao transcrever {audio_path}: {str(e)}")
        logger.debug(traceback.format_exc())
        return False

def find_audio_file(video_id, audio_dir):
    """
    Encontra o arquivo de áudio correspondente a um video_id, suportando múltiplos formatos.
    
    Args:
        video_id (str): ID do vídeo para procurar
        audio_dir (str): Diretório onde procurar os arquivos
        
    Returns:
        str or None: Caminho do arquivo encontrado ou None se não encontrado
    """
    from src.config import SUPPORTED_AUDIO_FORMATS
    
    for ext in SUPPORTED_AUDIO_FORMATS:
        potential_file = os.path.join(audio_dir, f"{video_id}{ext}")
        if os.path.exists(potential_file):
            return potential_file
    
    return None

def transcribe_audio_by_video_id(video_id, audio_dir=None, output_dir=None):
    """
    Transcreve um arquivo de áudio baseado no video_id, procurando por diferentes formatos.
    
    Args:
        video_id (str): ID do vídeo para transcrever
        audio_dir (str): Diretório dos arquivos de áudio (padrão: AUDIO_DIR do config)
        output_dir (str): Diretório de saída (padrão: WORDS_DIR do config)
        
    Returns:
        bool: True se a transcrição foi bem-sucedida, False caso contrário
    """
    from src.config import AUDIO_DIR
    
    if audio_dir is None:
        audio_dir = str(AUDIO_DIR)
    if output_dir is None:
        output_dir = str(WORDS_DIR)
    
    # Encontra o arquivo de áudio
    audio_file = find_audio_file(video_id, audio_dir)
    if not audio_file:
        logger.error(f"Nenhum arquivo de áudio encontrado para video_id: {video_id}")
        return False
    
    logger.info(f"Arquivo de áudio encontrado: {audio_file}")
    return transcribe_audio(audio_file, video_id)

def main():
    """
    Função principal para processamento em lote de arquivos de áudio.
    """
    try:
        # Garantir que diretórios existem
        os.makedirs(WORDS_DIR, exist_ok=True)
        
        # Configurar diretório de áudio
        audio_dir = "audios"
        
        # Listar arquivos de áudio
        audio_files = read_audio_files(audio_dir)
        if not audio_files:
            logger.warning("Nenhum arquivo de áudio encontrado em 'audios'.")
            return
            
        logger.info(f"Encontrados {len(audio_files)} arquivos de áudio para transcrever.")
        
        # Processar cada arquivo
        successful = 0
        for idx, audio_file in enumerate(audio_files, 1):
            logger.info(f"[{idx}/{len(audio_files)}] Processando: {audio_file}")
            audio_path = os.path.join(audio_dir, audio_file)
            base_name = os.path.splitext(audio_file)[0]
            
            if transcribe_audio(audio_path, base_name):
                successful += 1
                
        logger.info(f"Processo de transcrição finalizado. {successful}/{len(audio_files)} arquivos transcritos com sucesso.")
        
    except Exception as e:
        logger.error(f"Erro durante o processamento principal: {e}")
        logger.debug(traceback.format_exc())

if __name__ == "__main__":
    # Adicionar opções de linha de comando
    import argparse
    parser = argparse.ArgumentParser(description="Transcreve arquivos de áudio usando o modelo Faster-Whisper.")
    parser.add_argument("-a", "--audio-dir", default="audios", 
                        help="Diretório contendo os arquivos de áudio (padrão: audios)")
    parser.add_argument("-o", "--output-dir", default=WORDS_DIR, 
                        help=f"Diretório para salvar as transcrições (padrão: {WORDS_DIR})")
    parser.add_argument("-m", "--model", default=DEFAULT_FASTER_WHISPER_MODEL, 
                        help=f"Tamanho do modelo Faster-Whisper (padrão: {DEFAULT_FASTER_WHISPER_MODEL})")
    args = parser.parse_args()
    
    WORDS_DIR = args.output_dir

    main()
