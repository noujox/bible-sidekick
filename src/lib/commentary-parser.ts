export interface CommentarySection {
  reference: string | null;
  paragraphs: string[];
}

export interface ParsedVerseReference {
  chapter: number;
  startVerse: number;
  endVerse: number;
}

interface VerseNumber {
  numero_versiculo: number;
}

export interface CommentaryReferenceData {
  contenido: string;
  versiculo_inicio: number | null;
  versiculo_fin: number | null;
}

interface PendingSection {
  reference: string | null;
  lines: string[];
}

const REFERENCE_AT_LINE_START =
  /^\s*(\d+\.\d+(?:\s*[-\u2013\u2014]\s*\d+)?(?:ss)?(?:\s*,\s*(?:\d+\.)?\d+(?:\s*[-\u2013\u2014]\s*\d+)?(?:ss)?)*)(?=$|\s+|[.:)\]](?:\s+|$))/;
const REFERENCE_PART =
  /^\s*(?:(\d+)\.)?(\d+)(?:\s*[-\u2013\u2014]\s*(\d+))?\s*(ss)?\s*$/;

function splitParagraphs(lines: string[]): string[] {
  return lines
    .join("\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function readReference(line: string) {
  const match = line.match(REFERENCE_AT_LINE_START);

  if (!match) return null;

  return {
    reference: match[1],
    body: line.slice(match[0].length).replace(/^[\s.:)\]]+/, ""),
  };
}

export function parseVerseReferences(reference: string): ParsedVerseReference[] {
  let currentChapter: number | null = null;

  return reference.split(",").flatMap((part) => {
    const match = part.match(REFERENCE_PART);
    if (!match) return [];

    const chapter = match[1] ? Number(match[1]) : currentChapter;
    const startVerse = Number(match[2]);
    const endVerse = match[4]
      ? Number.MAX_SAFE_INTEGER
      : match[3]
        ? Number(match[3])
        : startVerse;

    if (chapter === null || chapter < 1 || startVerse < 1 || endVerse < startVerse) {
      return [];
    }

    currentChapter = chapter;
    return [{ chapter, startVerse, endVerse }];
  });
}

function toPositiveInteger(value: number | null): number | null {
  return value !== null && Number.isInteger(value) && value > 0 ? value : null;
}

export function associateCommentariesWithVerses<T extends CommentaryReferenceData>(
  verses: readonly VerseNumber[],
  commentaries: readonly T[],
  chapter: number,
): Map<number, T[]> {
  const associations = new Map<number, T[]>();

  for (const commentary of commentaries) {
    const ranges: ParsedVerseReference[] = [];
    const startVerse = toPositiveInteger(commentary.versiculo_inicio);
    const endVerse = toPositiveInteger(commentary.versiculo_fin);

    if (startVerse !== null && (endVerse === null || endVerse >= startVerse)) {
      ranges.push({
        chapter,
        startVerse,
        endVerse: endVerse ?? startVerse,
      });
    }

    for (const section of parseCommentary(commentary.contenido)) {
      if (section.reference === null) continue;

      ranges.push(
        ...parseVerseReferences(section.reference).filter(
          (reference) => reference.chapter === chapter,
        ),
      );
    }

    for (const verse of verses) {
      const isAssociated = ranges.some(
        (range) =>
          range.chapter === chapter &&
          verse.numero_versiculo >= range.startVerse &&
          verse.numero_versiculo <= range.endVerse,
      );

      if (!isAssociated) continue;

      const verseCommentaries = associations.get(verse.numero_versiculo) ?? [];
      verseCommentaries.push(commentary);
      associations.set(verse.numero_versiculo, verseCommentaries);
    }
  }

  return associations;
}

export function parseCommentary(content: string): CommentarySection[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const sections: CommentarySection[] = [];
  let current: PendingSection = { reference: null, lines: [] };

  const flushCurrent = () => {
    if (current.reference === null && !current.lines.some((line) => line.trim())) {
      return;
    }

    sections.push({
      reference: current.reference,
      paragraphs: splitParagraphs(current.lines),
    });
  };

  for (const line of lines) {
    const detected = readReference(line);

    if (detected) {
      flushCurrent();
      current = {
        reference: detected.reference,
        lines: detected.body ? [detected.body] : [],
      };
    } else {
      current.lines.push(line);
    }
  }

  flushCurrent();

  return sections;
}
