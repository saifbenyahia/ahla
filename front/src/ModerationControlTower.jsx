import React, { useState } from 'react';
import './ModerationControlTower.css';

const ModerationControlTower = () => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const macros = [
    "Catégorie incorrecte",
    "Objectif financier irréaliste",
    "Manque de garanties de réalisation",
    "Contenu inapproprié"
  ];

  const handleMacroClick = (macroText) => {
    setRejectReason((prev) => {
      // Si le champ est vide, on met juste la macro. Sinon, on ajoute à la ligne avec une puce.
      const prefix = prev.trim() === "" ? "" : prev + "\n";
      return prefix + "- " + macroText;
    });
  };

  const handleApprove = () => {
    alert("Le projet a été approuvé avec succès !");
  };

  const submitRejection = () => {
    if (!rejectReason.trim()) {
      alert("Veuillez fournir un motif de refus.");
      return;
    }
    alert("Projet refusé. Motif envoyé :\n" + rejectReason);
    // Reset state after theoretical submission
    setIsRejecting(false);
    setRejectReason("");
  };

  const cancelRejection = () => {
    setIsRejecting(false);
    setRejectReason("");
  };

  return (
    <div className="mod-tower-wrapper">
      <div className="mod-tower-container">
        
        {/* PANNEAU GAUCHE - APERÇU */}
        <section className="mod-tower-left">
          <header className="mod-header">
            <span className="mod-badge">Agriculture</span>
            <h1 className="mod-title">Oasis Solidaire à Chenini</h1>
            <div className="mod-target">
              Objectif: <span className="mod-target-accent">15 000 DT</span>
            </div>
          </header>

          <div className="mod-media-placeholder">
            <div className="mod-media-text">
              <i>🏞️</i>
              <span>Aperçu Image / Vidéo du Projet</span>
            </div>
          </div>

          <p className="mod-desc">
            Ce projet vise à restaurer une oasis abandonnée dans la région de Chenini en utilisant 
            des techniques d'agriculture durable et d'irrigation intelligente. Les fonds seront 
            entièrement dédiés à l'achat de pompes solaires et de semences autochtones pour 
            relancer l'écosystème local.
          </p>
        </section>

        {/* PANNEAU DROIT - ACTIONS */}
        <section className="mod-tower-right">
          <div className="mod-action-card">
            <h2 className="mod-action-title">Décision de Modération</h2>

            {!isRejecting ? (
              // Vue Initiale : Choix principal
              <div className="mod-action-buttons">
                <button 
                  className="btn-approve-huge" 
                  onClick={handleApprove}
                >
                  ✓ Approuver le projet
                </button>
                <button 
                  className="btn-reject-huge" 
                  onClick={() => setIsRejecting(true)}
                >
                  ✕ Refuser le projet
                </button>
              </div>
            ) : (
              // Vue Secondaire : Formulaire de Refus
              <div className="mod-reject-form">
                <label className="mod-label">Insérer des motifs rapides :</label>
                <div className="mod-macros-container">
                  {macros.map((macro, idx) => (
                    <button 
                      key={idx} 
                      className="mod-macro-chip"
                      onClick={() => handleMacroClick(macro)}
                    >
                      + {macro}
                    </button>
                  ))}
                </div>

                <label className="mod-label">Message détaillé destiné au créateur :</label>
                <textarea 
                  className="mod-textarea"
                  placeholder="Expliquez en détail pourquoi ce projet ne peut pas être accepté en l'état..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />

                <div className="mod-form-actions">
                  <button className="btn-cancel" onClick={cancelRejection}>
                    Annuler
                  </button>
                  <button className="btn-confirm-reject" onClick={submitRejection}>
                    Envoyer le refus
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </section>

      </div>
    </div>
  );
};

export default ModerationControlTower;
