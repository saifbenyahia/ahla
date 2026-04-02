import React from 'react';
import './Home.css';
import Navbar from './Navbar';
import ProjectCard from './components/ProjectCard';

const Home = ({ onNavigate, isAuthenticated, onLogout }) => {
  const handleCreateProject = () => {
    if (isAuthenticated) {
      onNavigate('startProject');
    } else {
      onNavigate('signIn', 'Vous devez être connecté pour créer un projet.');
    }
  };

  const projects = [
    {
      id: 1,
      title: "Oasis Solidaire : Irrigation intelligente",
      creator: "Par AgriTech Tozeur",
      desc: "Système d'irrigation goutte-à-goutte connecté et autonome en énergie solaire pour secourir les petits agriculteurs de l'Oasis de Tozeur.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
      funded: 65,
      collected: "18 500 DT",
      daysLeft: 14,
      category: "Environnement"
    },
    {
      id: 2,
      title: "Dar El Harka : Coworking & Artisanat",
      creator: "Par Collectif Medina, Tunis",
      desc: "Rénovation d'une maison historique de la Medina pour la transformer en espace de création pour les jeunes artisans tunisiens.",
      image: "https://images.unsplash.com/photo-1528157777178-0062a444aeb8?w=800&q=80",
      funded: 115,
      collected: "46 000 DT",
      daysLeft: 2,
      category: "Culture & Économie"
    },
    {
      id: 3,
      title: "Tbibi : Accès aux soins ruraux",
      creator: "Par Dr. Amine S., Kasserine",
      desc: "Déploiement d'une clinique mobile équipée pour des téléconsultations spécialisées dans les zones reculées de Kasserine.",
      image: "https://images.unsplash.com/photo-1576091160399-11cb953bff43?w=800&q=80",
      funded: 42,
      collected: "21 000 DT",
      daysLeft: 35,
      category: "Santé & Tech"
    }
  ];

  return (
    <div className="home-container">
      <div className="home-content-wrapper">
        
        {/* Navigation */}
        <Navbar 
          onNavigate={onNavigate} 
          isAuthenticated={isAuthenticated} 
          onLogout={onLogout} 
          activeTab="home" 
        />

        {/* Hero Banner */}
        <section className="hero-section">
          <h1 className="hero-title">
            Financez les idées de <span>demain</span>,<br/> aujourd'hui.
          </h1>
          <p className="hero-subtitle">
            Hive.tn est la première plateforme de financement participatif en Tunisie dédiée aux projets innovants, solidaires et créatifs. Rejoignez la ruche.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => onNavigate('discover')}>Soutenir un projet</button>
            <button className="hero-btn-secondary" onClick={handleCreateProject}>Créer mon projet</button>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="projects-section">
          <h2 className="section-title">Projets à soutenir en Tunisie</h2>
          
          <div className="projects-grid">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        {/* Comment ça marche Section */}
        <section className="how-it-works-section">
          <div className="hiw-container">
            <h2 className="section-title text-center">Comment ça marche ?</h2>
            <div className="hiw-grid">
              <div className="hiw-step">
                <div className="hiw-icon">💡</div>
                <h3>1. Soutenez un projet</h3>
                <p>Découvrez des idées tunisiennes innovantes et contribuez financièrement à leur réalisation en toute simplicité.</p>
              </div>
              <div className="hiw-step">
                <div className="hiw-icon">🛡️</div>
                <h3>2. Fonds sécurisés par jalons</h3>
                <p>Votre argent est protégé. Le financement est divisé en plusieurs jalons de réalisation clairs et définis à l'avance.</p>
              </div>
              <div className="hiw-step">
                <div className="hiw-icon">✅</div>
                <h3>3. Déblocage sur preuve</h3>
                <p>Les fonds ne sont débloqués au créateur qu'après validation stricte des preuves d'avancement du projet (factures, photos).</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Home;
