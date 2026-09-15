  import { useState, useEffect, useRef } from "react";
import { BibleSelector } from "@/components/BibleSelector";
import { BibleText } from "@/components/BibleText";
import { CommentaryPanel } from "@/components/CommentaryPanel";
import { DbLoadingScreen } from "@/components/DbLoadingScreen";
import { Type, Columns2, ChevronLeft, ChevronRight, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useSqliteDb } from "@/hooks/use-sqlite-db";

const NAV_BUTTON_HIDE_DELAY_MS = 3000;
const NAV_BUTTON_SCROLL_THRESHOLDS = {
  up: 24,
  down: 320,
} as const;

type ScrollDirection = keyof typeof NAV_BUTTON_SCROLL_THRESHOLDS;

const Index = () => {
  const isMobile = useIsMobile();
  const { loading, progress, fromCache } = useSqliteDb();
  const [book, setBook] = useState(() => localStorage.getItem("bible-book") || "genesis");
  const [chapter, setChapter] = useState(() => localStorage.getItem("bible-chapter") || "1");
  const [version, setVersion] = useState(() => localStorage.getItem("bible-version") || "RV1960");
  const [showCommentary, setShowCommentary] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [fontFamily, setFontFamily] = useState("serif");
  const [mobileView, setMobileView] = useState<"bible" | "commentary">("bible");
  const [showNavButtons, setShowNavButtons] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentKey = `${book}-${chapter}`;
  
  // Save to localStorage when book, chapter, or version changes
  useEffect(() => {
    localStorage.setItem("bible-book", book);
    localStorage.setItem("bible-chapter", chapter);
    localStorage.setItem("bible-version", version);
  }, [book, chapter, version]);
  
  useEffect(() => {
    const scrollStates = new Map<EventTarget, {
      position: number;
      direction: ScrollDirection | null;
      distance: number;
    }>();

    const getScrollPosition = (target: EventTarget) => {
      if (target === window || target === document) {
        return window.scrollY;
      }

      if (target instanceof HTMLElement) {
        return target.scrollTop;
      }

      return null;
    };

    const resetTimer = () => {
      setShowNavButtons(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setShowNavButtons(false);
      }, NAV_BUTTON_HIDE_DELAY_MS);
    };

    const handleScroll = (event: Event) => {
      const target = event.target ?? window;
      const currentPosition = getScrollPosition(target);

      if (currentPosition === null) {
        return;
      }

      const previousState = scrollStates.get(target);
      if (!previousState) {
        scrollStates.set(target, {
          position: currentPosition,
          direction: null,
          distance: 0,
        });
        return;
      }

      const delta = currentPosition - previousState.position;
      previousState.position = currentPosition;

      if (delta === 0) {
        return;
      }

      const direction: ScrollDirection = delta < 0 ? "up" : "down";
      if (previousState.direction !== direction) {
        previousState.direction = direction;
        previousState.distance = 0;
      }

      previousState.distance += Math.abs(delta);
      if (previousState.distance >= NAV_BUTTON_SCROLL_THRESHOLDS[direction]) {
        previousState.distance = 0;
        resetTimer();
      }
    };

    resetTimer();
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      scrollStates.clear();
    };
  }, []);
  
  if (loading) {
    return <DbLoadingScreen progress={progress} fromCache={fromCache} />;
  }


  const handlePrevious = () => {
    const ch = parseInt(chapter);
    if (ch > 1) {
      setChapter((ch - 1).toString());
    }
  };

  const handleNext = () => {
    setChapter((parseInt(chapter) + 1).toString());
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-2 sm:px-6 py-3 gap-2">
          <BibleSelector
            book={book}
            chapter={chapter}
            version={version}
            onBookChange={setBook}
            onChapterChange={setChapter}
            onVersionChange={setVersion}
          />

          <div className="flex items-center gap-1 sm:gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent h-8 w-8 sm:h-10 sm:w-10">
                  <Type className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Configuración de Texto</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Tamaño de Fuente</Label>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger id="font-size">
                        <SelectValue placeholder="Selecciona tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño</SelectItem>
                        <SelectItem value="medium">Mediano</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="xlarge">Muy Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">Tipo de Fuente</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Selecciona fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="sans">Sans Serif</SelectItem>
                        <SelectItem value="mono">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setShowCommentary(!showCommentary)}
              >
                <Columns2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Floating Navigation Buttons */}
        <div className="fixed inset-x-0 top-0 z-50 h-svh pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-auto hover:bg-accent rounded-full h-12 w-12 shadow-lg bg-card/80 backdrop-blur-sm transition-[left,opacity] duration-300 ${
              showNavButtons ? 'left-4 opacity-100' : '-left-12 opacity-0'
            }`}
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-auto hover:bg-accent rounded-full h-12 w-12 shadow-lg bg-card/80 backdrop-blur-sm transition-[right,opacity] duration-300 ${
              showNavButtons ? 'right-4 opacity-100' : '-right-12 opacity-0'
            }`}
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {isMobile && (
            <Button
              variant="default"
              size="lg"
              className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 pointer-events-auto shadow-lg gap-2"
              onClick={() => setMobileView(mobileView === "bible" ? "commentary" : "bible")}
            >
              {mobileView === "bible" ? (
                <>
                  <FileText className="h-5 w-5" />
                  Ver Comentarios
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  Ver Biblia
                </>
              )}
            </Button>
          )}
        </div>

        {isMobile ? (
          <>
            {mobileView === "bible" ? (
              <BibleText
                key={`${contentKey}-bible`}
                book={book}
                chapter={chapter}
                version={version}
                fontSize={fontSize}
                fontFamily={fontFamily}
                isMobile={isMobile}
              />
            ) : (
              <CommentaryPanel 
                key={`${contentKey}-commentary`}
                book={book} 
                chapter={chapter}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            )}
          </>
        ) : showCommentary ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <BibleText
                key={`${contentKey}-bible`}
                book={book}
                chapter={chapter}
                version={version}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            </ResizablePanel>
            
            <ResizableHandle className="w-1 bg-border hover:bg-accent transition-colors" />
            
            <ResizablePanel defaultSize={50} minSize={30}>
              <CommentaryPanel 
                key={`${contentKey}-commentary`}
                book={book} 
                chapter={chapter}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <BibleText
            key={`${contentKey}-bible`}
            book={book}
            chapter={chapter}
            version={version}
            fontSize={fontSize}
            fontFamily={fontFamily}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
