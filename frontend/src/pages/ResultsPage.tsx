import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsViewer } from "@/components/ResultsViewer";
import { StatsOverview } from "@/components/StatsOverview";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function ResultsPage() {
  const { state, dispatch } = useApp();
  
  const handleRefresh = () => {
    dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resultados</h1>
        <div className="flex items-center gap-4">
          {state.lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Última atualização: {state.lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Estatísticas principais */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {state.excelFiles.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Arquivos Excel
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {state.audioFiles.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Áudios Processados
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {state.transcriptFiles.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Transcrições
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Jobs recentes */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Jobs Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {state.jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum job executado ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {state.jobs.slice(-5).reverse().map((job) => (
                    <div key={job.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{job.type}</span>
                      <Badge 
                        variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'failed' ? 'destructive' :
                          job.status === 'running' ? 'secondary' : 'outline'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Área principal de resultados */}
        <div className="lg:col-span-3">
          <ResultsViewer />
          
          {/* Estatísticas detalhadas */}
          <div className="mt-6">
            <StatsOverview />
          </div>
        </div>
      </div>
    </div>
  );
}
