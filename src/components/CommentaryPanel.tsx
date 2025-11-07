import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useBibleCommentary } from "@/hooks/use-bible-data";

interface CommentaryPanelProps {
  book: string;
  chapter: string;
  fontSize?: string;
  fontFamily?: string;
}

const COMMENTARIES = [
  { value: "diario_vivir", label: "Diario Vivir" },
];

export function CommentaryPanel({ book, chapter, fontSize = "medium", fontFamily = "serif" }: CommentaryPanelProps) {
  const [commentaryType, setCommentaryType] = useState("diario_vivir");
  const chapterNum = parseInt(chapter, 10);
  const { data: commentaries, isLoading, error } = useBibleCommentary(book, chapterNum, commentaryType);

  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xlarge: "text-xl",
  };

  const fontClasses = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono",
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Comentarios Bíblicos</h2>
        <p className="text-sm text-muted-foreground mb-3">{book.toUpperCase()} {chapter}</p>
        <Select value={commentaryType} onValueChange={setCommentaryType}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Seleccionar comentario" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {COMMENTARIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-2xl">
          {isLoading && (
            <p className="text-muted-foreground">Cargando comentarios...</p>
          )}
          
          {error && (
            <p className="text-destructive">Error al cargar comentarios.</p>
          )}

          {!isLoading && !error && commentaries && commentaries.length === 0 && (
            <p className="text-muted-foreground">No hay comentarios disponibles para este capítulo.</p>
          )}

          {!isLoading && !error && commentaries && commentaries.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mb-4 text-heading">
                Comentario Bíblico
              </h3>
              <div className={`space-y-6 ${sizeClasses[fontSize as keyof typeof sizeClasses]} ${fontClasses[fontFamily as keyof typeof fontClasses]}`}>
                {commentaries.map((comment, i) => (
                  <div key={i} className="space-y-2">
                    {comment.titulo && (
                      <h4 className="bible-heading text-base font-semibold">
                        {comment.versiculo_inicio === comment.versiculo_fin 
                          ? `Versículo ${comment.versiculo_inicio}: ${comment.titulo}`
                          : `Versículos ${comment.versiculo_inicio}-${comment.versiculo_fin}: ${comment.titulo}`
                        }
                      </h4>
                    )}
                    <div className="text-foreground leading-relaxed whitespace-pre-line">
                      {comment.contenido}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
