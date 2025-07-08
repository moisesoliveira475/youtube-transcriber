import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsOverview } from "./StatsOverview";
import { TranscriptionModal } from "./TranscriptionModal";
import { useFiles } from "@/lib/hooks";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  File,
  Brain,
  Loader2
} from "lucide-react";
import { useJobStatus } from "@/hooks/useJobStatus";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface TranscriptionFile {
  id: string;
  title: string;
  date: string;
  duration?: string;
  status: "completed" | "processing" | "error";
  hasAiAnalysis: boolean;
  filePath: string;
  filename: string;
  size: number;
  modified: number;
}

export function ResultsViewer() {
  const { state, dispatch } = useApp();
  const [selectedTranscription, setSelectedTranscription] = useState<TranscriptionFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use API hooks
  const {
    excelFiles,
    transcriptFiles,
    isLoading,
    error,
    downloadExcel
  } = useFiles();

  // Suporte a status de job em andamento
  const jobId = state.jobs?.[0]?.id || null; // Pega o primeiro job ativo
  const { jobStatus } = useJobStatus(jobId);

  // Update context with file data
  useEffect(() => {
    if (excelFiles) {
      dispatch({ type: 'SET_EXCEL_FILES', payload: excelFiles });
    }
  }, [excelFiles, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Convert API files to display format
  const convertToTranscriptionFiles = (): TranscriptionFile[] => {
    if (!excelFiles || excelFiles.length === 0) {
      return []; // Retorna array vazio se não há dados da API
    }
    
    // Create a map of available video IDs from transcript files
    const availableVideoIds = transcriptFiles?.map(file => 
      file.video_id || file.filename.replace('.txt', '').replace('.json', '')
    ) || [];
    
    return excelFiles.map((file, index) => {
      const isAiAnalysis = file.is_ai_analysis || file.filename.includes('_ai_analysis');
      const dateMatch = file.filename.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
      
      // Use the corresponding video ID from available transcripts
      // This is a simple mapping - in a real scenario, we'd parse Excel content to find video IDs
      const videoId = availableVideoIds[index % availableVideoIds.length] || 
        file.filename.replace('.xlsx', '').replace('_ai_analysis', '');
      
      return {
        id: videoId, // Use video ID that actually has transcription
        title: `${file.filename.replace('.xlsx', '').replace('_ai_analysis', '')} (${videoId})`,
        date: dateMatch?.[1]?.split('_')[0] || new Date(file.modified * 1000).toISOString().split('T')[0],
        status: "completed" as const,
        hasAiAnalysis: isAiAnalysis,
        filePath: file.path || `/excel_output/${file.filename}`,
        filename: file.filename,
        size: file.size,
        modified: file.modified
      };
    });
  };

  const files = convertToTranscriptionFiles();

  const handleDownload = async (file: TranscriptionFile) => {
    try {
      await downloadExcel(file.filename);
      toast.success(`Download de ${file.filename} iniciado`);
    } catch (error) {
      toast.error("Erro ao fazer download do arquivo");
    }
  };

  const openTranscriptionModal = (file: TranscriptionFile) => {
    setSelectedTranscription(file);
    setIsModalOpen(true);
  };
  const getStatusIcon = (status: TranscriptionFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: TranscriptionFile["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case "processing":
        return <Badge variant="secondary">Processando</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {jobStatus && jobStatus.status === "processing" && (
        <Alert className="mb-4 flex items-center gap-4 border-blue-200 bg-blue-50">
          <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
          <div>
            <div className="font-medium">Processando...</div>
            <div className="text-sm text-muted-foreground">
              {jobStatus.current_step || "Aguarde, sua transcrição ou análise está em andamento."}
            </div>
            {typeof jobStatus.progress === "number" && (
              <Progress value={jobStatus.progress} className="mt-2" />
            )}
          </div>
        </Alert>
      )}
      
      <StatsOverview />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Resultados e Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transcriptions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transcriptions">Transcrições</TabsTrigger>
              <TabsTrigger value="analysis">Análises IA</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcriptions" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-2 animate-spin" />
                  <p>Carregando arquivos...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map((file) => (
                    <Card key={file.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(file.status)}
                              <h3 className="font-medium">{file.title}</h3>
                              {getStatusBadge(file.status)}
                              {file.hasAiAnalysis && (
                                <Badge variant="outline" className="text-purple-600">
                                  <Brain className="h-3 w-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {file.date}
                              </div>
                              {file.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {file.duration}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                ID: {file.id}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            {file.status === "completed" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openTranscriptionModal(file)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver Transcrição
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar Excel
                                </Button>
                                {file.hasAiAnalysis && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openTranscriptionModal(file)}
                                  >
                                    <Brain className="h-4 w-4 mr-2" />
                                    Ver Análise
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {files.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma transcrição encontrada</p>
                      <p className="text-sm">Execute o processamento para ver os resultados aqui</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-2 animate-spin" />
                  <p>Carregando análises...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files
                    .filter(file => file.hasAiAnalysis)
                    .map((file) => (
                      <Card key={file.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{file.title}</h3>
                              <Badge variant="outline" className="text-purple-600">
                                <Brain className="h-3 w-3 mr-1" />
                                Análise IA Completa
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">--</div>
                                <div className="text-muted-foreground">Calúnia</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">--</div>
                                <div className="text-muted-foreground">Injúria</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">--</div>
                                <div className="text-muted-foreground">Difamação</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openTranscriptionModal(file)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Ver Resumo
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar Relatório
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {files.filter(file => file.hasAiAnalysis).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma análise de IA encontrada</p>
                      <p className="text-sm">Execute o processamento com análise IA para ver os resultados aqui</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TranscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transcription={selectedTranscription ? {
          id: selectedTranscription.id,
          title: selectedTranscription.title,
          date: selectedTranscription.date,
          duration: selectedTranscription.duration || "00:00",
          status: selectedTranscription.status,
          hasAiAnalysis: selectedTranscription.hasAiAnalysis,
          transcript: ""
        } : null}
      />
    </div>
  );
}
