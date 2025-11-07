import { useBibleChapter } from "@/hooks/use-bible-data";

interface BibleTextProps {
  book: string;
  chapter: string;
  version: string;
  fontSize?: string;
  fontFamily?: string;
}

export function BibleText({
  book,
  chapter,
  version,
  fontSize = "medium",
  fontFamily = "serif",
}: BibleTextProps) {
  const chapterNum = parseInt(chapter, 10);
  const { data, isLoading, error } = useBibleChapter(book, chapterNum, version);

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

  if (isLoading) {
    return (
      <div className="relative h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-destructive">Error al cargar el capítulo. Por favor intenta nuevamente.</p>
        </div>
      </div>
    );
  }

  if (!data || !data.verses.length) {
    return (
      <div className="relative h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-muted-foreground">No se encontraron versículos para este capítulo.</p>
        </div>
      </div>
    );
  }

  const bookName = data.metadata?.libro_nombre || book.toUpperCase();

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-center mb-8 tracking-wide">
          {bookName} {chapter}
        </h1>

        <div className="space-y-6">
          {data.metadata?.capitulo_titulo && (
            <h2 className="bible-heading">{data.metadata.capitulo_titulo}</h2>
          )}
          
          <div className={`bible-text space-y-3 ${sizeClasses[fontSize as keyof typeof sizeClasses]} ${fontClasses[fontFamily as keyof typeof fontClasses]}`}>
            {data.verses.map((verse) => (
              <p key={verse.numero_versiculo}>
                <sup className="verse-number">{verse.numero_versiculo}</sup>
                {verse.texto}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
