import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FarmProvider } from './contexts/FarmContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';

// App Pages
import Layout from './components/layout/layout';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import HealthRecords from './pages/HealthRecords';
import Production from './pages/Production';
import Reports from './pages/Reports';

import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Genealogy from './pages/Genealogy';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <FarmProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="animals" element={<Animals />} />
                <Route path="health-records" element={<HealthRecords />} />
                <Route path="production" element={<Production />} />
                <Route path="reports" element={<Reports />} />
                <Route path="genealogy" element={<Genealogy/>} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Redirect and 404 */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FarmProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;