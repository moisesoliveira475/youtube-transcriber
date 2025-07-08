import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResultsViewer } from "./ResultsViewer";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AppProvider } from "@/context/AppContext";
import React from "react";

// Mock do hook useFiles para simular resposta da API
const mockUseFiles = vi.fn();

vi.mock("@/lib/hooks", () => ({
  useFiles: () => mockUseFiles()
}));

// Mock do hook useJobStatus
vi.mock("@/hooks/useJobStatus", () => ({
  useJobStatus: () => ({
    jobStatus: null,
    isLoading: false
  })
}));

// Mock do toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Wrapper de teste usando AppProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe("ResultsViewer integração com API de arquivos Excel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve exibir todos os arquivos Excel retornados pela API", async () => {
    mockUseFiles.mockReturnValue({
      excelFiles: [
        { filename: "transcricoes_2025-07-07_16-57-32.xlsx", size: 1024000, modified: Date.now() / 1000 },
        { filename: "transcricoes_2025-07-07_16-59-22.xlsx", size: 512000, modified: (Date.now() - 86400000) / 1000 },
        { filename: "transcricoes_2025-07-08_11-29-11.xlsx", size: 5393, modified: (Date.now() - 1000000) / 1000 },
        { filename: "transcricoes_2025-07-08_11-40-12.xlsx", size: 5393, modified: (Date.now() - 500000) / 1000 }
      ],
      transcriptFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: vi.fn()
    });

    render(
      <TestWrapper>
        <ResultsViewer />
      </TestWrapper>
    );

    // Espera os arquivos aparecerem (buscando pelos títulos transformados)
    await waitFor(() => {
      expect(screen.getByText("transcricoes_2025-07-07_16-57-32")).toBeInTheDocument();
      expect(screen.getByText("transcricoes_2025-07-07_16-59-22")).toBeInTheDocument();
      expect(screen.getByText("transcricoes_2025-07-08_11-29-11")).toBeInTheDocument();
      expect(screen.getByText("transcricoes_2025-07-08_11-40-12")).toBeInTheDocument();
    });
  });

  it("deve exibir estado de loading quando isLoading é true", async () => {
    mockUseFiles.mockReturnValue({
      excelFiles: [],
      transcriptFiles: [],
      isLoading: true,
      error: null,
      downloadExcel: vi.fn()
    });

    render(
      <TestWrapper>
        <ResultsViewer />
      </TestWrapper>
    );

    expect(screen.getByText("Carregando arquivos...")).toBeInTheDocument();
  });

  it("deve exibir mensagem quando não há arquivos", async () => {
    mockUseFiles.mockReturnValue({
      excelFiles: [],
      transcriptFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: vi.fn()
    });

    render(
      <TestWrapper>
        <ResultsViewer />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma transcrição encontrada")).toBeInTheDocument();
      expect(screen.getByText("Execute o processamento para ver os resultados aqui")).toBeInTheDocument();
    });
  });

  it("deve chamar downloadExcel quando botão de download é clicado", async () => {
    const mockDownloadExcel = vi.fn().mockResolvedValue(undefined);
    
    mockUseFiles.mockReturnValue({
      excelFiles: [
        { filename: "transcricoes_2025-07-07_16-57-32.xlsx", size: 1024000, modified: Date.now() / 1000 }
      ],
      transcriptFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: mockDownloadExcel
    });

    render(
      <TestWrapper>
        <ResultsViewer />
      </TestWrapper>
    );

    // Espera o botão aparecer
    await waitFor(() => {
      const downloadButton = screen.getByText("Baixar Excel");
      expect(downloadButton).toBeInTheDocument();
    });

    const downloadButton = screen.getByText("Baixar Excel");
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockDownloadExcel).toHaveBeenCalledWith("transcricoes_2025-07-07_16-57-32.xlsx");
    });
  });

  it("deve identificar e exibir arquivos com análise IA", async () => {
    mockUseFiles.mockReturnValue({
      excelFiles: [
        { 
          filename: "teste_ai_analysis.xlsx", 
          size: 1024000, 
          modified: Date.now() / 1000,
          is_ai_analysis: true
        }
      ],
      transcriptFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: vi.fn()
    });

    render(
      <TestWrapper>
        <ResultsViewer />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("IA")).toBeInTheDocument();
      expect(screen.getByText("Ver Análise")).toBeInTheDocument();
    });
  });

  it("deve exibir erro quando hook retorna erro", async () => {
    const mockError = "Erro ao carregar arquivos da API";
    
    mockUseFiles.mockReturnValue({
      excelFiles: [],
      transcriptFiles: [],
      isLoading: false,
      error: mockError,
      downloadExcel: vi.fn()
    });

    // Mock do toast para verificar se erro foi exibido
    const { toast } = await import("sonner");
    
    render(
      <TestWrapper>
        <ResultsViewer />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(mockError);
    });
  });

  it("deve lidar com arquivos que não seguem padrão de nome", async () => {
    mockUseFiles.mockReturnValue({
      excelFiles: [
        { 
          filename: "arquivo_sem_padrao.xlsx", 
          size: 1024000, 
          modified: Date.now() / 1000
        }
      ],
      transcriptFiles: [],
      isLoading: false,
      error: null,
      downloadExcel: vi.fn()
    });

    render(
      <TestWrapper>
        <ResultsViewer />
      </TestWrapper>
    );

    // Verifica se o arquivo foi renderizado mesmo sem seguir o padrão
    await waitFor(() => {
      expect(screen.getByText("arquivo_sem_padrao")).toBeInTheDocument();
    });
  });
});
