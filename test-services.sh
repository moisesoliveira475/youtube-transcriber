#!/bin/bash

# Script para testar rapidamente se os serviços estão funcionando

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo "🧪 Testando YouTube Transcriber Services"
echo "========================================"

# Testa Backend API
print_test "Testando Backend API (http://localhost:5000)..."
if curl -s http://localhost:5000/health >/dev/null 2>&1; then
    BACKEND_RESPONSE=$(curl -s http://localhost:5000/health)
    if echo "$BACKEND_RESPONSE" | grep -q '"status".*"ok"'; then
        print_success "Backend API está funcionando"
    else
        print_error "Backend API responde mas status incorreto: $BACKEND_RESPONSE"
    fi
else
    print_error "Backend API não está respondendo"
fi

# Testa Frontend
print_test "Testando Frontend (http://localhost:5173)..."
if curl -s http://localhost:5173/ >/dev/null 2>&1; then
    print_success "Frontend está funcionando"
else
    # Tenta outras portas comuns
    for port in 5174 5175 5176; do
        if curl -s http://localhost:$port/ >/dev/null 2>&1; then
            print_success "Frontend está funcionando na porta $port"
            break
        fi
    done
    if ! curl -s http://localhost:5173/ >/dev/null 2>&1 && ! curl -s http://localhost:5174/ >/dev/null 2>&1; then
        print_error "Frontend não está respondendo"
    fi
fi

# Testa endpoints da API
print_test "Testando endpoints da API..."
if curl -s http://localhost:5000/api/files/excel >/dev/null 2>&1; then
    print_success "Endpoint /api/files/excel está funcionando"
else
    print_error "Endpoint /api/files/excel não está respondendo"
fi

if curl -s http://localhost:5000/api/status >/dev/null 2>&1; then
    print_success "Endpoint /api/status está funcionando"
else
    print_error "Endpoint /api/status não está respondendo"
fi

echo
echo "🎯 Teste concluído!"
echo
echo "Se algum serviço não estiver funcionando:"
echo "1. Execute: ./start.sh"
echo "2. Aguarde alguns segundos para os serviços inicializarem"
echo "3. Execute este teste novamente: ./test-services.sh"
