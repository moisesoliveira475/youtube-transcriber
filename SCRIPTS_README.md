# 🚀 Scripts de Inicialização - YouTube Transcriber

Este diretório contém scripts para facilitar a inicialização do YouTube Transcriber, que executa tanto o backend (API Python) quanto o frontend (React) simultaneamente.

## 📋 Pré-requisitos

### Backend (Python)
- Python 3.8+ instalado
- Ambiente virtual criado: `python -m venv venv`
- Dependências instaladas: `pip install -r requirements.txt`

### Frontend (Node.js)
- Node.js 18+ instalado
- npm ou pnpm disponível
- Dependências instaladas automaticamente pelos scripts

## 🎯 Scripts Disponíveis

### Linux/macOS

#### 1. Script Principal (Raiz do Projeto)
```bash
# Na raiz do projeto
./start.sh
```

#### 2. Script do Frontend (Diretório frontend/)
```bash
# No diretório frontend/
./start-dev.sh

# Ou via npm/pnpm
npm run start:full
# ou
pnpm start:full
```

#### 3. Comandos npm disponíveis
```bash
cd frontend/

# Inicia aplicação completa (backend + frontend)
npm run dev:full
npm run start:full
npm run start:dev

# Apenas frontend (requer backend já rodando)
npm run dev
```

### Windows

#### Script Windows
```cmd
# Na raiz do projeto
start.bat
```

## 🔄 O que os Scripts Fazem

1. **Verificações Iniciais**
   - Verifica se os arquivos necessários existem
   - Confirma se o ambiente virtual Python está configurado
   - Instala dependências do frontend se necessário

2. **Inicialização do Backend**
   - Ativa o ambiente virtual Python
   - Inicia a API Flask em `http://localhost:5000`
   - Verifica se o backend está respondendo

3. **Inicialização do Frontend**
   - Instala dependências Node.js se necessário
   - Inicia o servidor de desenvolvimento Vite
   - Detecta automaticamente a porta disponível (5173, 5174, 5175, etc.)

4. **Monitoramento**
   - Monitora ambos os processos
   - Exibe logs em tempo real
   - Para todos os serviços ao pressionar `CTRL+C` (Linux/macOS) ou qualquer tecla (Windows)

## 📡 Endpoints Disponíveis

Após a inicialização:

- **Backend API**: `http://localhost:5000`
  - Health check: `http://localhost:5000/health`
  - Documentação: Ver `API_README.md`

- **Frontend UI**: `http://localhost:5173` (ou próxima porta disponível)
  - Interface web completa para gerenciar transcrições

## 📝 Logs

Os scripts geram logs separados:

- **Backend**: `backend.log` (raiz do projeto)
- **Frontend**: `frontend/frontend.log`

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se o ambiente virtual está correto
source venv/bin/activate
python -m api.app

# Verificar logs
cat backend.log
```

### Frontend não inicia
```bash
# Verificar dependências
cd frontend/
npm install  # ou pnpm install

# Iniciar manualmente
npm run dev
```

### Portas em uso
```bash
# Verificar quais portas estão em uso
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Parar processos se necessário
kill -9 <PID>
```

### Erro de permissão (Linux/macOS)
```bash
chmod +x start.sh
chmod +x frontend/start-dev.sh
```

## 🔧 Personalização

### Alterar Porta do Backend
Edite `api/app.py` e modifique:
```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

### Alterar Porta do Frontend
Edite `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000  // Porta desejada
  }
})
```

## 🚦 Status dos Serviços

Após inicialização bem-sucedida, você verá:

```
🚀 YouTube Transcriber iniciado com sucesso!

Serviços em execução:
  📡 Backend API: http://localhost:5000
  🌐 Frontend UI: http://localhost:5173

Logs:
  📝 Backend: /path/to/project/backend.log
  📝 Frontend: /path/to/project/frontend/frontend.log
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs de erro
2. Confirme se todos os pré-requisitos estão atendidos
3. Teste cada componente separadamente
4. Consulte a documentação principal no `README.md`
