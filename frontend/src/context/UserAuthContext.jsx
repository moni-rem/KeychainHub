import { createContext, useContext, useState } from "react";

const UserAuthContext = createContext();

const USER_KEY = "user_auth_v1";

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  function login(email, password) {
    // fake login (replace with API later)
    if (email && password) {
      const userData = { email };
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    }
    return false;
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
