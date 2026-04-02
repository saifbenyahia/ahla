import React, { useState } from 'react';
import './ProjectEditor.css';
import './CreateProject.css';
import BasicsTab from './components/ProjectEditor/BasicsTab';
import PeopleTab from './components/ProjectEditor/PeopleTab';
import RewardsTab from './components/ProjectEditor/RewardsTab';
import StoryTab from './components/ProjectEditor/StoryTab';

const TABS = ['Bases', 'Récompenses', 'Histoire', 'Personnes', 'Paiement', 'Promotion'];

const ProjectEditor = ({ onNavigate, draftProject, onSaveDraft }) => {
  const [activeTab, setActiveTab] = useState('Bases');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="pe-wrapper">

      {/* ── Header ── */}
      <header className="pe-header">
        <div className="pe-header-top">

          {/* Colonne 1 - Logo (gauche) */}
          <span className="pe-logo" onClick={() => onNavigate('home')}>Hive.tn</span>

          {/* Colonne 2 - Toggle centré */}
          <div className="pe-header-center">
            <div className="pe-mode-toggle">
              <button
                className={`pe-mode-btn ${!showPreview ? 'pe-mode-btn--active' : ''}`}
                onClick={() => setShowPreview(false)}
              >
                <span className="pe-mode-icon">✏️</span> Éditeur
              </button>
              <button
                className={`pe-mode-btn pe-mode-btn--preview ${showPreview ? 'pe-mode-btn--active pe-mode-btn--preview-active' : ''}`}
                onClick={() => setShowPreview(true)}
              >
                <span className="pe-mode-icon">👁</span> Aperçu
              </button>
            </div>
          </div>

          {/* Colonne 3 - Avatar (droite) */}
          <div className="pe-header-right">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
              alt="Avatar"
              className="pe-user-avatar"
            />
          </div>
        </div>

        {/* Onglets — masqués en mode Aperçu */}
        {!showPreview && (
          <nav className="pe-tabs" role="tablist" aria-label="Édition du projet">
            {TABS.map(tab => (
              <span
                key={tab}
                className={`pe-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab(tab)}
              >
                {tab}
              </span>
            ))}
          </nav>
        )}
      </header>

      {/* ── MODE ÉDITEUR ── */}
      {!showPreview && (
        <main className="pe-main">
          {activeTab === 'Bases' && <BasicsTab draftProject={draftProject} onSaveDraft={onSaveDraft} onNavigate={onNavigate} />}
          {activeTab === 'Récompenses' && <RewardsTab draftProject={draftProject} onSaveDraft={onSaveDraft} />}
          {activeTab === 'Histoire' && <StoryTab />}
          {activeTab === 'Personnes' && <PeopleTab />}
          {activeTab !== 'Bases' && activeTab !== 'Récompenses' && activeTab !== 'Histoire' && activeTab !== 'Personnes' && (
            <div style={{ textAlign: 'center', padding: '100px', color: '#a1a1aa' }}>
              <h2>{activeTab}</h2>
              <p>Cet onglet est en cours de structuration.</p>
            </div>
          )}
        </main>
      )}

      {/* ── MODE APERÇU (pleine page, même layout que l'éditeur) ── */}
      {showPreview && (
        <main className="pe-main pe-preview-page">
          <div className="pe-preview-content">

            {/* Titre & Sous-titre */}
            <div className="pe-preview-hero">
              <span className="pe-preview-badge">
                <span className="pe-preview-dot"></span>
                Mode Prévisualisation
              </span>
              <h1 className="pe-preview-title">
                {draftProject?.title || 'Titre de votre projet'}
              </h1>
              <p className="pe-preview-subtitle">
                {draftProject?.subtitle || 'Un sous-titre accrocheur pour présenter votre concept.'}
              </p>
            </div>

            {/* Layout principal : Image + Sidebar financement */}
            <div className="pe-preview-body">

              {/* Image principale */}
              <div className="pe-preview-media">
                <div className="pe-preview-image-placeholder">
                  {draftProject?.photoName
                    ? <span style={{ color: '#0ce688' }}>📷 {draftProject.photoName}</span>
                    : <span>Aucune image principale</span>
                  }
                </div>
              </div>

              {/* Sidebar financement */}
              <aside className="pe-preview-sidebar">
                <div className="pe-preview-amount">0 DT</div>
                <div className="pe-preview-goal">
                  engagés sur un objectif de <strong>{draftProject?.goal || '0'} DT</strong>
                </div>

                <div className="pe-preview-progress-bg">
                  <div className="pe-preview-progress-fill" style={{ width: '0%' }}></div>
                </div>

                <div className="pe-preview-stats">
                  <div className="pe-preview-stat">
                    <span className="pe-preview-stat-val">0</span>
                    <span className="pe-preview-stat-lbl">contributeurs</span>
                  </div>
                  <div className="pe-preview-stat">
                    <span className="pe-preview-stat-val">{draftProject?.duration || '0'}</span>
                    <span className="pe-preview-stat-lbl">jours restants</span>
                  </div>
                </div>

                <button className="pe-preview-cta" disabled>
                  Soutenir ce projet
                </button>

                <p className="pe-preview-notice">
                  ⚠️ Ceci est un aperçu — le projet n'est pas encore publié.
                </p>
              </aside>
            </div>

          </div>
        </main>
      )}

    </div>
  );
};

export default ProjectEditor;
