// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { Toaster } from "sonner";

// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import Dashboard from './pages/Dashboard';
// import AdminDashboard from './pages/AdminDashboard';
// import CharitiesPage from './pages/CharitiesPage';

// import './index.css';

// // 🔹 Loader
// const Loader = () => (
//   <div style={{
//     minHeight: "100vh",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "20px",
//     fontWeight: "bold",
//   }}>
//     Loading... 🔄
//   </div>
// );

// // 🔒 Protected Route
// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const auth = useAuth();

//   // ✅ SAFE CHECK (prevents crash)
//   if (!auth) return <Loader />;

//   const { user, loading } = auth;

//   if (loading) return <Loader />;

//   if (!user) return <Navigate to="/login" replace />;

//   if (adminOnly && user.role !== 'admin') {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// // 🌐 Public Route
// const PublicRoute = ({ children }) => {
//   const auth = useAuth();

//   // ✅ SAFE CHECK
//   if (!auth) return <Loader />;

//   const { user, loading } = auth;

//   if (loading) return <Loader />;

//   if (user) {
//     return (
//       <Navigate
//         to={user.role === 'admin' ? '/admin' : '/dashboard'}
//         replace
//       />
//     );
//   }

//   return children;
// };

// // 📍 Routes
// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<LandingPage />} />
//       <Route path="/charities" element={<CharitiesPage />} />

//       <Route path="/login" element={
//         <PublicRoute>
//           <LoginPage />
//         </PublicRoute>
//       } />

//       <Route path="/register" element={
//         <PublicRoute>
//           <RegisterPage />
//         </PublicRoute>
//       } />

//       <Route path="/dashboard" element={
//         <ProtectedRoute>
//           <Dashboard />
//         </ProtectedRoute>
//       } />

//       <Route path="/admin" element={
//         <ProtectedRoute adminOnly={true}>
//           <AdminDashboard />
//         </ProtectedRoute>
//       } />

//       {/* fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// // 🚀 Main App
// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//         <Toaster position="top-right" richColors />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { Toaster } from 'sonner';
// import { motion } from 'framer-motion';
// import { ShieldCheck, LoaderCircle } from 'lucide-react';

// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import Dashboard from './pages/Dashboard';
// import AdminDashboard from './pages/AdminDashboard';
// import CharitiesPage from './pages/CharitiesPage';

// import './index.css';

// /* ----------------------------- Loader ----------------------------- */
// const Loader = ({ message = 'Loading your experience...' }) => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-6">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.96, y: 12 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//         className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl p-10 text-center"
//       >
//         <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/20">
//           <LoaderCircle className="h-8 w-8 text-emerald-300 animate-spin" />
//         </div>

//         <div className="flex items-center justify-center gap-2 mb-3">
//           <ShieldCheck className="h-5 w-5 text-emerald-300" />
//           <h2 className="text-xl font-semibold text-white tracking-tight">
//             Golf Give
//           </h2>
//         </div>

//         <p className="text-sm text-slate-300 leading-6">
//           {message}
//         </p>

//         <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
//           <motion.div
//             initial={{ x: '-100%' }}
//             animate={{ x: '100%' }}
//             transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
//             className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
//           />
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// /* ------------------------- Protected Route ------------------------ */
// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const auth = useAuth();

//   if (!auth) {
//     return <Loader message="Preparing secure session..." />;
//   }

//   const { user, loading } = auth;

//   if (loading) {
//     return <Loader message="Checking authentication..." />;
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (adminOnly && user.role !== 'admin') {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// /* --------------------------- Public Route ------------------------- */
// const PublicRoute = ({ children }) => {
//   const auth = useAuth();

//   if (!auth) {
//     return <Loader message="Initializing application..." />;
//   }

//   const { user, loading } = auth;

//   if (loading) {
//     return <Loader message="Verifying user access..." />;
//   }

//   if (user) {
//     return (
//       <Navigate
//         to={user.role === 'admin' ? '/admin' : '/dashboard'}
//         replace
//       />
//     );
//   }

//   return children;
// };

// /* ----------------------------- Routes ----------------------------- */
// function AppRoutes() {
//   return (
//     <Routes>
//       {/* Public pages */}
//       <Route path="/" element={<LandingPage />} />
//       <Route path="/charities" element={<CharitiesPage />} />

//       {/* Auth pages */}
//       <Route
//         path="/login"
//         element={
//           <PublicRoute>
//             <LoginPage />
//           </PublicRoute>
//         }
//       />

//       <Route
//         path="/register"
//         element={
//           <PublicRoute>
//             <RegisterPage />
//           </PublicRoute>
//         }
//       />

//       {/* Protected user pages */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />

//       {/* Protected admin page */}
//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute adminOnly>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />

//       {/* Fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// /* ------------------------------ App ------------------------------- */
// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <div className="min-h-screen bg-background text-foreground antialiased">
//           <AppRoutes />
//           <Toaster
//             position="top-right"
//             richColors
//             closeButton
//             toastOptions={{
//               className:
//                 'rounded-2xl border border-slate-200 shadow-xl bg-white text-slate-900',
//             }}
//           />
//         </div>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { ShieldCheck, LoaderCircle } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CharitiesPage from './pages/CharitiesPage';

import './index.css';

const Loader = ({ message = 'Loading your experience...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl p-10 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/20">
          <LoaderCircle className="h-8 w-8 text-emerald-300 animate-spin" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Golf Give
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-6">{message}</p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
          />
        </div>
      </motion.div>
    </div>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying user access..." />;
  }

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin' : '/dashboard'}
        replace
      />
    );
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      <Route
        path="/charities"
        element={
          <PublicRoute>
            <CharitiesPage />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <AppRoutes />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className:
                'rounded-2xl border border-slate-200 shadow-xl bg-white text-slate-900',
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;