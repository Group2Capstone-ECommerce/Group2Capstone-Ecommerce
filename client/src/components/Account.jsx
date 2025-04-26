import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const [user, setUser] = useState(null);
  const { token, setToken } = useAuth();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const USER_API_URL = "http://localhost:3000/api/users/me";
  const UPDATE_EMAIL_API_URL = "http://localhost:3000/api/users/me";

  const navigate = useNavigate();
  
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
    </>
  );
}