import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Open the database
    const db = new DB("/var/task/biblia.db");

    // Get all books
    const books = db.queryEntries<{
      codigo: string;
      nombre: string;
      testamento: string;
      total_capitulos: number;
      numero_orden: number;
      categoria: string;
    }>(`
      SELECT 
        codigo,
        nombre,
        testamento,
        total_capitulos,
        numero_orden,
        categoria
      FROM libros
      ORDER BY numero_orden
    `);

    db.close();

    return new Response(
      JSON.stringify({ books }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching books:', error);
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
