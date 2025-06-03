import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Loader2
} from "lucide-react";

interface ProcessingStep {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed" | "error";
  progress?: number;
  message?: string;
}

interface ProcessingStatusProps {
  isProcessing: boolean;
  currentVideoId?: string;
  videoTitle?: string;
  steps: ProcessingStep[];
  logs: string[];
}

export function ProcessingStatus({
  isProcessing,
  currentVideoId,
  videoTitle,
  steps,
  logs
}: ProcessingStatusProps) {
  const getStepIcon = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepBadge = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case "in-progress":
        return <Badge variant="secondary">Em andamento</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  const overallProgress = steps.length > 0 
    ? (steps.filter(s => s.status === "completed").length / steps.length) * 100 
    : 0;

  if (!isProcessing) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processando {currentVideoId && `- ${currentVideoId}`}
          </CardTitle>
          {videoTitle && (
            <p className="text-sm text-muted-foreground">{videoTitle}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>

          {/* Etapas do Processo */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{step.name}</span>
                    {getStepBadge(step.status)}
                  </div>
                  {step.message && (
                    <p className="text-sm text-muted-foreground mt-1">{step.message}</p>
                  )}
                  {step.progress !== undefined && step.status === "in-progress" && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="w-full h-2" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">Aguardando logs...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dados de exemplo para as etapas
export const getDefaultSteps = (): ProcessingStep[] => [
  {
    id: "download",
    name: "Download do Áudio",
    status: "pending",
    message: "Extraindo áudio do YouTube..."
  },
  {
    id: "transcription",
    name: "Transcrição",
    status: "pending", 
    message: "Processando com Whisper..."
  },
  {
    id: "split",
    name: "Divisão em Blocos",
    status: "pending",
    message: "Organizando texto em seções..."
  },
  {
    id: "excel",
    name: "Exportação Excel",
    status: "pending",
    message: "Gerando planilha..."
  },
  {
    id: "ai-analysis",
    name: "Análise IA (Opcional)",
    status: "pending",
    message: "Classificando conteúdo jurídico..."
  }
];
