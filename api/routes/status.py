"""
Endpoints para status de jobs
"""
from flask import Blueprint, jsonify, request
from api.services.job_manager import job_manager

bp = Blueprint('status', __name__)

@bp.route('/jobs/<job_id>/status', methods=['GET'])
def get_job_status(job_id):
    """
    Retorna status de um job
    
    Response: {
        "id": "job_id",
        "status": "processing|completed|error|pending",
        "progress": 45,
        "current_step": "Processing video 2/5",
        "created_at": "2025-05-28T12:00:00",
        "updated_at": "2025-05-28T12:05:00",
        "result": { ... },
        "error": null
    }
    """
    try:
        job = job_manager.get_job(job_id)
        
        if not job:
            return jsonify({'error': f'Job {job_id} not found'}), 404
        
        return jsonify(job), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/jobs', methods=['GET'])
def list_jobs():
    """
    Lista jobs recentes
    
    Query params:
    - type: filtrar por tipo (transcription, analysis)
    - limit: número máximo de jobs (padrão: 50)
    """
    try:
        job_type = request.args.get('type')
        limit = int(request.args.get('limit', 50))
        
        jobs = job_manager.list_jobs(job_type=job_type, limit=limit)
        
        return jsonify({
            'success': True,
            'jobs': jobs,
            'count': len(jobs)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/jobs/<job_id>', methods=['DELETE'])
def cancel_job(job_id):
    """
    Cancela um job (apenas marca como cancelado, não para execução)
    """
    try:
        job = job_manager.get_job(job_id)
        
        if not job:
            return jsonify({'error': f'Job {job_id} not found'}), 404
        
        if job['status'] in ['completed', 'error']:
            return jsonify({'error': f'Cannot cancel job with status: {job["status"]}'}), 400
        
        job_manager.update_job(job_id, status='cancelled', step='Cancelled by user')
        
        return jsonify({
            'success': True,
            'message': f'Job {job_id} cancelled'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
