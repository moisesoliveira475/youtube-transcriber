import { useEffect, useState } from "react";
import { apiService } from "../lib/api";

export interface JobStatus {
  id: string;
  status: "processing" | "completed" | "error" | "pending" | "cancelled";
  progress?: number;
  current_step?: string;
  created_at?: string;
  updated_at?: string;
  result?: any;
  error?: string | null;
}

export function useJobStatus(jobId: string | null, pollInterval = 2000) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let isMounted = true;
    let interval: NodeJS.Timeout;
    setIsLoading(true);
    setError(null);

    const fetchStatus = async () => {
      try {
        const status = await apiService.getJobStatus(jobId);
        if (isMounted) {
          setJobStatus(status);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Erro ao buscar status do job");
          setIsLoading(false);
        }
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, pollInterval);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId, pollInterval]);

  return { jobStatus, isLoading, error };
}
