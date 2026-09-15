import { useMemo } from "react";
import { useSqliteDb } from "./use-sqlite-db";

interface Book {
  codigo: string;
  nombre: string;
  numero_orden: number;
  total_capitulos: number;
}

interface Version {
  id: number;
  codigo: string;
  nombre: string;
}

interface Verse {
  numero_versiculo: number;
  texto: string;
}

export interface Commentary {
  tipo_comentario: string;
  autor: string;
  titulo: string | null;
  contenido: string;
  versiculo_inicio: number | null;
  versiculo_fin: number | null;
}

export function useBibleBooks() {
  const { query, loading } = useSqliteDb();

  const books = useMemo(() => {
    if (loading) return [];
    
    return query<Book>(`
      SELECT codigo, nombre, numero_orden, total_capitulos
      FROM libros
      ORDER BY numero_orden
    `);
  }, [query, loading]);

  return { books, loading };
}

export function useBibleVersions() {
  const { query, loading } = useSqliteDb();

  const versions = useMemo(() => {
    if (loading) return [];
    
    return query<Version>(`
      SELECT id, codigo, nombre
      FROM versiones
      ORDER BY nombre
    `);
  }, [query, loading]);

  return { versions, loading };
}

export function useBibleChapter(bookCode: string, chapterNum: number, versionCode: string) {
  const { query, loading } = useSqliteDb();

  const verses = useMemo(() => {
    if (loading) return [];
    
    return query<Verse>(`
      SELECT numero_versiculo, texto
      FROM vista_versiculos_completa
      WHERE version_codigo = ?
        AND libro_codigo = ?
        AND numero_capitulo = ?
      ORDER BY numero_versiculo
    `, [versionCode, bookCode, chapterNum]);
  }, [bookCode, chapterNum, versionCode, query, loading]);

  return { verses, loading };
}

export function useBibleCommentary(bookCode: string, chapterNum: number, enabled = true) {
  const { query, loading } = useSqliteDb();

  const commentary = useMemo(() => {
    if (loading || !enabled) return [];
    
    return query<Commentary>(`
      SELECT tipo_comentario, autor, titulo, contenido, versiculo_inicio, versiculo_fin
      FROM vista_comentarios_completa
      WHERE libro_codigo = ?
        AND numero_capitulo = ?
      ORDER BY id
    `, [bookCode, chapterNum]);
  }, [bookCode, chapterNum, query, loading, enabled]);

  return { commentary, loading };
}
