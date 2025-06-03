import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/context/AppContext";
import { useTranscription } from "@/lib/hooks";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Play,
  Youtube,
  FileText,
  Brain,
  Settings,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

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
  const { state, addUrl, removeUrl, clearUrls, updateSettings } = useApp();
  const { startTranscription, isProcessing } = useTranscription();
  
  const [currentUrl, setCurrentUrl] = useState("");
  const [targetPerson, setTargetPerson] = useState(state.settings.targetPerson || "");
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Add single URL
  const handleAddUrl = () => {
    if (!currentUrl.trim()) {
      toast.error("Por favor, insira uma URL");
      return;
    }

    if (!validateYouTubeUrl(currentUrl.trim())) {
      toast.error("URL do YouTube inválida");
      return;
    }

    const videoId = extractVideoId(currentUrl.trim());
    if (!videoId) {
      toast.error("Não foi possível extrair o ID do vídeo");
      return;
    }

    // Check if URL already exists
    const urlExists = state.urls.some(url => extractVideoId(url) === videoId);
    if (urlExists) {
      toast.error("Este vídeo já foi adicionado");
      return;
    }

    addUrl(currentUrl.trim());
    setCurrentUrl("");
    toast.success("URL adicionada com sucesso");
  };

  // Add bulk URLs
  const handleAddBulkUrls = () => {
    if (!bulkUrls.trim()) {
      toast.error("Por favor, insira as URLs");
      return;
    }

    const urls = bulkUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && !url.startsWith('//'))
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast.error("Nenhuma URL válida encontrada");
      return;
    }

    let addedCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    urls.forEach(url => {
      if (!validateYouTubeUrl(url)) {
        invalidCount++;
        return;
      }

      const videoId = extractVideoId(url);
      if (!videoId) {
        invalidCount++;
        return;
      }

      // Check if URL already exists
      const urlExists = state.urls.some(existingUrl => extractVideoId(existingUrl) === videoId);
      if (urlExists) {
        duplicateCount++;
        return;
      }

      addUrl(url);
      addedCount++;
    });

    let message = `${addedCount} URL(s) adicionada(s)`;
    if (invalidCount > 0) message += `, ${invalidCount} inválida(s)`;
    if (duplicateCount > 0) message += `, ${duplicateCount} duplicada(s)`;

    if (addedCount > 0) {
      toast.success(message);
    } else {
      toast.error(message);
    }

    setBulkUrls("");
    setShowBulkInput(false);
  };

  // Remove URL
  const handleRemoveUrl = (index: number) => {
    removeUrl(index);
    toast.success("URL removida");
  };

  // Clear all URLs
  const handleClearUrls = () => {
    clearUrls();
    toast.success("Todas as URLs foram removidas");
  };

  // Update target person
  const handleTargetPersonChange = (value: string) => {
    setTargetPerson(value);
    updateSettings({ targetPerson: value });
  };

  // Start processing
  const handleStartProcessing = async () => {
    if (state.urls.length === 0) {
      toast.error("Adicione pelo menos uma URL para processar");
      return;
    }

    const options = {
      only_excel: false,
      playlist_mode: state.settings.playlistMode,
      ignore_existing: state.settings.ignoreExisting,
      use_whisper: state.settings.useWhisper,
      ai_analysis: state.settings.aiAnalysis,
      target_person: targetPerson || state.settings.targetPerson,
      with_explanation: state.settings.withExplanation
    };

    try {
      await startTranscription(state.urls, options);
      toast.success("Processamento iniciado com sucesso!");
    } catch (error) {
      toast.error("Erro ao iniciar processamento");
    }
  };

  // Quick action buttons
  const handleOnlyExcel = async () => {
    const options = {
      only_excel: true,
      playlist_mode: false,
      ignore_existing: false,
      use_whisper: state.settings.useWhisper,
      ai_analysis: false,
      target_person: targetPerson || state.settings.targetPerson
    };

    try {
      await startTranscription([], options);
      toast.success("Geração de Excel iniciada!");
    } catch (error) {
      toast.error("Erro ao gerar Excel");
    }
  };

  const handleOnlyAiAnalysis = async () => {
    const options = {
      only_excel: false,
      playlist_mode: false,
      ignore_existing: false,
      use_whisper: false,
      ai_analysis: true,
      target_person: targetPerson || state.settings.targetPerson,
      with_explanation: state.settings.withExplanation
    };

    try {
      await startTranscription([], options);
      toast.success("Análise IA iniciada!");
    } catch (error) {
      toast.error("Erro ao iniciar análise IA");
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Gerenciar URLs do YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single URL Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Cole aqui a URL do YouTube..."
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              />
            </div>
            <Button onClick={handleAddUrl} disabled={isProcessing}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {/* Bulk Input Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="bulk-mode"
              checked={showBulkInput}
              onCheckedChange={setShowBulkInput}
            />
            <Label htmlFor="bulk-mode">Adicionar múltiplas URLs</Label>
          </div>

          {/* Bulk Input */}
          {showBulkInput && (
            <div className="space-y-2">
              <Label htmlFor="bulk-urls">URLs em lote (uma por linha)</Label>
              <Textarea
                id="bulk-urls"
                placeholder="https://www.youtube.com/watch?v=abc123&#10;https://www.youtube.com/watch?v=def456&#10;// Comentários iniciados com // são ignorados"
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddBulkUrls} disabled={isProcessing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Lote
                </Button>
                <Button variant="outline" onClick={() => {
                  setBulkUrls("");
                  setShowBulkInput(false);
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* URLs List */}
          {state.urls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>URLs Adicionadas ({state.urls.length})</Label>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleClearUrls}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Todas
                </Button>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2">
                {state.urls.map((url, index) => {
                  const videoId = extractVideoId(url);
                  const isValid = videoId !== null;
                  
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      {isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{url}</p>
                        {videoId && (
                          <p className="text-xs text-muted-foreground">ID: {videoId}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUrl(index)}
                        disabled={isProcessing}
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

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Target Person */}
          <div className="space-y-2">
            <Label htmlFor="target-person">Pessoa Alvo para Análise IA</Label>
            <Input
              id="target-person"
              placeholder="Nome da pessoa para análise (ex: João Silva)"
              value={targetPerson}
              onChange={(e) => handleTargetPersonChange(e.target.value)}
            />
          </div>

          {/* Quick Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="playlist-mode">Modo Playlist</Label>
              <Switch
                id="playlist-mode"
                checked={state.settings.playlistMode}
                onCheckedChange={(checked) =>
                  updateSettings({ playlistMode: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ignore-existing">Ignorar Existentes</Label>
              <Switch
                id="ignore-existing"
                checked={state.settings.ignoreExisting}
                onCheckedChange={(checked) =>
                  updateSettings({ ignoreExisting: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-analysis">Análise IA</Label>
              <Switch
                id="ai-analysis"
                checked={state.settings.aiAnalysis}
                onCheckedChange={(checked) =>
                  updateSettings({ aiAnalysis: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="use-whisper">Usar Whisper Original</Label>
              <Switch
                id="use-whisper"
                checked={state.settings.useWhisper}
                onCheckedChange={(checked) =>
                  updateSettings({ useWhisper: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Ações de Processamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Full Processing */}
            <Button 
              className="h-16 flex flex-col gap-1"
              onClick={handleStartProcessing}
              disabled={isProcessing || state.urls.length === 0}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              <span className="text-sm">Processar Completo</span>
              <span className="text-xs opacity-70">Download + Transcrição + Excel</span>
            </Button>

            {/* Only Excel */}
            <Button 
              variant="outline"
              className="h-16 flex flex-col gap-1"
              onClick={handleOnlyExcel}
              disabled={isProcessing}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">Apenas Excel</span>
              <span className="text-xs opacity-70">De transcrições existentes</span>
            </Button>

            {/* Only AI Analysis */}
            <Button 
              variant="outline"
              className="h-16 flex flex-col gap-1"
              onClick={handleOnlyAiAnalysis}
              disabled={isProcessing}
            >
              <Brain className="h-5 w-5" />
              <span className="text-sm">Apenas Análise IA</span>
              <span className="text-xs opacity-70">De arquivos Excel existentes</span>
            </Button>
          </div>

          {/* Processing Status Info */}
          {isProcessing && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">
                  Processamento em andamento... Verifique a aba "Resultados" para acompanhar o progresso.
                </span>
              </div>
            </div>
          )}

          {/* Quick Help */}
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Dicas:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>URLs aceitas: youtube.com/watch?v=, youtu.be/, ou IDs diretos</li>
              <li>Use "Modo Playlist" para processar listas completas</li>
              <li>"Ignorar Existentes" pula vídeos já processados</li>
              <li>Configure a "Pessoa Alvo" para análises IA mais precisas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VideoManager;