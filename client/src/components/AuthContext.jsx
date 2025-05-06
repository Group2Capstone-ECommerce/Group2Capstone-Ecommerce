import { useState, createContext, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [token, setToken] = useState(null);
  //database users table named is_admin
  const [isAdmin, setIsAdmin] = useState(false);

  //not getting the accurate info
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider 
    value={{ token, setToken, isAdmin, setIsAdmin, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}