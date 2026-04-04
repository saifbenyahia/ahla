import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Home.css';

const Navbar = ({ onNavigate, isAuthenticated, onLogout, activeTab }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = storedUser.name || 'Utilisateur';
  const userEmail = storedUser.email || '';
  const userInitials = userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateProject = () => {
    if (isAuthenticated) {
      onNavigate('startProject');
    } else {
      onNavigate('signIn', 'Vous devez etre connecte pour creer un projet.');
    }
    setIsMobileMenuOpen(false);
  };

  const handleMenuNavigate = (view) => {
    setIsMobileMenuOpen(false);
    onNavigate(view);
  };

  return (
    <nav className={`navbar ${isMobileMenuOpen ? 'nav-open' : ''}`} style={{ zIndex: 110, position: 'relative' }}>
      <div className="nav-left">
        <h1 className="nav-logo" onClick={() => handleMenuNavigate('home')}>Hive.tn</h1>
      </div>

      <button
        type="button"
        className={`nav-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
        aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-mobile-panel ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="nav-center">
          <span className={`nav-link ${activeTab === 'discover' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleMenuNavigate('discover')}>Decouvrir</span>
          <span className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleMenuNavigate('home')}>Accueil</span>
          <span className={`nav-link ${activeTab === 'startProject' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={handleCreateProject}>Lancer un projet</span>
        </div>

        <div className="nav-right">
          {!isAuthenticated ? (
            <>
              <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleMenuNavigate('signIn')}>Connexion</span>
              <button className="nav-btn-solid" onClick={() => handleMenuNavigate('signUp')}>S'inscrire</button>
            </>
          ) : (
            <div className="user-profile-container" ref={menuRef}>
              <div
                className="user-avatar"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: storedUser.avatar ? 'none' : 'linear-gradient(135deg, #0ce688, #0ab56b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#0b0f19',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                {storedUser.avatar ? (
                  <img src={storedUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  userInitials
                )}
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <strong>{userName}</strong>
                    <span className="text-small" style={{ color: '#a1a1aa', fontSize: '13px' }}>{userEmail}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={() => handleMenuNavigate('profile')}>Profil</div>
                  <div className="dropdown-item" onClick={() => handleMenuNavigate('settings')}>Parametres</div>
                  <div className="dropdown-item" onClick={() => handleMenuNavigate('saved')}>Enregistrements</div>
                  <div className="dropdown-divider"></div>
                  <div
                    className="dropdown-item text-danger"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    Deconnexion
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
