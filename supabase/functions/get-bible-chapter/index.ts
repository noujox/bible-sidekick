import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChapterRequest {
  book: string;
  chapter: number;
  version: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book, chapter, version }: ChapterRequest = await req.json();

    // Open the database
    const db = new DB("/var/task/biblia.db");

    // Get verses for the chapter
    const verses = db.queryEntries<{
      numero_versiculo: number;
      texto: string;
    }>(`
      SELECT 
        v.numero_versiculo,
        v.texto
      FROM versiculos v
      JOIN capitulos c ON v.capitulo_id = c.id
      JOIN libros l ON c.libro_id = l.id
      JOIN versiones ver ON v.version_id = ver.id
      WHERE l.codigo = ?
        AND c.numero_capitulo = ?
        AND ver.codigo = ?
      ORDER BY v.numero_versiculo
    `, [book, chapter, version]);

    // Get chapter metadata
    const metadata = db.queryEntries<{
      libro_nombre: string;
      capitulo_titulo: string;
      total_versiculos: number;
      total_capitulos: number;
    }>(`
      SELECT 
        l.nombre as libro_nombre,
        c.titulo as capitulo_titulo,
        c.total_versiculos,
        l.total_capitulos
      FROM capitulos c
      JOIN libros l ON c.libro_id = l.id
      WHERE l.codigo = ?
        AND c.numero_capitulo = ?
      LIMIT 1
    `, [book, chapter]);

    db.close();

    return new Response(
      JSON.stringify({
        verses,
        metadata: metadata[0] || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching chapter:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
