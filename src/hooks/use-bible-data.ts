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
  id: number;
  capitulo_id: number;
  capitulo_fin_id: number | null;
  tipo_comentario_id: number;
  tipo_comentario_codigo: string;
  tipo_comentario: string;
  autor: string | null;
  titulo: string | null;
  contenido: string;
  contenido_html: string | null;
  versiculo_inicio: number | null;
  versiculo_fin: number | null;
  referencia_original: string | null;
  es_general: 0 | 1;
  orden: number | null;
  fecha_scrapeado: string | null;
  libro_codigo: string;
  libro_nombre: string;
  numero_capitulo: number;
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
      SELECT
        com.id,
        com.capitulo_id,
        com.capitulo_fin_id,
        com.tipo_comentario_id,
        tipo.codigo AS tipo_comentario_codigo,
        tipo.nombre AS tipo_comentario,
        tipo.autor,
        com.titulo,
        com.contenido,
        com.contenido_html,
        com.versiculo_inicio,
        com.versiculo_fin,
        com.referencia_original,
        com.es_general,
        com.orden,
        com.fecha_scrapeado,
        lib.codigo AS libro_codigo,
        lib.nombre AS libro_nombre,
        cap.numero_capitulo
      FROM comentarios AS com
      INNER JOIN capitulos AS cap ON cap.id = com.capitulo_id
      INNER JOIN libros AS lib ON lib.id = cap.libro_id
      INNER JOIN tipos_comentario AS tipo ON tipo.id = com.tipo_comentario_id
      WHERE lib.codigo = ?
        AND cap.numero_capitulo = ?
      ORDER BY com.orden, com.id
    `, [bookCode, chapterNum]);
  }, [bookCode, chapterNum, query, loading, enabled]);

  return { commentary, loading };
}
