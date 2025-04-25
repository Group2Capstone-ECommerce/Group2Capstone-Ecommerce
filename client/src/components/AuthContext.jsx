import { useState, createContext, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  return (
    <AuthContext.Provider value={{ token, setToken, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}