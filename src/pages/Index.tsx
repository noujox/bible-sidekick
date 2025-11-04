import { useState } from "react";
import { BibleSelector } from "@/components/BibleSelector";
import { BibleText } from "@/components/BibleText";
import { CommentaryPanel } from "@/components/CommentaryPanel";
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

const Index = () => {
  const isMobile = useIsMobile();
  const [book, setBook] = useState("john");
  const [chapter, setChapter] = useState("1");
  const [version, setVersion] = useState("rvr1960");
  const [showCommentary, setShowCommentary] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [fontFamily, setFontFamily] = useState("serif");
  const [mobileView, setMobileView] = useState<"bible" | "commentary">("bible");

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
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hover:bg-accent rounded-full h-12 w-12 shadow-lg bg-card/80 backdrop-blur-sm"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hover:bg-accent rounded-full h-12 w-12 shadow-lg bg-card/80 backdrop-blur-sm"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

{isMobile ? (
          <>
            {mobileView === "bible" ? (
              <BibleText
                book={book}
                chapter={chapter}
                version={version}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            ) : (
              <CommentaryPanel 
                book={book} 
                chapter={chapter}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            )}
            
            {/* Mobile toggle button */}
            <Button
              variant="default"
              size="lg"
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-lg gap-2"
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
          </>
        ) : showCommentary ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <BibleText
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
                book={book} 
                chapter={chapter}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <BibleText
            book={book}
            chapter={chapter}
            version={version}
            fontSize={fontSize}
            fontFamily={fontFamily}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
