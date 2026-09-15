import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import initSqlJs, { type Database } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { getCachedDB, saveToCache } from "@/lib/db-cache";
import { DB_URL, DB_VERSION } from "@/config/db-version";

export type SqliteParameter = string | number | Uint8Array | null;
export type SqliteQuery = <T = Record<string, unknown>>(
  sql: string,
  params?: SqliteParameter[],
) => T[];

export interface SqliteDbContextValue {
  db: Database | null;
  loading: boolean;
  progress: number;
  error: string | null;
  query: SqliteQuery;
  fromCache: boolean;
}

export const SqliteDbContext = createContext<SqliteDbContextValue | null>(null);

let sqlJsPromise: ReturnType<typeof initSqlJs> | null = null;

function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: () => sqlWasmUrl,
    });
  }

  return sqlJsPromise;
}

async function openDatabase(data: Uint8Array): Promise<Database> {
  const SQL = await getSqlJs();
  return new SQL.Database(data);
}

interface SqliteDbProviderProps {
  children: ReactNode;
}

export function SqliteDbProvider({ children }: SqliteDbProviderProps) {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const dbRef = useRef<Database | null>(null);

  useEffect(() => {
    let cancelled = false;

    const publishDatabase = (database: Database, cached: boolean) => {
      if (cancelled) {
        database.close();
        return false;
      }

      dbRef.current = database;
      setDb(database);
      setFromCache(cached);
      setProgress(100);
      setLoading(false);
      return true;
    };

    const initializeDatabase = async () => {
      setLoading(true);
      setProgress(0);
      setError(null);

      const cached = await getCachedDB();

      try {
        // 1. Usar directamente la versión persistida si ya es la actual.
        if (cached?.version === DB_VERSION) {
          console.log("✓ Cargando DB desde caché local");
          const database = await openDatabase(cached.data);
          publishDatabase(database, true);
          return;
        }

        // 2. Descargar la versión solicitada manteniendo la anterior como fallback.
        console.log("Descargando DB desde servidor...");
        if (!cancelled) {
          setFromCache(false);
        }

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
          if (cancelled) {
            await reader.cancel();
            return;
          }

          chunks.push(value);
          receivedLength += value.length;

          if (total > 0) {
            setProgress(Math.round((receivedLength / total) * 100));
          }
        }

        const dbBuffer = new Uint8Array(receivedLength);
        let position = 0;

        for (const chunk of chunks) {
          dbBuffer.set(chunk, position);
          position += chunk.length;
        }

        // Abrir primero valida que los bytes recibidos correspondan a una SQLite válida.
        const database = await openDatabase(dbBuffer);

        // El Service Worker puede responder con una DB anterior sin la versión solicitada.
        // Se puede usar durante esta sesión, pero no debe persistirse como DB_VERSION actual.
        if (new URL(response.url).searchParams.get("v") !== DB_VERSION) {
          console.warn("Usando DB previa desde la caché runtime mientras no hay red");
          publishDatabase(database, true);
          return;
        }

        try {
          await saveToCache(dbBuffer);
        } catch (cacheError) {
          database.close();
          throw cacheError;
        }

        if (publishDatabase(database, false)) {
          console.log("✓ DB cargada y guardada en caché exitosamente");
        }
      } catch (err) {
        if (cancelled) return;

        if (cached) {
          try {
            console.warn("No se pudo actualizar la DB; usando la copia local previa");
            const database = await openDatabase(cached.data);
            publishDatabase(database, true);
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

    void initializeDatabase();

    return () => {
      cancelled = true;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  const query = useCallback(function query<T = Record<string, unknown>>(
    sql: string,
    params: SqliteParameter[] = [],
  ): T[] {
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
  }, [db]);

  const value = useMemo<SqliteDbContextValue>(() => ({
    db,
    loading,
    progress,
    error,
    query,
    fromCache,
  }), [db, loading, progress, error, query, fromCache]);

  return (
    <SqliteDbContext.Provider value={value}>
      {children}
    </SqliteDbContext.Provider>
  );
}
