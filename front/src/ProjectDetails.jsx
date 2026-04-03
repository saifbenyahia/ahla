import React, { useState } from 'react';
import './Home.css';
import './ProjectDetails.css';
import Navbar from './Navbar';

const ProjectDetails = ({ onNavigate, isAuthenticated, onLogout, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('campaign');
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Save/Bookmark State
  const [isSaved, setIsSaved] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);

  // TODO: replace with real campaign ID from route params
  const campaignId = null; // will be dynamic when campaigns are loaded from DB

  const handleSaveCampaign = async () => {
    if (!campaignId) {
      // For demo: just toggle visual state if there's no real campaign ID yet
      setIsSaved(!isSaved);
      return;
    }
    const token = localStorage.getItem('token');
    setSavingInProgress(true);
    try {
      if (isSaved) {
        // Unsave
        await fetch(`http://localhost:5000/api/saved/${campaignId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsSaved(false);
      } else {
        // Save
        await fetch(`http://localhost:5000/api/saved/${campaignId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Save/unsave error:', err);
    } finally {
      setSavingInProgress(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowLoginModal(false);
        if (onLoginSuccess) onLoginSuccess();
        onNavigate('saved'); // Navigate directly after successful login
      } else {
        setLoginError(data.message || 'Identifiants incorrects');
      }
    } catch (err) {
      setLoginError('Erreur de connexion serveur');
    }
  };

  return (
    <div className="project-details-wrapper">
      
      {/* Navbar Principale */}
      <Navbar 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout} 
        activeTab="projectDetails" 
      />

      <div className="pd-main">
        {/* Header */}
        <div className="pd-header">
          <h1 className="pd-title">Dar El Harka : Coworking & Artisanat</h1>
          <p className="pd-subtitle">Rénovation d'une maison historique de la Medina pour la transformer en espace de création pour les jeunes artisans tunisiens.</p>
        </div>

        {/* Hero Grid */}
        <div className="pd-hero-grid">
          
          {/* Left Media Column */}
          <div className="pd-media-column">
            <div className="pd-media-container">
              <img src="https://images.unsplash.com/photo-1528157777178-0062a444aeb8?w=1200&q=80" alt="Dar El Harka" className="pd-media-img" />
              <div className="pd-play-btn">
                <div className="pd-play-icon"></div>
              </div>
            </div>
            
            <div className="pd-badges">
              <div className="pd-badge-item">
                <span className="pd-badge-icon">💖</span> Coup de Coeur
              </div>
              <div className="pd-badge-item">
                <span className="pd-badge-icon">🎨</span> Culture & Artisanat
              </div>
              <div className="pd-badge-item">
                <span className="pd-badge-icon">📍</span> Medina, Tunis
              </div>
            </div>
          </div>

          {/* Right Stats Column */}
          <div className="pd-stats-block">
            <div className="pd-progress-bar">
              <div className="pd-progress-fill" style={{ width: '115%' }}></div>
            </div>

            <div className="pd-stat-group">
              <div className="pd-stat-big">46 000 DT</div>
              <div className="pd-stat-label">récoltés sur un objectif de 40 000 DT</div>
            </div>

            <div className="pd-stat-group">
              <div className="pd-stat-big white">412</div>
              <div className="pd-stat-label">contributeurs</div>
            </div>

            <div className="pd-stat-group">
              <div className="pd-stat-big white">2</div>
              <div className="pd-stat-label">jours restants</div>
            </div>

            <button className="pd-back-btn">
              Soutenir ce projet
            </button>

            <div className="pd-actions-row">
              <button 
                className={`pd-remind-btn ${isSaved ? 'pd-saved-active' : ''}`}
                disabled={savingInProgress}
                onClick={() => {
                  if (isAuthenticated) {
                    handleSaveCampaign();
                  } else {
                    setShowLoginModal(true);
                  }
                }}
              >
                {isSaved ? '✅ Enregistré' : '🔖 Enregistrer'}
              </button>
              <div className="pd-social-btn">🔗</div>
              <div className="pd-social-btn">📱</div>
              <div className="pd-social-btn">✉️</div>
            </div>

            <div className="pd-warning-text">
              <strong>Tout ou rien.</strong> Ce projet ne sera financé que s'il atteint son objectif initial avant le Mer 15 Avril 2026 23:59 CET.
            </div>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="pd-trust-strip">
        <div className="pd-trust-grid">
          <div className="pd-trust-item">
            <div className="pd-trust-icon">🤝</div>
            <div className="pd-trust-text">Hive.tn connecte directement les porteurs de projets avec les bailleurs pour financer des idées locales de manière sécurisée.</div>
          </div>
          <div className="pd-trust-item">
            <div className="pd-trust-icon">🛡️</div>
            <div className="pd-trust-text">Les récompenses ne sont pas immédiates, mais les créateurs s'engagent à publier des mises à jour fréquentes sur l'évolution.</div>
          </div>
          <div className="pd-trust-item">
            <div className="pd-trust-icon">💳</div>
            <div className="pd-trust-text">Vous n'êtes débité que si l'objectif est atteint. Le financement est ensuite débloqué progressivement par jalons.</div>
          </div>
        </div>
      </div>

      {/* Horizontal Wrap for Sidebar + Content */}
      <div className="pd-layout-container">
        {/* Left Sidebar Navigation */}
        <aside className="pd-sidebar-nav">
          <div className="pd-sidebar-menu" role="tablist" aria-label="Navigation du projet">
            <span className={`pd-tab-vertical ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => setActiveTab('campaign')} role="tab" aria-selected={activeTab === 'campaign'} tabIndex={0}>Campagne</span>
            <span className={`pd-tab-vertical ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')} role="tab" aria-selected={activeTab === 'rewards'} tabIndex={0}>Récompenses <span className="pd-tab-count">4</span></span>
            <span className={`pd-tab-vertical ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')} role="tab" aria-selected={activeTab === 'faq'} tabIndex={0}>FAQ <span className="pd-tab-count">2</span></span>
            <span className={`pd-tab-vertical ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => setActiveTab('updates')} role="tab" aria-selected={activeTab === 'updates'} tabIndex={0}>Mises à jour <span className="pd-tab-count">8</span></span>
            <span className={`pd-tab-vertical ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')} role="tab" aria-selected={activeTab === 'comments'} tabIndex={0}>Commentaires <span className="pd-tab-count">412</span></span>
            <span className={`pd-tab-vertical ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')} role="tab" aria-selected={activeTab === 'community'} tabIndex={0}>Communauté</span>
          </div>
        </aside>

        {/* Tab Content Placeholder */}
        <main className="pd-sidebar-content">
          {activeTab === 'campaign' && (
             <div>
               <h2>La Médina comme point de départ</h2>
               <p>Dar El Harka est un projet ambitieux de réhabilitation situé au cœur de la Medina de Tunis. Notre objectif est de préserver une maison historique du 18ème siècle, pour la transformer en un espace de Coworking et de co-création spécialement adapté aux artisans traditionnels (Designers, Tisseurs, Graveurs, Céramistes) et à la nouvelle génération numérique.</p>
               <p>Aujourd'hui, de nombreux jeunes artisans n'ont pas accès à des machines coûteuses ni à des espaces pour exposer leurs produits de manière professionnelle.</p>
               
               <h2>Que ferons-nous avec les fonds ?</h2>
               <p>Grâce à vos dons, nous allons pouvoir rénover les plafonds effondrés, restaurer la menuiserie artisanale, et installer l'infrastructure électrique et la fibre optique nécessaires. Le budget inclut également l'achat partagé d'outils de précision professionnels (fours à céramique, imprimantes 3D, métiers à tisser).</p>
               <p>C'est un véritable hub hybride : une alliance entre l'innovation technologique et l'âme historique tunisienne.</p>
             </div>
          )}
          {activeTab === 'rewards' && <p><strong>Palier de 50 DT :</strong> Remerciement public + Carte artisanale.<br/><strong>Palier de 1 000 DT :</strong> Privatisation de tout le patio pour et visite exclusive avec accès au nom du bailleur gravé sur le mur fondateur.</p>}
          {activeTab === 'faq' && <p><strong>FAQ : Quand ouvrira le centre ?</strong><br/>Réponse : L'ouverture complète est estimée à Novembre 2026. Des journées portes ouvertes ponctuelles débuteront en Août.</p>}
          {activeTab === 'updates' && <p><strong>Dernière Mise à jour :</strong> L'architecte des bâtiments de France (ABF) a validé nos récents plans de sauvetage. Merci à tous, la campagne suit son cours magistralement !</p>}
          {activeTab === 'comments' && <p><strong>Selim T. a commenté :</strong> Wow, superbe projet. Hâte de venir télétravailler dans un riad ! Soutien total depuis Sfax.</p>}
          {activeTab === 'community' && <p>Explorez d'où vit la majorité des membres du collectif. Actuellement, notre diaspora aux USA et en France représente près de 45% des fonds soulevés !</p>}
        </main>
      </div>

      {/* Login Modal for Visitors */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ background: '#111', padding: '40px', borderRadius: '12px', width: '400px', maxWidth: '90%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>Connexion requise</h2>
                <button onClick={() => setShowLoginModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>
              <p style={{color: '#a1a1aa', marginBottom: '30px', lineHeight: '1.5'}}>
                Vous devez être connecté pour enregistrer ce projet et le retrouver plus tard.
              </p>
              
              {loginError && <div style={{ color: '#ff4d4f', marginBottom: '20px', padding: '10px', background: 'rgba(255,77,79,0.1)', borderRadius: '6px' }}>{loginError}</div>}
              
              <input 
                type="email" 
                placeholder="Adresse e-mail" 
                value={loginEmail} 
                onChange={e => setLoginEmail(e.target.value)} 
                style={{ width: '100%', padding: '14px', marginBottom: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', boxSizing: 'border-box' }} 
              />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)} 
                style={{ width: '100%', padding: '14px', marginBottom: '25px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'sans-serif' }} 
              />
              
              <button 
                onClick={handleQuickLogin} 
                style={{ width: '100%', padding: '16px', backgroundColor: '#05ce78', color: '#111', fontWeight: '800', fontSize: '16px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}
              >
                Se connecter
              </button>
              <div style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '14px' }}>
                Pas encore de compte ? <span onClick={() => { setShowLoginModal(false); onNavigate('signUp'); }} style={{ color: '#0ce688', cursor: 'pointer' }}>S'inscrire</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
