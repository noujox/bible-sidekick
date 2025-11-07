import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommentaryRequest {
  book: string;
  chapter: number;
  commentaryType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book, chapter, commentaryType = 'diario_vivir' }: CommentaryRequest = await req.json();

    // Open the database
    const db = new DB("/var/task/biblia.db");

    // Get commentary for the chapter
    const commentaries = db.queryEntries<{
      versiculo_inicio: number;
      versiculo_fin: number;
      titulo: string;
      contenido: string;
      tipo_comentario: string;
    }>(`
      SELECT 
        com.versiculo_inicio,
        com.versiculo_fin,
        com.titulo,
        com.contenido,
        tc.nombre as tipo_comentario
      FROM comentarios com
      JOIN capitulos c ON com.capitulo_id = c.id
      JOIN libros l ON c.libro_id = l.id
      JOIN tipos_comentario tc ON com.tipo_comentario_id = tc.id
      WHERE l.codigo = ?
        AND c.numero_capitulo = ?
        AND tc.codigo = ?
      ORDER BY com.versiculo_inicio
    `, [book, chapter, commentaryType]);

    db.close();

    return new Response(
      JSON.stringify({ commentaries }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching commentary:', error);
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
