import { BrowserRouter, Routes, Route } from "react-router-dom";;
import Index from "./pages/Index.tsx";;
import NotFound from "./pages/NotFound.tsx";;
import { InvoiceForm } from "./components/InvoiceForm.tsx";
import './App.css';
import LoginButton from './components/Login';
import LogoutButton from './components/Logout';
import Profile from './components/Profile';
import useMachine from './hooks/useMachine';
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ViewInvoice from "./components/ViewInvoice.tsx";
import { useAuth0 } from "@auth0/auth0-react";

const queryClient = new QueryClient();

function App() {
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard"); // Add state management for activeTab & setActiveTab variables
  const backendMachine = useMachine({
    url: import.meta.env.VITE_BACKEND_MAIN_URL,
  });
  const aiMachine = useMachine({
    url: import.meta.env.VITE_AI_MAIN_URL,
  });
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>

        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/new-invoice" element={<Index overrideContent={<InvoiceForm/>} forceTab="invoices"/>} />
            <Route path="/invoice/:id/edit" element={<Index overrideContent={<InvoiceForm/>} forceTab="invoices"/>} />
            <Route path="/invoice/:id/view" element={<Index overrideContent={<ViewInvoice/>} forceTab="invoices"/>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} /> 
        </Routes>
        
          
         
      {/* <Profile></Profile>
      <LoginButton></LoginButton>
      <LogoutButton></LogoutButton> */}
    
      
      {/* <h2>Backend Service Data: </h2>
      {backendMachine.data}
      <h2>AI Service Data: </h2>
      {aiMachine.data} */}



        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
