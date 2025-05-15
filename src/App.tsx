
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FormProvider } from "./contexts/FormContext";
import { allBlocks } from "./data/blocks"; // Aggiornato per usare la nuova struttura
import Index from "./pages/Index";
import SimulazioneAvanzata from "./pages/SimulazioneAvanzata";
import Form from "./pages/Form";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/simulazione-avanzata" element={<SimulazioneAvanzata />} />
          <Route 
            path="/simulazione/:blockType" 
            element={
              <FormProvider blocks={allBlocks}>
                <Form />
              </FormProvider>
            } 
          />
          <Route
            path="/simulazione/:blockType/:blockId"
            element={
              <FormProvider blocks={allBlocks}>
                <Form />
              </FormProvider>
            }
          />
          <Route
            path="/simulazione/:blockType/:blockId/:questionId"
            element={
              <FormProvider blocks={allBlocks}>
                <Form />
              </FormProvider>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
