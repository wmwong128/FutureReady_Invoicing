import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index.tsx';
import NotFound from './pages/NotFound.tsx';
import { InvoiceForm } from './components/InvoiceForm.tsx';
import './App.css';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ViewInvoice from './components/ViewInvoice.tsx';
import { useAuth0 } from '@auth0/auth0-react';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/new-invoice"
              element={
                <Index overrideContent={<InvoiceForm />} forceTab="invoices" />
              }
            />
            <Route
              path="/invoice/:id/edit"
              element={
                <Index overrideContent={<InvoiceForm />} forceTab="invoices" />
              }
            />
            <Route
              path="/invoice/:id/view"
              element={
                <Index overrideContent={<ViewInvoice />} forceTab="invoices" />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
