# Guia de Uso da Análise IA - YouTube Transcriber

## Funcionalidades Implementadas

A nova funcionalidade de análise IA permite identificar automaticamente casos de **calúnia**, **injúria** e **difamação** em transcrições de vídeos usando inteligência artificial.

## Configuração Inicial

### 1. Instalar Dependências
```bash
pip install google-cloud-aiplatform vertexai
```

### 2. Configurar no config.py
```python
# Nome da pessoa a ser analisada
TARGET_PERSON_NAME = "Nome da Pessoa"

# Contexto adicional para análise
ANALYSIS_CONTEXT = """
Seu contexto específico aqui...
"""

# Configurações de IA
CLASSIFICATION_WITH_EXPLANATION = False  # True para explicações detalhadas (mais caro)
AI_SAVE_INTERVAL = 100  # Salvar a cada N registros
```

### 3. Autenticação Google Cloud
```bash
gcloud auth application-default login
```

## Modos de Uso

### 1. Fluxo Completo (Download + Transcrição + Excel + Análise IA)
```bash
python src/main.py --ai-analysis
```

### 2. Excel + Análise IA (a partir de transcrições existentes)
```bash
python src/main.py --only-excel --ai-analysis
```

### 3. Apenas Análise IA (arquivo Excel existente)
```bash
python src/main.py --only-ai-analysis caminho/para/arquivo.xlsx
```

## Argumentos de Linha de Comando

### Argumentos Principais
- `--ai-analysis`: Ativa análise IA após geração do Excel
- `--only-ai-analysis ARQUIVO`: Processa apenas análise IA em arquivo Excel existente
- `--ai-resume`: Retoma análise IA de arquivo existente (continua de onde parou)

### Configurações Específicas
- `--target-person "Nome"`: Nome da pessoa específica para análise (sobrescreve config.py)
- `--with-explanation`: Inclui explicações detalhadas na análise IA (mais caro)

### Combinações Úteis
```bash
# Análise de vídeo específico com explicações
python src/main.py --only-excel --ai-analysis -id "VIDEO_ID" --with-explanation

# Retomar análise interrompida
python src/main.py --only-ai-analysis arquivo.xlsx --ai-resume

# Análise com pessoa específica
python src/main.py --ai-analysis --target-person "João Silva"
```

## Estrutura de Saída

### Arquivos Gerados
- `transcripts/summaries/{video_id}_summary.txt`: Resumo do vídeo gerado por IA
- `excel_output/{nome}_ai_analysis.xlsx`: Excel com classificações de IA

### Colunas Adicionadas no Excel
- `Calúnia_IA`: Sim/Não para casos de calúnia
- `Injúria_IA`: Sim/Não para casos de injúria  
- `Difamação_IA`: Sim/Não para casos de difamação
- `Explicação_IA`: Explicação detalhada (se ativada)

## Definições Jurídicas Usadas

- **Calúnia**: Atribuir falsamente a alguém fato definido como crime
- **Injúria**: Ofender a dignidade ou o decoro de alguém
- **Difamação**: Imputar a alguém fato ofensivo à sua reputação

## Performance e Custos

### Configurações Recomendadas
- `AI_CONCURRENT_REQUESTS = 5`: Limita requisições simultâneas
- `AI_REQUEST_DELAY = 0.5`: Delay entre requisições
- `CLASSIFICATION_WITH_EXPLANATION = False`: Para economizar tokens

### Backup Automático
- Salvamento automático a cada 100 registros (configurável)
- Possibilidade de retomar análises interrompidas
- Logs detalhados em `youtube_transcriber.log`

## Exemplos de Uso

### Caso 1: Análise Completa de Novo Vídeo
```bash
# 1. Adicionar URL no videos.txt
echo "https://www.youtube.com/watch?v=VIDEO_ID" >> videos.txt

# 2. Processar com análise IA
python src/main.py --ai-analysis --target-person "Nome da Pessoa"
```

### Caso 2: Análise de Arquivo Local Existente
```bash
# Análise IA em Excel já gerado
python src/main.py --only-ai-analysis excel_output/transcricoes_2025-05-28_12-56-03.xlsx --with-explanation
```

### Caso 3: Análise de Vídeo Específico
```bash
# Só processar um vídeo específico
python src/main.py --only-excel --ai-analysis -id "VIDEO_ID" --target-person "João Silva"
```

## Resolução de Problemas

### Erro de Autenticação
```bash
gcloud auth application-default login
gcloud config set project SEU_PROJECT_ID
```

### Erro de Rate Limit
- A aplicação já possui retry automático
- Ajuste `AI_REQUEST_DELAY` para valores maiores se necessário

### Interrupção da Análise
- Use `--ai-resume` para continuar de onde parou
- Os arquivos são salvos automaticamente a cada 100 registros

## Monitoramento

### Logs
```bash
tail -f youtube_transcriber.log
```

### Progresso
- Barra de progresso em tempo real
- Logs informativos sobre cada etapa
- Salvamento incremental para segurança
