import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBibleBooks, useBibleVersions } from "@/hooks/use-bible-data";

interface BibleSelectorProps {
  book: string;
  chapter: string;
  version: string;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  onVersionChange: (version: string) => void;
}

export function BibleSelector({
  book,
  chapter,
  version,
  onBookChange,
  onChapterChange,
  onVersionChange,
}: BibleSelectorProps) {
  const [openBook, setOpenBook] = useState(false);
  const [openChapter, setOpenChapter] = useState(false);
  const [openVersion, setOpenVersion] = useState(false);

  const { data: booksData, isLoading: booksLoading } = useBibleBooks();
  const { data: versionsData, isLoading: versionsLoading } = useBibleVersions();

  const books = booksData || [];
  const versions = versionsData || [];

  const selectedBook = books.find((b) => b.codigo === book);
  const selectedVersion = versions.find((v) => v.codigo === version);
  const chapterCount = selectedBook?.total_capitulos || 50;
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  return (
    <div className="flex gap-1.5 sm:gap-3 items-center w-full sm:w-auto">
      {/* Book Selector with Search */}
      <Popover open={openBook} onOpenChange={setOpenBook}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openBook}
            className="w-[120px] sm:w-[180px] justify-between bg-secondary border-border text-sm sm:text-base px-2 sm:px-4"
            disabled={booksLoading}
          >
            <span className="truncate">{selectedBook?.nombre || "Libro"}</span>
            <ChevronsUpDown className="hidden sm:block ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-popover border-border">
          <Command>
            <CommandInput placeholder="Buscar libro..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontró el libro.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {books.map((b) => (
                    <CommandItem
                      key={b.codigo}
                      value={b.nombre}
                      onSelect={() => {
                        onBookChange(b.codigo);
                        setOpenBook(false);
                      }}
                    >
                      {b.nombre}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          book === b.codigo ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Chapter Selector with Grid */}
      <Popover open={openChapter} onOpenChange={setOpenChapter}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[70px] sm:w-[100px] justify-between bg-secondary border-border text-sm sm:text-base px-2 sm:px-4"
          >
            <span className="truncate">Cap. {chapter}</span>
            <ChevronsUpDown className="hidden sm:block ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] sm:w-[520px] p-4 bg-popover border-border">
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {chapters.map((ch) => (
                <Button
                  key={ch}
                  variant={chapter === ch.toString() ? "default" : "outline"}
                  size="sm"
                  className="h-10 w-10"
                  onClick={() => {
                    onChapterChange(ch.toString());
                    setOpenChapter(false);
                  }}
                >
                  {ch}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Version Selector */}
      <Popover open={openVersion} onOpenChange={setOpenVersion}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[90px] sm:w-[120px] justify-between bg-secondary border-border text-sm sm:text-base px-2 sm:px-4"
            disabled={versionsLoading}
          >
            <span className="truncate">{selectedVersion?.nombre || "Ver."}</span>
            <ChevronsUpDown className="hidden sm:block ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[150px] p-2 bg-popover border-border">
          <div className="flex flex-col gap-1">
            {versions.map((v) => (
              <Button
                key={v.codigo}
                variant={version === v.codigo ? "default" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => {
                  onVersionChange(v.codigo);
                  setOpenVersion(false);
                }}
              >
                {v.codigo.toUpperCase()}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    version === v.codigo ? "opacity-100" : "opacity-0"
                  )}
                />
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
