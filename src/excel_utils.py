"""
Módulo para manipulação de arquivos Excel no projeto YouTube Transcriber.
Fornece funcionalidades para salvar blocos de transcrição em arquivos Excel
e gerar relatórios a partir de transcrições de teste.
"""
import pandas as pd
import os
from src.utils.logger import setup_logger
from src.config import EXCEL_OUTPUT_DIR

# Configurar logger para este módulo
logger = setup_logger(__name__)

def save_blocks_to_excel(all_blocks, excel_name):
    """
    Salva os blocos de transcrição em um arquivo Excel.
    
    Args:
        all_blocks (list): Lista de dicionários contendo as transcrições e metadados.
        excel_name (str): Nome do arquivo Excel de saída.
        
    Returns:
        str: Caminho do arquivo Excel gerado ou None se nenhum bloco foi fornecido.
    """
    if not all_blocks:
        logger.warning("Nenhum trecho gerado para salvar no Excel.")
        return None
        
    # Criar o diretório de saída se não existir
    os.makedirs(EXCEL_OUTPUT_DIR, exist_ok=True)
    
    # Criar DataFrame e otimizar a ordem das colunas
    df = pd.DataFrame(all_blocks)
    
    # Organiza colunas para colocar timestamp após transcrição se ambas existirem
    cols = list(df.columns)
    if 'transcrição' in cols and 'timestamp' in cols:
        cols.remove('timestamp')
        idx = cols.index('transcrição') + 1
        cols.insert(idx, 'timestamp')
        df = df[cols]
    
    # Salva o Excel
    excel_path = os.path.join(EXCEL_OUTPUT_DIR, excel_name)
    df.to_excel(excel_path, index=False)
    
    logger.info(f"Arquivo Excel gerado: {excel_path} ({len(all_blocks)} trechos)")
    return excel_path

def generate_excel_from_test(test_transcript_path, split_transcription):
    """
    Gera um Excel a partir de um arquivo de transcrição _test.txt e seu _test.json,
    incluindo os timestamps dos segmentos.
    
    Args:
        test_transcript_path (str): Caminho para o arquivo de transcrição de teste (.txt).
        split_transcription (function): Função para dividir a transcrição em blocos.
        
    Returns:
        str: Caminho do arquivo Excel gerado ou None se houve erro.
    """
    import json
    import datetime
    from pathlib import Path
    
    # Verificar e processar arquivos
    try:
        test_path = Path(test_transcript_path)
        base = test_path.with_suffix("")
        json_path = str(base) + ".json"
        
        if not test_path.exists() or not Path(json_path).exists():
            logger.error(f"Arquivo de transcrição ou segmentos não encontrado: {test_transcript_path} / {json_path}")
            return None
        
        # Ler arquivos de transcrição e segmentos
        with open(test_transcript_path, encoding="utf-8") as f:
            text = f.read()
            
        with open(json_path, encoding="utf-8") as f:
            segments = json.load(f)
            
        # Dividir a transcrição em blocos
        blocks = split_transcription(text)
        logger.info(f"Transcrição dividida em {len(blocks)} blocos")
        
        # Processar cada bloco e tentar encontrar timestamps correspondentes
        all_blocks = []
        
        def format_timestamp(seconds):
            """Formata segundos para HH:MM:SS"""
            h = int(seconds // 3600)
            m = int((seconds % 3600) // 60)
            s = int(seconds % 60)
            return f"{h:02}:{m:02}:{s:02}"
        
        for block in blocks:
            block_text = block.replace('\n', ' ').strip()
            found = False
            
            # Buscar um segmento correspondente
            for seg in segments:
                seg_text = seg.get('text', '').replace('\n', ' ').strip()
                if seg_text and seg_text in block_text:
                    start = seg['start']
                    end = seg['end']
                    timestamp = f"{format_timestamp(start)} - {format_timestamp(end)}"
                    found = True
                    break
                    
            if not found:
                timestamp = ""
                
            all_blocks.append({"transcrição": block, "timestamp": timestamp})
        
        # Gerar nome do arquivo com timestamp
        now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        base_filename = os.path.basename(str(base))
        excel_filename = f"{base_filename}_{now}_test.xlsx"
        
        # Salvar Excel
        return save_blocks_to_excel(all_blocks, excel_filename)
        
    except Exception as e:
        logger.error(f"Erro ao gerar Excel de teste: {e}")
        return None
