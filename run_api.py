#!/usr/bin/env python3
"""
Script para inicializar a API Flask do YouTube Transcriber
"""
import os
import sys
from api.app import create_app

# Add project root to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)


if __name__ == '__main__':
    # Configura variáveis de ambiente
    os.environ.setdefault('FLASK_ENV', 'development')
    
    # Cria a aplicação Flask
    app = create_app()
    
    print("🚀 YouTube Transcriber API starting...")
    print("📡 API disponível em: http://localhost:5000")
    print("📚 Documentação: http://localhost:5000")
    print("❤️  Health check: http://localhost:5000/health")
    print("\n📋 Endpoints disponíveis:")
    print("   POST /api/transcribe - Iniciar transcrição")
    print("   POST /api/analyze - Iniciar análise AI")
    print("   GET  /api/jobs/{id}/status - Status do job")
    print("   GET  /api/files/excel - Listar arquivos Excel")
    print("   GET  /api/jobs - Listar jobs")
    print("\n🛑 Para parar: Ctrl+C")
    
    # Inicia o servidor
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )
