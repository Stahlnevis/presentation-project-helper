import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EvidenceVault from "./pages/EvidenceVault";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import GeoTracking from "./pages/GeoTracking";
import NotFound from "./pages/NotFound";
import EvidenceIndex from "@/features/evidence-safe/pages/Index";
import EvidenceCapture from "@/features/evidence-safe/pages/Capture";
import ExtensionDownload from "./pages/ExtensionDownload";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/get-extension" element={<ExtensionDownload />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evidence-vault" element={<EvidenceIndex />} />
          <Route path="/evidence-vault/capture" element={<EvidenceCapture />} />
          <Route path="/threat-intelligence" element={<ThreatIntelligence />} />
          <Route path="/geo-tracking" element={<GeoTracking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
