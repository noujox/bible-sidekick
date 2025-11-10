import { ScrollArea } from "@/components/ui/scroll-area";
import { useBibleCommentary, useBibleBooks } from "@/hooks/use-bible-data";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentaryPanelProps {
  book: string;
  chapter: string;
  fontSize?: string;
  fontFamily?: string;
}

const COMMENTARIES = [
  { value: "matthew-henry", label: "Matthew Henry" },
  { value: "jamieson", label: "Jamieson-Fausset-Brown" },
  { value: "barnes", label: "Barnes' Notes" },
  { value: "gill", label: "Gill's Exposition" },
];

export function CommentaryPanel({ book, chapter, fontSize = "medium", fontFamily = "serif" }: CommentaryPanelProps) {
  const { commentary: commentaryData, loading } = useBibleCommentary(book, parseInt(chapter));
  const { books } = useBibleBooks();

  const bookData = books.find((b) => b.codigo === book);
  const bookName = bookData?.nombre || book.toUpperCase();

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
        <p className="text-sm text-muted-foreground mb-3">{bookName} {chapter}</p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 text-heading">
            Comentario Bíblico
          </h3>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : commentaryData.length === 0 ? (
            <div className="text-muted-foreground">
              No hay comentarios disponibles para este capítulo en la versión seleccionada.
            </div>
          ) : (
            <div className={`prose prose-invert prose-sm max-w-none space-y-6 text-foreground leading-relaxed ${sizeClasses[fontSize as keyof typeof sizeClasses]} ${fontClasses[fontFamily as keyof typeof fontClasses]}`}>
              {commentaryData.map((item, i) => (
                <div key={i} className="space-y-2 border-l-2 border-primary/30 pl-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">{item.tipo_comentario}</span>
                    {item.autor && <span>• {item.autor}</span>}
                    {item.versiculo_inicio && (
                      <span>• v.{item.versiculo_inicio}{item.versiculo_fin ? `-${item.versiculo_fin}` : ''}</span>
                    )}
                  </div>
                  {item.titulo && (
                    <h4 className="bible-heading text-base font-semibold mt-2">
                      {item.titulo}
                    </h4>
                  )}
                  <p className="text-foreground whitespace-pre-wrap">
                    {item.contenido}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
