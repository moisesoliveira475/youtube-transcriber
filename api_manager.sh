#!/bin/bash
# Script para gerenciar a API do YouTube Transcriber

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="$SCRIPT_DIR/venv/bin/activate"
PID_FILE="$SCRIPT_DIR/api.pid"
LOG_FILE="$SCRIPT_DIR/api.log"

start_api() {
    if [ -f "$PID_FILE" ]; then
        echo "❌ API já está rodando (PID: $(cat $PID_FILE))"
        return 1
    fi
    
    echo "🚀 Iniciando YouTube Transcriber API..."
    
    # Ativa o virtual environment e inicia a API
    source "$VENV_PATH"
    cd "$SCRIPT_DIR"
    
    nohup python run_api.py > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    sleep 2
    
    if ps -p $(cat "$PID_FILE") > /dev/null; then
        echo "✅ API iniciada com sucesso!"
        echo "📡 Disponível em: http://localhost:5000"
        echo "📋 PID: $(cat $PID_FILE)"
        echo "📝 Logs: $LOG_FILE"
    else
        echo "❌ Falha ao iniciar a API"
        rm -f "$PID_FILE"
        return 1
    fi
}

stop_api() {
    if [ ! -f "$PID_FILE" ]; then
        echo "❌ API não está rodando"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    echo "🛑 Parando API (PID: $PID)..."
    
    kill "$PID"
    rm -f "$PID_FILE"
    
    echo "✅ API parada"
}

status_api() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null; then
            echo "✅ API está rodando (PID: $PID)"
            echo "📡 URL: http://localhost:5000"
            echo "❤️  Health: http://localhost:5000/health"
        else
            echo "❌ PID file existe mas processo não está rodando"
            rm -f "$PID_FILE"
        fi
    else
        echo "❌ API não está rodando"
    fi
}

restart_api() {
    echo "🔄 Reiniciando API..."
    stop_api
    sleep 2
    start_api
}

test_api() {
    echo "🧪 Testando API..."
    if command -v curl > /dev/null; then
        response=$(curl -s -w "%{http_code}" http://localhost:5000/health)
        if [[ "$response" == *"200" ]]; then
            echo "✅ API está respondendo corretamente"
        else
            echo "❌ API não está respondendo (HTTP: $response)"
        fi
    else
        echo "❌ curl não encontrado. Instale curl para testar a API."
    fi
}

show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "📝 Últimas linhas do log:"
        tail -f "$LOG_FILE"
    else
        echo "❌ Arquivo de log não encontrado: $LOG_FILE"
    fi
}

case "$1" in
    start)
        start_api
        ;;
    stop)
        stop_api
        ;;
    restart)
        restart_api
        ;;
    status)
        status_api
        ;;
    test)
        test_api
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "🎯 YouTube Transcriber API Manager"
        echo ""
        echo "Uso: $0 {start|stop|restart|status|test|logs}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia a API em background"
        echo "  stop    - Para a API"
        echo "  restart - Reinicia a API"
        echo "  status  - Verifica se a API está rodando"
        echo "  test    - Testa se a API está respondendo"
        echo "  logs    - Mostra logs da API"
        echo ""
        echo "Exemplos:"
        echo "  $0 start    # Inicia a API"
        echo "  $0 status   # Verifica status"
        echo "  $0 logs     # Acompanha logs"
        exit 1
        ;;
esac
