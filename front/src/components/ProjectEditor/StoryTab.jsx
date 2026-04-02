import React, { useState, useRef } from 'react';

const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Paragraphe' },
  { value: 'heading', label: 'Titre' },
  { value: 'subheading', label: 'Sous-titre' },
];

const createBlock = (type = 'paragraph', content = '') => ({
  id: Date.now() + Math.random(),
  type,
  content,
});

const StoryTab = () => {
  // Story Blocks
  const [blocks, setBlocks] = useState([createBlock()]);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [showTypeMenu, setShowTypeMenu] = useState(null);
  const fileInputRef = useRef(null);
  const imageBlockTarget = useRef(null);

  // New Sections
  const [risks, setRisks] = useState('');
  const [faqs, setFaqs] = useState([]);

  const updateBlock = (id, updates) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id) => {
    setBlocks(prev => {
      const filtered = prev.filter(b => b.id !== id);
      return filtered.length === 0 ? [createBlock()] : filtered;
    });
  };

  const addBlockAfter = (id, type = 'paragraph') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      const newBlock = createBlock(type);
      const updated = [...prev];
      updated.splice(idx + 1, 0, newBlock);
      setActiveBlockId(newBlock.id);
      return updated;
    });
  };

  const addBlockAtEnd = (type = 'paragraph') => {
    const newBlock = createBlock(type);
    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const handleImageUpload = (blockId) => {
    imageBlockTarget.current = blockId;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && imageBlockTarget.current) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const targetId = imageBlockTarget.current;
        // Insert image block after target
        setBlocks(prev => {
          const idx = prev.findIndex(b => b.id === targetId);
          const imgBlock = {
            id: Date.now() + Math.random(),
            type: 'image',
            content: ev.target.result,
            fileName: file.name,
          };
          const updated = [...prev];
          updated.splice(idx + 1, 0, imgBlock);
          return updated;
        });
        imageBlockTarget.current = null;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const addVideoEmbed = (blockId) => {
    const url = prompt('Collez l\'URL de la vidéo (YouTube, Vimeo, etc.) :');
    if (url && url.trim()) {
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === blockId);
        const videoBlock = {
          id: Date.now() + Math.random(),
          type: 'video',
          content: url.trim(),
        };
        const updated = [...prev];
        updated.splice(idx + 1, 0, videoBlock);
        return updated;
      });
    }
  };

  const toggleList = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      if (block.type === 'list') {
        updateBlock(blockId, { type: 'paragraph' });
      } else {
        updateBlock(blockId, { type: 'list' });
      }
    }
  };

  const getVideoEmbedUrl = (url) => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const handleKeyDown = (e, block) => {
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'list') {
      e.preventDefault();
      addBlockAfter(block.id);
    }
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  return (
    <>
      {/* Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 30px auto', textAlign: 'left' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Histoire du projet</h1>
        <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
          Décrivez pourquoi vous levez des fonds, ce qui vous tient à cœur, comment vous comptez réaliser votre projet et qui vous êtes.
        </p>
      </div>

      {/* Info Banner */}
      <div className="story-info-banner">
        <div className="story-info-icon">📝</div>
        <div style={{ flex: 1 }}>
          <strong>Bienvenue dans l'éditeur d'histoire</strong>
          <span style={{ color: '#a1a1aa', marginLeft: '8px' }}>Utilisez la barre d'outils pour formater votre contenu.</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Editor Area */}
      <div className="story-editor">
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`story-block ${activeBlockId === block.id ? 'active' : ''}`}
            onClick={() => setActiveBlockId(block.id)}
          >
            {/* Block Toolbar - visible on active */}
            {activeBlockId === block.id && block.type !== 'image' && block.type !== 'video' && (
              <div className="story-toolbar">
                <div className="story-toolbar-group">
                  <div className="story-type-selector">
                    <button
                      className="story-toolbar-btn story-type-btn"
                      onClick={(e) => { e.stopPropagation(); setShowTypeMenu(showTypeMenu === block.id ? null : block.id); }}
                    >
                      {BLOCK_TYPES.find(t => t.value === block.type)?.label || 'Paragraphe'}
                      <span className="story-chevron">▾</span>
                    </button>
                    {showTypeMenu === block.id && (
                      <div className="story-type-menu">
                        {BLOCK_TYPES.map(t => (
                          <button
                            key={t.value}
                            className={`story-type-option ${block.type === t.value ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBlock(block.id, { type: t.value });
                              setShowTypeMenu(null);
                            }}
                          >
                            <span className={`story-type-preview ${t.value}`}>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="story-toolbar-divider" />

                <div className="story-toolbar-group">
                  <button
                    className="story-toolbar-btn"
                    title="Ajouter une image"
                    onClick={(e) => { e.stopPropagation(); handleImageUpload(block.id); }}
                  >
                    🖼️
                  </button>
                  <button
                    className="story-toolbar-btn"
                    title="Intégrer une vidéo"
                    onClick={(e) => { e.stopPropagation(); addVideoEmbed(block.id); }}
                  >
                    🎬
                  </button>
                  <button
                    className={`story-toolbar-btn ${block.type === 'list' ? 'active' : ''}`}
                    title="Liste à puces"
                    onClick={(e) => { e.stopPropagation(); toggleList(block.id); }}
                  >
                    ☰
                  </button>
                </div>

                <div className="story-toolbar-divider" />

                <button
                  className="story-toolbar-btn story-delete-btn"
                  title="Supprimer ce bloc"
                  onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                >
                  🗑️
                </button>
              </div>
            )}

            {/* Block Content */}
            {block.type === 'image' ? (
              <div className="story-image-block">
                <img src={block.content} alt={block.fileName || 'Image'} className="story-image" />
                <button
                  className="story-image-delete"
                  onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                  title="Supprimer l'image"
                >
                  ✕
                </button>
              </div>
            ) : block.type === 'video' ? (
              <div className="story-video-block">
                <iframe
                  src={getVideoEmbedUrl(block.content)}
                  title="Vidéo intégrée"
                  className="story-video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  className="story-image-delete"
                  onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                  title="Supprimer la vidéo"
                >
                  ✕
                </button>
              </div>
            ) : (
              <textarea
                className={`story-textarea story-${block.type}`}
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, block)}
                onFocus={() => setActiveBlockId(block.id)}
                placeholder={
                  block.type === 'heading' ? 'Titre…' :
                    block.type === 'subheading' ? 'Sous-titre…' :
                      block.type === 'list' ? '• Élément de liste…' :
                        'Commencez à écrire votre histoire ici…'
                }
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            )}
          </div>
        ))}

        {/* Add Block Button */}
        <div className="story-add-block">
          <button
            className="story-add-btn"
            onClick={() => addBlockAtEnd()}
            title="Ajouter un bloc"
          >
            +
          </button>
        </div>
      </div>

      <div style={{ height: '40px' }}></div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '50px' }} />

      {/* Risks and Challenges */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Risques et défis</h2>
          <p style={{ marginBottom: '15px' }}>Soyez honnête sur les risques et les défis potentiels de ce projet et sur la manière dont vous prévoyez de les surmonter pour le mener à bien.</p>
        </div>
        <div className="pe-split-right">
          <textarea
            className="pe-textarea pe-input"
            placeholder="Les risques et défis courants que vous pourriez vouloir aborder incluent le budget, les délais pour les récompenses et le projet lui-même, la taille de votre audience..."
            value={risks}
            onChange={(e) => setRisks(e.target.value)}
          ></textarea>
          <div className="pe-note" style={{ marginTop: '10px' }}>
            💡 Communiquez les risques et les défis à l'avance pour définir les bonnes attentes. <span style={{ textDecoration: 'underline', color: '#0ce688', cursor: 'pointer', marginLeft: '5px' }}>En savoir plus...</span>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="pe-split-row">
        <div className="pe-split-left">
          <h2>Foire aux questions</h2>
          <p style={{ marginBottom: '15px' }}>Publiez des réponses aux questions fréquemment posées.</p>
        </div>
        <div className="pe-split-right" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label className="pe-label">Question</label>
                  <input
                    type="text"
                    className="pe-input"
                    value={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...faqs];
                      newFaqs[index].question = e.target.value;
                      setFaqs(newFaqs);
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="pe-label">Réponse</label>
                  <textarea
                    className="pe-textarea pe-input"
                    style={{ minHeight: '100px', lineHeight: '1.5', padding: '12px 16px' }}
                    value={faq.answer}
                    onChange={(e) => {
                      const newFaqs = [...faqs];
                      newFaqs[index].answer = e.target.value;
                      setFaqs(newFaqs);
                    }}
                  ></textarea>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    className="pe-save-btn"
                    style={{ color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                    onClick={() => {
                      setFaqs(faqs.filter((_, i) => i !== index));
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🗑️</span> Supprimer
                  </button>
                </div>
              </div>
            ))}

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
              <button
                className="pe-new-item-btn"
                style={{ background: '#111', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'none' }}
                onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
              >
                Ajouter une autre FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoryTab;