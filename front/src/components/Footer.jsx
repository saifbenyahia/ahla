import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <div className="hive-footer-wrapper">
      <footer className="hive-footer">
        
        <div className="hive-footer-top">
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Hive.tn</Link>
            <p className="footer-tagline">
              Propulsez les projets communautaires et donnez vie aux idées innovantes en Tunisie.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Twitter" rel="noopener noreferrer">
                𝕏
              </a>
              <a href="#" className="social-link" aria-label="Instagram" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Découverte */}
          <nav className="footer-nav-col" aria-label="Découverte">
            <h4 className="footer-col-title">Découverte</h4>
            <ul className="footer-nav-list">
              <li><Link to="/discover" className="footer-nav-link">Explorer les projets</Link></li>
              <li><Link to="/discover?filter=popular" className="footer-nav-link">Projets populaires</Link></li>
              <li><Link to="/discover?filter=categories" className="footer-nav-link">Catégories</Link></li>
            </ul>
          </nav>

          {/* Column 3: Créateurs */}
          <nav className="footer-nav-col" aria-label="Créateurs">
            <h4 className="footer-col-title">Créateurs</h4>
            <ul className="footer-nav-list">
              <li><Link to="/start" className="footer-nav-link">Lancer un projet</Link></li>
              <li><Link to="/guide" className="footer-nav-link">Guide du créateur</Link></li>
              <li><Link to="/rules" className="footer-nav-link">Règles et éligibilité</Link></li>
            </ul>
          </nav>

          {/* Column 4: Légal & Support */}
          <nav className="footer-nav-col" aria-label="Légal et Support">
            <h4 className="footer-col-title">Légal & Support</h4>
            <ul className="footer-nav-list">
              <li><Link to="/help" className="footer-nav-link">Centre d'aide</Link></li>
              <li><Link to="/terms" className="footer-nav-link">Conditions générales</Link></li>
              <li><Link to="/privacy" className="footer-nav-link">Confidentialité</Link></li>
            </ul>
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="hive-footer-bottom">
          <div className="footer-copyright">
            &copy; 2026 Hive.tn. Tous droits réservés.
          </div>
          
          <form className="footer-newsletter" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Votre adresse email" 
              className="newsletter-input" 
              required 
              aria-label="Email pour la newsletter"
            />
            <button type="submit" className="newsletter-submit">S'abonner</button>
          </form>
        </div>

      </footer>
    </div>
  );
};

export default Footer;
