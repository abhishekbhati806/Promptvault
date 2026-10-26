import { useEffect, useState } from 'react';
import AuthContext from './auth-context.js';
import { fetchCurrentUser } from '../utils/auth.js';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('promptvault_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!token) {
      return () => {
        active = false;
      };
    }

    fetchCurrentUser(token)
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem('promptvault_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function login(accessToken, currentUser) {
    localStorage.setItem('promptvault_token', accessToken);
    setToken(accessToken);
    setUser(currentUser);
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem('promptvault_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
