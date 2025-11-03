interface Verse {
  number: number;
  text: string;
}

interface BibleTextProps {
  book: string;
  chapter: string;
  version: string;
  fontSize?: string;
  fontFamily?: string;
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
  fontSize = "medium",
  fontFamily = "serif",
}: BibleTextProps) {
  const bookName = book === "john" ? "JUAN" : book.toUpperCase();

  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xlarge: "text-xl",
  };

  const fontClasses = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono",
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-16 py-8">
        <h1 className="text-2xl font-bold text-center mb-8 tracking-wide">
          {bookName} {chapter}
        </h1>

        <div className="space-y-6">
          <h2 className="bible-heading">El Verbo hecho carne</h2>
          
          <div className={`bible-text space-y-3 ${sizeClasses[fontSize as keyof typeof sizeClasses]} ${fontClasses[fontFamily as keyof typeof fontClasses]}`}>
            {SAMPLE_TEXT.map((verse) => (
              <p key={verse.number}>
                <sup className="verse-number">{verse.number}</sup>
                {verse.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
