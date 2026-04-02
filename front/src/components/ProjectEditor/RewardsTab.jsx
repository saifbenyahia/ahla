import React, { useState, useRef } from 'react';

const API_URL = 'http://localhost:5000';

const RewardsTab = ({ draftProject, onSaveDraft }) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [items, setItems] = useState(draftProject?.rewards || []);

  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  
  const [savingMsg, setSavingMsg] = useState('');

  const syncWithServer = async (newItems) => {
    setSavingMsg('Sauvegarde en cours...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/campaigns/${draftProject.campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rewards: newItems })
      });
      if (res.ok) {
        setSavingMsg('Enregistré ✓');
        if (onSaveDraft) {
          onSaveDraft({ rewards: newItems });
        }
        setTimeout(() => setSavingMsg(''), 2000);
      } else {
        setSavingMsg('Erreur de sauvegarde');
      }
    } catch (e) {
      setSavingMsg('Erreur réseau');
    }
  };

  const handleDeleteItem = (indexToDelete) => {
    const newItems = items.filter((_, idx) => idx !== indexToDelete);
    setItems(newItems);
    syncWithServer(newItems);
  };

  const handleSaveItem = () => {
    if (itemTitle.trim() !== '') {
      const newItems = [...items, { title: itemTitle, price: itemPrice, desc: itemDesc }];
      setItems(newItems);
      setItemTitle('');
      setItemPrice('');
      setItemDesc('');
      setIsAddingItem(false);
      syncWithServer(newItems);
    }
  };

  return (
    <>
      <div style={{ maxWidth: '1100px', margin: '0 auto 60px auto', textAlign: 'left', position: 'relative' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Récompenses</h1>
        <p style={{ color: '#a1a1aa' }}>Définissez ce que vous offrez à vos contributeurs en échange de leur soutien.</p>
        
        {savingMsg && (
          <div style={{ position: 'absolute', top: '10px', right: '0', background: 'rgba(5,206,120,0.1)', color: '#0ce688', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', border: '1px solid rgba(5,206,120,0.3)' }}>
            {savingMsg}
          </div>
        )}
      </div>

      {!isAddingItem && (
        <div className="pe-rewards-intro" style={{ maxWidth: '1100px', margin: '0 auto 40px auto', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '50px 30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ marginBottom: '35px', color: '#d1d1d6', lineHeight: '1.7', fontSize: '16px', maxWidth: '800px', margin: '0 auto 35px auto' }}>
            L'inclusion de récompenses permet aux contributeurs de comprendre et de comparer facilement vos offres. Une récompense peut être n'importe quoi que vous prévoyez d'offrir à vos contributeurs. Quelques exemples incluent des cartes à jouer, une copie numérique d'un livre, un billet pour une pièce de théâtre, ou même un remerciement dans votre documentaire.
          </p>
          <button className="pe-new-item-btn" onClick={() => setIsAddingItem(true)}>
            <span style={{ fontSize: '22px', marginRight: '8px', fontWeight: 'bold' }}>+</span> Ajouter une récompense
          </button>
          <div style={{ marginTop: '25px' }}>
            <span className="pe-upload-text" style={{ color: '#05ce78', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}>
              En savoir plus sur la création de récompenses
            </span>
          </div>
        </div>
      )}

      {/* Liste des récompenses existantes */}
      {items.length > 0 && !isAddingItem && (
        <div style={{ maxWidth: '1100px', margin: '0 auto 40px auto', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '20px', color: '#fff' }}>Vos récompenses sauvegardées ({items.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', position: 'relative' }}>
                <button
                  onClick={() => handleDeleteItem(idx)}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'color 0.2s' }}
                  title="Supprimer cette récompense"
                  onMouseOver={(e) => e.target.style.color = '#ff7875'}
                  onMouseOut={(e) => e.target.style.color = '#ff4d4f'}
                >
                  ✕
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingRight: '25px' }}>
                  <strong style={{ fontSize: '18px', color: '#fff' }}>{item.title}</strong>
                  <span style={{ color: '#0ce688', fontWeight: '600' }}>{item.price ? `${item.price} TND` : 'Inclus'}</span>
                </div>
                {item.desc && <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>{item.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire d'ajout de récompense */}
      {isAddingItem && (
        <div className="pe-split-right" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '30px' }}>Créer une nouvelle récompense</h2>

          <div className="pe-form-row">
            <div className="pe-form-col">
              <label className="pe-label">Titre de la récompense</label>
              <input
                type="text"
                className="pe-input"
                placeholder="Ex: T-shirt exclusif Hive.tn"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
              />
            </div>
            <div className="pe-form-col">
              <label className="pe-label">Valeur estimée (TND)</label>
              <input
                type="number"
                className="pe-input"
                placeholder="Ex: 50"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label className="pe-label">Description (Optionnelle)</label>
            <textarea
              className="pe-textarea pe-input"
              placeholder="Décrivez cette récompense en quelques mots..."
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button
              className="cp-btn-next"
              style={{ width: 'auto', margin: 0 }}
              onClick={handleSaveItem}
              disabled={!itemTitle.trim()}
            >
              Sauvegarder la récompense
            </button>
            <button
              className="pe-save-btn"
              onClick={() => setIsAddingItem(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RewardsTab;