#!/bin/bash

# Script principal para inicializar o YouTube Transcriber
# Localizado na raiz do projeto para fácil acesso

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_SCRIPT="$SCRIPT_DIR/frontend/start-dev.sh"

# Cores para output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}🎬 YouTube Transcriber${NC}"
echo -e "${GREEN}Iniciando aplicação completa...${NC}"
echo

# Verifica se o script do frontend existe
if [ ! -f "$FRONTEND_SCRIPT" ]; then
    echo "❌ Script do frontend não encontrado em: $FRONTEND_SCRIPT"
    exit 1
fi

# Executa o script do frontend (que gerencia tanto backend quanto frontend)
exec "$FRONTEND_SCRIPT"
