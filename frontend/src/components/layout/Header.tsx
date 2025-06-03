import { FileText, Youtube } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Youtube className="h-8 w-8 text-red-600" />
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              YouTube Transcriber
            </h1>
            <p className="text-sm text-muted-foreground">
              Transcreva e analise vídeos do YouTube com IA
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
