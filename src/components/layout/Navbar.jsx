import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Home, User, Stethoscope, Store, LogOut, FileText, Bot, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userRole } = useAuth(); // Import real auth bindings
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const path = location.pathname;
  let portal = 'Patient';
  if (userRole === 'doctor' || path.includes('/doctor')) portal = 'Doctor';
  if (userRole === 'pharmacist' || path.includes('/pharmacy')) portal = 'Pharmacy';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const getNavLinks = () => {
    switch (portal) {
      case 'Doctor':
        return [
          { to: '/doctor-dashboard', label: 'Dashboard', icon: <Home size={20} /> },
          { to: '/doctor-dashboard/consultations', label: 'Consultations', icon: <Stethoscope size={20} /> },
          { to: '/doctor-dashboard/prescriptions', label: 'Prescriptions', icon: <Stethoscope size={20} /> },
        ];
      case 'Pharmacy':
        return [
          { to: '/pharmacy-dashboard', label: 'Dashboard', icon: <Home size={20} /> },
          { to: '/pharmacy-dashboard/inventory', label: 'Inventory', icon: <Store size={20} /> },
        ];
      case 'Patient':
      default:
        return [
          { to: '/patient-dashboard', label: t('home'), icon: <Home size={20} /> },
          { to: '/patient-dashboard/symptom-checker', label: t('symptoms'), icon: <Stethoscope size={20} /> },
          { to: '/patient-dashboard/bookings', label: t('bookings'), icon: <User size={20} /> },
          { to: '/patient-dashboard/records', label: t('records'), icon: <FileText size={20} /> },
          { to: '/patient-dashboard/pharmacies', label: t('pharmacies'), icon: <Store size={20} /> },
          { to: '/patient-dashboard/health-assistant', label: t('healthAssistant'), icon: <Bot size={20} /> },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-logo">SehatLink</span>
          <span className="brand-portal">{portal} Portal</span>
          <span className="brand-tagline desktop-only">"Connecting Care, Anywhere"</span>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-only">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
          <div className="language-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            <Globe size={20} />
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              style={{
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', cursor: 'pointer', color: 'white',
              fontWeight: '600', fontSize: '14px',
              padding: '8px 18px', borderRadius: '24px',
              boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
              transition: 'all 0.25s ease',
              marginLeft: '8px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.35)'; }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
          <div className="mobile-nav-link" style={{ borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
              <Globe size={20} />
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  flex: 1
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: 'calc(100% - 32px)', margin: '8px 16px',
              padding: '14px 20px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', cursor: 'pointer', color: 'white',
              fontWeight: '600', fontSize: '15px',
              boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
