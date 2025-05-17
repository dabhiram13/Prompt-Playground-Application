import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { useAnalytics } from "./hooks/use-analytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Check if Google Analytics ID is available
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA();
    } else {
      console.warn('Missing Google Analytics Measurement ID. Analytics tracking is disabled.');
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
