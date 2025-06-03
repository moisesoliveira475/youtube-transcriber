# YouTube Transcriber

Ferramenta para transcrição automática de vídeos do YouTube, dividindo o conteúdo em blocos para análise e exportando para Excel.

## Funcionalidades

- Download de áudio de vídeos do YouTube
- **Processamento de arquivos MP4/WAV/M4A/MP3/AAC locais**
- Transcrição usando Whisper ou Faster-Whisper (com suporte a GPU)
- Divisão da transcrição em blocos de tamanho adequado
- Exportação para Excel com timestamps
- Suporte a transcrição em lote
- **Análise IA para identificação de calúnia, injúria e difamação**

## Requisitos

- Python 3.8+
- Dependências listadas em `requirements.txt`
- GPU com CUDA (opcional, para transcrição acelerada)
- **Para análise IA**: Conta Google Cloud Platform com Vertex AI ativado

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

## Uso

### 1. Adicione URLs do YouTube ou arquivos locais

Adicione as URLs dos vídeos que deseja transcrever no arquivo `videos.txt`, uma por linha.
Você também pode adicionar caminhos para arquivos **MP4, WAV, M4A, MP3 ou AAC** locais.
Você pode adicionar comentários usando `//` no início da linha.

Exemplo de `videos.txt`:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
// Comentário sobre o vídeo acima
/home/usuario/videos/meu_video.mp4
./audios/audio_local.wav
/caminho/para/arquivo.m4a
https://youtu.be/9bZkp7q19f0
// Outro comentário
./videos/apresentacao.mp3
```

### 2. Execute o script principal

```bash
python -m src.main
```

### Opções disponíveis

#### Transcrição
- `--only-excel`: Apenas gera o Excel a partir das transcrições já existentes
- `--list` ou `-l`: Permite baixar playlists inteiras
- `--video-id` ou `-id`: Processa apenas o vídeo com o ID especificado
- `--ignore`: Ignora download/transcrição se o vídeo já tiver transcrição
- `--whisper`: Força o uso do Whisper original (padrão: faster-whisper)
- `--test-whisper`: Executa apenas um teste de transcrição
- `--cpu`: Força o uso de CPU para a transcrição

#### Análise IA
- `--ai-analysis`: Ativa análise IA após geração do Excel
- `--only-ai-analysis ARQUIVO`: Processa apenas análise IA em arquivo Excel existente
- `--ai-resume`: Retoma análise IA de arquivo existente (continua de onde parou)
- `--target-person "Nome"`: Nome da pessoa específica para análise
- `--with-explanation`: Inclui explicações detalhadas na análise IA

## Estrutura do Projeto

```
youtube_transcriber/
├── videos.txt            # Lista de URLs de vídeos
├── requirements.txt      # Dependências do projeto
├── audios/               # Áudios baixados
├── transcripts/          
│   ├── words/           # Transcrições completas
│   ├── sections/        # Transcrições divididas em blocos
│   └── summaries/       # Resumos gerados por IA
├── excel_output/         # Arquivos Excel gerados
└── src/                  # Código-fonte
    ├── config.py         # Configurações centralizadas
    ├── main.py           # Script principal
    ├── download_audio.py # Download de áudio
    ├── generate_transcription.py      # Transcrição com Whisper
    ├── generate_transcription_fw.py   # Transcrição com Faster-Whisper
    ├── split_transcription.py         # Divisão de textos
    ├── excel_utils.py                 # Exportação para Excel
    ├── ai_analysis/      # Módulo de análise IA
    │   ├── vertex_client.py          # Cliente Vertex AI
    │   ├── prompt_templates.py       # Templates de prompt
    │   ├── summary_generator.py      # Geração de resumos
    │   └── content_classifier.py     # Classificação de conteúdo
    └── utils/            # Utilitários
        ├── extract_video_id.py
        ├── logger.py
        └── test_whisper_transcription.py
```

## Exemplos

### Processar todos os vídeos em videos.txt

```bash
python -m src.main
```

### Processar apenas um vídeo específico

```bash
python -m src.main --video-id dQw4w9WgXcQ
```

### Apenas gerar Excel a partir de transcrições existentes

```bash
python -m src.main --only-excel
```

### Forçar uso de CPU (útil se GPU estiver causando problemas)

```bash
python -m src.main --cpu
```

### Processar arquivos locais

Adicione o caminho completo do arquivo no `videos.txt`:
```bash
# No videos.txt:
/caminho/para/seu/arquivo.mp4
./audios/meu_audio.wav
./videos/apresentacao.m4a

# Execute normalmente:
python -m src.main
```

**Formatos suportados para arquivos locais:**
- MP4 (vídeos com áudio)
- WAV (áudio)
- M4A (áudio)
- MP3 (áudio) 
- AAC (áudio)

Os arquivos locais são automaticamente copiados para a pasta `audios/` e processados da mesma forma que os vídeos baixados do YouTube.

## Análise IA

A nova funcionalidade de análise IA permite identificar automaticamente casos de **calúnia**, **injúria** e **difamação** em transcrições usando inteligência artificial (Vertex AI).

### Configuração da Análise IA

#### 1. Instalar dependências adicionais
```bash
pip install google-cloud-aiplatform vertexai
```

#### 2. Configurar autenticação Google Cloud
```bash
gcloud auth application-default login
gcloud config set project SEU_PROJECT_ID
```

#### 3. Configurar no config.py
```python
# Nome da pessoa a ser analisada
TARGET_PERSON_NAME = "Nome da Pessoa"

# Contexto adicional para análise
ANALYSIS_CONTEXT = """
Contexto específico sobre a situação...
"""

# Ativar explicações detalhadas (mais caro)
CLASSIFICATION_WITH_EXPLANATION = False
```

### Exemplos de Uso da Análise IA

#### Fluxo completo com análise IA
```bash
python -m src.main --ai-analysis
```

#### Análise IA apenas (em arquivo Excel existente)
```bash
python -m src.main --only-ai-analysis excel_output/transcricoes_2025-05-28_12-56-03.xlsx
```

#### Análise com explicações detalhadas
```bash
python -m src.main --ai-analysis --with-explanation --target-person "João Silva"
```

#### Retomar análise interrompida
```bash
python -m src.main --only-ai-analysis arquivo.xlsx --ai-resume
```

### Saída da Análise IA

A análise adiciona as seguintes colunas ao Excel:
- `Calúnia_IA`: Sim/Não para casos de calúnia
- `Injúria_IA`: Sim/Não para casos de injúria  
- `Difamação_IA`: Sim/Não para casos de difamação
- `Explicação_IA`: Explicação detalhada (se ativada)

### Definições Jurídicas

- **Calúnia**: Atribuir falsamente a alguém fato definido como crime
- **Injúria**: Ofender a dignidade ou o decoro de alguém
- **Difamação**: Imputar a alguém fato ofensivo à sua reputação

## 📝 Convenção de Commits

Para manter um histórico de commits organizado e padronizado, seguimos a seguinte convenção:

* `feat`: Nova funcionalidade
* `fix`: Correção de bug
* `docs`: Alterações na documentação
* `style`: Formatação de código
* `refactor`: Refatoração de código
* `test`: Adição ou modificação de testes
* `chore`: Alterações em arquivos de build, configs etc.

# Padrão de nomenclatura de ramificações

Use o seguinte padrão para criar ramificações:

- **type**: A finalidade da ramificação, como:
  - `feat` para novos recursos
  - `fix` para correções de bugs
  - `chore` para tarefas de manutenção
  - `docs` para documentação
  - `refactor` para refatoração de código
  - `test` para testes

- descrição curta**: Um resumo conciso do objetivo da ramificação (em inglês).

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.
