"""
Endpoints para gerenciamento de arquivos
"""
from flask import Blueprint, jsonify, send_file
from src.config import EXCEL_OUTPUT_DIR, TRANSCRIPT_DIR, AUDIO_DIR

bp = Blueprint('files', __name__)

@bp.route('/files/excel', methods=['GET'])
def list_excel_files():
    """
    Lista todos os arquivos Excel gerados
    """
    try:
        files = []
        
        if EXCEL_OUTPUT_DIR.exists():
            for file_path in EXCEL_OUTPUT_DIR.glob("*.xlsx"):
                stat = file_path.stat()
                files.append({
                    'filename': file_path.name,
                    'path': str(file_path.relative_to(EXCEL_OUTPUT_DIR.parent)),
                    'size': stat.st_size,
                    'modified': stat.st_mtime,
                    'is_ai_analysis': '_ai_analysis.xlsx' in file_path.name
                })
        
        # Ordena por data de modificação (mais recente primeiro)
        files.sort(key=lambda x: x['modified'], reverse=True)
        
        return jsonify({
            'success': True,
            'files': files,
            'count': len(files)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/files/transcripts', methods=['GET'])
def list_transcript_files():
    """
    Lista arquivos de transcrição
    """
    try:
        files = {
            'words': [],
            'sections': [],
            'summaries': []
        }
        
        # Words (JSON com timestamps)
        words_dir = TRANSCRIPT_DIR / 'words'
        if words_dir.exists():
            for file_path in words_dir.glob("*.json"):
                stat = file_path.stat()
                files['words'].append({
                    'filename': file_path.name,
                    'video_id': file_path.stem,
                    'size': stat.st_size,
                    'modified': stat.st_mtime
                })
        
        # Sections (blocos divididos)
        sections_dir = TRANSCRIPT_DIR / 'sections'
        if sections_dir.exists():
            for file_path in sections_dir.glob("*_split.json"):
                stat = file_path.stat()
                files['sections'].append({
                    'filename': file_path.name,
                    'video_id': file_path.name.replace('_split.json', ''),
                    'size': stat.st_size,
                    'modified': stat.st_mtime
                })
        
        # Summaries (resumos AI)
        summaries_dir = TRANSCRIPT_DIR / 'summaries'
        if summaries_dir.exists():
            for file_path in summaries_dir.glob("*_summary.txt"):
                stat = file_path.stat()
                files['summaries'].append({
                    'filename': file_path.name,
                    'video_id': file_path.name.replace('_summary.txt', ''),
                    'size': stat.st_size,
                    'modified': stat.st_mtime
                })
        
        return jsonify({
            'success': True,
            'files': files
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/files/download/<path:filepath>', methods=['GET'])
def download_file(filepath):
    """
    Download de arquivos gerados
    """
    try:
        # Resolve caminho seguro
        base_paths = [EXCEL_OUTPUT_DIR, TRANSCRIPT_DIR, AUDIO_DIR]
        file_found = None
        
        for base_path in base_paths:
            potential_path = base_path / filepath
            if potential_path.exists() and potential_path.is_file():
                # Verifica se o arquivo está dentro do diretório permitido
                if str(potential_path.resolve()).startswith(str(base_path.resolve())):
                    file_found = potential_path
                    break
        
        if not file_found:
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            str(file_found),
            as_attachment=True,
            download_name=file_found.name
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/files/transcript/<video_id>', methods=['GET'])
def get_transcript_content(video_id):
    """
    Retorna o conteúdo de transcrição de um vídeo como texto
    """
    try:
        # Procura arquivo de transcrição completa (words)
        words_dir = TRANSCRIPT_DIR / 'words'
        transcript_file = words_dir / f"{video_id}.txt"
        
        if not transcript_file.exists():
            return jsonify({'error': 'Transcript not found'}), 404
        
        # Lê o conteúdo do arquivo
        with open(transcript_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return jsonify({
            'success': True,
            'video_id': video_id,
            'content': content,
            'file_path': str(transcript_file.relative_to(TRANSCRIPT_DIR.parent))
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/files/info', methods=['GET'])
def get_files_info():
    """
    Retorna informações gerais sobre os arquivos
    """
    try:
        info = {
            'directories': {
                'excel_output': str(EXCEL_OUTPUT_DIR),
                'transcripts': str(TRANSCRIPT_DIR),
                'audios': str(AUDIO_DIR)
            },
            'counts': {
                'excel_files': 0,
                'audio_files': 0,
                'transcript_files': 0
            },
            'total_size': {
                'excel': 0,
                'audio': 0,
                'transcripts': 0
            }
        }
        
        # Conta arquivos Excel
        if EXCEL_OUTPUT_DIR.exists():
            excel_files = list(EXCEL_OUTPUT_DIR.glob("*.xlsx"))
            info['counts']['excel_files'] = len(excel_files)
            info['total_size']['excel'] = sum(f.stat().st_size for f in excel_files)
        
        # Conta arquivos de áudio
        if AUDIO_DIR.exists():
            audio_files = list(AUDIO_DIR.glob("*"))
            audio_files = [f for f in audio_files if f.is_file()]
            info['counts']['audio_files'] = len(audio_files)
            info['total_size']['audio'] = sum(f.stat().st_size for f in audio_files)
        
        # Conta arquivos de transcrição
        if TRANSCRIPT_DIR.exists():
            transcript_files = []
            for subdir in ['words', 'sections', 'summaries']:
                subdir_path = TRANSCRIPT_DIR / subdir
                if subdir_path.exists():
                    transcript_files.extend(list(subdir_path.glob("*")))
            
            transcript_files = [f for f in transcript_files if f.is_file()]
            info['counts']['transcript_files'] = len(transcript_files)
            info['total_size']['transcripts'] = sum(f.stat().st_size for f in transcript_files)
        
        return jsonify({
            'success': True,
            'info': info
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/files/audio', methods=['GET'])
def list_audio_files():
    """
    Lista arquivos de áudio
    """
    try:
        from src.config import AUDIO_DIR
        files = []
        if AUDIO_DIR.exists():
            for file_path in AUDIO_DIR.glob("*"):
                if file_path.is_file():
                    stat = file_path.stat()
                    files.append({
                        'filename': file_path.name,
                        'size': stat.st_size,
                        'modified': stat.st_mtime
                    })
        files.sort(key=lambda x: x['modified'], reverse=True)
        return jsonify({
            'success': True,
            'files': files,
            'count': len(files)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
