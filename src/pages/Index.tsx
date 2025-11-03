import { useState } from "react";
import { BibleSelector } from "@/components/BibleSelector";
import { BibleText } from "@/components/BibleText";
import { CommentaryPanel } from "@/components/CommentaryPanel";
import { Volume2, Type, Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-1 overflow-hidden">
        <BibleText
          book={book}
          chapter={chapter}
          version={version}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
        
        {showCommentary && <CommentaryPanel />}
      </div>
    </div>
  );
};

export default Index;
