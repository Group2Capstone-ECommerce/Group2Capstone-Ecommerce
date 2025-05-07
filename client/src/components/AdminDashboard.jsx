import { useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import EditProductsTab from "./EditProductsTab.jsx";
import ViewUsersTab from "../components/ViewUsersTab.jsx"
import './CSS/adminDashboard.css'

export default function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <p className="access-denied">Access Denied. Admins Only.</p>
  }
  return (
    <div className="admin-container">
    <h1 className="admin-title">Admin Dashboard</h1>

      {/*Tab Buttons*/}
    <ul className="tab-buttons">
      <li><NavLink to="users" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>View Users</NavLink> </li>
      <li><NavLink to="products" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>Add/Edit Products</NavLink></li>  
      {/* <li><p>Select a tab above</p></li> */}
    </ul>

  {/* Nested Routes */}
  <div className="tab-content">
    <Routes>
      <Route path="users" element={<ViewUsersTab />} />
      <Route path="products" element={<EditProductsTab />} />
      <Route path="*" element={<p>Select a tab above</p>} />
    </Routes>
  </div>
</div>
  );
}