import { Loader2, Play, Plus, Trash2, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useTranscription } from "../lib/hooks";
import { useJobStatus } from "../hooks/useJobStatus";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ProcessingStatus, getDefaultSteps } from "./ProcessingStatus";

// URL validation helper
const extractVideoId = (url: string): string | null => {
  try {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1] || match[0];
    }
    return null;
  } catch {
    return null;
  }
};

const validateYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

export function VideoManager() {
  const { state, addUrl, removeUrl, clearUrls } = useApp();
  const { startTranscription, isProcessing, jobId, error } = useTranscription();
  const [inputUrl, setInputUrl] = useState("");
  const [errorMsg, setError] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  // Poll status do job
  const { jobStatus } = useJobStatus(jobId, 2000);

  // Permite múltiplas URLs coladas de uma vez (uma por linha)
  const handleAddUrl = () => {
    const urls = inputUrl
      .split(/\n|,/)
      .map(u => u.trim())
      .filter(Boolean);
    const invalid = urls.filter(u => !validateYouTubeUrl(u));
    if (invalid.length) {
      setError(
        invalid.length === 1
          ? `URL inválida: ${invalid[0]}`
          : `Algumas URLs são inválidas: ${invalid.join(", ")}`
      );
      return;
    }
    urls.forEach(u => addUrl(u));
    setInputUrl("");
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputUrl(e.target.value);
    setError(null);
  };

  const handleRemoveUrl = (idx: number) => removeUrl(idx);
  const handleClear = () => clearUrls();

  const handleStart = async () => {
    if (!state.urls.length) {
      toast.error("Adicione pelo menos uma URL válida.");
      return;
    }
    setShowStatus(true);
    const res = await startTranscription(state.urls, {});
    if (!res.success) {
      toast.error(res.error || "Erro ao iniciar processamento");
      setShowStatus(false);
    }
  };

  // Monta steps e logs para o componente de status
  const steps = (jobStatus && (jobStatus as any).steps) || getDefaultSteps();
  const logs = (jobStatus && (jobStatus as any).logs) || [];
  const isJobProcessing = isProcessing || (jobStatus && ["processing", "pending"].includes(jobStatus.status));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar vídeos do YouTube</CardTitle>
        <div className="text-xs text-muted-foreground mt-1">URLs adicionadas: <span className="font-bold">{state.urls.length}</span></div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-2 items-end mb-4">
          <textarea
            placeholder="Cole uma ou mais URLs do YouTube (uma por linha)"
            value={inputUrl}
            onChange={handleInputChange}
            disabled={isProcessing}
            data-testid="input-url"
            rows={2}
            className="w-full resize-none border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-muted"
          />
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleAddUrl} disabled={isProcessing || !inputUrl} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
            <Button variant="secondary" onClick={handleClear} disabled={isProcessing || !state.urls.length} className="w-full md:w-auto">
              <Trash2 className="w-4 h-4 mr-1" /> Limpar
            </Button>
          </div>
        </div>
        {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}
        <div className="mb-4 bg-muted/60 rounded-md p-2 border">
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {state.urls.map((url, idx) => (
              <li key={url} className="flex items-center gap-2 group hover:bg-muted/80 rounded px-2 py-1 transition">
                <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate max-w-xs flex-1 text-sm">{url}</span>
                <Button size="icon" variant="ghost" onClick={() => handleRemoveUrl(idx)} disabled={isProcessing} className="opacity-60 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
            {!state.urls.length && (
              <li className="text-xs text-muted-foreground px-2 py-1">Nenhuma URL adicionada.</li>
            )}
          </ul>
        </div>
        <Button
          onClick={handleStart}
          disabled={isProcessing || !state.urls.length}
          className="w-full h-12 text-base font-semibold"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isProcessing ? "Processando" : "Iniciar processamento"}
        </Button>
        {/* Exibe status detalhado do processamento */}
        {showStatus && isJobProcessing && (
          <div className="mt-6">
            <ProcessingStatus
              isProcessing={isJobProcessing}
              currentVideoId={state.urls[0]}
              steps={steps}
              logs={logs}
            />
          </div>
        )}
        {/* Exibe erro se houver */}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </CardContent>
    </Card>
  );
}