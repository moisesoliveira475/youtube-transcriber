"""
Módulo para divisão de transcrições em blocos menores.
Fornece funcionalidades para dividir tanto textos planos quanto
estruturas JSON com timestamps em blocos de tamanho adequado.
"""
import re
import json
from pathlib import Path
import sys
from src.utils.logger import setup_logger
from src.config import TARGET_WORDS_PER_BLOCK, WORDS_TOLERANCE, SECTIONS_DIR

# Configurar logger para este módulo
logger = setup_logger(__name__)

def split_transcription(text, target_words=None, tolerance=None):
    """
    Divide um texto de transcrição em blocos menores baseados em frases.
    
    Args:
        text (str): O texto completo da transcrição.
        target_words (int, optional): Número alvo de palavras por bloco. 
                                      Se None, usa o valor da configuração.
        tolerance (int, optional): Tolerância no número de palavras. 
                                   Se None, usa o valor da configuração.
    
    Returns:
        list: Lista de strings, cada uma contendo um bloco de texto.
    """
    # Usar valores de config.py se não fornecidos
    target_words = target_words or TARGET_WORDS_PER_BLOCK
    tolerance = tolerance or WORDS_TOLERANCE
    
    logger.debug(f"Dividindo transcrição em blocos (alvo: {target_words} palavras, tolerância: {tolerance})")
    
    # Divide o texto em frases usando ponto final, interrogação ou exclamação
    sentences = re.split(r'(?<=[.!?])\s+', text)
    blocks = []
    current_block = []
    current_count = 0

    for sentence in sentences:
        words = sentence.split()
        n_words = len(words)
        # Se a frase for muito grande, vira um bloco sozinha
        if n_words > target_words + tolerance:
            if current_block:
                blocks.append(' '.join(current_block))
                current_block = []
                current_count = 0
            blocks.append(sentence.strip())
            continue
        # Se a frase for muito pequena, só adiciona
        if n_words < 10:
            current_block.append(sentence.strip())
            current_count += n_words
            continue
        # Se adicionar a frase não passar muito do alvo, adiciona
        if current_count + n_words <= target_words + tolerance:
            current_block.append(sentence.strip())
            current_count += n_words
        else:
            # Fecha o bloco atual e começa outro
            if current_block:
                blocks.append(' '.join(current_block))
            current_block = [sentence.strip()]
            current_count = n_words
    # Adiciona o último bloco
    if current_block:
        blocks.append(' '.join(current_block))
    return blocks

def split_transcription_json(json_data, target_words=None, tolerance=None):
    """
    Divide dados JSON de transcrição em blocos menores, preservando timestamps.
    
    Args:
        json_data (list): Lista de segmentos de transcrição no formato JSON.
        target_words (int, optional): Número alvo de palavras por bloco. 
                                      Se None, usa o valor da configuração.
        tolerance (int, optional): Tolerância no número de palavras. 
                                   Se None, usa o valor da configuração.
    
    Returns:
        list: Lista de dicionários, cada um contendo um bloco com timestamps e texto.
    """
    # Usar valores de config.py se não fornecidos
    target_words = target_words or TARGET_WORDS_PER_BLOCK
    tolerance = tolerance or WORDS_TOLERANCE
    
    logger.debug(f"Dividindo JSON de transcrição em blocos (alvo: {target_words} palavras, tolerância: {tolerance})")
    
    # Primeiro, extraímos todas as palavras do JSON
    all_words = []
    for block in json_data:
        if "words" in block:
            for w in block["words"]:
                all_words.append(w)
    
    # Se não tiver palavras com timestamps, retorna vazio
    if not all_words:
        return []
    
    # Agora, agrupa as palavras em frases baseado em pontuação
    sentences = []
    current_sentence = []
    for w in all_words:
        word = w["word"].strip()
        current_sentence.append(w)
        # Se a palavra termina com pontuação, fecha a frase
        if word.endswith('.') or word.endswith('!') or word.endswith('?'):
            if current_sentence:
                sentence_obj = {
                    "start": current_sentence[0]["start"],
                    "end": current_sentence[-1]["end"],
                    "words": current_sentence.copy(),
                }
                sentences.append(sentence_obj)
                current_sentence = []
    
    # Adiciona qualquer frase restante
    if current_sentence:
        sentence_obj = {
            "start": current_sentence[0]["start"],
            "end": current_sentence[-1]["end"],
            "words": current_sentence.copy(),
        }
        sentences.append(sentence_obj)
    
    # Agora, aplica a mesma lógica de split_transcription para agrupar frases em blocos
    blocks = []
    current_block = []
    current_count = 0
    
    for sentence in sentences:
        sentence_text = ' '.join([w["word"].strip() for w in sentence["words"]])
        n_words = len(sentence["words"])
        
        # Se a frase for muito grande, vira um bloco sozinha
        if n_words > target_words + tolerance:
            if current_block:
                # Fecha o bloco atual
                block_words = []
                for s in current_block:
                    block_words.extend(s["words"])
                
                if block_words:
                    block_text = ' '.join([w["word"].strip() for w in block_words])
                    block = {
                        "start": block_words[0]["start"],
                        "end": block_words[-1]["end"],
                        "text": block_text,
                        "words": block_words.copy()
                    }
                    blocks.append(block)
                current_block = []
                current_count = 0
            
            # A frase grande vira um bloco sozinho
            block = {
                "start": sentence["start"],
                "end": sentence["end"],
                "text": sentence_text,
                "words": sentence["words"].copy()
            }
            blocks.append(block)
            continue
            
        # Se a frase for muito pequena, só adiciona
        if n_words < 10:
            current_block.append(sentence)
            current_count += n_words
            continue
            
        # Se adicionar a frase não passar muito do alvo, adiciona
        if current_count + n_words <= target_words + tolerance:
            current_block.append(sentence)
            current_count += n_words
        else:
            # Fecha o bloco atual e começa outro
            if current_block:
                block_words = []
                for s in current_block:
                    block_words.extend(s["words"])
                
                if block_words:
                    block_text = ' '.join([w["word"].strip() for w in block_words])
                    block = {
                        "start": block_words[0]["start"],
                        "end": block_words[-1]["end"],
                        "text": block_text,
                        "words": block_words.copy()
                    }
                    blocks.append(block)
            
            current_block = [sentence]
            current_count = n_words
    
    # Adiciona o último bloco
    if current_block:
        block_words = []
        for s in current_block:
            block_words.extend(s["words"])
        
        if block_words:
            block_text = ' '.join([w["word"].strip() for w in block_words])
            block = {
                "start": block_words[0]["start"],
                "end": block_words[-1]["end"],
                "text": block_text,
                "words": block_words.copy()
            }
            blocks.append(block)
    
    return blocks

if __name__ == "__main__":
    """
    Execute o script diretamente para processar um arquivo JSON de transcrição.
    Exemplo: python split_transcription.py /caminho/para/transcrição.json
    """
    if len(sys.argv) < 2:
        logger.error("Uso: python split_transcription.py <caminho_json>")
        sys.exit(1)
        
    input_path = Path(sys.argv[1])
    if not input_path.exists():
        logger.error(f"Arquivo não encontrado: {input_path}")
        sys.exit(1)
        
    try:
        base_name = input_path.stem
        logger.info(f"Processando arquivo: {input_path}")
        
        with input_path.open(encoding="utf-8") as f:
            json_data = json.load(f)
            
        blocks = split_transcription_json(json_data)
        
        # Criar diretório de saída se não existir
        output_dir = SECTIONS_DIR
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Salva o resultado em um novo JSON
        out_json_path = output_dir / f"{base_name}_split.json"
        with out_json_path.open("w", encoding="utf-8") as f:
            json.dump(blocks, f, ensure_ascii=False, indent=2)
            
        # Salva também os trechos em txt
        out_txt_path = output_dir / f"{base_name}_split.txt"
        with out_txt_path.open("w", encoding="utf-8") as f:
            for block in blocks:
                f.write(block["text"] + "\n\n")
                
        logger.info(f"Split concluído. {len(blocks)} blocos salvos em {out_json_path} e {out_txt_path}")
    except Exception as e:
        logger.error(f"Erro ao processar arquivo: {e}")
        sys.exit(1)
