import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  useBibleChapter,
  useBibleBooks,
  useBibleCommentary,
  type Commentary,
} from "@/hooks/use-bible-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BibleTextProps {
  book: string;
  chapter: string;
  version: string;
  fontSize?: string;
  fontFamily?: string;
  isMobile?: boolean;
}

export function BibleText({
  book,
  chapter,
  version,
  fontSize = "medium",
  fontFamily = "serif",
  isMobile = false,
}: BibleTextProps) {
  const chapterNumber = parseInt(chapter, 10);
  const { verses, loading } = useBibleChapter(book, chapterNumber, version);
  const { commentary: commentaryData } = useBibleCommentary(book, chapterNumber, isMobile);
  const { books } = useBibleBooks();
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const commentaryByVerse = useMemo(() => {
    const grouped = new Map<number, Commentary[]>();

    for (const commentary of commentaryData) {
      if (commentary.es_general !== 0 || commentary.versiculo_inicio === null) continue;

      const entries = grouped.get(commentary.versiculo_inicio) ?? [];
      entries.push(commentary);
      grouped.set(commentary.versiculo_inicio, entries);
    }

    return grouped;
  }, [commentaryData]);

  useEffect(() => {
    if (!isMobile || loading || typeof window === "undefined") return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const storageKey = `bible-sidekick:bible-scroll:${encodeURIComponent(version)}:${encodeURIComponent(book)}:${encodeURIComponent(chapter)}`;
    let frameId: number | null = null;
    let pendingScrollTop: number | null = null;

    try {
      const savedScrollTop = window.localStorage.getItem(storageKey);
      if (savedScrollTop !== null && savedScrollTop.trim() !== "") {
        const parsedScrollTop = Number(savedScrollTop);
        if (Number.isFinite(parsedScrollTop)) {
          const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
          container.scrollTop = Math.min(Math.max(parsedScrollTop, 0), maxScrollTop);
        }
      }
    } catch {
      // localStorage may be unavailable in private browsing or restricted contexts.
    }

    const flushPendingScroll = () => {
      if (pendingScrollTop === null) return;

      const scrollTop = pendingScrollTop;
      pendingScrollTop = null;

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }

      try {
        window.localStorage.setItem(storageKey, String(scrollTop));
      } catch {
        // Ignore storage failures so scrolling remains functional.
      }
    };

    const handleScroll = () => {
      pendingScrollTop = container.scrollTop;
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(flushPendingScroll);
    };

    const handlePageHide = () => {
      flushPendingScroll();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      flushPendingScroll();
    };
  }, [book, chapter, version, isMobile, loading]);

  useEffect(() => {
    setSelectedVerse(null);
  }, [book, chapter, isMobile]);

  const selectedCommentaries = selectedVerse === null
    ? []
    : commentaryByVerse.get(selectedVerse) ?? [];

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
    <div ref={scrollContainerRef} className="relative h-full overflow-y-auto">
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
              {verses.map((verse) => {
                const verseCommentaries = commentaryByVerse.get(verse.numero_versiculo) ?? [];
                const verseContent = (
                  <>
                    <sup className="verse-number">{verse.numero_versiculo}</sup>
                    {verse.texto}
                    {isMobile && verseCommentaries.length > 0 && (
                      <MessageCircle
                        aria-hidden="true"
                        className="ml-2 inline-block h-4 w-4 align-middle text-yellow-400"
                      />
                    )}
                  </>
                );

                if (!isMobile || verseCommentaries.length === 0) {
                  return <p key={verse.numero_versiculo}>{verseContent}</p>;
                }

                return (
                  <button
                    key={verse.numero_versiculo}
                    type="button"
                    className="block w-full cursor-pointer bg-transparent p-0 text-left text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setSelectedVerse(verse.numero_versiculo)}
                    aria-label={`Abrir comentarios del versículo ${verse.numero_versiculo}`}
                  >
                    {verseContent}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <Dialog
          open={selectedVerse !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedVerse(null);
          }}
        >
          <DialogContent
            className="w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto p-5"
            onClick={() => setSelectedVerse(null)}
          >
            <DialogHeader className="pr-6 text-left">
              <DialogTitle>Comentarios del versículo {selectedVerse}</DialogTitle>
              <DialogDescription>
                {bookName} {chapter}
              </DialogDescription>
            </DialogHeader>

            <div className={`prose prose-invert prose-sm max-w-none space-y-6 text-foreground leading-relaxed ${sizeClasses[fontSize as keyof typeof sizeClasses]} ${fontClasses[fontFamily as keyof typeof fontClasses]}`}>
              {selectedCommentaries.map((item) => (
                <article key={item.id} className="space-y-2 border-l-2 border-primary/30 pl-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">{item.tipo_comentario}</span>
                    {item.autor && <span>• {item.autor}</span>}
                    {item.referencia_original && <span>• {item.referencia_original}</span>}
                  </div>
                  {item.titulo && (
                    <h3 className="bible-heading text-base font-semibold mt-2">
                      {item.titulo}
                    </h3>
                  )}
                  <p className="text-foreground whitespace-pre-wrap">{item.contenido}</p>
                </article>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
