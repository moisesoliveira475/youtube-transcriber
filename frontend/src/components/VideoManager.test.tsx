import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VideoManager } from "../components/VideoManager";
import { AppProvider } from "../context/AppContext";

// Corrige erro de matcher: importa jest-dom para toBeInTheDocument
import "@testing-library/jest-dom";

import React from "react";

// Estado reativo para simular isProcessing
let processing = false;
const listeners: (() => void)[] = [];

vi.mock("../lib/hooks", () => ({
  useTranscription: () => ({
    startTranscription: vi.fn(async () => {
      processing = true;
      listeners.forEach(fn => fn());
      return { success: true };
    }),
    get isProcessing() {
      return processing;
    },
    subscribe: (fn: () => void) => listeners.push(fn)
  })
}));

// Helper para forçar re-render no teste
function useRerenderOnProcessing() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setTick(t => t + 1);
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);
}

// Teste mínimo para isolar erro de importação
function TestComponent() {
  return <div>TestComponent OK</div>;
}

describe("TestComponent mínimo", () => {
  it("deve renderizar o texto corretamente", () => {
    render(<TestComponent />);
    expect(screen.getByText(/TestComponent OK/i)).toBeInTheDocument();
  });
});

describe("VideoManager integração", () => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    useRerenderOnProcessing();
    return <AppProvider>{children}</AppProvider>;
  }
  it("deve iniciar transcrição e exibir feedback visual de processamento", async () => {
    render(
      <VideoManager />, { wrapper: Wrapper }
    );
    // Adiciona uma URL válida
    const input = screen.getByPlaceholderText(/(url do youtube|uma ou mais urls do youtube)/i);
    fireEvent.change(input, { target: { value: "https://youtu.be/3mYf_Urh96w" } });
    fireEvent.click(screen.getByText(/adicionar/i));
    // Inicia processamento
    fireEvent.click(screen.getByText(/iniciar processamento/i));
    // Espera feedback visual
    await waitFor(() => {
      expect(screen.getByText(/processando/i)).toBeInTheDocument();
    });
  });
});
