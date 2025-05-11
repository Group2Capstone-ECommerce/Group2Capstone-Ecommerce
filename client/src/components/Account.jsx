import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import './CSS/myAccount.css'

export default function Account() {
  const [user, setUser] = useState(null);
  const { token, setToken } = useAuth();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [orders, setOrders] = useState([]);

  const USER_ORDERS_API_URL = "http://localhost:3000/api/orders/me";
  const USER_API_URL = "http://localhost:3000/api/users/me";
  const UPDATE_EMAIL_API_URL = "http://localhost:3000/api/users/me";

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      // Redirect to login page if user is not logged in
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(USER_ORDERS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log(data);
        
        if (res.ok) {
          setOrders(Array.isArray(data) ? data : data.orders || []);
        } else {
          setError(data.error || "Failed to fetch orders.");
        }
      } catch (err) {
        setError("An error occurred while fetching the orders for the user.");
      }
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    if (!token) {
      // Redirect to login page if user is not logged in
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(USER_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
          setEmail(data.email); // Prepopulate the email
        } else {
          setError(data.error || "Failed to fetch user.");
        }
      } catch (err) {
        setError("An error occurred while fetching the user.");
      }
    };

    fetchUser();
  }, [token]);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(UPDATE_EMAIL_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update the user state with the new email
        setUser((prevUser) => ({
          ...prevUser,
          email: email, // Update email to the new value
        }));
        setUpdateMessage(data.message || "Email updated successfully.");
        setTimeout(() => {
          setUpdateMessage("");
        }, 3000);
      } else {
        setUpdateMessage(data.error || "Error updating email.");
      }
    } catch (err) {
      setUpdateMessage("An error occurred while updating email.");
    }
  };

  return (
    <>
    <div className="accountContainer">
      <div id="accountContainer">
        <div id="userAccountInfo">
          <h1>Account Info</h1>
          <p><b>Username: </b>{user ? user.username : ""}</p>
          <p><b>Email: </b>{user ? user.email : ""}</p>
        </div>

        <form onSubmit={handleUpdateEmail}>
          <div>
            <label htmlFor="email">Update Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <br/>
          <button type="submit">Update Email</button>
        </form>

        {updateMessage && <p>{updateMessage}</p>}
        {error && <p>{error}</p>}
      </div>
      <div id="ordersContainer">
        <h1>Orders</h1>
        {orders.length === 0 ? 
          (
            <h2>There are no orders for this user.</h2>
          ) : 
          (
            <ul>
              {orders.map( (order) => (
                <li key={order.id}>
                  <p><strong>Order #{order.id}</strong></p>
                  <p>Date: {order.created_at}</p>
                  <p>Status: {order.status}</p>
                  <p>Price: ${order.total_price}</p>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
      
    </>
  );
}