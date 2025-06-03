"""
Modelos de dados para validação de requests/responses
"""
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class TranscriptionRequest:
    urls: List[str]
    only_excel: bool = False
    playlist_mode: bool = False
    video_id_filter: Optional[str] = None
    ignore_existing: bool = False
    use_whisper: bool = False
    ai_analysis: bool = False
    target_person: Optional[str] = None

@dataclass
class AnalysisRequest:
    excel_file: str
    target_person: Optional[str] = None
    with_explanation: bool = False
    resume: bool = False

@dataclass
class JobResponse:
    job_id: str
    status: str
    progress: int
    current_step: str
    created_at: str
    updated_at: str
    result: Optional[Any] = None
    error: Optional[str] = None
