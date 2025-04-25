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

        const fetchUser = async () => {
            try {
                const response = await fetch(ADMIN_USERS_URL);
                const data = await response.json();
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
            <p>Logged in as: {user?.email}</p>

            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <ul>
                {users.map((user) => (
                  <li key={user.id}>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><srtong>Role:</srtong> {user.role}</p>
                  </li>
            ))}
        </ul>
            )}
        </div>
    );
}