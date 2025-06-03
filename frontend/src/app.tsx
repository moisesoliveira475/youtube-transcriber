import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/Navigation";
import { Router } from "@/components/Router";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/context/AppContext";

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <main>
          <Router />
        </main>
        <Toaster />
      </div>
    </AppProvider>
  );
}

export default App;
