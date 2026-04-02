import React, { useState, useRef } from 'react';

const PeopleTab = () => {
  const [generatedUrl, setGeneratedUrl] = useState('');

  const handleGenerateUrl = () => {
    // Generate a secure random alphanumeric slug
    const randomSlug = Math.random().toString(36).substring(2, 8);
    setGeneratedUrl(`https://hive.tn/profile/benyahia-saif-${randomSlug}`);
  };

  return (
    <>
      <div style={{ maxWidth: '1100px', margin: '0 auto 60px auto', textAlign: 'left' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Présentez-vous</h1>
        <p style={{ color: '#a1a1aa' }}>Donnez à vos contributeurs une idée de qui vous êtes, et ajoutez vos collaborateurs si vous travaillez en équipe.</p>
      </div>

      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Votre profil</h2>
          <p style={{ marginBottom: '15px' }}>Cela apparaîtra sur la page de votre projet et doit inclure votre nom, photo, biographie et emplacement géographique.</p>
        </div>
        <div className="pe-split-right" style={{ padding: '0', background: 'transparent', border: 'none' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '30px', position: 'relative', marginTop: '40px' }}>
            <div style={{ position: 'absolute', top: '-40px', left: '30px', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ce688, #00bfff)', border: '4px solid #151a2a', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}></div>
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '20px', margin: '0 0 5px 0', color: '#fff' }}>Benyahia Saif</h3>
              <p style={{ color: '#a1a1aa', margin: 0, fontSize: '14px' }}>Créateur du projet</p>
            </div>
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button className="cp-btn-next" style={{ width: 'auto', margin: 0, padding: '10px 20px', fontSize: '15px' }}>
                Compléter votre profil
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '50px 0' }} />

      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>URL personnalisée</h2>
          <p style={{ marginBottom: '15px' }}>Créez une URL personnalisée pour votre page de profil avec au moins trois caractères. Cette formulation servira également de base pour l'URL de votre projet.</p>
        </div>
        <div className="pe-split-right">
          {!generatedUrl ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#a1a1aa', marginBottom: '20px', fontSize: '15px' }}>
                Cliquez sur le bouton ci-dessous pour générer automatiquement une URL unique pour votre page de profil.
              </p>
              <button
                className="cp-btn-next"
                style={{ width: 'auto', margin: 0, padding: '12px 24px', fontSize: '15px' }}
                onClick={handleGenerateUrl}
              >
                Générer mon URL automatiquement
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(12, 230, 136, 0.05)', border: '1px solid rgba(12, 230, 136, 0.2)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <h3 style={{ color: '#0ce688', marginBottom: '15px', fontSize: '18px' }}>URL générée avec succès ! ✅</h3>
              <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '16px', wordBreak: 'break-all' }}>
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                  {generatedUrl}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PeopleTab;