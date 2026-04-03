import React, { useEffect, useRef, useState } from 'react';

const API_URL = 'http://localhost:5000';

const BasicsTab = ({ draftProject, onSaveDraft, onNavigate }) => {
  const [title, setTitle] = useState(draftProject?.title || '');
  const [subtitle, setSubtitle] = useState(draftProject?.subtitle || '');
  const [category, setCategory] = useState(draftProject?.category || '');
  const [goal, setGoal] = useState(draftProject?.goal || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const campaignId = draftProject?.campaignId;

  useEffect(() => {
    setTitle(draftProject?.title || '');
    setSubtitle(draftProject?.subtitle || '');
    setCategory(draftProject?.category || '');
    setGoal(draftProject?.goal || '');
  }, [draftProject?.title, draftProject?.subtitle, draftProject?.category, draftProject?.goal]);

  const handleMediaUpload = async (file, type) => {
    if (!campaignId) {
      setSaveError('Veuillez sauvegarder le projet au moins une fois avant d\'ajouter des médias.');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const isImage = type === 'image';
    if (isImage) setUploadingImage(true);
    else setUploadingVideo(true);
    setSaveError('');
    setSaveMsg('');

    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/media/${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setSaveMsg(`${isImage ? 'Image' : 'Vidéo'} enregistrée avec succès ✓`);
        if (onSaveDraft) {
          onSaveDraft(isImage ? { image_url: data.fileUrl } : { video_url: data.fileUrl });
        }
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        const errorMsg = isImage ? "l'image" : "la vidéo";
        setSaveError(data.message || `Erreur lors de l'upload de ${errorMsg}.`);
      }
    } catch (err) {
      setSaveError('Erreur réseau lors de l\'upload.');
    } finally {
      if (isImage) setUploadingImage(false);
      else setUploadingVideo(false);
    }
  };

  const handleSave = async () => {
    if (!campaignId) {
      setSaveError('Aucun projet en cours. Veuillez d\'abord créer un projet.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSaveError('Vous devez être connecté.');
      return;
    }

    setSaving(true);
    setSaveMsg('');
    setSaveError('');

    try {
      const body = {};
      if (title) body.title = title;
      if (subtitle) body.description = subtitle;
      if (category) body.category = category;
      if (goal) body.target_amount = parseInt(goal, 10) * 1000; // TND → millimes

      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || 'Erreur lors de la sauvegarde.');
        return;
      }

      setSaveMsg('Modifications enregistrées ✓');
      if (onSaveDraft) {
        onSaveDraft({ title, subtitle, category, goal });
      }
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveError('Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!campaignId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setSaveError('Vous devez être connecté.');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir soumettre votre projet pour révision ?\n\nUne fois soumis, vous ne pourrez plus modifier le brouillon.')) {
      return;
    }

    setSaving(true);
    setSaveMsg('');
    setSaveError('');

    try {
      // Save first
      await handleSave();

      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || 'Erreur lors de la soumission.');
        return;
      }

      setSaveMsg('Projet soumis pour révision ! Redirection...');
      setTimeout(() => {
        if (onNavigate) onNavigate('home');
      }, 2000);
    } catch (err) {
      setSaveError('Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ maxWidth: '1100px', margin: '0 auto 60px auto', textAlign: 'left' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Commençons par les bases</h1>
        <p style={{ color: '#a1a1aa' }}>Facilitez la découverte de votre projet par notre communauté.</p>
      </div>

      {/* Feedback Messages */}
      {saveMsg && (
        <div style={{ maxWidth: '1100px', margin: '0 auto 20px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', backgroundColor: 'rgba(5, 206, 120, 0.12)', color: '#34d399', border: '1px solid rgba(5, 206, 120, 0.25)', textAlign: 'center' }}>
          {saveMsg}
        </div>
      )}
      {saveError && (
        <div style={{ maxWidth: '1100px', margin: '0 auto 20px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)', textAlign: 'center' }}>
          {saveError}
        </div>
      )}

      {/* 1. Project Title & Subtitle */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Titre du projet</h2>
          <p style={{ marginBottom: '15px' }}>Rédigez un titre clair et concis ainsi qu'un sous-titre pour aider les internautes à comprendre rapidement votre projet. Les deux apparaîtront sur les pages de votre projet.</p>
          <p>Les contributeurs potentiels les verront aussi si votre projet figure sur la page de votre catégorie, dans les résultats de recherche ou dans nos emails.</p>
        </div>
        <div className="pe-split-right">
          <div style={{ marginBottom: '25px' }}>
            <label className="pe-label">Titre</label>
            <input
              type="text"
              className="pe-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#a1a1aa', marginTop: '5px' }}>
              {title.length}/60
            </div>
          </div>
          <div>
            <label className="pe-label">Sous-titre</label>
            <textarea
              className="pe-textarea pe-input"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#a1a1aa', marginTop: '5px' }}>
              {subtitle.length}/135
            </div>
          </div>
          <div className="pe-note">
            ⚡ Donnez aux contributeurs la meilleure première impression avec des titres accrocheurs.
          </div>
        </div>
      </div>

      {/* 2. Project Category */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Catégorie du projet</h2>
          <p style={{ marginBottom: '15px' }}>Choisissez une catégorie principale pour aider les contributeurs à trouver votre projet.</p>
        </div>
        <div className="pe-split-right">
          <div className="pe-form-row">
            <div className="pe-form-col">
              <label className="pe-label">Catégorie principale</label>
              <select className="pe-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="" disabled>Sélectionnez une catégorie</option>
                <option value="Arts & BD">Arts & BD</option>
                <option value="Artisanat">Artisanat</option>
                <option value="Cinéma & Vidéo">Cinéma & Vidéo</option>
                <option value="Projets Solidaires">Projets Solidaires</option>
                <option value="Tech & App">Tech & App</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Project Image */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Image du projet</h2>
          <p style={{ marginBottom: '15px' }}>Ajoutez une image qui représente clairement votre projet. Choisissez-en une qui rend bien à différentes tailles.</p>
          <p>Votre image doit faire au moins 1024x576 pixels. Évitez les images contenant des bannières, des badges ou du texte.</p>
        </div>
        <div className="pe-split-right">
          <div className="pe-upload-box">
            <button className="pe-upload-btn" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}>
              {uploadingImage ? 'Importation...' : 'Importer une image'}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={imageInputRef} 
              style={{ display: 'none' }} 
              onChange={(e) => {
                if (e.target.files[0]) handleMediaUpload(e.target.files[0], 'image');
                e.target.value = '';
              }}
            />
            <div className="pe-upload-text">
              Formats acceptés : JPG, PNG, GIF, ou WEBP, ne dépassant pas 50 Mo.
              <br /><br />
              {draftProject?.image_url && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ color: '#0ce688' }}>✅ Image enregistrée</span>
                  <br/>
                  <img src={`${API_URL}${draftProject.image_url}`} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', marginTop: '10px', borderRadius: '8px', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Project Video */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Vidéo du projet (optionnel)</h2>
          <p style={{ marginBottom: '15px' }}>Ajoutez une vidéo qui décrit votre projet.</p>
          <p>Expliquez aux internautes pourquoi vous levez des fonds, comment vous comptez réaliser ce projet, qui vous êtes, et pourquoi cela vous tient à cœur.</p>
        </div>
        <div className="pe-split-right">
          <div className="pe-upload-box">
            <button className="pe-upload-btn" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo}>
              {uploadingVideo ? 'Importation en cours...' : 'Importer une vidéo'}
            </button>
            <input 
              type="file" 
              accept="video/*" 
              ref={videoInputRef} 
              style={{ display: 'none' }} 
              onChange={(e) => {
                if (e.target.files[0]) handleMediaUpload(e.target.files[0], 'video');
                e.target.value = '';
              }}
            />
            <div className="pe-upload-text">
              Formats acceptés : MOV, MPEG, AVI, MP4, 3GP, WMV ou FLV, ne dépassant pas 5120 Mo.
              <br /><br />
              {draftProject?.video_url && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ color: '#0ce688' }}>✅ Vidéo enregistrée</span>
                  <br/>
                  <video src={`${API_URL}${draftProject.video_url}`} controls style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px', borderRadius: '8px', background: '#000' }} />
                </div>
              )}
            </div>
          </div>
          <div className="pe-note">
            ⚡ 80 % des projets réussis comportent une vidéo. Créez-en une excellente, quel que soit votre budget.
          </div>
        </div>
      </div>

      {/* 5. Funding Goal */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Objectif de financement</h2>
          <p style={{ marginBottom: '15px' }}>Fixez un objectif réalisable qui couvre tout ce dont vous avez besoin pour mener à bien votre projet.</p>
          <p>Le financement suit le principe du tout ou rien. Si vous n'atteignez pas votre objectif, vous ne recevrez pas les fonds.</p>
        </div>
        <div className="pe-split-right">
          <label className="pe-label">Montant visé (TND)</label>
          <input
            type="number"
            className="pe-input"
            placeholder="Ex: 5000"
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
          <div className="pe-note">
            {goal && parseInt(goal) > 0 ? `= ${(parseInt(goal) * 1000).toLocaleString()} millimes` : ''}
          </div>
        </div>
      </div>

      {/* 6. Target Launch Date */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Date de lancement cible (optionnel)</h2>
          <p style={{ marginBottom: '15px' }}>Nous vous fournirons des recommandations sur le moment idéal pour effectuer les démarches administratives qui peuvent prendre quelques jours.</p>
        </div>
        <div className="pe-split-right">
          <div className="pe-form-row">
            <div className="pe-form-col">
              <label className="pe-label">Jour</label>
              <input type="text" className="pe-input" placeholder="JJ" />
            </div>
            <div className="pe-form-col">
              <label className="pe-label">Mois</label>
              <input type="text" className="pe-input" placeholder="MM" />
            </div>
            <div className="pe-form-col">
              <label className="pe-label">Année</label>
              <input type="text" className="pe-input" placeholder="AAAA" />
            </div>
          </div>
          <p style={{ fontSize: '14px', marginBottom: '10px', marginTop: '15px' }}>Nous vous recommanderons quand vous devrez :</p>
          <ul style={{ fontSize: '14px', color: '#a1a1aa', paddingLeft: '20px', marginBottom: '20px' }}>
            <li>Confirmer votre identité et fournir vos coordonnées bancaires</li>
            <li>Soumettre votre projet pour vérification</li>
          </ul>
          <div className="pe-note" style={{ color: '#a1a1aa' }}>
            🎯 Fixer une date cible ne lancera pas automatiquement votre projet.
          </div>
        </div>
      </div>

      {/* 7. Campaign Duration */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Durée de la campagne</h2>
          <p>Fixez une limite de temps pour votre campagne. Vous ne pourrez plus la modifier une fois lancée.</p>
        </div>
        <div className="pe-split-right">
          <div className="pe-radio-group">
            <label className="pe-radio-item">
              <input type="radio" name="duration" value="15 jours" className="pe-radio-input" defaultChecked />
              <span style={{ fontSize: '15px' }}>15 jours</span>
            </label>
            <label className="pe-radio-item">
              <input type="radio" name="duration" value="1 mois" className="pe-radio-input" />
              <span style={{ fontSize: '15px' }}>1 mois</span>
            </label>
            <label className="pe-radio-item">
              <input type="radio" name="duration" value="2 mois" className="pe-radio-input" />
              <span style={{ fontSize: '15px' }}>2 mois</span>
            </label>
            <label className="pe-radio-item">
              <input type="radio" name="duration" value="6 mois" className="pe-radio-input" />
              <span style={{ fontSize: '15px' }}>6 mois</span>
            </label>
          </div>
          <div className="pe-note">
            ⚡ Les campagnes de 30 jours ou moins ont plus de chances d'aboutir.
          </div>
        </div>
      </div>


      {/* 9. Danger Zone - Delete Project */}
      <div style={{ marginTop: '80px', padding: '40px', background: 'rgba(255, 77, 79, 0.05)', border: '1px solid rgba(255, 77, 79, 0.2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#ff4d4f', fontSize: '20px', margin: '0 0 8px 0' }}>Supprimer le projet</h2>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>Cette action est irréversible. Toutes les données de ce brouillon seront définitivement perdues.</p>
        </div>
        <button
          className="pe-save-btn"
          style={{ background: 'transparent', color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.5)' }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255, 77, 79, 0.1)'; e.target.style.borderColor = '#ff4d4f'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255, 77, 79, 0.5)'; }}
          onClick={() => {
            if (window.confirm('🚨 Êtes-vous sûr de vouloir supprimer définitivement ce projet ?\n\nCette action est irréversible !')) {
              if (onNavigate) onNavigate('home');
            }
          }}
        >
          Supprimer ce brouillon
        </button>
      </div>

    </>
  );
};

export default BasicsTab;
