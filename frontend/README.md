# YouTube Transcriber Frontend

Interface web moderna para a aplicação YouTube Transcriber, construída com React, TypeScript e shadcn/ui.

## 🚀 Funcionalidades

### ✅ Gerenciamento de URLs
- Adicionar múltiplas URLs do YouTube
- Validação e extração automática de Video IDs
- Visualização organizada das URLs adicionadas
- Remoção individual de URLs

### ✅ Processamento Completo
- Interface para configurar pessoa alvo para análise jurídica
- Botões separados para cada etapa do processo
- Execução completa do pipeline de transcrição
- Status em tempo real com progresso detalhado

### ✅ Monitoramento de Status
- Progresso visual de cada etapa do processamento
- Logs em tempo real do sistema
- Indicadores de status para cada vídeo
- Estimativas de tempo e conclusão

### ✅ Visualização de Resultados
- Dashboard com estatísticas gerais
- Lista organizada de transcrições
- Filtros por status e tipo de análise
- Modal detalhado para cada transcrição

### ✅ Análise IA Integrada
- Visualização de classificações jurídicas (calúnia, injúria, difamação)
- Resumos automáticos dos vídeos
- Detalhes das ocorrências encontradas
- Níveis de confiança da IA

### ✅ Configurações Avançadas
- Interface intuitiva com accordions organizados
- Configurações de transcrição (modelo, tamanho, GPU)
- Configurações de IA (pessoa alvo, explicações detalhadas)
- Configurações de performance e recursos

## 🎨 Componentes

### Layout Principal
- **Header**: Cabeçalho com logo e título da aplicação
- **MainTabs**: Navegação principal com 4 seções

### Seção "Processar"
- **VideoManager**: Gerenciamento de URLs e configurações básicas
- **ProcessingStatus**: Status detalhado do processamento em tempo real

### Seção "Resultados"
- **StatsOverview**: Cards com estatísticas gerais
- **ResultsViewer**: Lista de transcrições com filtros
- **TranscriptionModal**: Modal detalhado para visualizar transcrições e análises

### Seção "Configurações"
- **AdvancedSettings**: Configurações organizadas em accordions

### Seção "Sobre"
- Informações sobre a aplicação e tecnologias utilizadas

## 🛠️ Tecnologias

- **React 19** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Ícones
- **Biome** - Linting e formatação

## 📦 Componentes shadcn/ui Utilizados

```bash
# Componentes básicos
pnpm dlx shadcn@latest add button card input textarea select label badge tabs separator

# Componentes de feedback
pnpm dlx shadcn@latest add progress alert

# Componentes de layout
pnpm dlx shadcn@latest add accordion switch dialog
```

## 🚀 Como Executar

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build
pnpm preview
```

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── layout/
│   │   └── Header.tsx
│   ├── ui/                    # Componentes shadcn/ui
│   ├── VideoManager.tsx       # Gerenciamento de URLs
│   ├── ProcessingStatus.tsx   # Status do processamento
│   ├── ResultsViewer.tsx      # Visualização de resultados
│   ├── TranscriptionModal.tsx # Modal de detalhes
│   ├── AdvancedSettings.tsx   # Configurações avançadas
│   ├── StatsOverview.tsx      # Dashboard de estatísticas
│   └── MainTabs.tsx          # Navegação principal
├── lib/
│   └── utils.ts              # Utilitários (cn function)
├── app.tsx                   # Componente principal
├── main.tsx                  # Entry point
└── index.css                 # Estilos globais
```

## 🎯 Próximos Passos

1. **Integração com Backend**
   - Conectar com a API Python existente
   - WebSocket para status em tempo real
   - Gerenciamento de estado global

2. **Funcionalidades Avançadas**
   - Upload de arquivos locais
   - Configurações persistentes
   - Notificações toast

3. **Otimizações**
   - Lazy loading de componentes
   - Virtualization para listas grandes
   - PWA capabilities
