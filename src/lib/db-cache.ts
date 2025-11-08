import { DB_VERSION } from "@/config/db-version";

const DB_NAME = "BibleDB";
const DB_STORE_NAME = "database";
const VERSION_KEY = "db_version";

interface CachedDB {
  version: string;
  data: Uint8Array;
}

export async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
        db.createObjectStore(DB_STORE_NAME);
      }
    };
  });
}

export async function getCachedDB(): Promise<Uint8Array | null> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction([DB_STORE_NAME], "readonly");
    const store = transaction.objectStore(DB_STORE_NAME);

    const versionRequest = store.get(VERSION_KEY);
    const dataRequest = store.get("data");

    const version = await new Promise<string>((resolve, reject) => {
      versionRequest.onsuccess = () => resolve(versionRequest.result);
      versionRequest.onerror = () => reject(versionRequest.error);
    });

    const data = await new Promise<Uint8Array>((resolve, reject) => {
      dataRequest.onsuccess = () => resolve(dataRequest.result);
      dataRequest.onerror = () => reject(dataRequest.error);
    });

    db.close();

    // Verificar versión
    if (version !== DB_VERSION) {
      console.log("Nueva versión de DB disponible, limpiando caché...");
      await clearCache();
      return null;
    }

    return data || null;
  } catch (error) {
    console.error("Error al recuperar DB del caché:", error);
    return null;
  }
}

export async function saveToCache(data: Uint8Array): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction([DB_STORE_NAME], "readwrite");
    const store = transaction.objectStore(DB_STORE_NAME);

    store.put(DB_VERSION, VERSION_KEY);
    store.put(data, "data");

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
    console.log("DB guardada en caché exitosamente");
  } catch (error) {
    console.error("Error al guardar DB en caché:", error);
    throw error;
  }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction([DB_STORE_NAME], "readwrite");
    const store = transaction.objectStore(DB_STORE_NAME);

    store.clear();

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
    console.log("Caché limpiado exitosamente");
  } catch (error) {
    console.error("Error al limpiar caché:", error);
    throw error;
  }
}
