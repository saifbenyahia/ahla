import React, { useState } from 'react';
import './Home.css';
import './ProjectDetails.css';
import Navbar from './Navbar';

const ProjectDetails = ({ onNavigate, isAuthenticated, onLogout }) => {
  const [activeTab, setActiveTab] = useState('campaign');

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
              <button className="pd-remind-btn" onClick={() => onNavigate('saved')}>
                🔖 Enregistrer
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

      {/* Tabs Menu */}
      <div className="pd-tabs-nav">
        <div className="pd-tabs-container" role="tablist" aria-label="Navigation du projet">
          <span className={`pd-tab ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => setActiveTab('campaign')} role="tab" aria-selected={activeTab === 'campaign'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('campaign')}>Campagne</span>
          <span className={`pd-tab ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')} role="tab" aria-selected={activeTab === 'rewards'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('rewards')}>Récompenses <span className="pd-tab-count">4</span></span>
          <span className={`pd-tab ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')} role="tab" aria-selected={activeTab === 'faq'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('faq')}>FAQ <span className="pd-tab-count">2</span></span>
          <span className={`pd-tab ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => setActiveTab('updates')} role="tab" aria-selected={activeTab === 'updates'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('updates')}>Mises à jour <span className="pd-tab-count">8</span></span>
          <span className={`pd-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')} role="tab" aria-selected={activeTab === 'comments'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('comments')}>Commentaires <span className="pd-tab-count">412</span></span>
          <span className={`pd-tab ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')} role="tab" aria-selected={activeTab === 'community'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveTab('community')}>Communauté</span>
        </div>
      </div>

      {/* Tab Content Placeholder */}
      <div className="pd-body">
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
      </div>

    </div>
  );
};

export default ProjectDetails;
