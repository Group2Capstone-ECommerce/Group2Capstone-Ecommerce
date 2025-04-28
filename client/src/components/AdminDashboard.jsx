import { useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";
import ViewUsersTab from "../components/ViewUsersTab.jsx"
//import AddEditProductsTab from ...


export default function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <p className="access-denied">Access Denied. Admins Only.</p>
  }

  return (
  
      <div className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>

          {/*Tab Buttons*/}
          <div className="tab-buttons">
        <NavLink
          to="users"
          className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}
        >
          View Users
        </NavLink>
        {/* <NavLink to="add-products" className="tab-button">Add/Edit Products</NavLink> */}
      </div>

      {/* Nested Routes */}
      <div className="tab-content">
        <Routes>
          <Route path="users" element={<ViewUsersTab />} />
          {/* <Route path="add-products" element={<AddEditProductsTab />} /> */}
          <Route path="*" element={<p>Select a tab above.</p>} />
        </Routes>
      </div>
    </div>
  );
}