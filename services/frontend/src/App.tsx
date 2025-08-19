import { BrowserRouter, Routes, Route } from "react-router-dom";;
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { InvoiceManagement } from "./components/InvoiceManagement";
import { ClientManagement } from "./components/ClientManagement";
import { InvoiceUpload } from "./components/InvoiceUpload";
import Index from "./pages/Index.tsx";;
import NotFound from "./pages/NotFound.tsx";;
import './App.css';
import LoginButton from './components/Login';
import LogoutButton from './components/Logout';
import Profile from './components/Profile';
import useMachine from './hooks/useMachine';
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
//import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "invoices" && <InvoiceManagement />}
            {activeTab === "clients" && <ClientManagement />}
            {activeTab === "upload" && <InvoiceUpload />}
          </Layout>
          
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
          </div>

          <Profile />
          <LoginButton />
          <LogoutButton />

          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
