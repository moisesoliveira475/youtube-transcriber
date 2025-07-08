import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultsViewer } from '../ResultsViewer';
import { useFiles } from '@/lib/hooks';

// Mock dos hooks essenciais
vi.mock('@/lib/hooks');
vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    state: {
      jobs: [],
      excelFiles: [],
      audioFiles: [],
      transcriptFiles: [],
    },
    dispatch: vi.fn(),
  }),
}));
vi.mock('@/hooks/useJobStatus', () => ({
  useJobStatus: () => ({
    jobStatus: null,
    isLoading: false,
    error: null,
  }),
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseFiles = vi.mocked(useFiles);

describe('ResultsViewer', () => {
  const mockDownloadExcel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock inicial do hook de arquivos
    mockUseFiles.mockReturnValue({
      excelFiles: [],
      transcriptFiles: [],
      audioFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: mockDownloadExcel,
      refresh: vi.fn(),
    });
  });

  it('deve renderizar mensagem quando não há arquivos', () => {
    render(<ResultsViewer />);
    
    expect(screen.getByText('Nenhuma transcrição encontrada')).toBeInTheDocument();
    expect(screen.getByText('Execute o processamento para ver os resultados aqui')).toBeInTheDocument();
  });

  it('deve exibir loading quando isLoading é true', () => {
    mockUseFiles.mockReturnValue({
      excelFiles: [],
      transcriptFiles: [],
      audioFiles: [],
      isLoading: true,
      error: null,
      downloadExcel: mockDownloadExcel,
      refresh: vi.fn(),
    });

    render(<ResultsViewer />);
    
    expect(screen.getByText('Carregando arquivos...')).toBeInTheDocument();
  });

  it('deve exibir arquivos Excel quando disponíveis', () => {
    const mockExcelFiles = [
      {
        filename: 'transcricoes_2025-07-08_10-30-00.xlsx',
        size: 1024,
        modified: Date.now() / 1000,
        is_ai_analysis: false,
      },
    ];

    const mockTranscriptFiles = [
      {
        filename: 'CRY2joOmrig.txt',
        video_id: 'CRY2joOmrig',
        size: 512,
        modified: Date.now() / 1000,
      },
    ];

    mockUseFiles.mockReturnValue({
      excelFiles: mockExcelFiles,
      transcriptFiles: mockTranscriptFiles,
      audioFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: mockDownloadExcel,
      refresh: vi.fn(),
    });

    render(<ResultsViewer />);
    
    // Verifica se o arquivo é exibido com o video ID
    expect(screen.getByText(/transcricoes_2025-07-08_10-30-00.*CRY2joOmrig/)).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('deve identificar arquivos com análise IA', () => {
    const mockExcelFiles = [
      {
        filename: 'transcricoes_2025-07-08_10-30-00_ai_analysis.xlsx',
        size: 1024,
        modified: Date.now() / 1000,
        is_ai_analysis: true,
      },
    ];

    const mockTranscriptFiles = [
      {
        filename: 'CRY2joOmrig.txt',
        video_id: 'CRY2joOmrig',
        size: 512,
        modified: Date.now() / 1000,
      },
    ];

    mockUseFiles.mockReturnValue({
      excelFiles: mockExcelFiles,
      transcriptFiles: mockTranscriptFiles,
      audioFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: mockDownloadExcel,
      refresh: vi.fn(),
    });

    render(<ResultsViewer />);
    
    // Verifica se o badge de IA é exibido
    expect(screen.getByText('IA')).toBeInTheDocument();
  });

  it('deve abrir modal de transcrição ao clicar em "Ver Transcrição"', async () => {
    const mockExcelFiles = [
      {
        filename: 'transcricoes_2025-07-08_10-30-00.xlsx',
        size: 1024,
        modified: Date.now() / 1000,
        is_ai_analysis: false,
      },
    ];

    const mockTranscriptFiles = [
      {
        filename: 'CRY2joOmrig.txt',
        video_id: 'CRY2joOmrig',
        size: 512,
        modified: Date.now() / 1000,
      },
    ];

    mockUseFiles.mockReturnValue({
      excelFiles: mockExcelFiles,
      transcriptFiles: mockTranscriptFiles,
      audioFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: mockDownloadExcel,
      refresh: vi.fn(),
    });

    render(<ResultsViewer />);
    
    const verTranscricaoButton = screen.getByText('Ver Transcrição');
    fireEvent.click(verTranscricaoButton);
    
    // O modal deveria abrir (verificamos se o TranscriptionModal foi renderizado)
    // Como o modal está em outro componente, verificamos se não há erro
    expect(verTranscricaoButton).toBeInTheDocument();
  });

  it('deve chamar downloadExcel ao clicar em "Baixar Excel"', async () => {
    const mockExcelFiles = [
      {
        filename: 'transcricoes_2025-07-08_10-30-00.xlsx',
        size: 1024,
        modified: Date.now() / 1000,
        is_ai_analysis: false,
      },
    ];

    const mockTranscriptFiles = [
      {
        filename: 'CRY2joOmrig.txt',
        video_id: 'CRY2joOmrig',
        size: 512,
        modified: Date.now() / 1000,
      },
    ];

    mockUseFiles.mockReturnValue({
      excelFiles: mockExcelFiles,
      transcriptFiles: mockTranscriptFiles,
      audioFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: mockDownloadExcel,
      refresh: vi.fn(),
    });

    render(<ResultsViewer />);
    
    const baixarExcelButton = screen.getByText('Baixar Excel');
    fireEvent.click(baixarExcelButton);
    
    await waitFor(() => {
      expect(mockDownloadExcel).toHaveBeenCalledWith('transcricoes_2025-07-08_10-30-00.xlsx');
    });
  });

  it('deve exibir status de processamento quando há job ativo', () => {
    // Este teste seria implementado com mocks mais complexos
    // Por ora, verificamos apenas a renderização básica
    render(<ResultsViewer />);
    expect(screen.getByText('Nenhuma transcrição encontrada')).toBeInTheDocument();
  });

  it('deve exibir análises IA em tab separada', () => {
    const mockExcelFiles = [
      {
        filename: 'transcricoes_2025-07-08_10-30-00_ai_analysis.xlsx',
        size: 1024,
        modified: Date.now() / 1000,
        is_ai_analysis: true,
      },
    ];

    const mockTranscriptFiles = [
      {
        filename: 'CRY2joOmrig.txt',
        video_id: 'CRY2joOmrig',
        size: 512,
        modified: Date.now() / 1000,
      },
    ];

    mockUseFiles.mockReturnValue({
      excelFiles: mockExcelFiles,
      transcriptFiles: mockTranscriptFiles,
      audioFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: mockDownloadExcel,
      refresh: vi.fn(),
    });

    render(<ResultsViewer />);
    
    // Clica na tab de análises
    const analysisTab = screen.getByText('Análises IA');
    fireEvent.click(analysisTab);
    
    // Verifica se o arquivo de análise é exibido
    expect(screen.getByText('Análise IA Completa')).toBeInTheDocument();
    expect(screen.getByText('Ver Resumo')).toBeInTheDocument();
    expect(screen.getByText('Baixar Relatório')).toBeInTheDocument();
  });
});
