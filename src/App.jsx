import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

const THEME_STORAGE_KEY = "socialpilot-theme";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return <AppRoutes />;
}

export default App;