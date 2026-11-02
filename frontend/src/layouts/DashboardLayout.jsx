import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { clearAuthSession } from '../services/apiClient';
import './DashboardLayout.css';

export const DashboardLayout = ({ title, sidebarItems }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate(title === 'Nhà Tuyển Dụng' ? '/employer' : '/');
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
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="icon-btn" title="Thông báo">
              <Bell size={20} />
            </button>

            <button
              type="button"
              className="icon-btn logout-header-btn"
              title="Đăng xuất khỏi hệ thống"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
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
            <ToastContainer position="top-right" autoClose={3000} newestOnTop />
          </div>
        </main>
      </div>
    </div>
  );
};
