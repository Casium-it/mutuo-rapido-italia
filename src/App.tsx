
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FormProvider } from "@/contexts/FormContext";
import { allBlocks } from "@/data/blocks";
import SimulazioneAvanzata from "./pages/SimulazioneAvanzata";
import Form from "./pages/Form";
import FormCompleted from "./pages/FormCompleted";
import FormLoading from "./pages/FormLoading";
import ResumeSimulation from "./pages/ResumeSimulation";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Simulazioni from "./pages/Simulazioni";
import Home from "./pages/Home";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulazione-avanzata" element={<SimulazioneAvanzata />} />
            <Route path="/simulazione-avanzata/:slug" element={<SimulazioneAvanzata />} />
            <Route path="/riprendi-simulazione" element={<ResumeSimulation />} />
            <Route path="/simulazione/:blockType/:blockId/:questionId" element={
              <FormProvider blocks={allBlocks}>
                <Form />
              </FormProvider>
            } />
            <Route path="/form-loading" element={<FormLoading />} />
            <Route path="/form-completed" element={<FormCompleted />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/simulazioni" element={<Simulazioni />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
