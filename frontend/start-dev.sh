#!/bin/bash

# Script para inicializar o YouTube Transcriber
# Inicia tanto o backend (API) quanto o frontend simultaneamente

set -e  # Para no primeiro erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Diretório raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT"

print_status "Iniciando YouTube Transcriber..."
print_status "Diretório do projeto: $PROJECT_ROOT"

# Verifica se estamos no diretório correto
if [ ! -f "$PROJECT_ROOT/requirements.txt" ]; then
    print_error "Arquivo requirements.txt não encontrado. Verifique se está no diretório correto do projeto."
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    print_error "Arquivo package.json do frontend não encontrado."
    exit 1
fi

# Função para limpar processos ao sair
cleanup() {
    print_warning "Parando serviços..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend parado."
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend parado."
    fi
    exit 0
}

# Captura CTRL+C para limpeza
trap cleanup SIGINT SIGTERM

# Verifica se o ambiente virtual existe
if [ ! -d "$BACKEND_DIR/venv" ]; then
    print_error "Ambiente virtual não encontrado em $BACKEND_DIR/venv"
    print_status "Execute 'python -m venv venv && source venv/bin/activate && pip install -r requirements.txt' primeiro."
    exit 1
fi

# Verifica se node_modules existe no frontend
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_warning "node_modules não encontrado. Instalando dependências do frontend..."
    cd "$FRONTEND_DIR"
    if command -v pnpm >/dev/null 2>&1; then
        pnpm install
    elif command -v npm >/dev/null 2>&1; then
        npm install
    else
        print_error "npm ou pnpm não encontrado. Instale Node.js primeiro."
        exit 1
    fi
    print_success "Dependências do frontend instaladas."
fi

# Verifica se as portas estão livres
check_port() {
    local port=$1
    local service=$2
    if lsof -ti:$port >/dev/null 2>&1; then
        print_error "Porta $port ($service) está sendo usada por outro processo."
        echo
        echo "Processo usando a porta $port:"
        lsof -i:$port
        echo
        print_error "Por favor, pare o processo que está usando a porta $port e tente novamente."
        echo "Comando para parar: lsof -ti:$port | xargs kill -9"
        exit 1
    fi
}

print_status "Verificando portas..."
check_port 5000 "Backend API"
check_port 5173 "Frontend"

# Inicia o backend
print_status "Iniciando backend API..."
cd "$BACKEND_DIR"
source venv/bin/activate

# Inicia o backend em background
python -m api.app > "$BACKEND_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Aguarda o backend inicializar
print_status "Aguardando backend inicializar..."
sleep 3

# Verifica se o backend está rodando (com retry)
BACKEND_READY=false
for i in {1..5}; do
    if curl -s http://localhost:5000/health >/dev/null 2>&1; then
        BACKEND_READY=true
        break
    fi
    print_status "Tentativa $i/5 - aguardando backend..."
    sleep 2
done

if [ "$BACKEND_READY" = false ]; then
    print_error "Backend falhou ao inicializar. Verifique backend.log para detalhes."
    echo "Últimas linhas do log do backend:"
    tail -10 "$BACKEND_DIR/backend.log"
    exit 1
fi

print_success "Backend iniciado com sucesso em http://localhost:5000"

# Inicia o frontend
print_status "Iniciando frontend..."
cd "$FRONTEND_DIR"

# Inicia o frontend em background
if command -v pnpm >/dev/null 2>&1; then
    pnpm dev > "$FRONTEND_DIR/frontend.log" 2>&1 &
else
    npm run dev > "$FRONTEND_DIR/frontend.log" 2>&1 &
fi
FRONTEND_PID=$!

# Aguarda o frontend inicializar
print_status "Aguardando frontend inicializar..."
sleep 3

# Tenta detectar a porta do frontend (com retry)
FRONTEND_PORT=""
FRONTEND_READY=false
for i in {1..10}; do
    for port in 5173 5174 5175 5176; do
        if curl -s http://localhost:$port >/dev/null 2>&1; then
            FRONTEND_PORT=$port
            FRONTEND_READY=true
            break 2
        fi
    done
    print_status "Tentativa $i/10 - aguardando frontend..."
    sleep 1
done

if [ "$FRONTEND_READY" = false ]; then
    print_warning "Não foi possível detectar o frontend automaticamente."
    print_status "Verificando se o processo do frontend ainda está ativo..."
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_status "Frontend parece estar iniciando. Verifique frontend.log para a porta."
        # Tenta extrair a porta do log
        if [ -f "$FRONTEND_DIR/frontend.log" ]; then
            DETECTED_PORT=$(grep -o "http://localhost:[0-9]*" "$FRONTEND_DIR/frontend.log" | head -1 | grep -o "[0-9]*$")
            if [ ! -z "$DETECTED_PORT" ]; then
                FRONTEND_PORT=$DETECTED_PORT
                print_success "Porta detectada no log: $FRONTEND_PORT"
            fi
        fi
    else
        print_error "Frontend falhou ao inicializar. Últimas linhas do log:"
        tail -10 "$FRONTEND_DIR/frontend.log"
    fi
else
    print_success "Frontend iniciado com sucesso em http://localhost:$FRONTEND_PORT"
fi

# Mostra status dos serviços
echo
print_success "🚀 YouTube Transcriber iniciado com sucesso!"
echo
echo -e "${BLUE}Serviços em execução:${NC}"
echo -e "  📡 Backend API: ${GREEN}http://localhost:5000${NC}"
if [ ! -z "$FRONTEND_PORT" ]; then
    echo -e "  🌐 Frontend UI: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
else
    echo -e "  🌐 Frontend UI: ${YELLOW}Verifique a porta nos logs${NC}"
fi
echo
echo -e "${BLUE}Logs:${NC}"
echo -e "  📝 Backend: ${BACKEND_DIR}/backend.log"
echo -e "  📝 Frontend: ${FRONTEND_DIR}/frontend.log"
echo
print_status "Pressione CTRL+C para parar todos os serviços."

# Opção para abrir o navegador automaticamente
if command -v xdg-open >/dev/null 2>&1; then
    echo
    read -p "Deseja abrir o frontend no navegador? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ ! -z "$FRONTEND_PORT" ]; then
            print_status "Abrindo http://localhost:$FRONTEND_PORT no navegador..."
            xdg-open "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1 &
        else
            print_status "Abrindo http://localhost:5173 no navegador..."
            xdg-open "http://localhost:5173" >/dev/null 2>&1 &
        fi
    fi
fi

# Mantém o script rodando e monitora os processos
CHECK_INTERVAL=10
LAST_CHECK=0

while true; do
    sleep 1
    CURRENT_TIME=$(date +%s)
    
    # Verifica os processos a cada CHECK_INTERVAL segundos
    if [ $((CURRENT_TIME - LAST_CHECK)) -ge $CHECK_INTERVAL ]; then
        LAST_CHECK=$CURRENT_TIME
        
        # Verifica se os processos ainda estão rodando
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            print_error "Backend parou de funcionar. Últimas linhas do log:"
            tail -10 "$BACKEND_DIR/backend.log"
            break
        fi
        
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            print_error "Frontend parou de funcionar. Últimas linhas do log:"
            tail -10 "$FRONTEND_DIR/frontend.log"
            break
        fi
    fi
done

cleanup
