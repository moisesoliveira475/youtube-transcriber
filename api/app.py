"""
Flask API para YouTube Transcriber
Expõe endpoints REST mantendo compatibilidade com CLI
"""
import os
import sys
from flask import Flask
from flask_cors import CORS

# Add project root to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    
    # Enable CORS for frontend integration
    CORS(app)
    
    # Register blueprints
    from api.routes.transcription import bp as transcription_bp
    from api.routes.analysis import bp as analysis_bp
    from api.routes.files import bp as files_bp
    from api.routes.status import bp as status_bp
    
    app.register_blueprint(transcription_bp, url_prefix='/api')
    app.register_blueprint(analysis_bp, url_prefix='/api')
    app.register_blueprint(files_bp, url_prefix='/api')
    app.register_blueprint(status_bp, url_prefix='/api')
    
    @app.route('/')
    def index():
        return {
            'message': 'YouTube Transcriber API',
            'version': '1.0.0',
            'endpoints': {
                'transcription': '/api/transcribe',
                'analysis': '/api/analyze',
                'files': '/api/files',
                'status': '/api/jobs/{job_id}/status'
            }
        }
    
    @app.route('/health')
    def health():
        return {'status': 'ok'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
