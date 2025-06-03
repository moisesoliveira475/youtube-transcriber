import os
import argparse
import datetime
import sys
import json
import asyncio
from pathlib import Path

# Add the project root to Python path to allow imports from both locations
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    # Try importing from src (when running from project root)
    from src.split_transcription import split_transcription
    from src.excel_utils import save_blocks_to_excel
    from src.utils.extract_video_id import extract_video_id
    from src.utils.test_whisper_transcription import test_whisper_transcription
    from src.utils.generate_excel_from_test import generate_excel_from_test
    from src.ai_analysis import ContentClassifier
except ImportError:
    # Import directly (when running from src directory)
    from split_transcription import split_transcription
    from excel_utils import save_blocks_to_excel
    from utils.extract_video_id import extract_video_id
    from utils.test_whisper_transcription import test_whisper_transcription
    from utils.generate_excel_from_test import generate_excel_from_test
    from ai_analysis import ContentClassifier

def format_timestamp(seconds):
    """
    Converte segundos para formato HH:MM:SS
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02}:{minutes:02}:{secs:02}"

def process_all(audio_dir, transcript_dir, excel_name, only_excel=False, playlist_mode=False, video_id_filter=None, ignore_existing=False, use_whisper=False, ai_analysis=False, only_ai_analysis=False, ai_resume=False, target_person=None):
    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    name, ext = os.path.splitext(excel_name)
    excel_name = f"{name}_{now}{ext}"
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(transcript_dir, exist_ok=True)
    # Garante que a pasta sections existe
    os.makedirs(os.path.join(transcript_dir, "sections"), exist_ok=True)
    
    all_blocks = []
    if only_excel:
        # Primeiro tenta usar os arquivos já processados com timestamps da pasta sections
        sections_dir = os.path.join(transcript_dir, "sections")
        words_dir = os.path.join(transcript_dir, "words")
        
        processed_videos = set()
        
        # Verifica se existem arquivos split com timestamps
        if os.path.exists(sections_dir):
            for filename in os.listdir(sections_dir):
                if filename.endswith('_split.json'):
                    video_id = filename.replace('_split.json', '')
                    if video_id_filter and video_id != video_id_filter:
                        continue
                    
                    sections_file = os.path.join(sections_dir, filename)
                    with open(sections_file, encoding="utf-8") as f:
                        blocks = json.load(f)
                    
                    for block in blocks:
                        start_formatted = format_timestamp(block['start'])
                        end_formatted = format_timestamp(block['end'])
                        all_blocks.append({
                            "transcrição": block["text"], 
                            "timestamp": f"{start_formatted} - {end_formatted}", 
                            "video_id": video_id
                        })
                    processed_videos.add(video_id)
        
        # Para vídeos não processados, tenta usar os arquivos JSON da pasta words
        if os.path.exists(words_dir):
            for filename in os.listdir(words_dir):
                if filename.endswith('.json'):
                    video_id = filename.replace('.json', '')
                    if video_id_filter and video_id != video_id_filter:
                        continue
                    if video_id in processed_videos:
                        continue  # Já foi processado com split
                    
                    segments_file = os.path.join(words_dir, filename)
                    with open(segments_file, encoding="utf-8") as f:
                        segments = json.load(f)
                    
                    try:
                        from src.split_transcription import split_transcription_json
                    except ImportError:
                        from split_transcription import split_transcription_json
                    
                    blocks = split_transcription_json(segments)
                    for block in blocks:
                        start_formatted = format_timestamp(block['start'])
                        end_formatted = format_timestamp(block['end'])
                        all_blocks.append({
                            "transcrição": block["text"], 
                            "timestamp": f"{start_formatted} - {end_formatted}", 
                            "video_id": video_id
                        })
                    processed_videos.add(video_id)
        
        # Como último recurso, usa arquivos .txt sem timestamps
        if os.path.exists(words_dir):
            for filename in os.listdir(words_dir):
                if filename.endswith('.txt'):
                    video_id = filename.replace('.txt', '')
                    if video_id_filter and video_id != video_id_filter:
                        continue
                    if video_id in processed_videos:
                        continue  # Já foi processado
                    
                    transcription_file = os.path.join(words_dir, filename)
                    with open(transcription_file, encoding="utf-8") as f:
                        text = f.read()
                    blocks = split_transcription(text)
                    for block in blocks:
                        all_blocks.append({"transcrição": block, "video_id": video_id})
        if all_blocks:
            excel_path = save_blocks_to_excel(all_blocks, excel_name)
            
            # Se análise IA foi solicitada, processar o arquivo Excel gerado
            if ai_analysis and excel_path:
                print("Iniciando análise IA...")
                asyncio.run(process_ai_analysis(excel_path, target_person, ai_resume))
        else:
            print("Nenhum trecho gerado.")
        return
    try:
        from src.download_audio import read_urls, download_audio
        from src.config import is_local_file
        if use_whisper:
            from src.generate_transcription import transcribe_audio_by_video_id
        else:
            from src.generate_transcription_fw import transcribe_audio_by_video_id
    except ImportError:
        from download_audio import read_urls, download_audio
        from config import is_local_file
        if use_whisper:
            from generate_transcription import transcribe_audio_by_video_id
        else:
            from generate_transcription_fw import transcribe_audio_by_video_id
    
    entries = read_urls("videos.txt")
    if not entries:
        print("Nenhuma entrada encontrada. Verifique videos.txt.")
        return
    
    for entry in entries:
        video_id = extract_video_id(entry)
        if not video_id:
            print(f"Não foi possível extrair/gerar o ID da entrada: {entry}")
            continue
        if video_id_filter and video_id != video_id_filter:
            continue
        
        # Ajusta para buscar em transcripts/words
        transcription_file = os.path.join(transcript_dir, "words", f"{video_id}.txt")
        segments_file = os.path.join(transcript_dir, "words", f"{video_id}.json")
        
        if os.path.exists(transcription_file) and ignore_existing:
            print(f"Transcrição já existe para {video_id}, ignorando download/transcrição.")
        else:
            if not os.path.exists(transcription_file):
                print(f"Processando entrada: {entry}")
                
                # Determinar extensão baseada no tipo de entrada
                if is_local_file(entry):
                    # Para arquivos locais, mantém a extensão original
                    source_ext = os.path.splitext(entry)[1]
                    audio_file = os.path.join(audio_dir, f"{video_id}{source_ext}")
                else:
                    # Para URLs do YouTube, usa formato WAV
                    audio_file = os.path.join(audio_dir, f"{video_id}.wav")
                
                # Download/cópia do arquivo
                if download_audio(entry, audio_file, no_playlist=not playlist_mode):
                    # Transcrever usando a função que detecta automaticamente o formato
                    if not transcribe_audio_by_video_id(video_id, audio_dir):
                        print(f"Falha na transcrição de {entry}. Continuando...")
                        continue
                else:
                    print(f"Falha ao processar {entry}. Pulando transcrição.")
                    continue
        
        if not os.path.exists(transcription_file):
            print(f"Arquivo de transcrição não encontrado para {video_id}, pulando.")
            continue
        # Preferencialmente faz split pelo JSON se existir
        if os.path.exists(segments_file):
            with open(segments_file, encoding="utf-8") as f:
                segments = json.load(f)
            try:
                from src.split_transcription import split_transcription_json
            except ImportError:
                from split_transcription import split_transcription_json
            blocks = split_transcription_json(segments)
            
            # Salvando os blocos divididos em transcripts/sections como o script original faz
            out_json_path = Path(os.path.join(transcript_dir, "sections", f"{video_id}_split.json"))
            out_txt_path = Path(os.path.join(transcript_dir, "sections", f"{video_id}_split.txt"))
            
            # Salva o JSON
            with out_json_path.open("w", encoding="utf-8") as f:
                json.dump(blocks, f, ensure_ascii=False, indent=2)
                
            # Salva o TXT
            with out_txt_path.open("w", encoding="utf-8") as f:
                for block in blocks:
                    f.write(block["text"] + "\n\n")
            
            print(f"Split concluído. {len(blocks)} blocos salvos em {out_json_path} e {out_txt_path}")
            
            for block in blocks:
                start_formatted = format_timestamp(block['start'])
                end_formatted = format_timestamp(block['end'])
                all_blocks.append({"transcrição": block["text"], "timestamp": f"{start_formatted} - {end_formatted}", "video_id": video_id})
        else:
            with open(transcription_file, encoding="utf-8") as f:
                text = f.read()
            blocks = split_transcription(text)
            
            # Salvando os blocos de texto em transcripts/sections
            out_txt_path = Path(os.path.join(transcript_dir, "sections", f"{video_id}_split.txt"))
            with out_txt_path.open("w", encoding="utf-8") as f:
                for block in blocks:
                    f.write(block + "\n\n")
                    
            print(f"Split concluído. {len(blocks)} blocos salvos em {out_txt_path}")
            
            for block in blocks:
                all_blocks.append({"transcrição": block, "video_id": video_id})
    
    if all_blocks:
        excel_path = save_blocks_to_excel(all_blocks, excel_name)
        
        # Se análise IA foi solicitada, processar o arquivo Excel gerado
        if ai_analysis and excel_path:
            print("Iniciando análise IA...")
            asyncio.run(process_ai_analysis(excel_path, target_person, ai_resume))
    else:
        print("Nenhum trecho gerado.")


async def process_ai_analysis(excel_file, target_person=None, resume_existing=True):
    """
    Processa análise IA em um arquivo Excel.
    
    Args:
        excel_file: Caminho para o arquivo Excel
        target_person: Nome da pessoa específica a analisar
        resume_existing: Se deve continuar de arquivo existente
    """
    try:
        classifier = ContentClassifier()
        
        # Define arquivo de saída
        excel_path = Path(excel_file)
        output_file = excel_path.parent / f"{excel_path.stem}_ai_analysis{excel_path.suffix}"
        
        await classifier.classify_excel_file(
            input_file=str(excel_file),
            output_file=str(output_file),
            target_person=target_person,
            resume_existing=resume_existing
        )
        
        print(f"Análise IA concluída! Arquivo salvo em: {output_file}")
        
    except Exception as e:
        print(f"Erro na análise IA: {e}")
        raise


async def process_only_ai_analysis(excel_file, target_person=None, resume_existing=True):
    """
    Processa apenas análise IA em um arquivo Excel existente.
    
    Args:
        excel_file: Caminho para o arquivo Excel existente
        target_person: Nome da pessoa específica a analisar  
        resume_existing: Se deve continuar de arquivo existente
    """
    if not Path(excel_file).exists():
        print(f"Arquivo Excel não encontrado: {excel_file}")
        return
    
    try:
        classifier = ContentClassifier()
        
        # Define arquivo de saída
        excel_path = Path(excel_file)
        output_file = excel_path.parent / f"{excel_path.stem}_ai_analysis{excel_path.suffix}"
        
        await classifier.classify_excel_file(
            input_file=str(excel_file),
            output_file=str(output_file),
            target_person=target_person,
            resume_existing=resume_existing
        )
        
        print(f"Análise IA concluída! Arquivo salvo em: {output_file}")
        
    except Exception as e:
        print(f"Erro na análise IA: {e}")
        raise

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Processa vídeos do YouTube, transcreve e exporta para Excel.")
    parser.add_argument("-t", "--transcripts", default="transcripts", help="Diretório para salvar as transcrições completas")
    parser.add_argument("-a", "--audios", default="audios", help="Diretório para salvar os áudios baixados")
    parser.add_argument("-x", "--excel", default="transcricoes.xlsx", help="Nome do arquivo Excel de saída (será salvo em excel_output)")
    parser.add_argument("--only-excel", action="store_true", help="Apenas gera o Excel a partir das transcrições já existentes")
    parser.add_argument("-l", "--list", action="store_true", help="Permite baixar playlists inteiras (por padrão, só baixa o vídeo individual)")
    parser.add_argument("-id", "--video-id", help="Processa apenas o vídeo com este ID do YouTube")
    parser.add_argument("--ignore", action="store_true", help="Ignora download/transcrição se o vídeo já tiver transcrição gerada")
    parser.add_argument("--whisper", action="store_true", help="Força o uso do Whisper original (padrão: faster-whisper)")
    parser.add_argument("--test-whisper", action="store_true", help="Executa apenas um teste de transcrição Whisper para o vídeo especificado com arquivos _test.")
    parser.add_argument("--cpu", action="store_true", help="Força o uso de CPU para a transcrição (ignora GPU mesmo se disponível)")
    parser.add_argument("--test-excel", help="Gera um Excel a partir de um arquivo de transcrição _test.txt (e _test.json) com timestamps.")
    
    # Argumentos de análise IA
    parser.add_argument("--ai-analysis", action="store_true", help="Ativa análise IA após geração do Excel")
    parser.add_argument("--only-ai-analysis", help="Processa apenas análise IA em arquivo Excel existente (caminho para o arquivo)")
    parser.add_argument("--ai-resume", action="store_true", help="Retoma análise IA de arquivo existente")
    parser.add_argument("--target-person", help="Nome da pessoa específica para análise (sobrescreve config.py)")
    parser.add_argument("--with-explanation", action="store_true", help="Inclui explicações detalhadas na análise IA (mais caro)")
    
    args = parser.parse_args()
    
    # Configurar explicações se solicitado
    if args.with_explanation:
        try:
            from src.config import CLASSIFICATION_WITH_EXPLANATION
            import src.config as config
            config.CLASSIFICATION_WITH_EXPLANATION = True
        except ImportError:
            import config
            config.CLASSIFICATION_WITH_EXPLANATION = True
    
    if args.test_whisper:
        if not args.video_id:
            print("Você deve passar o argumento -id para usar --test-whisper.")
            sys.exit(1)
        test_whisper_transcription(args.video_id, args.audios, args.transcripts, force_cpu=args.cpu, use_whisper=args.whisper)
    elif args.test_excel:
        generate_excel_from_test(args.test_excel)
    elif args.only_ai_analysis:
        # Processa apenas análise IA
        asyncio.run(process_only_ai_analysis(
            excel_file=args.only_ai_analysis,
            target_person=args.target_person,
            resume_existing=args.ai_resume
        ))
    else:
        process_all(
            args.audios, 
            args.transcripts, 
            args.excel, 
            only_excel=args.only_excel, 
            playlist_mode=args.list, 
            video_id_filter=args.video_id, 
            ignore_existing=args.ignore, 
            use_whisper=args.whisper,
            ai_analysis=args.ai_analysis,
            target_person=args.target_person
        )