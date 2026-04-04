import React, { useState, useEffect } from 'react';
import './Home.css';
import './SavedProjects.css';
import Navbar from './Navbar';
import ProjectCard from './components/ProjectCard';

const API_URL = 'http://localhost:5000';

const SavedProjects = ({ onNavigate, isAuthenticated, onLogout }) => {
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/saved`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSavedProjects(data.campaigns.map(c => ({
            id: c.id,
            title: c.title,
            creator: `Par ${c.creator_name}`,
            desc: c.description || '',
            image: c.image_url ? `${API_URL}${c.image_url}` : 'https://images.unsplash.com/photo-1592982537447-6f2e8f17ba81?w=800&q=80',
            funded: 0,
            collected: `${(Number(c.target_amount || 0) / 1000).toLocaleString('fr-FR')} DT`,
            daysLeft: '--',
            category: c.category || 'Projet'
          })));
        }
      } catch (err) {
        console.error('Fetch saved error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleUnsave = async (campaignId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/saved/${campaignId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSavedProjects(prev => prev.filter(p => p.id !== campaignId));
    } catch (err) {
      console.error('Unsave error:', err);
    }
  };

  return (
    <div className="saved-page-wrapper">
      
      {/* Navbar Principale */}
      <Navbar 
        onNavigate={onNavigate} 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout} 
        activeTab="saved" 
      />

      <div className="saved-main">
        {/* Header de la page */}
        <div className="saved-header">
          <div className="saved-icon-badge">🔖</div>
          <h1 className="saved-title">Projets Enregistrés</h1>
          <p className="saved-subtitle">Retrouvez ici les perles rares que vous avez mises de côté pour les soutenir plus tard.</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#a1a1aa', padding: '60px 0' }}>
            Chargement...
          </div>
        )}

        {/* Empty state */}
        {!loading && savedProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '12px' }}>Aucun projet enregistré</h3>
            <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', maxWidth: '450px', margin: '0 auto 30px auto' }}>
              Parcourez les projets et cliquez sur "Enregistrer" pour les retrouver ici plus tard.
            </p>
            <button 
              className="nav-btn-solid" 
              style={{ padding: '14px 32px', fontSize: '16px' }}
              onClick={() => onNavigate('discover')}
            >
              Découvrir des projets
            </button>
          </div>
        )}

        {/* Grille de projets */}
        {!loading && savedProjects.length > 0 && (
          <div className="projects-section" style={{ padding: '0', maxWidth: '100%' }}>
            <div className="projects-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
              {savedProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onNavigate={onNavigate}
                  overlay={
                    <>🔖 Enregistré</>
                  }
                  actions={
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      <button 
                        className="nav-btn-solid" 
                        style={{ flex: 1, padding: '10px', fontSize: '15px' }}
                      >
                        Soutenir
                      </button>
                      <button 
                        className="nav-btn-solid" 
                        style={{ padding: '10px 16px', fontSize: '15px', background: 'rgba(255, 77, 79, 0.15)', color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.3)' }}
                        onClick={(e) => { e.stopPropagation(); handleUnsave(project.id); }}
                      >
                        Retirer
                      </button>
                    </div>
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

export default SavedProjects;

