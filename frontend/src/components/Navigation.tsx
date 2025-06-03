import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  FileText,
  Settings,
  Info,
  Activity
} from "lucide-react";

export function Navigation() {
  const { state, navigateTo } = useApp();
  
  const navItems = [
    {
      id: 'process' as const,
      label: 'Processar',
      icon: Play,
      description: 'Adicionar URLs e iniciar transcrições',
      badge: state.isProcessing ? 'Ativo' : null,
      badgeVariant: 'default' as const
    },
    {
      id: 'results' as const,
      label: 'Resultados',
      icon: FileText,
      description: 'Visualizar e baixar arquivos processados',
      badge: state.excelFiles.length > 0 ? state.excelFiles.length.toString() : null,
      badgeVariant: 'secondary' as const
    },
    {
      id: 'settings' as const,
      label: 'Configurações',
      icon: Settings,
      description: 'Configurar modelos e parâmetros',
      badge: null,
      badgeVariant: 'outline' as const
    },
    {
      id: 'about' as const,
      label: 'Sobre',
      icon: Info,
      description: 'Informações sobre a aplicação',
      badge: null,
      badgeVariant: 'outline' as const
    }
  ];
  
  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 h-auto flex-col sm:flex-row text-left",
                  isActive && "bg-primary text-primary-foreground"
                )}
                onClick={() => navigateTo(item.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant}
                      className={cn(
                        "ml-1",
                        isActive && "bg-primary-foreground text-primary"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="hidden sm:block text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </span>
              </Button>
            );
          })}
          
          {/* Indicador de status global */}
          <div className="ml-auto flex items-center gap-2">
            {state.activeJob && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 animate-pulse" />
                <span>Processando...</span>
                <Badge variant="outline">
                  {Math.round(state.activeJob.progress)}%
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
