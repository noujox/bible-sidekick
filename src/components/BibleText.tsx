import { useBibleChapter, useBibleBooks } from "@/hooks/use-bible-data";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { verses, loading } = useBibleChapter(book, parseInt(chapter), version);
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

  if (loading) {
    return (
      <div className="relative h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-[40vh]">
        <h1 className="text-2xl font-bold text-center mb-8 tracking-wide">
          {bookName} {chapter}
        </h1>

        {verses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No se encontraron versículos para este capítulo.
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`bible-text space-y-3 ${sizeClasses[fontSize as keyof typeof sizeClasses]} ${fontClasses[fontFamily as keyof typeof fontClasses]}`}>
              {verses.map((verse) => (
                <p key={verse.numero_versiculo}>
                  <sup className="verse-number">{verse.numero_versiculo}</sup>
                  {verse.texto}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
