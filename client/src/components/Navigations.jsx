import { Link } from "react-router-dom"
import { useAuth } from "../components/AuthContext.jsx";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function Navigations() {
  const {token} = useAuth();
  const {isAdmin, setIsAdmin} = useAuth()
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users/me', {
          method:'GET',
          headers:{
              Authorization: `Bearer ${token}`,
          },
      });
        const result = await response.json();
        console.log('fetch user result =>', result);
        if (!response.ok) {
          return toast.error('No user found!');
        }
        setIsAdmin(result.is_admin); //Set admin status
      } catch (error) {
        toast.error('Something went wrong when fetching user!');
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token, setIsAdmin]); //Only runs when token changes
  console.log('token is =>', token)
  console.log('Is admin: =>', isAdmin)

  return (
    <>
      <div id="navBar">
        <div className="navLinks">
        <Link to="/">Products</Link>
        {!token && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {token && !isAdmin && (
          <>
          <Link to="/cart">Cart</Link>
          <Link to="/account">My Account</Link>
          </>
        ) }
        {token && isAdmin && <Link to="/admin">Admin Dashboard</Link>}

        {token && <Link to="/logout">Log Out</Link>}
        </div>
      </div>
    </>
  )
};