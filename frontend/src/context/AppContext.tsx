import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

// Tipos para o estado da aplicação
export interface TranscriptionSettings {
  useWhisper: boolean;
  playlistMode: boolean;
  ignoreExisting: boolean;
  aiAnalysis: boolean;
  targetPerson: string;
  withExplanation: boolean;
  cpuOnly: boolean;
  onlyExcel: boolean;
}

export interface Job {
  id: string;
  type: 'transcription' | 'analysis';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  startTime: Date;
  endTime?: Date;
  steps?: Array<{
    id: string;
    name: string;
    status: "pending" | "in-progress" | "completed" | "error";
    progress?: number;
    message?: string;
  }>;
  logs?: string[];
}

export interface AppState {
  // Navegação
  currentPage: 'process' | 'results' | 'settings' | 'about';
  
  // Configurações
  settings: TranscriptionSettings;
  
  // Jobs ativos
  jobs: Job[];
  activeJob: Job | null;
  
  // URLs e processamento
  urls: string[];
  
  // Cache de dados
  excelFiles: any[];
  audioFiles: any[];
  transcriptFiles: any[];
  
  // Status da aplicação
  isProcessing: boolean;
  lastRefresh: Date | null;
}

// Ações possíveis
export type AppAction =
  | { type: 'SET_PAGE'; payload: AppState['currentPage'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TranscriptionSettings> }
  | { type: 'SET_URLS'; payload: string[] }
  | { type: 'ADD_URL'; payload: string }
  | { type: 'REMOVE_URL'; payload: number }
  | { type: 'CLEAR_URLS' }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: { id: string; updates: Partial<Job> } }
  | { type: 'REMOVE_JOB'; payload: string }
  | { type: 'SET_ACTIVE_JOB'; payload: Job | null }
  | { type: 'SET_EXCEL_FILES'; payload: any[] }
  | { type: 'SET_AUDIO_FILES'; payload: any[] }
  | { type: 'SET_TRANSCRIPT_FILES'; payload: any[] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_LAST_REFRESH'; payload: Date };

// Estado inicial
const initialState: AppState = {
  currentPage: 'process',
  settings: {
    useWhisper: false,
    playlistMode: false,
    ignoreExisting: false,
    aiAnalysis: false,
    targetPerson: '',
    withExplanation: false,
    cpuOnly: false,
    onlyExcel: false,
  },
  jobs: [],
  activeJob: null,
  urls: [],
  excelFiles: [],
  audioFiles: [],
  transcriptFiles: [],
  isProcessing: false,
  lastRefresh: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'SET_URLS':
      return { ...state, urls: action.payload };
    
    case 'ADD_URL':
      return { ...state, urls: [...state.urls, action.payload] };
    
    case 'REMOVE_URL':
      return { 
        ...state, 
        urls: state.urls.filter((_, index) => index !== action.payload) 
      };
    
    case 'CLEAR_URLS':
      return { ...state, urls: [] };
    
    case 'ADD_JOB':
      return {
        ...state,
        jobs: [...state.jobs, action.payload],
        activeJob: action.payload
      };
    
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload.id
            ? { ...job, ...action.payload.updates }
            : job
        ),
        activeJob: state.activeJob?.id === action.payload.id
          ? { ...state.activeJob, ...action.payload.updates }
          : state.activeJob
      };
    
    case 'REMOVE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        activeJob: state.activeJob?.id === action.payload ? null : state.activeJob
      };
    
    case 'SET_ACTIVE_JOB':
      return { ...state, activeJob: action.payload };
    
    case 'SET_EXCEL_FILES':
      return { ...state, excelFiles: action.payload };
    
    case 'SET_AUDIO_FILES':
      return { ...state, audioFiles: action.payload };
    
    case 'SET_TRANSCRIPT_FILES':
      return { ...state, transcriptFiles: action.payload };
    
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    
    case 'SET_LAST_REFRESH':
      return { ...state, lastRefresh: action.payload };
    
    default:
      return state;
  }
}

// Contexto
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Ações de conveniência
  navigateTo: (page: AppState['currentPage']) => void;
  updateSettings: (settings: Partial<TranscriptionSettings>) => void;
  setUrls: (urls: string[]) => void;
  addUrl: (url: string) => void;
  removeUrl: (index: number) => void;
  clearUrls: () => void;
  addJob: (job: Omit<Job, 'id' | 'startTime'>) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  setProcessing: (processing: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Ações de conveniência
  const navigateTo = (page: AppState['currentPage']) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };
  
  const updateSettings = (settings: Partial<TranscriptionSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };
  
  const setUrls = (urls: string[]) => {
    dispatch({ type: 'SET_URLS', payload: urls });
  };
  
  const addUrl = (url: string) => {
    dispatch({ type: 'ADD_URL', payload: url });
  };
  
  const removeUrl = (index: number) => {
    dispatch({ type: 'REMOVE_URL', payload: index });
  };
  
  const clearUrls = () => {
    dispatch({ type: 'CLEAR_URLS' });
  };
  
  const addJob = (jobData: Omit<Job, 'id' | 'startTime'>): Job => {
    const job: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
    };
    dispatch({ type: 'ADD_JOB', payload: job });
    return job;
  };
  
  const updateJob = (id: string, updates: Partial<Job>) => {
    dispatch({ type: 'UPDATE_JOB', payload: { id, updates } });
  };
  
  const removeJob = (id: string) => {
    dispatch({ type: 'REMOVE_JOB', payload: id });
  };
  
  const setProcessing = (processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: processing });
  };
  
  const contextValue: AppContextType = {
    state,
    dispatch,
    navigateTo,
    updateSettings,
    setUrls,
    addUrl,
    removeUrl,
    clearUrls,
    addJob,
    updateJob,
    removeJob,
    setProcessing,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
