"""
Módulo de análise de IA para classificação de conteúdo.
Inclui geração de resumos e classificação de calúnia, injúria e difamação.
"""

from .summary_generator import SummaryGenerator
from .content_classifier import ContentClassifier
from .vertex_client import VertexAIClient

__all__ = ['SummaryGenerator', 'ContentClassifier', 'VertexAIClient']
