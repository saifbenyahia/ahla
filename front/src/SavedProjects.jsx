import React from 'react';
import './Home.css';
import './SavedProjects.css';
import Navbar from './Navbar';
import ProjectCard from './components/ProjectCard';

const SavedProjects = ({ onNavigate, isAuthenticated, onLogout }) => {
  const savedProjects = [
    {
      id: 4,
      title: "AgriTech Gabès : Serres Connectées",
      creator: "Par GreenOasis",
      desc: "Développement de serres hydroponiques alimentées par énergie solaire pour optimiser l'agriculture en milieu aride.",
      image: "https://images.unsplash.com/photo-1592982537447-6f2e8f17ba81?w=800&q=80",
      funded: 85,
      collected: "38 250 DT",
      daysLeft: 12,
      category: "Agritech"
    },
    {
      id: 5,
      title: "Sicca Jazz : L'édition du Renouveau",
      creator: "Par Association Culturelle du Kef",
      desc: "Soutenez l'organisation du plus grand festival de jazz au Nord-Ouest. Devenez mécène culturel de la région de Sicca Veneria.",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      funded: 40,
      collected: "12 000 DT",
      daysLeft: 45,
      category: "Culture & Art"
    }
  ];

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

        {/* Grille de projets */}
        <div className="projects-section" style={{ padding: '0', maxWidth: '100%' }}>
          <div className="projects-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 350px))', justifyContent: 'center' }}>
            {savedProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onNavigate={onNavigate}
                overlay={
                  <>🔖 Enregistré</>
                }
                actions={
                  <button className="nav-btn-solid" style={{ width: '100%', padding: '10px', fontSize: '15px' }}>
                    Soutenir ce projet
                  </button>
                }
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SavedProjects;
