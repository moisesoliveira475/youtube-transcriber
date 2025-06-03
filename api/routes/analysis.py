"""
Endpoints para análise de IA
"""
from flask import Blueprint, request, jsonify
from api.services.analysis_service import analysis_service
from api.services.job_manager import job_manager

bp = Blueprint('analysis', __name__)

@bp.route('/analyze', methods=['POST'])
def start_analysis():
    """
    Inicia análise de IA em arquivo Excel
    
    Body: {
        "excel_file": "transcricoes_2025-05-28_12-56-03.xlsx",
        "target_person": "João Silva",
        "with_explanation": true,
        "resume": false
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        excel_file = data.get('excel_file')
        if not excel_file:
            return jsonify({'error': 'excel_file is required'}), 400
        
        options = {
            'target_person': data.get('target_person'),
            'with_explanation': data.get('with_explanation', False),
            'resume': data.get('resume', False)
        }
        
        # Inicia job de análise
        job_id = analysis_service.start_analysis_job(excel_file, options)
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': f'AI analysis job started for file: {excel_file}'
        }), 202
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/excel-files', methods=['GET'])
def list_excel_files():
    """
    Lista arquivos Excel disponíveis para análise
    """
    try:
        files = analysis_service.list_available_excel_files()
        
        return jsonify({
            'success': True,
            'files': files,
            'count': len(files)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
