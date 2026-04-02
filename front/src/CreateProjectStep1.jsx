import React, { useState } from 'react';
import './CreateProject.css';

const categoriesList = [
  'Arts & BD',
  'Artisanat',
  'Cinéma & Vidéo',
  'Projets Solidaires',
  'Tech & App'
];

const CreateProjectStep1 = ({ onNavigate, onSaveDraft, draftProject }) => {
  const [category, setCategory] = useState(draftProject?.category || '');

  const isFormComplete = category !== '';

  const handleNext = () => {
    if (isFormComplete) {
      if(onSaveDraft) onSaveDraft({ category });
      onNavigate('createProjectStep2');
    }
  };

  return (
    <div className="cp-wrapper">
      
      {/* Minimal Header */}
      <header className="cp-header">
        <div className="cp-logo" onClick={() => onNavigate('home')}>Hive.tn</div>
        <img 
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" 
          alt="Avatar" 
          className="cp-user-avatar"
          onClick={() => onNavigate('profile')}
        />
      </header>

      {/* Progress Bar */}
      <div className="cp-progress-container">
        <div className="cp-progress-segment active"></div>
        <div className="cp-progress-segment"></div>
        <div className="cp-progress-segment"></div>
      </div>

      {/* Main Content Areas */}
      <main className="cp-main">
        <div className="cp-content-box">
          <h1 className="cp-title">Pour commencer, configurons votre projet.</h1>
          
          <h2 className="cp-subtitle">Sélectionnez une catégorie principale pour votre nouveau projet.</h2>
          <p className="cp-description">
            Cela aidera les contributeurs à trouver votre projet. Vous pourrez la modifier plus tard si nécessaire.
          </p>

          <div className="cp-form-row">
            <div className="cp-select-wrapper" style={{ maxWidth: '400px', width: '100%' }}>
              <select 
                className="cp-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Sélectionnez une catégorie</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="cp-footer">
        <div className="cp-footer-text">
          Un nouveau projet — bienvenu !
        </div>
        <button 
          className="cp-btn-next" 
          disabled={!isFormComplete}
          onClick={handleNext}
        >
          Suivant : Détails du projet
        </button>
      </footer>

    </div>
  );
};

export default CreateProjectStep1;
