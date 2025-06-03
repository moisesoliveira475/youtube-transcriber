import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFiles } from "@/lib/hooks";
import type { FileInfo } from "@/lib/api";
import { 
  FileText, 
  Clock, 
  BarChart3,
  HardDrive
} from "lucide-react";

interface AppStats {
  totalVideos: number;
  totalTranscriptions: number;
  totalAiAnalyses: number;
  totalProcessingTime: string;
  averageVideoLength: string;
  storageUsed: string;
  lastProcessed: string;
}

export function StatsOverview() {
  const { excelFiles, transcriptFiles, isLoading } = useFiles();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Calculate stats from real data with fallback to mock values
  const calculateStats = (): AppStats => {
    if (isLoading || !excelFiles) {
      // Return mock data while loading
      return {
        totalVideos: 25,
        totalTranscriptions: 23,
        totalAiAnalyses: 8,
        totalProcessingTime: "4h 23m",
        averageVideoLength: "12m 45s",
        storageUsed: "1.2 GB",
        lastProcessed: "2025-05-28 13:02"
      };
    }

    const totalTranscriptions = excelFiles.length;
    const totalAiAnalyses = excelFiles.filter((file) => 
      file.is_ai_analysis || file.filename.includes('_ai_analysis')
    ).length;
    
    // Calculate storage used (convert bytes to readable format)
    const totalBytes = excelFiles.reduce((sum: number, file: FileInfo) => sum + file.size, 0) +
                      (transcriptFiles?.reduce ? transcriptFiles.reduce((sum: number, file: FileInfo) => sum + file.size, 0) : 0);
    const storageUsed = formatBytes(totalBytes);

    // Get last processed date
    const lastModified = Math.max(
      ...excelFiles.map((file: FileInfo) => file.modified),
      ...(transcriptFiles?.map ? transcriptFiles.map((file: FileInfo) => file.modified) : [])
    );
    const lastProcessed = new Date(lastModified * 1000).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      totalVideos: totalTranscriptions, // Assuming 1 video per transcription
      totalTranscriptions,
      totalAiAnalyses,
      totalProcessingTime: "~" + Math.round(totalTranscriptions * 2) + "m", // Estimate
      averageVideoLength: "~10m", // Default estimate
      storageUsed,
      lastProcessed
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVideos}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalTranscriptions} transcritos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Análises IA</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAiAnalyses}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalTranscriptions > 0 ? Math.round((stats.totalAiAnalyses / stats.totalTranscriptions) * 100) : 0}% dos transcritos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Processamento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProcessingTime}</div>
          <p className="text-xs text-muted-foreground">
            Média: {stats.averageVideoLength} por vídeo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.storageUsed}</div>
          <p className="text-xs text-muted-foreground">
            Últimos arquivos: {stats.lastProcessed}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
