export interface CommentarySection {
  reference: string | null;
  paragraphs: string[];
}

interface PendingSection {
  reference: string | null;
  lines: string[];
}

const REFERENCE_AT_LINE_START =
  /^\s*(\d+\.\d+(?:\s*[-\u2013\u2014]\s*\d+)?(?:ss)?(?:\s*,\s*(?:\d+\.)?\d+(?:\s*[-\u2013\u2014]\s*\d+)?(?:ss)?)*)(?=$|\s+|[.:)\]](?:\s+|$))/;

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
