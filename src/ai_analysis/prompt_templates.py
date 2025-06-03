"""
Templates de prompts para análise de IA.
"""
from typing import Optional
try:
    from ..config import TARGET_PERSON_NAME, ANALYSIS_CONTEXT
except ImportError:
    from config import TARGET_PERSON_NAME, ANALYSIS_CONTEXT


class PromptTemplates:
    """Templates de prompts para diferentes tipos de análise."""
    
    @staticmethod
    def get_summary_prompt(full_transcription: str) -> str:
        """
        Gera prompt para criação de resumo do vídeo.
        
        Args:
            full_transcription: Transcrição completa do vídeo
            
        Returns:
            Prompt para geração de resumo
        """
        return f"""
Você é um assistente especializado em análise de conteúdo. Sua tarefa é criar um resumo abrangente e objetivo do seguinte conteúdo de vídeo transcrito.

**Instruções para o resumo:**
- Identifique o tema principal e subtemas abordados
- Liste as principais pessoas mencionadas
- Descreva o tom geral do conteúdo (neutro, crítico, elogioso, etc.)
- Identifique o contexto (notícia, debate, entrevista, opinião, etc.)
- Mencione os principais pontos ou argumentos apresentados
- Mantenha objetividade e neutralidade

**Formato do resumo:**
- Tema principal: [tema]
- Pessoas mencionadas: [lista de pessoas]
- Contexto: [tipo de conteúdo]
- Tom geral: [tom]
- Principais pontos: [lista de pontos principais]
- Resumo geral: [resumo em 2-3 parágrafos]

**Transcrição completa:**
{full_transcription}

Por favor, forneça um resumo seguindo o formato especificado.
"""
    
    @staticmethod
    def get_classification_prompt(
        segment_text: str, 
        video_summary: Optional[str] = None,
        with_explanation: bool = False,
        target_person: Optional[str] = None
    ) -> str:
        """
        Gera prompt para classificação de calúnia, injúria e difamação.
        
        Args:
            segment_text: Texto do segmento a ser classificado
            video_summary: Resumo do vídeo para contexto
            with_explanation: Se deve incluir explicação detalhada
            target_person: Nome da pessoa específica a analisar
            
        Returns:
            Prompt para classificação
        """
        person_name = target_person or TARGET_PERSON_NAME or "[PESSOA ESPECÍFICA]"
        
        context_section = ""
        if video_summary:
            context_section = f"""
**Contexto do vídeo:**
{video_summary}

"""
        
        additional_context = ""
        if ANALYSIS_CONTEXT.strip():
            additional_context = f"""
**Contexto adicional:**
{ANALYSIS_CONTEXT}

"""
        
        explanation_instruction = ""
        response_format = "Responda apenas: Sim ou Não"
        
        if with_explanation:
            explanation_instruction = " Forneça uma explicação clara para cada classificação."
            response_format = """**Formato da resposta:**
Calúnia: [Sim/Não]
Injúria: [Sim/Não] 
Difamação: [Sim/Não]
Explicação: [explicação detalhada]"""
        else:
            response_format = """**Formato da resposta:**
Calúnia: [Sim/Não]
Injúria: [Sim/Não]
Difamação: [Sim/Não]"""
        
        return f"""
Você é um assistente especializado em análise jurídica de conteúdo para identificar possíveis casos de calúnia, injúria e difamação em relação à pessoa {person_name}.

{context_section}{additional_context}**Definições jurídicas:**

**Calúnia:** Atribuir falsamente a alguém fato definido como crime.
- Exemplos: Acusar alguém de roubo, fraude, corrupção sem provas

**Injúria:** Ofender a dignidade ou o decoro de alguém.
- Exemplos: Xingamentos, ofensas pessoais, ataques ao caráter

**Difamação:** Imputar a alguém fato ofensivo à sua reputação.
- Exemplos: Espalhar boatos prejudiciais, atribuir comportamentos que manchem a reputação

**Sua tarefa:** Analise o trecho fornecido e determine se contém elementos que se enquadram em calúnia, injúria ou difamação contra {person_name}.{explanation_instruction}

{response_format}

**Trecho a ser analisado:**
"{segment_text}"

Analise o trecho acima considerando as definições jurídicas e o contexto fornecido.
"""
