import { useState } from "react";
import { useAuth } from "../components/AuthContext.jsx";
import ViewUsersTab from "../components/ViewUsersTab.jsx"
//import AddEditProductsTab from ...


export default function AdminDashboard() {
  const { isAdmin, setIsAdmin } = useAuth();
  const tabs = ["View Users", "Add/Edit Products"];
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <>
      <div className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>

        {!isAdmin ? (
          <p className="access-denied">Access Denied. Admins Only.</p>
        ) : (
          <>
          {/*Tab Buttons*/}
          <div className="tab-buttons">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? "active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/*Tab Content*/}
          <div className="tab-content">
            {activeTab === "View Users" && <ViewUsersTab />}
          </div>
          </>
        )}
      </div>
    </>
  );
}