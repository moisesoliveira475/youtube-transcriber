import { useApp } from "@/context/AppContext";
import { ProcessPage, ResultsPage, SettingsPage, AboutPage } from "@/pages";

export function Router() {
  const { state } = useApp();
  
  switch (state.currentPage) {
    case 'process':
      return <ProcessPage />;
    case 'results':
      return <ResultsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'about':
      return <AboutPage />;
    default:
      return <ProcessPage />;
  }
}
