"""
Utilitários para respostas da API
"""
from flask import jsonify
from typing import Any, Dict, Optional

def success_response(data: Any = None, message: str = None, status_code: int = 200):
    """
    Cria uma resposta de sucesso padronizada
    """
    response = {'success': True}
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    return jsonify(response), status_code

def error_response(error: str, status_code: int = 400, details: Optional[Dict] = None):
    """
    Cria uma resposta de erro padronizada
    """
    response = {
        'success': False,
        'error': error
    }
    
    if details:
        response['details'] = details
    
    return jsonify(response), status_code

def job_created_response(job_id: str, message: str = None):
    """
    Resposta padronizada para criação de jobs
    """
    return success_response(
        data={'job_id': job_id},
        message=message or f'Job {job_id} created successfully',
        status_code=202
    )
