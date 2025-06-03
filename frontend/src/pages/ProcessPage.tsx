import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoManager from "@/components/VideoManager";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { useApp } from "@/context/AppContext";

export function ProcessPage() {
  const { state } = useApp();
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Processar Vídeos</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área principal de processamento */}
        <div className="lg:col-span-2">
          <VideoManager />
        </div>
        
        {/* Status do processamento */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Status do Processamento</CardTitle>
            </CardHeader>
            <CardContent>
              {state.activeJob ? (
                <ProcessingStatus 
                  isProcessing={Boolean(state.activeJob)}
                  steps={state.activeJob.steps || []}
                  logs={state.activeJob.logs || []}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Nenhum processamento ativo</p>
                  <p className="text-sm mt-2">
                    Adicione URLs e inicie o processamento
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Resumo das configurações atuais */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Configurações Atuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Modelo:</span>
                <span className="font-medium">
                  {state.settings.useWhisper ? 'OpenAI Whisper' : 'Faster-Whisper'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Modo Playlist:</span>
                <span className="font-medium">
                  {state.settings.playlistMode ? 'Habilitado' : 'Desabilitado'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Análise IA:</span>
                <span className="font-medium">
                  {state.settings.aiAnalysis ? 'Habilitada' : 'Desabilitada'}
                </span>
              </div>
              {state.settings.aiAnalysis && state.settings.targetPerson && (
                <div className="flex justify-between text-sm">
                  <span>Pessoa Alvo:</span>
                  <span className="font-medium text-primary">
                    {state.settings.targetPerson}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Processamento:</span>
                <span className="font-medium">
                  {state.settings.cpuOnly ? 'CPU Apenas' : 'GPU/CPU'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
