import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Verse {
  number: number;
  text: string;
}

interface BibleTextProps {
  book: string;
  chapter: string;
  version: string;
  onPrevious: () => void;
  onNext: () => void;
}

// Ejemplo de datos (en producción vendrían de una API)
const SAMPLE_TEXT: Verse[] = [
  {
    number: 1,
    text: "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.",
  },
  {
    number: 2,
    text: "Este era en el principio con Dios.",
  },
  {
    number: 3,
    text: "Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho.",
  },
  {
    number: 4,
    text: "En él estaba la vida, y la vida era la luz de los hombres.",
  },
  {
    number: 5,
    text: "La luz en las tinieblas resplandece, y las tinieblas no prevalecieron contra ella.",
  },
  {
    number: 6,
    text: "Hubo un hombre enviado de Dios, el cual se llamaba Juan.",
  },
  {
    number: 7,
    text: "Este vino por testimonio, para que diese testimonio de la luz, a fin de que todos creyesen por él.",
  },
  {
    number: 8,
    text: "No era él la luz, sino para que diese testimonio de la luz.",
  },
  {
    number: 9,
    text: "Aquella luz verdadera, que alumbra a todo hombre, venía a este mundo.",
  },
  {
    number: 10,
    text: "En el mundo estaba, y el mundo por él fue hecho; pero el mundo no le conoció.",
  },
];

export function BibleText({
  book,
  chapter,
  version,
  onPrevious,
  onNext,
}: BibleTextProps) {
  const bookName = book === "john" ? "JUAN" : book.toUpperCase();

  return (
    <div className="relative flex-1">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hover:bg-accent"
        onClick={onPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <div className="max-w-3xl mx-auto px-16 py-8">
        <h1 className="text-2xl font-bold text-center mb-8 tracking-wide">
          {bookName} {chapter}
        </h1>

        <div className="space-y-6">
          <h2 className="bible-heading">El Verbo hecho carne</h2>
          
          <div className="bible-text space-y-3">
            {SAMPLE_TEXT.map((verse) => (
              <p key={verse.number}>
                <sup className="verse-number">{verse.number}</sup>
                {verse.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hover:bg-accent"
        onClick={onNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
