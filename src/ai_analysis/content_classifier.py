"""
Classitry:
    from ..utils.logger import get_logger
    from ..config import (
        AI_SAVE_INTERVAL, CLASSIFICATION_WITH_EXPLANATION, TARGET_PERSON_NAME
    )
except ImportError:
    from utils.logger import get_logger
    from config import (
        AI_SAVE_INTERVAL, CLASSIFICATION_WITH_EXPLANATION, TARGET_PERSON_NAME
    )dor de conteúdo para análise de calúnia, injúria e difamação.
"""
import pandas as pd
from typing import Optional, Dict, List
from pathlib import Path
from tqdm import tqdm
from .vertex_client import VertexAIClient
from .prompt_templates import PromptTemplates
from .summary_generator import SummaryGenerator
from ..utils.logger import setup_logger
from ..config import (
    AI_SAVE_INTERVAL, CLASSIFICATION_WITH_EXPLANATION, TARGET_PERSON_NAME
)

logger = setup_logger(__name__)


class ContentClassifier:
    """Classificador de conteúdo usando IA."""
    
    def __init__(self):
        """Inicializa o classificador."""
        self.client = VertexAIClient()
        self.summary_generator = SummaryGenerator()
    
    def _parse_classification_response(self, response: str) -> Dict[str, str]:
        """
        Faz parse da resposta de classificação da IA.
        
        Args:
            response: Resposta da IA
            
        Returns:
            Dicionário com as classificações
        """
        result = {
            'calúnia': 'Erro',
            'injúria': 'Erro', 
            'difamação': 'Erro',
            'explicação': ''
        }
        
        try:
            lines = response.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('Calúnia:'):
                    result['calúnia'] = 'Sim' if 'Sim' in line else 'Não'
                elif line.startswith('Injúria:'):
                    result['injúria'] = 'Sim' if 'Sim' in line else 'Não'
                elif line.startswith('Difamação:'):
                    result['difamação'] = 'Sim' if 'Sim' in line else 'Não'
                elif line.startswith('Explicação:'):
                    result['explicação'] = line.replace('Explicação:', '').strip()
        except Exception as e:
            logger.error(f"Erro ao fazer parse da resposta: {e}")
            result['explicação'] = f"Erro no parse: {response}"
        
        return result
    
    async def classify_segment(
        self, 
        segment_text: str, 
        video_summary: Optional[str] = None,
        target_person: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Classifica um segmento de texto.
        
        Args:
            segment_text: Texto do segmento
            video_summary: Resumo do vídeo para contexto
            target_person: Nome da pessoa específica
            
        Returns:
            Dicionário com classificações
        """
        try:
            prompt = PromptTemplates.get_classification_prompt(
                segment_text=segment_text,
                video_summary=video_summary,
                with_explanation=CLASSIFICATION_WITH_EXPLANATION,
                target_person=target_person
            )
            
            response = await self.client.generate_content_async(prompt)
            return self._parse_classification_response(response)
            
        except Exception as e:
            logger.error(f"Erro ao classificar segmento: {e}")
            return {
                'calúnia': 'Erro',
                'injúria': 'Erro',
                'difamação': 'Erro',
                'explicação': f"Erro na classificação: {str(e)}"
            }
    
    def _add_classification_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Adiciona colunas de classificação ao DataFrame se não existirem.
        
        Args:
            df: DataFrame a ser modificado
            
        Returns:
            DataFrame com colunas adicionadas
        """
        classification_columns = ['Calúnia_IA', 'Injúria_IA', 'Difamação_IA']
        
        if CLASSIFICATION_WITH_EXPLANATION:
            classification_columns.append('Explicação_IA')
        
        for col in classification_columns:
            if col not in df.columns:
                df[col] = pd.NA
        
        return df
    
    def _save_progress(self, df: pd.DataFrame, output_file: str) -> None:
        """
        Salva progresso no arquivo Excel.
        
        Args:
            df: DataFrame para salvar
            output_file: Caminho do arquivo de saída
        """
        try:
            logger.info(f"Salvando progresso em '{output_file}'...")
            with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Sheet1', index=False)
            logger.info("Progresso salvo com sucesso!")
        except Exception as e:
            logger.error(f"Erro ao salvar progresso: {e}")
    
    def _get_video_ids_from_dataframe(self, df: pd.DataFrame) -> List[str]:
        """
        Extrai IDs únicos de vídeos do DataFrame.
        
        Args:
            df: DataFrame com dados
            
        Returns:
            Lista de IDs de vídeos únicos
        """
        if 'video_id' in df.columns:
            return df['video_id'].unique().tolist()
        else:
            logger.warning("Coluna 'video_id' não encontrada no DataFrame")
            return []
    
    async def classify_excel_file(
        self, 
        input_file: str, 
        output_file: str,
        sheet_name: str = 'Sheet1',
        target_person: Optional[str] = None,
        resume_existing: bool = True
    ) -> None:
        """
        Classifica todos os segmentos de um arquivo Excel.
        
        Args:
            input_file: Arquivo Excel de entrada
            output_file: Arquivo Excel de saída
            sheet_name: Nome da aba
            target_person: Nome da pessoa específica a analisar
            resume_existing: Se deve continuar de arquivo existente
        """
        # Determina pessoa alvo
        person_name = target_person or TARGET_PERSON_NAME
        if not person_name:
            logger.warning("Nome da pessoa não definido. Use TARGET_PERSON_NAME no config.py")
        
        # Carrega dados
        if resume_existing and Path(output_file).exists():
            logger.info(f"Carregando progresso existente de '{output_file}'...")
            df = pd.read_excel(output_file, sheet_name=sheet_name)
        else:
            logger.info(f"Carregando dados iniciais de '{input_file}', sheet: {sheet_name}")
            df = pd.read_excel(input_file, sheet_name=sheet_name)
        
        logger.info(f"Total de segmentos carregados: {len(df)}")
        
        # Prepara DataFrame
        df['transcrição'] = df['transcrição'].fillna('').astype(str)
        df = self._add_classification_columns(df)
        
        # Identifica segmentos para processar
        mask = pd.isna(df['Calúnia_IA']) | pd.isna(df['Injúria_IA']) | pd.isna(df['Difamação_IA'])
        indices_to_process = df[mask].index.tolist()
        
        if not indices_to_process:
            logger.info("Todos os segmentos já foram processados!")
            return
        
        logger.info(f"Segmentos a processar: {len(indices_to_process)}")
        
        # Gera resumos dos vídeos
        video_ids = self._get_video_ids_from_dataframe(df)
        logger.info(f"Gerando resumos para {len(video_ids)} vídeos...")
        summaries = await self.summary_generator.generate_summaries_for_videos(video_ids)
        
        # Processa segmentos
        try:
            with tqdm(total=len(indices_to_process), desc="Classificando segmentos") as pbar:
                for i, index in enumerate(indices_to_process):
                    try:
                        segment_text = df.at[index, 'transcrição']
                        video_id = df.at[index, 'video_id'] if 'video_id' in df.columns else None
                        video_summary = summaries.get(video_id) if video_id else None
                        
                        # Classifica segmento
                        classification = await self.classify_segment(
                            segment_text=segment_text,
                            video_summary=video_summary,
                            target_person=person_name
                        )
                        
                        # Atualiza DataFrame
                        df.at[index, 'Calúnia_IA'] = classification['calúnia']
                        df.at[index, 'Injúria_IA'] = classification['injúria']
                        df.at[index, 'Difamação_IA'] = classification['difamação']
                        
                        if CLASSIFICATION_WITH_EXPLANATION:
                            df.at[index, 'Explicação_IA'] = classification['explicação']
                        
                        pbar.update(1)
                        
                        # Salva progresso periodicamente
                        if (i + 1) % AI_SAVE_INTERVAL == 0 or i == len(indices_to_process) - 1:
                            logger.info(f"Processados {i + 1} segmentos. Salvando progresso...")
                            self._save_progress(df, output_file)
                    
                    except Exception as e:
                        logger.error(f"Erro ao processar segmento {index}: {e}")
                        self._save_progress(df, output_file)
                        raise
        
        except KeyboardInterrupt:
            logger.info("Processo interrompido pelo usuário. Salvando estado atual...")
            self._save_progress(df, output_file)
            raise
        
        logger.info(f"Classificação concluída! Resultados salvos em '{output_file}'")
    
    async def classify_dataframe(
        self, 
        df: pd.DataFrame,
        target_person: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Classifica segmentos de um DataFrame.
        
        Args:
            df: DataFrame com segmentos
            target_person: Nome da pessoa específica a analisar
            
        Returns:
            DataFrame com classificações
        """
        # Determina pessoa alvo
        person_name = target_person or TARGET_PERSON_NAME
        
        # Prepara DataFrame
        df = df.copy()
        df['transcrição'] = df['transcrição'].fillna('').astype(str)
        df = self._add_classification_columns(df)
        
        # Gera resumos se necessário
        video_ids = self._get_video_ids_from_dataframe(df)
        summaries = await self.summary_generator.generate_summaries_for_videos(video_ids)
        
        # Processa todos os segmentos
        for index in df.index:
            segment_text = df.at[index, 'transcrição']
            video_id = df.at[index, 'video_id'] if 'video_id' in df.columns else None
            video_summary = summaries.get(video_id) if video_id else None
            
            classification = await self.classify_segment(
                segment_text=segment_text,
                video_summary=video_summary,
                target_person=person_name
            )
            
            df.at[index, 'Calúnia_IA'] = classification['calúnia']
            df.at[index, 'Injúria_IA'] = classification['injúria']
            df.at[index, 'Difamação_IA'] = classification['difamação']
            
            if CLASSIFICATION_WITH_EXPLANATION:
                df.at[index, 'Explicação_IA'] = classification['explicação']
        
        return df
    
    def analyze_excel_file(self, input_file: str, output_file: str = "", sheet_name: str = 'Sheet1', target_person: Optional[str] = None, with_explanation: bool = False, resume: bool = True) -> str:
        """
        Wrapper síncrono para classify_excel_file (async).
        Executa a classificação e salva o resultado em output_file.
        Retorna o caminho do arquivo de saída.
        """
        import asyncio
        if not output_file:
            # Gera nome de saída padrão
            output_file = input_file.replace('.xlsx', '_ai_analysis.xlsx')
        # Chama a função async de forma síncrona
        asyncio.run(self.classify_excel_file(
            input_file=input_file,
            output_file=output_file,
            sheet_name=sheet_name,
            target_person=target_person,
            resume_existing=resume
        ))
        return output_file
