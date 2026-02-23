// src/context/UserAuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const UserAuthContext = createContext();

// Storage keys (keep consistent everywhere)
const USER_KEY = "user";
const TOKEN_KEY = "token";

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user + token on app start (page refresh safe)
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  /**
   * ✅ Login using backend response
   * login({ user, token })
   */
  function login({ user, token }) {
    setUser(user);
    setToken(token);

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * ✅ Logout everywhere
   */
  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  return (
    <UserAuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}
