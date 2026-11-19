import { useEffect, useRef, useState } from 'react';
import AuthContext from './auth-context.js';
import { fetchCurrentUser, getStoredToken, setStoredToken } from '../utils/auth.js';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));
  const skipVerifyTokenRef = useRef(null);

  useEffect(() => {
    let active = true;

    if (!token) {
      return () => {
        active = false;
      };
    }

    // Skip redundant /me call right after interactive login (we already have fresh user).
    if (skipVerifyTokenRef.current === token) {
      skipVerifyTokenRef.current = null;
      return () => {
        active = false;
      };
    }

    fetchCurrentUser(token)
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        setStoredToken(null);
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
    skipVerifyTokenRef.current = accessToken;
    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(currentUser);
    setLoading(false);
  }

  function logout() {
    skipVerifyTokenRef.current = null;
    setStoredToken(null);
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
