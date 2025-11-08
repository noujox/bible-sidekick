import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { DB_SIZE_MB } from "@/config/db-version";

interface DbLoadingScreenProps {
  progress: number;
  fromCache: boolean;
}

export function DbLoadingScreen({ progress, fromCache }: DbLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6">
        <div className="text-center space-y-6">
          {/* Icono animado */}
          <div className="flex justify-center">
            <div className="relative">
              <BookOpen className="h-20 w-20 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {fromCache ? "Cargando Biblia..." : "Descargando Biblia..."}
            </h1>
            <p className="text-sm text-muted-foreground">
              {fromCache
                ? "Cargando desde caché local"
                : `Descargando base de datos (${DB_SIZE_MB} MB)`}
            </p>
          </div>

          {/* Barra de progreso */}
          {!fromCache && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
          )}

          {/* Mensaje informativo */}
          <p className="text-xs text-muted-foreground">
            {fromCache
              ? "Esto solo tomará unos segundos..."
              : "Esto solo ocurre la primera vez. La próxima será instantáneo."}
          </p>
        </div>
      </div>
    </div>
  );
}
