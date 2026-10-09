import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ title, items, isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-brand">JobViet</NavLink>
          <span className="sidebar-title">{title}</span>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  end={item.end}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
