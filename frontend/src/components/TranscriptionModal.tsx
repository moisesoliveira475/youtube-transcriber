import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Brain, 
  Download,
  Play,
  Loader2
} from "lucide-react";

interface TranscriptionDetails {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: "completed" | "processing" | "error";
  hasAiAnalysis: boolean;
  transcript: string;
  aiAnalysis?: {
    summary: string;
    calumny: number;
    injury: number;
    defamation: number;
    details: Array<{
      type: "calumny" | "injury" | "defamation";
      text: string;
      timestamp: string;
      confidence: number;
    }>;
  };
}

interface TranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcription: TranscriptionDetails | null;
}

export function TranscriptionModal({ isOpen, onClose, transcription }: TranscriptionModalProps) {
  const [transcriptContent, setTranscriptContent] = useState<string>("");
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Load transcript content when modal opens
  useEffect(() => {
    const loadTranscript = async () => {
      if (!isOpen || !transcription?.id) return;
      
      setIsLoadingTranscript(true);
      try {
        const response = await apiService.getTranscriptContent(transcription.id);
        if (response.success && response.content) {
          setTranscriptContent(response.content);
        } else {
          setTranscriptContent("Transcrição não encontrada ou ainda não processada.");
          if (response.error) {
            toast.error(response.error);
          }
        }
      } catch (error) {
        toast.error("Erro ao carregar transcrição");
        setTranscriptContent("Erro ao carregar a transcrição.");
      } finally {
        setIsLoadingTranscript(false);
      }
    };

    loadTranscript();
  }, [isOpen, transcription?.id]);

  // Reset content when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTranscriptContent("");
    }
  }, [isOpen]);

  // Download handlers
  const handleDownloadTranscript = async () => {
    if (!transcription?.id) return;
    
    setIsDownloading('transcript');
    try {
      const blob = await apiService.downloadTranscriptFile(`${transcription.id}.txt`, 'words');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${transcription.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Transcrição baixada com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar transcrição");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadExcel = async () => {
    if (!transcription?.id) return;
    
    setIsDownloading('excel');
    try {
      // Find the Excel file that matches this video ID
      const filesResponse = await apiService.listExcelFiles();
      if (filesResponse.success) {
        // Look for Excel file containing this video ID (rough matching)
        const excelFile = filesResponse.files.find((f: any) => 
          f.filename.includes('transcricoes') && !f.is_ai_analysis
        );
        
        if (excelFile) {
          const blob = await apiService.downloadExcelFile(excelFile.filename);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = excelFile.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Planilha Excel baixada com sucesso!");
        } else {
          toast.error("Arquivo Excel não encontrado");
        }
      }
    } catch (error) {
      toast.error("Erro ao baixar planilha Excel");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadAiAnalysis = async () => {
    if (!transcription?.id) return;
    
    setIsDownloading('ai');
    try {
      // Find the AI analysis Excel file
      const filesResponse = await apiService.listExcelFiles();
      if (filesResponse.success) {
        const aiFile = filesResponse.files.find((f: any) => 
          f.filename.includes('transcricoes') && f.is_ai_analysis
        );
        
        if (aiFile) {
          const blob = await apiService.downloadExcelFile(aiFile.filename);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = aiFile.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Relatório de Análise IA baixado com sucesso!");
        } else {
          toast.error("Arquivo de análise IA não encontrado");
        }
      }
    } catch (error) {
      toast.error("Erro ao baixar relatório de análise IA");
    } finally {
      setIsDownloading(null);
    }
  };
  if (!transcription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {transcription.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {transcription.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {transcription.duration}
            </div>
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              ID: {transcription.id}
            </div>
            {transcription.hasAiAnalysis && (
              <Badge variant="outline" className="text-purple-600">
                <Brain className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="transcript" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript">Transcrição</TabsTrigger>
              <TabsTrigger value="analysis" disabled={!transcription.hasAiAnalysis}>
                Análise IA
              </TabsTrigger>
              <TabsTrigger value="actions">Ações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript" className="flex-1 overflow-auto">
              <Card>
                <CardContent className="pt-4">
                  {isLoadingTranscript ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando transcrição...</span>
                    </div>
                  ) : (
                    <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      {transcriptContent || "Nenhuma transcrição disponível."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="flex-1 overflow-auto">
              {transcription.hasAiAnalysis && transcription.aiAnalysis ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{transcription.aiAnalysis.summary}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Classificação Jurídica</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{transcription.aiAnalysis.calumny}</div>
                          <div className="text-sm text-muted-foreground">Calúnia</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{transcription.aiAnalysis.injury}</div>
                          <div className="text-sm text-muted-foreground">Injúria</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{transcription.aiAnalysis.defamation}</div>
                          <div className="text-sm text-muted-foreground">Difamação</div>
                        </div>
                      </div>

                      {transcription.aiAnalysis.details.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Ocorrências Detectadas:</h4>
                          {transcription.aiAnalysis.details.map((detail: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={
                                  detail.type === "calumny" ? "destructive" :
                                  detail.type === "injury" ? "default" : "secondary"
                                }>
                                  {detail.type === "calumny" ? "Calúnia" :
                                   detail.type === "injury" ? "Injúria" : "Difamação"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{detail.timestamp}</span>
                                <span className="text-sm text-muted-foreground">
                                  Confiança: {Math.round(detail.confidence * 100)}%
                                </span>
                              </div>
                              <p className="text-sm italic">"{detail.text}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Análise IA não disponível</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="actions" className="flex-1">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Downloads</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleDownloadTranscript}
                      disabled={isDownloading === 'transcript'}
                    >
                      {isDownloading === 'transcript' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Baixar Transcrição (TXT)
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={handleDownloadExcel}
                      disabled={isDownloading === 'excel'}
                    >
                      {isDownloading === 'excel' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Baixar Planilha Excel
                    </Button>
                    {transcription.hasAiAnalysis && (
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={handleDownloadAiAnalysis}
                        disabled={isDownloading === 'ai'}
                      >
                        {isDownloading === 'ai' ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Baixar Relatório de Análise IA
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reprocessar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Brain className="h-4 w-4 mr-2" />
                      Executar Análise IA
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Retranscrever
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
