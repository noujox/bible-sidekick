import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const COMMENTARIES = [
  { value: "matthew-henry", label: "Matthew Henry" },
  { value: "jamieson", label: "Jamieson-Fausset-Brown" },
  { value: "barnes", label: "Barnes' Notes" },
  { value: "gill", label: "Gill's Exposition" },
];

const SAMPLE_COMMENTARY = `
**Versículos 1-5: El Verbo eterno**

"En el principio era el Verbo" - Esta declaración establece la preexistencia eterna del Verbo (Logos). Juan usa un término filosófico conocido tanto por judíos como griegos, pero lo llena con contenido cristiano único.

El apóstol Juan presenta tres verdades fundamentales sobre el Verbo:
1. Su eternidad: "era" en el principio
2. Su relación con Dios: "era con Dios"
3. Su deidad: "era Dios"

**La creación por el Verbo**

Todas las cosas fueron hechas por medio de Él. Esto contradice cualquier filosofía que vea la materia como eterna o malvada. El Verbo es el agente activo de la creación.

**La vida y la luz**

En Él estaba la vida, no solo existencia física, sino vida espiritual y eterna. Esta vida es la luz de los hombres, revelando tanto su condición pecaminosa como el camino de salvación.

**El conflicto con las tinieblas**

Las tinieblas representan el pecado, la ignorancia espiritual y la muerte. Aunque la luz resplandece, las tinieblas intentaron comprenderla o apagarla, pero no prevalecieron. Esta es una profecía del rechazo de Cristo y Su victoria final.
`;

export function CommentaryPanel() {
  const [commentary, setCommentary] = useState("matthew-henry");

  return (
    <div className="w-full lg:w-1/2 border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <Select value={commentary} onValueChange={setCommentary}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Seleccionar comentario" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {COMMENTARIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 text-heading">
            Comentario Bíblico
          </h3>
          <div className="prose prose-invert prose-sm max-w-none space-y-4 text-foreground leading-relaxed">
            {SAMPLE_COMMENTARY.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('**')) {
                const text = paragraph.replace(/\*\*/g, '');
                return (
                  <h4 key={i} className="bible-heading text-base mt-6 mb-3">
                    {text}
                  </h4>
                );
              }
              return (
                <p key={i} className="text-foreground">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
