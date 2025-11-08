import { useMemo } from "react";
import { useSqliteDb } from "./use-sqlite-db";

interface Book {
  codigo: string;
  nombre: string;
  numero_orden: number;
  total_capitulos: number;
}

interface Version {
  codigo: string;
  nombre: string;
  abreviatura: string;
}

interface Verse {
  numero_versiculo: number;
  texto: string;
}

interface Commentary {
  versiculo_inicio: number;
  versiculo_fin: number | null;
  texto_comentario: string;
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
      SELECT codigo, nombre, abreviatura
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
      SELECT 
        numero_versiculo,
        texto
      FROM versiculos
      WHERE codigo_libro = ?
        AND numero_capitulo = ?
        AND codigo_version = ?
      ORDER BY numero_versiculo
    `, [bookCode, chapterNum, versionCode]);
  }, [bookCode, chapterNum, versionCode, query, loading]);

  return { verses, loading };
}

export function useBibleCommentary(bookCode: string, chapterNum: number, commentaryType: string) {
  const { query, loading } = useSqliteDb();

  const commentary = useMemo(() => {
    if (loading) return [];
    
    return query<Commentary>(`
      SELECT 
        versiculo_inicio,
        versiculo_fin,
        texto_comentario
      FROM comentarios
      WHERE codigo_libro = ?
        AND numero_capitulo = ?
        AND tipo_comentario = ?
      ORDER BY versiculo_inicio
    `, [bookCode, chapterNum, commentaryType]);
  }, [bookCode, chapterNum, commentaryType, query, loading]);

  return { commentary, loading };
}
