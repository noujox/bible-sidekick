import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BibleSelectorProps {
  book: string;
  chapter: string;
  version: string;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  onVersionChange: (version: string) => void;
}

const BOOKS = [
  { value: "genesis", label: "Génesis" },
  { value: "exodus", label: "Éxodo" },
  { value: "john", label: "Juan" },
  { value: "matthew", label: "Mateo" },
  { value: "mark", label: "Marcos" },
  { value: "luke", label: "Lucas" },
  { value: "acts", label: "Hechos" },
  { value: "romans", label: "Romanos" },
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
  const chapters = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

  return (
    <div className="flex gap-3 items-center">
      <Select value={book} onValueChange={onBookChange}>
        <SelectTrigger className="w-[180px] bg-secondary border-border">
          <SelectValue placeholder="Seleccionar libro" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {BOOKS.map((b) => (
            <SelectItem key={b.value} value={b.value}>
              {b.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={chapter} onValueChange={onChapterChange}>
        <SelectTrigger className="w-[100px] bg-secondary border-border">
          <SelectValue placeholder="Cap." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-[300px]">
          {chapters.map((ch) => (
            <SelectItem key={ch} value={ch}>
              {ch}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={version} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[120px] bg-secondary border-border">
          <SelectValue placeholder="Versión" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {VERSIONS.map((v) => (
            <SelectItem key={v.value} value={v.value}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
