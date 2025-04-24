import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

export default function Logout() {
  const {token, setToken} = useAuth();
  let navigate = useNavigate();

  useEffect(() => {
    const logUserOut = () => {
      setToken("");
      navigate('/');
    }
    logUserOut();
  }, []);
}