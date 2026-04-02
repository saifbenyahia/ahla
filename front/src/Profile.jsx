import React, { useState } from 'react';
import './Home.css';
import './Profile.css';
import './Settings.css';
import Navbar from './Navbar';
import ProjectCard from './components/ProjectCard';

const Profile = ({ onNavigate, isAuthenticated, onLogout }) => {
  const [activeTab, setActiveTab] = useState('created');

  // Read user info from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = storedUser.name || 'Utilisateur';
  const userEmail = storedUser.email || '';
  const userInitials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Les projets créés par cet utilisateur
  const createdProjects = [
    {
      id: 2,
      title: "Dar El Harka : Coworking & Artisanat",
      creator: "Par Ayoub B. (Vous)",
      desc: "Rénovation d'une maison historique de la Medina pour la transformer en espace de création pour les jeunes artisans tunisiens.",
      image: "https://images.unsplash.com/photo-1528157777178-0062a444aeb8?w=800&q=80",
      funded: 115,
      collected: "46 000 DT",
      daysLeft: 2,
      category: "Culture & Économie"
    }
  ];

  return (
    <div className="profile-page-wrapper">
      
      {/* Privacy Banner */}
      <div className="profile-privacy-banner">
        <div className="banner-text">
          <span style={{color: '#0ce688', fontSize: '18px'}}>👁️</span> 
          Cette page de profil n'est visible que par vous.
        </div>
        <button className="banner-btn" onClick={() => onNavigate('settings')}>Gérer vos paramètres de confidentialité</button>
      </div>

      {/* Navbar Principale */}
      <Navbar 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout} 
        activeTab="profile" 
      />

      <div className="profile-main">
        
        {/* Header Avatar and Info */}
        <div className="profile-header">
          <div className="profile-large-avatar">
            {storedUser.avatar ? (
              <img src={storedUser.avatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #0ce688, #0ab56b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: '800', color: '#0b0f19' }}>
                {userInitials}
              </div>
            )}
          </div>
          <h1 className="profile-name">{userName}</h1>
          <div className="profile-meta">
            {userEmail} · Soutenu 0 projet
          </div>
        </div>

        {/* Superbacker component */}
        <div className="superbacker-card">
          <div className="superbacker-icon">
            ⭐
          </div>
          <div className="superbacker-content">
            <div className="superbacker-title">
              0 sur 25 projets avant le statut Super-Contributeur Hive
            </div>
            <a className="superbacker-link" onClick={() => {}}>En savoir plus sur le statut de Super-Contributeur</a>
            <div className="superbacker-progress-bg">
              <div className="superbacker-progress-fill"></div>
            </div>
            <button className="nav-btn-solid" style={{ padding: '8px 24px', fontSize: '14px' }} onClick={() => onNavigate('home')}>
              Soutenir des projets
            </button>
          </div>
        </div>

        {/* Tabs System */}
        <div className="profile-tabs-container">
          <div className="profile-tabs" role="tablist" aria-label="Onglets du profil">
            <span 
              className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
              role="tab"
              aria-selected={activeTab === 'about'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('about')}
            >
              À propos
            </span>
            <span 
              className={`profile-tab ${activeTab === 'backed' ? 'active' : ''}`}
              onClick={() => setActiveTab('backed')}
              role="tab"
              aria-selected={activeTab === 'backed'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('backed')}
            >
              Soutenus <span>0</span>
            </span>
            <span 
              className={`profile-tab ${activeTab === 'created' ? 'active' : ''}`}
              onClick={() => setActiveTab('created')}
              role="tab"
              aria-selected={activeTab === 'created'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('created')}
            >
              Créés <span>1</span>
            </span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          storedUser.bio ? (
            <div className="profile-content-empty" style={{ textAlign: 'left' }}>
              <h3>Biographie</h3>
              <p style={{ lineHeight: '1.7', color: '#d4d4d8', whiteSpace: 'pre-wrap' }}>{storedUser.bio}</p>
              <button className="settings-btn-outline" onClick={() => onNavigate('settings')} style={{ marginTop: '16px' }}>Modifier la bio</button>
            </div>
          ) : (
            <div className="profile-content-empty">
              <h3>Aucune biographie</h3>
              <p>Vous n'avez pas encore ajouté de description à votre profil public.</p>
              <button className="settings-btn-outline" onClick={() => onNavigate('settings')}>Ajouter une bio</button>
            </div>
          )
        )}

        {activeTab === 'backed' && (
          <div className="profile-content-empty">
            <h3>Vous n'avez soutenu aucun projet.</h3>
            <p>Il est temps de changer ça ! Découvrez des idées innovantes.</p>
            <button className="settings-btn-outline" onClick={() => onNavigate('home')} style={{ color: '#05ce78', borderColor: '#05ce78' }}>
              Découvrir des projets
            </button>
          </div>
        )}

        {/* The Created Projects Tab requested by User */}
        {activeTab === 'created' && (
          <div className="projects-section" style={{ padding: '0', maxWidth: '100%' }}>
            {/* Using grid columns specifically for profile view to maintain proportionality */}
            <div className="projects-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 350px))', justifyContent: 'center' }}>
              {createdProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onNavigate={onNavigate}
                  actions={
                    <button className="settings-btn-outline" style={{ width: '100%', borderColor: '#05ce78', color: '#05ce78' }}>
                      Gérer la campagne
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
