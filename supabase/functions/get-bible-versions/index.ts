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

    // Get all versions
    const versions = db.queryEntries<{
      codigo: string;
      nombre: string;
      idioma: string;
      descripcion: string;
    }>(`
      SELECT 
        codigo,
        nombre,
        idioma,
        descripcion
      FROM versiones
      ORDER BY codigo
    `);

    db.close();

    return new Response(
      JSON.stringify({ versions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching versions:', error);
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
