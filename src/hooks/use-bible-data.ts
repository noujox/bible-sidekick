import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Book {
  codigo: string;
  nombre: string;
  testamento: string;
  total_capitulos: number;
  numero_orden: number;
  categoria: string;
}

interface Version {
  codigo: string;
  nombre: string;
  idioma: string;
  descripcion: string;
}

interface Verse {
  numero_versiculo: number;
  texto: string;
}

interface ChapterMetadata {
  libro_nombre: string;
  capitulo_titulo: string;
  total_versiculos: number;
  total_capitulos: number;
}

interface Commentary {
  versiculo_inicio: number;
  versiculo_fin: number;
  titulo: string;
  contenido: string;
  tipo_comentario: string;
}

export const useBibleBooks = () => {
  return useQuery({
    queryKey: ["bible-books"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-bible-books");
      if (error) throw error;
      return data.books as Book[];
    },
    staleTime: Infinity, // Books don't change
  });
};

export const useBibleVersions = () => {
  return useQuery({
    queryKey: ["bible-versions"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-bible-versions");
      if (error) throw error;
      return data.versions as Version[];
    },
    staleTime: Infinity, // Versions don't change
  });
};

export const useBibleChapter = (book: string, chapter: number, version: string) => {
  return useQuery({
    queryKey: ["bible-chapter", book, chapter, version],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-bible-chapter", {
        body: { book, chapter, version },
      });
      if (error) throw error;
      return {
        verses: data.verses as Verse[],
        metadata: data.metadata as ChapterMetadata | null,
      };
    },
    enabled: !!book && !!chapter && !!version,
    staleTime: Infinity, // Bible text doesn't change
  });
};

export const useBibleCommentary = (book: string, chapter: number, commentaryType = "diario_vivir") => {
  return useQuery({
    queryKey: ["bible-commentary", book, chapter, commentaryType],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-bible-commentary", {
        body: { book, chapter, commentaryType },
      });
      if (error) throw error;
      return data.commentaries as Commentary[];
    },
    enabled: !!book && !!chapter,
    staleTime: Infinity, // Commentary doesn't change
  });
};
