@echo off
REM Script para Windows - YouTube Transcriber
REM Inicia backend e frontend simultaneamente

setlocal EnableDelayedExpansion

echo.
echo [94m🎬 YouTube Transcriber[0m
echo [92mIniciando aplicacao completa...[0m
echo.

REM Obtem o diretorio do projeto
set PROJECT_ROOT=%~dp0
set BACKEND_DIR=%PROJECT_ROOT%
set FRONTEND_DIR=%PROJECT_ROOT%frontend

echo [94m[INFO][0m Diretorio do projeto: %PROJECT_ROOT%

REM Verifica arquivos necessarios
if not exist "%BACKEND_DIR%requirements.txt" (
    echo [91m[ERROR][0m Arquivo requirements.txt nao encontrado.
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%package.json" (
    echo [91m[ERROR][0m Arquivo package.json do frontend nao encontrado.
    pause
    exit /b 1
)

REM Verifica ambiente virtual
if not exist "%BACKEND_DIR%venv" (
    echo [91m[ERROR][0m Ambiente virtual nao encontrado em %BACKEND_DIR%venv
    echo [94m[INFO][0m Execute 'python -m venv venv' e instale as dependencias primeiro.
    pause
    exit /b 1
)

REM Verifica node_modules
if not exist "%FRONTEND_DIR%node_modules" (
    echo [93m[WARNING][0m node_modules nao encontrado. Instalando dependencias...
    cd /d "%FRONTEND_DIR%"
    where pnpm >nul 2>&1
    if !errorlevel! == 0 (
        pnpm install
    ) else (
        where npm >nul 2>&1
        if !errorlevel! == 0 (
            npm install
        ) else (
            echo [91m[ERROR][0m npm ou pnpm nao encontrado. Instale Node.js primeiro.
            pause
            exit /b 1
        )
    )
    echo [92m[SUCCESS][0m Dependencias do frontend instaladas.
)

REM Inicia backend
echo [94m[INFO][0m Iniciando backend API...
cd /d "%BACKEND_DIR%"
call venv\Scripts\activate.bat

start /b "YouTube Transcriber Backend" cmd /c "python -m api.app > backend.log 2>&1"

REM Aguarda backend inicializar
echo [94m[INFO][0m Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

REM Testa se backend esta funcionando
curl -s http://localhost:5000/health >nul 2>&1
if !errorlevel! neq 0 (
    echo [91m[ERROR][0m Backend falhou ao inicializar. Verifique backend.log
    type backend.log
    pause
    exit /b 1
)

echo [92m[SUCCESS][0m Backend iniciado com sucesso em http://localhost:5000

REM Inicia frontend
echo [94m[INFO][0m Iniciando frontend...
cd /d "%FRONTEND_DIR%"

where pnpm >nul 2>&1
if !errorlevel! == 0 (
    start /b "YouTube Transcriber Frontend" cmd /c "pnpm dev > frontend.log 2>&1"
) else (
    start /b "YouTube Transcriber Frontend" cmd /c "npm run dev > frontend.log 2>&1"
)

echo [94m[INFO][0m Aguardando frontend inicializar...
timeout /t 8 /nobreak >nul

echo.
echo [92m🚀 YouTube Transcriber iniciado com sucesso![0m
echo.
echo [94mServicos em execucao:[0m
echo   📡 Backend API: [92mhttp://localhost:5000[0m
echo   🌐 Frontend UI: [92mhttp://localhost:5173[0m (ou proxima porta disponivel)
echo.
echo [94mLogs:[0m
echo   📝 Backend: %BACKEND_DIR%backend.log
echo   📝 Frontend: %FRONTEND_DIR%frontend.log
echo.
echo [94m[INFO][0m Pressione qualquer tecla para parar todos os servicos.

pause >nul

REM Limpa processos
echo [93m[WARNING][0m Parando servicos...
taskkill /f /im python.exe /fi "WINDOWTITLE eq YouTube Transcriber Backend*" 2>nul
taskkill /f /im node.exe /fi "WINDOWTITLE eq YouTube Transcriber Frontend*" 2>nul
echo [94m[INFO][0m Servicos parados.

pause
