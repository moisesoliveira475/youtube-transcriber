# YouTube Transcriber Copilot Instructions

## Project Overview
YouTube Transcriber is a full-stack application that automates downloading and transcribing YouTube videos, dividing the transcriptions into manageable blocks, and exporting them to Excel with timestamps. The application supports both original Whisper and Faster-Whisper models for transcription, with options for GPU acceleration. It includes AI analysis functionality to classify content for calúnia (calumny), injúria (injury), and difamação (defamation) using Vertex AI.

**The project now consists of three main components:**
1. **Python CLI Application** - Original command-line interface
2. **REST API (Flask)** - Web API for HTTP integration
3. **React Frontend** - Modern web interface for managing transcriptions

## Key Components and Flow

### 1. Input Management
#### CLI Mode
- Users add YouTube URLs to `videos.txt` (one URL per line)
- Lines starting with `//` are treated as comments
- The application processes all URLs or a specific video ID if provided

#### API/Frontend Mode
- Users input URLs directly through the web interface
- Real-time URL validation and processing
- Support for batch processing multiple URLs

### 2. Main Application Flow (`src/main.py`)
1. Parse command-line arguments (CLI mode)
2. Download audio from YouTube videos
3. Transcribe audio using Whisper or Faster-Whisper
4. Split transcriptions into manageable text blocks
5. Export transcriptions to Excel with timestamps
6. **Optional AI analysis to classify content for legal issues**

### 3. REST API (`api/`)
#### Core API Structure
- **Flask Application** (`api/app.py`) - Main API server with CORS support
- **Route Modules** (`api/routes/`) - Organized endpoint handlers
- **Service Layer** (`api/services/`) - Business logic and processing
- **Models & Schemas** (`api/models/`) - Data validation and serialization
- **Utilities** (`api/utils/`) - Response helpers and common functions

#### API Endpoints
**Transcription Routes** (`/api/transcribe`)
- `POST /api/transcribe` - Start transcription process
- Support for batch URL processing
- Configurable transcription options (Whisper/Faster-Whisper, CPU/GPU)
- Playlist processing control

**Analysis Routes** (`/api/analyze`)
- `POST /api/analyze` - Start AI analysis on Excel files
- Configurable target person and explanation options
- Resume functionality for interrupted analyses

**File Management Routes** (`/api/files`)
- `GET /api/files/excel` - List all generated Excel files
- `GET /api/files/excel/<filename>` - Download specific Excel file
- `GET /api/files/transcripts` - List transcription files
- `GET /api/files/audio` - List audio files
- File metadata including size, modification date, and analysis status

**Status Routes** (`/api/status`)
- `GET /api/status` - API health check and system status
- `GET /api/jobs/<job_id>/status` - Job progress tracking
- Real-time processing status updates

#### Services Layer
- **Job Manager** (`job_manager.py`) - Handles background processing and job tracking
- **Transcription Service** (`transcription_service.py`) - Manages audio processing workflow
- **Analysis Service** (`analysis_service.py`) - Handles AI analysis operations
- Async job processing with progress tracking
- Error handling and recovery mechanisms

### 4. React Frontend (`frontend/`)
#### Modern Web Interface
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **shadcn/ui** component library for consistent UI
- **Biome** for code formatting and linting

#### Frontend Components
**Main Interface** (`src/components/MainTabs.tsx`)
- Tabbed interface for different operations
- Process, Results, Settings, and About sections

**Video Management** (`src/components/VideoManager.tsx`)
- URL input and validation
- Batch processing interface
- Real-time transcription options

**Results Viewer** (`src/components/ResultsViewer.tsx`)
- Excel file browser and download
- Transcription preview
- Analysis results display

**Processing Status** (`src/components/ProcessingStatus.tsx`)
- Real-time job progress tracking
- Status updates and error handling
- Background processing indicators

**Advanced Settings** (`src/components/AdvancedSettings.tsx`)
- Model selection (Whisper/Faster-Whisper)
- AI analysis configuration
- Performance and quality settings

**Statistics Overview** (`src/components/StatsOverview.tsx`)
- Processing metrics and statistics
- File system usage information
- Performance monitoring

#### Frontend Features
- **Real-time Updates** - WebSocket or polling for job status
- **File Management** - Browse, download, and manage output files
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Theme switching support
- **Error Handling** - User-friendly error messages and recovery
- **Progressive Enhancement** - Works without JavaScript for basic features

### 5. Audio Download (`src/download_audio.py`)
- Uses `yt-dlp` to download audio from YouTube URLs
- Extracts video IDs and saves audio as WAV files
- Supports single videos or playlists
- Local file processing support (MP4, WAV, M4A, MP3, AAC)

### 6. Transcription Process
- Two transcription engines available:
  - `generate_transcription.py` - Original OpenAI Whisper
  - `generate_transcription_fw.py` - Faster-Whisper implementation
- Both generate:
  - Complete text transcription (.txt)
  - Detailed segment information with timestamps (.json)
- Output saved in `transcripts/words/` directory
- GPU acceleration support with memory monitoring

### 7. Text Processing (`src/split_transcription.py`)
- Divides transcriptions into blocks of appropriate size
- Attempts to maintain semantic coherence by breaking on sentences
- Target size defined in `config.py`: ~130 words per block
- Results stored in `transcripts/sections/` directory

### 8. Excel Export (`src/excel_utils.py`)
- Creates Excel files with transcribed blocks
- Includes timestamps when available
- Saves output in `excel_output/` directory with timestamp in filename
- AI analysis results integration

### 9. Configuration (`src/config.py`)
- Central configuration for directories, file paths
- Model settings (size, language)
- Text processing parameters
- Excel output settings
- API and frontend integration settings

### 10. Utilities (`src/utils/`)
- `extract_video_id.py` - Parse YouTube URLs to extract video IDs
- `logger.py` - Consistent logging throughout the application
- `test_whisper_transcription.py` - Testing utilities

### 11. AI Analysis (`src/ai_analysis/`)
- `vertex_client.py` - Google Cloud Vertex AI client with retry logic and rate limiting
- `prompt_templates.py` - Configurable prompt templates for AI analysis
- `summary_generator.py` - Automatic video summary generation
- `content_classifier.py` - Classification of content for calúnia, injúria, and difamação
- Supports configurable context and target person analysis
- Includes automatic summary generation before classification
- Features incremental saving and resume functionality

## Command-Line Options

### Core Transcription Options
- `--only-excel`: Skip downloading/transcribing, only create Excel from existing transcriptions
- `--list` / `-l`: Allow downloading entire playlists
- `--video-id` / `-id`: Process only a specific YouTube video
- `--ignore`: Skip videos that already have transcriptions
- `--whisper`: Force use of original Whisper model (default: Faster-Whisper)
- `--cpu`: Force CPU usage even if GPU is available
- `--test-whisper`: Test transcription on a specific video

### AI Analysis Options
- `--ai-analysis`: Enable AI analysis after Excel generation
- `--only-ai-analysis FILEPATH`: Process only AI analysis on existing Excel file
- `--ai-resume`: Resume AI analysis from existing file (continues where it left off)
- `--target-person "NAME"`: Specify target person for analysis (overrides config.py)
- `--with-explanation`: Include detailed explanations in AI analysis (more expensive)

## API Endpoints

### Transcription Endpoints
```
POST /api/transcribe
Body: {
  "urls": ["url1", "url2"],
  "options": {
    "only_excel": false,
    "playlist_mode": false,
    "ignore_existing": false,
    "use_whisper": false,
    "ai_analysis": false,
    "target_person": "Nome da Pessoa"
  }
}
```

### Analysis Endpoints
```
POST /api/analyze
Body: {
  "excel_file": "transcricoes_2025-05-28_12-56-03.xlsx",
  "target_person": "João Silva",
  "with_explanation": true,
  "resume": false
}
```

### File Management Endpoints
```
GET /api/files/excel          # List Excel files
GET /api/files/excel/<name>   # Download Excel file
GET /api/files/transcripts    # List transcript files
GET /api/files/audio          # List audio files
```

### Status Endpoints
```
GET /api/status               # API health check
GET /api/jobs/<id>/status     # Job progress tracking
```

## Frontend Components

### Main Interface Components
- **MainTabs** - Primary tabbed interface (Process, Results, Settings, About)
- **Header** - Application header with navigation and status
- **VideoManager** - URL input and batch processing interface
- **ResultsViewer** - File browser and download interface
- **ProcessingStatus** - Real-time job progress tracking
- **AdvancedSettings** - Configuration and model selection
- **StatsOverview** - System metrics and performance monitoring

### UI Components (shadcn/ui)
- **Tabs, Cards, Buttons** - Core interface elements
- **Progress, Badge, Alert** - Status and feedback components
- **Select, Switch, Textarea** - Form controls
- **Dialog, Accordion** - Advanced UI patterns

### Features
- **Real-time Updates** - Live job status and progress
- **File Management** - Browse, preview, and download results
- **Responsive Design** - Desktop, tablet, and mobile support
- **Theme Support** - Dark/light mode switching
- **Error Handling** - User-friendly error messages

## Project Structure

### Root Directory
- `videos.txt` - Input file with YouTube URLs (CLI mode)
- `start.sh` - Main application startup script
- `requirements.txt` - Python dependencies
- `youtube_transcriber.log` - Application logs

### Data Directories
- `audios/` - Downloaded audio files
- `transcripts/words/` - Complete transcriptions with timestamps
- `transcripts/sections/` - Split transcriptions in blocks
- `transcripts/summaries/` - AI-generated video summaries
- `excel_output/` - Generated Excel files

### Source Code (`src/`)
- `main.py` - Entry point and workflow coordinator
- `download_audio.py` - Audio extraction from YouTube
- `generate_transcription(_fw).py` - Transcription engines
- `split_transcription.py` - Text segmentation
- `excel_utils.py` - Excel generation
- `config.py` - Application configuration
- `ai_analysis/` - AI analysis modules
  - `vertex_client.py` - Google Cloud Vertex AI client
  - `prompt_templates.py` - AI prompt templates
  - `summary_generator.py` - Video summary generation
  - `content_classifier.py` - Legal content classification
- `utils/` - Helper modules and utilities

### REST API (`api/`)
- `app.py` - Flask application entry point
- `requirements.txt` - API-specific dependencies
- `routes/` - API endpoint handlers
  - `transcribe.py` - Transcription endpoints
  - `analyze.py` - AI analysis endpoints
  - `files.py` - File management endpoints
  - `status.py` - Status and health check endpoints
- `services/` - Business logic layer
  - `job_manager.py` - Background job processing
  - `transcription_service.py` - Transcription workflow
  - `analysis_service.py` - AI analysis operations
- `models/` - Data models and schemas
- `utils/` - API utilities and helpers

### React Frontend (`frontend/`)
- `package.json` - Node.js dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `biome.json` - Code formatting and linting
- `start-dev.sh` - Frontend development startup script
- `src/` - React application source
  - `App.tsx` - Main application component
  - `components/` - React components
    - `MainTabs.tsx` - Primary interface tabs
    - `VideoManager.tsx` - URL input and processing
    - `ResultsViewer.tsx` - File browser and downloads
    - `ProcessingStatus.tsx` - Job progress tracking
    - `AdvancedSettings.tsx` - Configuration interface
    - `StatsOverview.tsx` - System metrics
  - `lib/` - Utility functions and API client
  - `hooks/` - Custom React hooks
  - `types/` - TypeScript type definitions
- `public/` - Static assets
- `dist/` - Built application (generated)

## Development Workflow

### Environment Setup
1. **Python Environment**: The application runs in a virtual environment
   ```bash
   source /home/m01545/projects/python/youtube_transcriber/venv/bin/activate
   ```

2. **Dependencies Installation**:
   - **Python CLI**: `pip install -r requirements.txt`
   - **API**: `pip install -r api/requirements.txt`
   - **Frontend**: `cd frontend && npm install`

### Development Startup

#### Full Stack Development
```bash
# Start all services (API + Frontend)
./start.sh
```

#### Frontend Development Only
```bash
# Start frontend development server
cd frontend && ./start-dev.sh
# or
cd frontend && npm run dev
```

#### API Development Only
```bash
# Activate Python environment
source venv/bin/activate
# Start Flask API
cd api && python app.py
```

#### CLI Development/Testing
```bash
# Activate Python environment
source venv/bin/activate
# Run CLI application
python src/main.py [options]
```

### Build and Deployment

#### Frontend Production Build
```bash
cd frontend
npm run build
# Built files will be in dist/ directory
```

#### API Production Deployment
- Configure CORS settings in `api/app.py`
- Set environment variables for production
- Use WSGI server (e.g., Gunicorn) for production deployment

### Integration Testing
- **Frontend ↔ API**: Frontend runs on development server, connects to Flask API
- **API ↔ CLI**: API services utilize CLI transcription and analysis modules
- **End-to-End**: Full workflow from URL input to Excel output with AI analysis

## Development Notes

### Technical Requirements
- **Python 3.8+** with virtual environment activation required
- **Node.js 18+** for frontend development
- **GPU Support**: CUDA-compatible GPU recommended for faster transcription
- **Storage**: Adequate disk space for audio files and transcriptions

### Performance Considerations
- **Faster-Whisper** is recommended over original Whisper for better performance
- **GPU acceleration** significantly improves transcription speed
- **Batch processing** supports multiple URLs for efficiency
- **Background jobs** prevent UI blocking during long operations

### File Management
- File naming based on YouTube video IDs for consistency
- Automatic cleanup and organization of temporary files
- Excel files include timestamps in filenames for versioning
- AI analysis results integrated into existing Excel files

### Logging and Monitoring
- Application logs available in `youtube_transcriber.log`
- Real-time job progress tracking through API
- Error handling with user-friendly messages
- Performance metrics available through frontend statistics

### AI Analysis Features
- **Content Classification**: Automated analysis for calúnia, injúria, and difamação
- **Target Person Analysis**: Configurable subject-specific analysis
- **Resume Functionality**: Continue interrupted analysis operations
- **Incremental Saving**: Progress preserved during long analysis sessions
- **Rate Limiting**: Proper handling of API quotas and limits

## New rules for development

- Whenever you implement a new feature on the frontend, backend or hooks, create automated tests using Vitest (for frontend/TypeScript).
- The tests should cover the main flows, states and expected errors of the new feature.
- The code is only considered ready if it is accompanied by automated tests.