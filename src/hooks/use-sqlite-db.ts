import { useContext } from "react";
import { SqliteDbContext } from "@/providers/SqliteDbProvider";

export function useSqliteDb() {
  const context = useContext(SqliteDbContext);

  if (!context) {
    throw new Error("useSqliteDb debe usarse dentro de SqliteDbProvider");
  }

  return context;
}
