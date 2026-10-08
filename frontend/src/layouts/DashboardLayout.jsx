import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import './DashboardLayout.css';

export const DashboardLayout = ({ title, sidebarItems }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        title={title} 
        items={sidebarItems} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1 className="dashboard-page-title">{title} Dashboard</h1>
          </div>
          
          <div className="header-right">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile-menu">
              <div className="user-avatar">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>
        
        <main className="dashboard-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
