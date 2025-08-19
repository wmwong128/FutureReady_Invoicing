import { BrowserRouter, Routes, Route } from "react-router-dom";;
import Index from "./pages/Index.tsx";;
import NotFound from "./pages/NotFound.tsx";;
import './App.css';
import LoginButton from './components/Login';
import LogoutButton from './components/Logout';
import Profile from './components/Profile';
import useMachine from './hooks/useMachine';
import { useState } from "react";
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';


function App() {
  const [count, setCount] = useState(0);
  const backendMachine = useMachine({
    url: import.meta.env.VITE_BACKEND_MAIN_URL,
  });
  const aiMachine = useMachine({
    url: import.meta.env.VITE_AI_MAIN_URL,
  });

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <Profile></Profile>
      <LoginButton></LoginButton>
      <LogoutButton></LogoutButton>
      <h2>Backend Service Data: </h2>
      {backendMachine.data}
      <h2>AI Service Data: </h2>
      {aiMachine.data}
    

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>

    </>
  );
}


// // import { Toaster } from "@/components/ui/toaster";
// import { Toaster } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index.tsx";
// import NotFound from "./pages/NotFound.tsx";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Toaster />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Index />} />
//           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

export default App;
