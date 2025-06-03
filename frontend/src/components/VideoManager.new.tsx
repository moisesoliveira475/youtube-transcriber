import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ProcessingStatus, getDefaultSteps } from "./ProcessingStatus";
import { useTranscription } from "@/lib/hooks";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Play, 
  Download, 
  FileText, 
  Brain,
  Settings,
  Youtube
} from "lucide-react";

export function VideoManager() {
  const { state, setUrls, updateSettings } = useApp();
  const [newUrl, setNewUrl] = useState("");
  
  // Use API hooks
  const {
    currentJob,
    isLoading,
    error,
    startTranscription,
    getVideoInfo,
    clearError
  } = useTranscription();

  // Processing state
  const [processingSteps, setProcessingSteps] = useState(getDefaultSteps());
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);

  // Clear errors on mount
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Update processing steps based on current job
  useEffect(() => {
    if (!currentJob) return;

    const updatedSteps = processingSteps.map(step => {
      // Map job status to step status
      if (currentJob.current_step?.toLowerCase().includes(step.id)) {
        return {
          ...step,
          status: currentJob.status === 'processing' ? 'in-progress' as const : 
                 currentJob.status === 'completed' ? 'completed' as const :
                 currentJob.status === 'error' ? 'error' as const : 'pending' as const,
          progress: currentJob.progress,
          message: currentJob.current_step
        };
      }
      return step;
    });

    setProcessingSteps(updatedSteps);

    // Add logs
    if (currentJob.current_step) {
      setProcessingLogs(prev => [...prev, currentJob.current_step]);
    }
  }, [currentJob, processingSteps]);

  const addUrl = async () => {
    if (!newUrl.trim()) return;
    
    const trimmedUrl = newUrl.trim();
    if (state.urls.includes(trimmedUrl)) {
      toast.warning("URL já foi adicionada");
      return;
    }

    // Validate URL and get video info
    try {
      const videoInfo = await getVideoInfo(trimmedUrl);
      if (videoInfo?.success) {
        setUrls([...state.urls, trimmedUrl]);
        setNewUrl("");
        toast.success(`Vídeo adicionado: ${videoInfo.title || 'Video válido'}`);
      } else {
        toast.error(videoInfo?.error || "URL inválida");
      }
    } catch (error) {
      toast.error("Erro ao validar URL");
    }
  };

  const removeUrl = (index: number) => {
    setUrls(state.urls.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addUrl();
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const startProcessing = async () => {
    if (state.urls.length === 0) {
      toast.error("Adicione pelo menos uma URL");
      return;
    }

    // Reset processing state
    setProcessingSteps(getDefaultSteps());
    setProcessingLogs([]);

    const options = {
      playlist_mode: state.settings.playlistMode,
      ignore_existing: state.settings.ignoreExisting,
      use_whisper: state.settings.useWhisper,
      ai_analysis: state.settings.aiAnalysis,
      target_person: state.settings.targetPerson || undefined,
      with_explanation: state.settings.withExplanation
    };

    try {
      const jobId = await startTranscription(state.urls, options);
      if (jobId) {
        toast.success("Processamento iniciado com sucesso!");
      } else {
        toast.error("Falha ao iniciar processamento");
      }
    } catch (error) {
      toast.error("Erro ao iniciar processamento");
    }
  };

  const isProcessing = currentJob?.status === 'processing' || currentJob?.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Adicionar URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            Gerenciar URLs do YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="url-input" className="sr-only">
                URL do YouTube
              </Label>
              <Input
                id="url-input"
                placeholder="Cole a URL do YouTube aqui..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={addUrl} disabled={!newUrl.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {state.urls.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                URLs adicionadas ({state.urls.length})
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {state.urls.map((url, index) => {
                  const videoId = extractVideoId(url);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{url}</p>
                        {videoId && (
                          <Badge variant="secondary" className="text-xs">
                            ID: {videoId}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUrl(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-whisper"
                checked={state.settings.useWhisper}
                onCheckedChange={(checked) => updateSettings({ useWhisper: checked })}
              />
              <Label htmlFor="use-whisper">Usar Whisper Original</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="playlist-mode"
                checked={state.settings.playlistMode}
                onCheckedChange={(checked) => updateSettings({ playlistMode: checked })}
              />
              <Label htmlFor="playlist-mode">Modo Playlist</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="ignore-existing"
                checked={state.settings.ignoreExisting}
                onCheckedChange={(checked) => updateSettings({ ignoreExisting: checked })}
              />
              <Label htmlFor="ignore-existing">Ignorar Existentes</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="ai-analysis"
                checked={state.settings.aiAnalysis}
                onCheckedChange={(checked) => updateSettings({ aiAnalysis: checked })}
              />
              <Label htmlFor="ai-analysis">Análise IA</Label>
            </div>
          </div>
          
          {state.settings.aiAnalysis && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-person">
                    Pessoa Alvo (para análise jurídica)
                  </Label>
                  <Input
                    id="target-person"
                    placeholder="Nome da pessoa para análise de calúnia, injúria e difamação"
                    value={state.settings.targetPerson}
                    onChange={(e) => updateSettings({ targetPerson: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional: Especifique uma pessoa para análise focada em questões jurídicas
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="with-explanation"
                    checked={state.settings.withExplanation}
                    onCheckedChange={(checked) => updateSettings({ withExplanation: checked })}
                  />
                  <Label htmlFor="with-explanation">Incluir Explicações Detalhadas</Label>
                  <p className="text-xs text-muted-foreground ml-2">(mais caro)</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Processar Vídeos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="flex items-center gap-2"
              disabled={state.urls.length === 0 || isProcessing}
              onClick={startProcessing}
            >
              <Download className="h-4 w-4" />
              Baixar Áudio
            </Button>
            
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              disabled={state.urls.length === 0 || isProcessing}
              onClick={startProcessing}
            >
              <FileText className="h-4 w-4" />
              Transcrever
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={state.urls.length === 0 || isProcessing}
              onClick={startProcessing}
            >
              <Brain className="h-4 w-4" />
              Análise IA
            </Button>
          </div>

          <Separator />

          <div className="flex justify-center">
            <Button
              size="lg"
              className="w-full md:w-auto"
              disabled={state.urls.length === 0 || isProcessing || isLoading}
              onClick={startProcessing}
            >
              {isProcessing || isLoading ? (
                <>Processando...</>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Processo Completo
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            O processo completo inclui: download de áudio, transcrição, 
            divisão em blocos, exportação para Excel e análise opcional com IA
          </p>
        </CardContent>
      </Card>

      {/* Status/Log */}
      {isProcessing && (
        <ProcessingStatus
          isProcessing={isProcessing}
          currentVideoId={currentJob?.id}
          videoTitle={extractVideoId(state.urls[0] || '') || 'Processando...'}
          steps={processingSteps}
          logs={processingLogs}
        />
      )}
    </div>
  );
}
