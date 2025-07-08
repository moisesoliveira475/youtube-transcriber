import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsViewer } from "./ResultsViewer";
import { AdvancedSettings } from "./AdvancedSettings";
import { 
  Play, 
  FileText,
  Settings,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoManager } from "./VideoManager";

export function MainTabs() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="process" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="process" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Processar
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Sobre
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="process">
          <VideoManager />
        </TabsContent>
        
        <TabsContent value="results">
          <ResultsViewer />
        </TabsContent>
        
        <TabsContent value="settings">
          <AdvancedSettings />
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Transcriber</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Aplicação Python para automatizar o download e transcrição de vídeos do YouTube, 
                com divisão das transcrições em blocos gerenciáveis e exportação para Excel com timestamps.
              </p>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Funcionalidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Download de áudio do YouTube</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Transcrição com Whisper/Faster-Whisper</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Divisão em blocos semânticos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Exportação para Excel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Análise IA com Vertex AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Classificação jurídica (calúnia, injúria, difamação)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Tecnologias</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Python</Badge>
                  <Badge>OpenAI Whisper</Badge>
                  <Badge>Faster-Whisper</Badge>
                  <Badge>Google Vertex AI</Badge>
                  <Badge>yt-dlp</Badge>
                  <Badge>React</Badge>
                  <Badge>TypeScript</Badge>
                  <Badge>Tailwind CSS</Badge>
                  <Badge>shadcn/ui</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
