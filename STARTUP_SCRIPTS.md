# Scripts de Inicialização - YouTube Transcriber

## Scripts Disponíveis

### 🚀 `start.sh` - Script Principal
Script principal para inicializar toda a aplicação (Backend + Frontend).

```bash
./start.sh
```

**O que faz:**
- Verifica e libera as portas 5000 (Backend) e 5173 (Frontend)
- Inicia o Backend API em http://localhost:5000
- Inicia o Frontend em http://localhost:5173
- Monitora ambos os serviços continuamente
- Oferece opção para abrir o navegador automaticamente

### 🧪 `test-services.sh` - Verificação Rápida
Script para testar se todos os serviços estão funcionando.

```bash
./test-services.sh
```

**O que verifica:**
- Backend API (/health endpoint)
- Frontend (interface web)
- Endpoints principais da API (/api/files/excel, /api/status)

### 📂 `frontend/start-dev.sh` - Script Detalhado
Script interno com lógica completa de inicialização (chamado pelo start.sh).

## Funcionalidades dos Scripts

### ✅ Verificações Automáticas
- **Ambiente Virtual**: Verifica se o venv existe
- **Dependências**: Instala dependências do frontend se necessário
- **Portas**: Libera portas ocupadas automaticamente
- **Processos**: Monitora se os serviços continuam rodando

### 🔄 Retry Logic
- **Backend**: Até 5 tentativas para inicializar (10 segundos)
- **Frontend**: Até 10 tentativas para detectar a porta (10 segundos)
- **Detecção de Porta**: Verifica portas 5173-5176 automaticamente

### 📊 Logs e Monitoramento
- **Backend Log**: `/home/m01545/projects/python/youtube_transcriber/backend.log`
- **Frontend Log**: `/home/m01545/projects/python/youtube_transcriber/frontend/frontend.log`
- **Monitoramento**: Verifica status dos processos a cada 10 segundos

### 🛑 Limpeza Automática
- **CTRL+C**: Para ambos os serviços de forma limpa
- **Cleanup**: Remove processos órfãos automaticamente
- **Trap Signals**: Captura sinais de interrupção

## Solucionando Problemas

### Erro: "Port already in use"
Os scripts agora lidam automaticamente com portas ocupadas, mas se persistir:
```bash
# Manual cleanup
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Erro: "Backend failed to initialize"
```bash
# Verificar logs
tail -20 backend.log

# Verificar ambiente virtual
source venv/bin/activate
python -m api.app
```

### Erro: "Frontend failed to initialize"
```bash
# Verificar logs
tail -20 frontend/frontend.log

# Instalar dependências
cd frontend && npm install
```

### Teste Rápido de Funcionamento
```bash
./test-services.sh
```

## Estrutura dos Logs

### Backend Log
```
* Serving Flask app 'app'
* Debug mode: on
* Running on http://127.0.0.1:5000
```

### Frontend Log
```
VITE v6.3.5  ready in 439 ms
➜  Local:   http://localhost:5173/
```

## URLs de Acesso

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health
- **API Status**: http://localhost:5000/api/status

## Notas Importantes

1. **Ambiente Virtual**: O script requer que o ambiente virtual esteja configurado em `venv/`
2. **Node.js**: Requer Node.js 18+ para o frontend
3. **Dependências**: Instala automaticamente dependências do frontend se necessário
4. **Monitoramento**: Os scripts monitoram continuamente os processos
5. **Limpeza**: Use CTRL+C para parar tudo de forma limpa

## Comandos Úteis

```bash
# Iniciar aplicação completa
./start.sh

# Testar se está funcionando
./test-services.sh

# Parar todos os processos (se necessário)
pkill -f "vite|flask|app.py"

# Ver logs em tempo real
tail -f backend.log
tail -f frontend/frontend.log
```
