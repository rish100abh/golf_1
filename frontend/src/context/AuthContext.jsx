// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// export const formatApiErrorDetail = (detail) => {
//   if (!detail) return 'Something went wrong. Please try again.';
//   if (typeof detail === 'string') return detail;
//   if (Array.isArray(detail)) {
//     return detail.map((e) => e?.msg || JSON.stringify(e)).join(' ');
//   }
//   if (detail?.msg) return detail.msg;
//   return String(detail);
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const checkAuth = async () => {
//     try {
//       const { data } = await axios.get(`${BACKEND_URL}/api/auth/me`, {
//         withCredentials: true,
//       });
//       setUser(data?.user || data || null);
//     } catch (error) {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const { data } = await axios.post(
//         `${BACKEND_URL}/api/auth/login`,
//         credentials,
//         { withCredentials: true }
//       );

//       setUser(data?.user || data || null);
//       return data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const { data } = await axios.post(
//         `${BACKEND_URL}/api/auth/register`,
//         userData,
//         { withCredentials: true }
//       );

//       setUser(data?.user || data || null);
//       return data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post(
//         `${BACKEND_URL}/api/auth/logout`,
//         {},
//         { withCredentials: true }
//       );
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setUser(null);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         register,
//         logout,
//         checkAuth,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const formatApiErrorDetail = (detail) => {
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e?.msg || JSON.stringify(e)).join(' ');
  }
  if (detail?.msg) return detail.msg;
  return String(detail);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data?.user || data || null);
      return data?.user || data || null;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data?.user || data || null);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data?.user || data || null);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => {
    return {
      user,
      loading,
      login,
      register,
      logout,
      checkAuth,
      isAuthenticated: !!user,
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);