import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { 
  Settings, 
  Cpu, 
  Brain, 
  FileText, 
  Zap,
  Save,
  RotateCcw
} from "lucide-react";

export function AdvancedSettings() {
  const { state, updateSettings } = useApp();

  const handleSave = () => {
    // Configurações são salvas automaticamente no contexto
    toast.success("Configurações salvas com sucesso!");
  };

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
    toast.success("Configurações resetadas para padrão");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Avançadas
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            
            {/* Configurações de Transcrição */}
            <AccordionItem value="transcription">
              <AccordionTrigger className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Configurações de Transcrição
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whisper-model">Modelo de Transcrição</Label>
                    <Select 
                      value={state.settings.useWhisper ? "original" : "faster-whisper"}
                      onValueChange={(value) => updateSettings({ useWhisper: value === "original" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faster-whisper">Faster-Whisper (Recomendado)</SelectItem>
                        <SelectItem value="original">OpenAI Whisper Original</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Faster-Whisper oferece melhor performance e menor uso de memória
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpu-only">Forçar CPU</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="cpu-only"
                        checked={state.settings.cpuOnly}
                        onCheckedChange={(checked) => updateSettings({ cpuOnly: checked })}
                      />
                      <span className="text-sm">
                        {state.settings.cpuOnly ? 'Usar apenas CPU' : 'GPU disponível se detectada'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Desative para usar GPU quando disponível (mais rápido)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playlist-mode">Modo Playlist</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="playlist-mode"
                        checked={state.settings.playlistMode}
                        onCheckedChange={(checked) => updateSettings({ playlistMode: checked })}
                      />
                      <span className="text-sm">
                        {state.settings.playlistMode ? 'Processar playlists completas' : 'Apenas vídeos individuais'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ignore-existing">Ignorar Existentes</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ignore-existing"
                        checked={state.settings.ignoreExisting}
                        onCheckedChange={(checked) => updateSettings({ ignoreExisting: checked })}
                      />
                      <span className="text-sm">
                        {state.settings.ignoreExisting ? 'Pular vídeos já processados' : 'Reprocessar todos'}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Configurações de IA */}
            <AccordionItem value="ai-analysis">
              <AccordionTrigger className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Análise de Inteligência Artificial
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ai-analysis"
                      checked={state.settings.aiAnalysis}
                      onCheckedChange={(checked) => updateSettings({ aiAnalysis: checked })}
                    />
                    <Label htmlFor="ai-analysis">Habilitar Análise IA</Label>
                  </div>
                  
                  {state.settings.aiAnalysis && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                      <div className="space-y-2">
                        <Label htmlFor="target-person">Pessoa Alvo para Análise Jurídica</Label>
                        <Input
                          id="target-person"
                          placeholder="Ex: João Silva, Maria Santos..."
                          value={state.settings.targetPerson}
                          onChange={(e) => updateSettings({ targetPerson: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Especifique uma pessoa para análise focada em calúnia, injúria e difamação.
                          Deixe em branco para análise geral.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="with-explanation"
                            checked={state.settings.withExplanation}
                            onCheckedChange={(checked) => updateSettings({ withExplanation: checked })}
                          />
                          <Label htmlFor="with-explanation">Incluir Explicações Detalhadas</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gera explicações detalhadas para cada classificação (consome mais tokens da API)
                        </p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-amber-800">Informações sobre a Análise IA</p>
                            <ul className="text-amber-700 mt-1 space-y-1 text-xs">
                              <li>• Utiliza Google Vertex AI para análise de conteúdo</li>
                              <li>• Classifica automaticamente calúnia, injúria e difamação</li>
                              <li>• Gera resumos automáticos dos vídeos</li>
                              <li>• Pode ser executada separadamente após a transcrição</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Configurações de Performance */}
            <AccordionItem value="performance">
              <AccordionTrigger className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Performance e Sistema
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status do Sistema</Label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jobs Ativos:</span>
                        <span>{state.jobs.filter(j => j.status === 'running').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total de Jobs:</span>
                        <span>{state.jobs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">URLs Carregadas:</span>
                        <span>{state.urls.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cache e Arquivos</Label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arquivos Excel:</span>
                        <span>{state.excelFiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arquivos de Áudio:</span>
                        <span>{state.audioFiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transcrições:</span>
                        <span>{state.transcriptFiles.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Cpu className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">Dicas de Performance</p>
                      <ul className="text-blue-700 mt-1 space-y-1 text-xs">
                        <li>• Use Faster-Whisper para melhor performance</li>
                        <li>• Habilite GPU se disponível para transcrição mais rápida</li>
                        <li>• Processe vídeos em lotes para eficiência</li>
                        <li>• Use "Ignorar Existentes" para evitar reprocessamento</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
