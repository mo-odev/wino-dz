import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PostItem from "./pages/PostItem";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import ItemDetails from "./pages/ItemDetails";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import { AuthProvider } from "./hooks/useAuth";
import AllItems from "./pages/AllItem";
import DashboardAdmin from "./pages/DashboardAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/post" element={<PostItem />} />
            <Route path="/post-item" element={<PostItem />} />
            <Route path="/search" element={<Search />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/AllItem" element={<AllItems />} />
            <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
