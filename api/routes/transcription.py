"""
Endpoints para operações de transcrição
"""
from flask import Blueprint, request, jsonify
from api.services.transcription_service import transcription_service
from api.services.job_manager import job_manager

bp = Blueprint('transcription', __name__)

@bp.route('/transcribe', methods=['POST'])
def start_transcription():
    """
    Inicia processo de transcrição
    
    Body: {
        "urls": ["url1", "url2"],
        "options": {
            "only_excel": false,
            "playlist_mode": false,
            "ignore_existing": false,
            "use_whisper": false,
            "ai_analysis": false,
            "target_person": "Nome da Pessoa"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        urls = data.get('urls', [])
        if not urls:
            return jsonify({'error': 'URLs list is required'}), 400
        
        if not isinstance(urls, list):
            return jsonify({'error': 'URLs must be a list'}), 400
        
        options = data.get('options', {})
        
        # Valida URLs
        for url in urls:
            if not isinstance(url, str) or not url.strip():
                return jsonify({'error': f'Invalid URL: {url}'}), 400
        
        # Inicia job de transcrição
        job_id = transcription_service.start_transcription_job(urls, options)
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': f'Transcription job started for {len(urls)} URL(s)'
        }), 202
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/transcribe/single', methods=['POST'])
def transcribe_single():
    """
    Transcreve um único vídeo
    
    Body: {
        "url": "youtube_url",
        "options": { ... }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        url = data.get('url')
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        options = data.get('options', {})
        
        # Inicia job de transcrição
        job_id = transcription_service.transcribe_single_video(url, options)
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': f'Transcription job started for URL: {url}'
        }), 202
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/video-info', methods=['POST'])
def get_video_info():
    """
    Extrai informações de um vídeo do YouTube
    
    Body: {
        "url": "youtube_url"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        url = data.get('url')
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        info = transcription_service.get_video_info(url)
        
        if info['success']:
            return jsonify(info), 200
        else:
            return jsonify(info), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
