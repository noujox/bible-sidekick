import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SqliteDbProvider } from "@/providers/SqliteDbProvider";

createRoot(document.getElementById("root")!).render(
  <SqliteDbProvider>
    <App />
  </SqliteDbProvider>,
);
