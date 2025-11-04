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

interface BibleSelectorProps {
  book: string;
  chapter: string;
  version: string;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  onVersionChange: (version: string) => void;
}

const BOOKS = [
  { value: "genesis", label: "Génesis", chapters: 50 },
  { value: "exodus", label: "Éxodo", chapters: 40 },
  { value: "john", label: "Juan", chapters: 21 },
  { value: "matthew", label: "Mateo", chapters: 28 },
  { value: "mark", label: "Marcos", chapters: 16 },
  { value: "luke", label: "Lucas", chapters: 24 },
  { value: "acts", label: "Hechos", chapters: 28 },
  { value: "romans", label: "Romanos", chapters: 16 },
];

const VERSIONS = [
  { value: "rvr1960", label: "RVR1960" },
  { value: "nvi", label: "NVI" },
  { value: "lbla", label: "LBLA" },
  { value: "dhh", label: "DHH" },
];

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

  const selectedBook = BOOKS.find((b) => b.value === book);
  const selectedVersion = VERSIONS.find((v) => v.value === version);
  const chapterCount = selectedBook?.chapters || 50;
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
            className="w-[120px] sm:w-[180px] justify-between bg-secondary border-border text-sm sm:text-base"
          >
            {selectedBook?.label || "Libro"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-popover border-border">
          <Command>
            <CommandInput placeholder="Buscar libro..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontró el libro.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {BOOKS.map((b) => (
                    <CommandItem
                      key={b.value}
                      value={b.label}
                      onSelect={() => {
                        onBookChange(b.value);
                        setOpenBook(false);
                      }}
                    >
                      {b.label}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          book === b.value ? "opacity-100" : "opacity-0"
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
            className="w-[70px] sm:w-[100px] justify-between bg-secondary border-border text-sm sm:text-base"
          >
            Cap. {chapter}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
            className="w-[90px] sm:w-[120px] justify-between bg-secondary border-border text-sm sm:text-base"
          >
            {selectedVersion?.label || "Ver."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[150px] p-2 bg-popover border-border">
          <div className="flex flex-col gap-1">
            {VERSIONS.map((v) => (
              <Button
                key={v.value}
                variant={version === v.value ? "default" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => {
                  onVersionChange(v.value);
                  setOpenVersion(false);
                }}
              >
                {v.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    version === v.value ? "opacity-100" : "opacity-0"
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
