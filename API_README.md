# API Flask - YouTube Transcriber

API REST para integração com o YouTube Transcriber, permitindo uso via HTTP mantendo compatibilidade com CLI.

## 🚀 Início Rápido

### Instalação das dependências da API:
```bash
source /home/m01545/projects/python/youtube_transcriber/venv/bin/activate
pip install -r requirements_api.txt
```

### Iniciar a API:
```bash
python run_api.py
```

A API estará disponível em: `http://localhost:5000`

## 📡 Endpoints

### 1. Transcrição

#### `POST /api/transcribe`
Inicia processo de transcrição para múltiplas URLs.

**Request:**
```json
{
  "urls": [
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=def456"
  ],
  "options": {
    "only_excel": false,
    "playlist_mode": false,
    "ignore_existing": false,
    "use_whisper": false,
    "ai_analysis": false,
    "target_person": "João Silva"
  }
}
```

**Response:**
```json
{
  "success": true,
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Transcription job started for 2 URL(s)"
}
```

#### `POST /api/transcribe/single`
Transcreve um único vídeo.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=abc123",
  "options": {
    "use_whisper": false,
    "ai_analysis": true
  }
}
```

#### `POST /api/video-info`
Extrai informações básicas de um vídeo.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=abc123"
}
```

**Response:**
```json
{
  "success": true,
  "video_id": "abc123",
  "url": "https://www.youtube.com/watch?v=abc123"
}
```

### 2. Análise AI

#### `POST /api/analyze`
Inicia análise de IA em arquivo Excel existente.

**Request:**
```json
{
  "excel_file": "transcricoes_2025-05-28_12-56-03.xlsx",
  "target_person": "João Silva",
  "with_explanation": true,
  "resume": false
}
```

**Response:**
```json
{
  "success": true,
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "message": "AI analysis job started for file: transcricoes_2025-05-28_12-56-03.xlsx"
}
```

#### `GET /api/excel-files`
Lista arquivos Excel disponíveis para análise.

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "transcricoes_2025-05-28_12-56-03.xlsx",
      "path": "/home/.../excel_output/transcricoes_2025-05-28_12-56-03.xlsx",
      "size": 45678,
      "modified": 1716901020.123
    }
  ],
  "count": 1
}
```

### 3. Status de Jobs

#### `GET /api/jobs/{job_id}/status`
Retorna status detalhado de um job.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "transcription",
  "status": "processing",
  "progress": 45,
  "current_step": "Transcribing video 2/5",
  "created_at": "2025-05-28T12:00:00",
  "updated_at": "2025-05-28T12:05:00",
  "result": null,
  "error": null
}
```

#### `GET /api/jobs`
Lista jobs recentes.

**Query Parameters:**
- `type`: filtrar por tipo (`transcription`, `analysis`)
- `limit`: número máximo de jobs (padrão: 50)

**Response:**
```json
{
  "success": true,
  "jobs": [...],
  "count": 10
}
```

#### `DELETE /api/jobs/{job_id}`
Cancela um job em andamento.

### 4. Gerenciamento de Arquivos

#### `GET /api/files/excel`
Lista todos os arquivos Excel gerados.

#### `GET /api/files/transcripts`
Lista arquivos de transcrição organizados por tipo.

#### `GET /api/files/download/{filepath}`
Faz download de arquivos gerados.

#### `GET /api/files/info`
Retorna estatísticas gerais dos arquivos.

## 📊 Status de Jobs

### Estados possíveis:
- `pending`: Job criado, aguardando processamento
- `processing`: Job em execução
- `completed`: Job finalizado com sucesso
- `error`: Job falhou
- `cancelled`: Job cancelado pelo usuário

### Monitoramento:
Para monitorar o progresso de um job, faça polling no endpoint `/api/jobs/{job_id}/status` a cada 2-5 segundos.

## 🛠️ Integração com Scripts Existentes

A API é uma camada sobre os scripts Python existentes:

- **CLI continua funcionando** normalmente
- **Mesma configuração** (`src/config.py`)
- **Mesmos diretórios** de output
- **Mesma lógica** de processamento

### Exemplo de uso conjunto:
```bash
# Via CLI (continua funcionando)
python src/main.py --ai-analysis --target-person "João Silva"

# Via API (nova funcionalidade)
curl -X POST http://localhost:5000/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://youtube.com/watch?v=abc"], "options": {"ai_analysis": true}}'
```

## 🚦 Health Check

#### `GET /health`
Verifica se a API está funcionando.

**Response:**
```json
{
  "status": "ok"
}
```

## 🔧 Arquitetura

```
API Request → Flask Route → Service Layer → Original Python Scripts
                                ↓
                          Job Manager (async tracking)
                                ↓
                           Response with job_id
```

### Componentes:

1. **Flask Routes** - Endpoints REST
2. **Services** - Wrappers dos scripts existentes
3. **Job Manager** - Gerenciamento assíncrono
4. **Models** - Validação de dados

## 🎯 Casos de Uso

### 1. Integração com Frontend
```javascript
// Iniciar transcrição
const response = await fetch('/api/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    urls: ['https://youtube.com/watch?v=abc'],
    options: { ai_analysis: true }
  })
});

const { job_id } = await response.json();

// Monitorar progresso
const checkStatus = async () => {
  const status = await fetch(`/api/jobs/${job_id}/status`);
  const data = await status.json();
  
  if (data.status === 'completed') {
    console.log('Transcrição concluída!', data.result);
  } else {
    console.log(`Progresso: ${data.progress}% - ${data.current_step}`);
    setTimeout(checkStatus, 2000);
  }
};

checkStatus();
```

### 2. Automação via Scripts
```bash
#!/bin/bash
# Script para processar lista de vídeos via API

for url in $(cat video_urls.txt); do
  job_id=$(curl -s -X POST http://localhost:5000/api/transcribe \
    -H "Content-Type: application/json" \
    -d "{\"urls\": [\"$url\"]}" | jq -r '.job_id')
  
  echo "Job criado: $job_id para URL: $url"
done
```

### 3. Webhook/Callback (futuro)
Possibilidade de adicionar notificações quando jobs forem concluídos.

## 🔐 Considerações de Segurança

Para uso em produção, considere:

1. **Autenticação** - Adicionar API keys ou JWT
2. **Rate Limiting** - Limitar requests por IP
3. **HTTPS** - Configurar SSL/TLS
4. **Validação** - Sanitizar inputs
5. **Logs** - Auditoria de operações

## 📝 Logs

Os logs da API são integrados com o sistema existente:
- Arquivo: `youtube_transcriber.log`
- Jobs salvos em: `api_jobs.json`
