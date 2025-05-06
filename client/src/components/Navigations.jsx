import { Link } from "react-router-dom"
import { useAuth } from "../components/AuthContext.jsx";

export default function Navigations() {
  const {token, setToken} = useAuth();
  const {isAdmin, setIsAdmin} = useAuth();

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