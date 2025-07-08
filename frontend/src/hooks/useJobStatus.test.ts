import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useJobStatus } from "../hooks/useJobStatus";

vi.mock("../lib/api", () => ({
  apiService: {
    getJobStatus: vi.fn(async (jobId: string) => ({
      id: jobId,
      status: "processing",
      progress: 42,
      current_step: "Transcrevendo vídeo..."
    }))
  }
}));

describe("useJobStatus", () => {
  it("deve buscar status do job e atualizar estado", async () => {
    const { result } = renderHook(() => useJobStatus("job123", 100));
    await waitFor(() => {
      expect(result.current.jobStatus).toBeTruthy();
      expect(result.current.jobStatus?.id).toBe("job123");
      expect(result.current.jobStatus?.status).toBe("processing");
      expect(result.current.jobStatus?.progress).toBe(42);
      expect(result.current.jobStatus?.current_step).toBe("Transcrevendo vídeo...");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it("deve lidar com erro ao buscar status", async () => {
    // Simula erro
    const { apiService } = await import("../lib/api");
    (apiService.getJobStatus as any).mockRejectedValueOnce(new Error("fail"));
    const { result } = renderHook(() => useJobStatus("job-err", 100));
    await waitFor(() => {
      expect(result.current.error).toBe("Erro ao buscar status do job");
      expect(result.current.jobStatus).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
