import { useState, useEffect } from "react";
import initSqlJs, { Database } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { getCachedDB, saveToCache } from "@/lib/db-cache";
import { DB_URL, DB_VERSION } from "@/config/db-version";

type SqliteParameter = string | number | Uint8Array | null;

export function useSqliteDb() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const openDatabase = async (data: Uint8Array) => {
    const SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl,
    });

    return new SQL.Database(data);
  };

  const initializeDatabase = async () => {
    const cached = await getCachedDB();

    try {
      setLoading(true);
      setProgress(0);

      // 1. Cargar la versión actual desde IndexedDB
      if (cached?.version === DB_VERSION) {
        console.log("✓ Cargando DB desde caché local");
        setFromCache(true);
        const database = await openDatabase(cached.data);
        setDb(database);
        setLoading(false);
        return;
      }

      // 2. Descargar la nueva versión, manteniendo la anterior como fallback.
      console.log("Descargando DB desde servidor...");
      setFromCache(false);
      
      const response = await fetch(DB_URL);
      
      if (!response.ok) {
        throw new Error(`Error al descargar DB: ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo leer la respuesta");
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        if (total > 0) {
          const percent = Math.round((receivedLength / total) * 100);
          setProgress(percent);
        }
      }

      // Combinar todos los chunks
      const dbBuffer = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        dbBuffer.set(chunk, position);
        position += chunk.length;
      }

      // Validar la DB antes de reemplazar la copia persistida.
      const database = await openDatabase(dbBuffer);

      // El fallback runtime puede contener una DB anterior sin versión. Sirve para
      // esta sesión, pero no debe marcarse como la DB_VERSION solicitada.
      if (new URL(response.url).searchParams.get("v") !== DB_VERSION) {
        console.warn("Usando DB previa desde la caché runtime mientras no hay red");
        setFromCache(true);
        setDb(database);
        setLoading(false);
        return;
      }

      try {
        await saveToCache(dbBuffer);
      } catch (error) {
        database.close();
        throw error;
      }

      setDb(database);
      setLoading(false);
      console.log("✓ DB cargada y guardada en caché exitosamente");
    } catch (err) {
      if (cached) {
        try {
          console.warn("No se pudo actualizar la DB; usando la copia local previa");
          const database = await openDatabase(cached.data);
          setFromCache(true);
          setDb(database);
          setLoading(false);
          return;
        } catch (cacheError) {
          console.error("Error al abrir la copia local previa:", cacheError);
        }
      }

      console.error("Error al inicializar la base de datos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  const query = <T = Record<string, unknown>>(sql: string, params: SqliteParameter[] = []): T[] => {
    if (!db) return [];
    
    try {
      const results = db.exec(sql, params);
      
      if (results.length === 0) return [];
      
      const { columns, values } = results[0];
      
      return values.map((row) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj as T;
      });
    } catch (err) {
      console.error("Error ejecutando query:", sql, err);
      return [];
    }
  };

  return { db, loading, progress, error, query, fromCache };
}
