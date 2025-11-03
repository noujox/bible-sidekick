import { useState } from "react";
import { BibleSelector } from "@/components/BibleSelector";
import { BibleText } from "@/components/BibleText";
import { CommentaryPanel } from "@/components/CommentaryPanel";
import { Volume2, Type, Columns2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [book, setBook] = useState("john");
  const [chapter, setChapter] = useState("1");
  const [version, setVersion] = useState("rvr1960");
  const [showCommentary, setShowCommentary] = useState(true);

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
        <div className="flex items-center justify-between px-6 py-3">
          <BibleSelector
            book={book}
            chapter={chapter}
            version={version}
            onBookChange={setBook}
            onChapterChange={setChapter}
            onVersionChange={setVersion}
          />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Volume2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Type className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              onClick={() => setShowCommentary(!showCommentary)}
            >
              <Columns2 className="h-5 w-5" />
            </Button>
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

        {showCommentary ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <BibleText
                book={book}
                chapter={chapter}
                version={version}
              />
            </ResizablePanel>
            
            <ResizableHandle className="w-1 bg-border hover:bg-accent transition-colors" />
            
            <ResizablePanel defaultSize={50} minSize={30}>
              <CommentaryPanel book={book} chapter={chapter} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <BibleText
            book={book}
            chapter={chapter}
            version={version}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
