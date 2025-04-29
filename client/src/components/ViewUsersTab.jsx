// Admin view users tab

import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext.jsx";

export default function ViewUsersTab() {
    const { isAdmin, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const ADMIN_USERS_URL = "http://localhost:3000/api/admin/users";

    useEffect(() => {
        if (!isAdmin) return;

        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token"); 
                console.log("Token from localStorage:", token);  // Check if token exists
        
                if (!token) {
                    throw new Error("Token is missing.");
                }
        
                const response = await fetch(ADMIN_USERS_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include', // only if your backend expects cookies/session
                });
        
                console.log("Response status:", response.status);
        
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }
        
                const data = await response.json();
                console.log("Fetched users:", data);
        
                if (!Array.isArray(data)) throw new Error("Invalid user data");
                setUsers(data);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [isAdmin]);

    if (!isAdmin) {
        return <p>Access denied. Admins only</p>;
    }

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <h2>View Users</h2>
            {/* <p>Logged in as: {user?.username}</p> */}

            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <ul>
                {users.map((user) => (
                  <li key={user.id}>
                    <p><strong>Name:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.is_admin ? "Admin" : "User"}</p>
                  </li>
            ))}
        </ul>
            )}
        </div>
    );
}