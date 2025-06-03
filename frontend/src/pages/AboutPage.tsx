import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, FileText, Cpu, Zap, Brain } from "lucide-react";

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">YouTube Transcriber</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Aplicação Python para automatizar o download e transcrição de vídeos do YouTube, 
          com divisão das transcrições em blocos gerenciáveis e exportação para Excel com timestamps.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Funcionalidades principais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
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
                <span className="text-sm">Interface web moderna</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Processamento em lote</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* IA e Análise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Análise com Vertex AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Classificação jurídica</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Detecção de calúnia</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Detecção de injúria</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Detecção de difamação</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Análise contextual</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Aceleração GPU</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Faster-Whisper otimizado</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Processamento paralelo</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Jobs em background</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Monitoramento de memória</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span className="text-sm">Cache inteligente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tecnologias */}
      <Card>
        <CardHeader>
          <CardTitle>Tecnologias Utilizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Backend</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Python 3.8+</Badge>
                <Badge>OpenAI Whisper</Badge>
                <Badge>Faster-Whisper</Badge>
                <Badge>Google Vertex AI</Badge>
                <Badge>yt-dlp</Badge>
                <Badge>Flask</Badge>
                <Badge>pandas</Badge>
                <Badge>openpyxl</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>React 19</Badge>
                <Badge>TypeScript</Badge>
                <Badge>Vite</Badge>
                <Badge>Tailwind CSS</Badge>
                <Badge>shadcn/ui</Badge>
                <Badge>Biome</Badge>
                <Badge>Lucide Icons</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Infraestrutura</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>CUDA (GPU)</Badge>
                <Badge>Docker</Badge>
                <Badge>REST API</Badge>
                <Badge>CORS</Badge>
                <Badge>WebSockets</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Links úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Github className="h-4 w-4 mr-2" />
              Repositório no GitHub
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Documentação da API
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Guia de Instalação
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
            
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Troubleshooting
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Informações de versão */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Versão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Versão:</span>
              <br />
              <span className="font-medium">1.0.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">Última Atualização:</span>
              <br />
              <span className="font-medium">29 de Maio, 2025</span>
            </div>
            <div>
              <span className="text-muted-foreground">Licença:</span>
              <br />
              <span className="font-medium">MIT</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
