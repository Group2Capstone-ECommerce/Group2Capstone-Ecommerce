import { Link } from "react-router-dom"

export default function Navigations() {
  return (
    <>
      <div id="navBar">
        <div class="navLinks">
          <Link to="/">Products</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </>
  )
};