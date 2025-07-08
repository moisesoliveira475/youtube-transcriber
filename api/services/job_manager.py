"""
Job Manager simples para gerenciar tarefas assíncronas
"""
import json
import time
import uuid
import threading
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

class SimpleJobManager:
    def __init__(self, jobs_file: str = "api_jobs.json"):
        self.jobs_file = Path(jobs_file)
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()
        self._load_jobs()
    
    def _load_jobs(self):
        """Carrega jobs do arquivo JSON"""
        if self.jobs_file.exists():
            try:
                with open(self.jobs_file, 'r', encoding='utf-8') as f:
                    self.jobs = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                self.jobs = {}
    
    def _save_jobs(self):
        """Salva jobs no arquivo JSON"""
        with self.lock:
            with open(self.jobs_file, 'w', encoding='utf-8') as f:
                json.dump(self.jobs, f, indent=2, ensure_ascii=False)
    
    def create_job(self, job_type: str, data: Dict[str, Any]) -> str:
        """Cria um novo job e retorna o job_id"""
        job_id = str(uuid.uuid4())
        
        job = {
            'id': job_id,
            'type': job_type,
            'status': 'pending',
            'progress': 0,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'data': data,
            'current_step': 'Initializing...',
            'steps': [],  # Lista de steps detalhados
            'logs': [],   # Lista de logs textuais
            'result': None,
            'error': None
        }
        
        with self.lock:
            self.jobs[job_id] = job
        
        self._save_jobs()
        return job_id

    def add_step(self, job_id: str, step_id: str, name: str, status: str = "pending", message: str = ""):
        """Adiciona ou atualiza um step do job"""
        if job_id not in self.jobs:
            return False
        with self.lock:
            job = self.jobs[job_id]
            steps = job.setdefault('steps', [])
            # Atualiza se já existe, senão adiciona
            for s in steps:
                if s['id'] == step_id:
                    s.update({"status": status, "message": message})
                    break
            else:
                steps.append({"id": step_id, "name": name, "status": status, "message": message})
        self._save_jobs()
        return True

    def update_step_status(self, job_id: str, step_id: str, status: str, message: str = ""):
        """Atualiza status de um step existente"""
        return self.add_step(job_id, step_id, name=step_id, status=status, message=message)

    def add_log(self, job_id: str, message: str):
        """Adiciona uma mensagem de log ao job"""
        if job_id not in self.jobs:
            return False
        with self.lock:
            logs = self.jobs[job_id].setdefault('logs', [])
            logs.append(f"[{datetime.now().isoformat()}] {message}")
        self._save_jobs()
        return True
    
    def update_job(self, job_id: str, status: Optional[str] = None, 
                   step: Optional[str] = None, progress: Optional[int] = None,
                   result: Optional[Any] = None, error: Optional[str] = None):
        """Atualiza um job existente"""
        if job_id not in self.jobs:
            return False
        
        with self.lock:
            job = self.jobs[job_id]
            
            if status:
                job['status'] = status
            if step:
                job['current_step'] = step
            if progress is not None:
                job['progress'] = progress
            if result is not None:
                job['result'] = result
            if error is not None:
                job['error'] = error
            
            job['updated_at'] = datetime.now().isoformat()
        
        self._save_jobs()
        return True
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retorna informações de um job"""
        return self.jobs.get(job_id)
    
    def complete_job(self, job_id: str, result: Any):
        """Marca job como completo"""
        self.update_job(job_id, status='completed', progress=100, result=result)
    
    def fail_job(self, job_id: str, error: str):
        """Marca job como falhado"""
        self.update_job(job_id, status='error', error=error)
    
    def list_jobs(self, job_type: Optional[str] = None, limit: int = 50) -> list:
        """Lista jobs, opcionalmente filtrados por tipo"""
        jobs_list = list(self.jobs.values())
        
        if job_type:
            jobs_list = [job for job in jobs_list if job['type'] == job_type]
        
        # Ordena por data de criação (mais recente primeiro)
        jobs_list.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jobs_list[:limit]
    
    def cleanup_old_jobs(self, days: int = 7):
        """Remove jobs antigos"""
        cutoff_time = time.time() - (days * 24 * 60 * 60)
        
        with self.lock:
            jobs_to_remove = []
            for job_id, job in self.jobs.items():
                try:
                    created_time = datetime.fromisoformat(job['created_at']).timestamp()
                    if created_time < cutoff_time:
                        jobs_to_remove.append(job_id)
                except (ValueError, KeyError):
                    continue
            
            for job_id in jobs_to_remove:
                del self.jobs[job_id]
        
        if jobs_to_remove:
            self._save_jobs()
        
        return len(jobs_to_remove)

# Instância global do job manager
job_manager = SimpleJobManager()
