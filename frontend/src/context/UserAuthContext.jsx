// UserAuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const UserAuthContext = createContext();
const USER_KEY = "user_auth_v1";

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function login({ email }) {
    const userData = { email };
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }

  return (
    <UserAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}
