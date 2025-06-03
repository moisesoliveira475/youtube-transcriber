import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedSettings } from "@/components/AdvancedSettings";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw, Download, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const { state, updateSettings } = useApp();
  
  const handleReset = () => {
    updateSettings({
      useWhisper: false,
      playlistMode: false,
      ignoreExisting: false,
      aiAnalysis: false,
      targetPerson: '',
      withExplanation: false,
      cpuOnly: false,
    });
  };
  
  const handleExportSettings = () => {
    const settings = JSON.stringify(state.settings, null, 2);
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-transcriber-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            updateSettings(settings);
          } catch (error) {
            console.error('Erro ao importar configurações:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImportSettings}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações principais */}
        <div className="lg:col-span-2">
          <AdvancedSettings />
        </div>
        
        {/* Resumo das configurações */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo das Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Modelo de Transcrição</h4>
                  <Badge variant={state.settings.useWhisper ? "secondary" : "default"}>
                    {state.settings.useWhisper ? 'OpenAI Whisper' : 'Faster-Whisper'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Processamento</h4>
                  <div className="space-y-1">
                    <Badge variant={state.settings.cpuOnly ? "destructive" : "default"}>
                      {state.settings.cpuOnly ? 'CPU Apenas' : 'GPU/CPU'}
                    </Badge>
                    {state.settings.playlistMode && (
                      <Badge variant="outline">Modo Playlist</Badge>
                    )}
                    {state.settings.ignoreExisting && (
                      <Badge variant="outline">Ignorar Existentes</Badge>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Análise IA</h4>
                  {state.settings.aiAnalysis ? (
                    <div className="space-y-1">
                      <Badge variant="default">Habilitada</Badge>
                      {state.settings.targetPerson && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Pessoa Alvo:</span>
                          <br />
                          <span className="font-medium">{state.settings.targetPerson}</span>
                        </div>
                      )}
                      {state.settings.withExplanation && (
                        <Badge variant="outline">Com Explicações</Badge>
                      )}
                    </div>
                  ) : (
                    <Badge variant="secondary">Desabilitada</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Informações do sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status da API:</span>
                <Badge variant="default">Conectada</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última Sincronização:</span>
                <span>
                  {state.lastRefresh ? 
                    state.lastRefresh.toLocaleTimeString() : 
                    'Nunca'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jobs Ativos:</span>
                <span>{state.jobs.filter(j => j.status === 'running').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Jobs:</span>
                <span>{state.jobs.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
