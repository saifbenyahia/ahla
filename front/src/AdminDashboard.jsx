import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_URL = 'http://localhost:5000';

/**
 * AdminDashboard — Connected to real backend API
 * All mock data removed. KPIs, pending campaigns, and users
 * are fetched from /api/admin/* endpoints.
 */
const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [rejectModal, setRejectModal] = useState({ isOpen: false, campaignId: null, reason: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, campaign: null });

  // ── Live State (fetched from API) ────────────
  const [stats, setStats] = useState(null);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // ── Fetch KPI stats ──────────────────────────
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, { headers });
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setError(data.message);
    } catch { setError('Impossible de charger les statistiques.'); }
  };

  // ── Fetch pending campaigns ──────────────────
  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/campaigns/pending`, { headers });
      const data = await res.json();
      if (data.success) setPendingCampaigns(data.campaigns);
    } catch { /* silent */ }
  };

  // ── Fetch users ──────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, { headers });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch { /* silent */ }
  };

  // ── Initial load ─────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPending(), fetchUsers()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // ── Approve campaign ─────────────────────────
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/campaigns/${id}/approve`, {
        method: 'POST', headers,
      });
      const data = await res.json();
      if (data.success) {
        setPendingCampaigns(prev => prev.filter(c => c.id !== id));
        fetchStats(); // refresh KPIs
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch { alert('Erreur réseau.'); }
  };

  // ── Reject campaign ──────────────────────────
  const handleRejectClick = (id) => {
    setRejectModal({ isOpen: true, campaignId: id, reason: '' });
  };

  const confirmRejection = async () => {
    if (!rejectModal.reason.trim()) {
      alert("Le motif de refus est obligatoire.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/campaigns/${rejectModal.campaignId}/reject`, {
        method: 'POST', headers,
        body: JSON.stringify({ reason: rejectModal.reason }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingCampaigns(prev => prev.filter(c => c.id !== rejectModal.campaignId));
        fetchStats();
      }
      alert(data.message || 'Campagne refusée.');
    } catch { alert('Erreur réseau.'); }
    setRejectModal({ isOpen: false, campaignId: null, reason: '' });
  };

  // ── Delete user ──────────────────────────────
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ Supprimer définitivement "${user.name}" (${user.email}) ?\n\nToutes ses campagnes seront aussi supprimées. Cette action est irréversible.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE', headers,
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        fetchStats();
      }
      alert(data.message);
    } catch { alert('Erreur réseau.'); }
  };

  // ── Toggle role ──────────────────────────────
  const handleToggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'promouvoir en Administrateur' : 'rétrograder en Utilisateur';
    if (!window.confirm(`Voulez-vous ${action} "${user.name}" ?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/role`, {
        method: 'PUT', headers,
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      }
      alert(data.message);
    } catch { alert('Erreur réseau.'); }
  };

  // ── Rename user ──────────────────────────────
  const handleRenameUser = async (user) => {
    const newName = window.prompt(`Nouveau nom pour "${user.name}" :`, user.name);
    if (!newName || newName.trim() === user.name) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/name`, {
        method: 'PUT', headers,
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, name: newName.trim() } : u));
      }
      alert(data.message);
    } catch { alert('Erreur réseau.'); }
  };

  // ── Loading state ────────────────────────────
  if (loading) {
    return (
      <div className="admin-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#a1a1aa', fontSize: '18px' }}>Chargement du tableau de bord...</p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────
  if (error && !stats) {
    return (
      <div className="admin-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: '#f87171', fontSize: '16px' }}>{error}</p>
        <button className="btn-primary" onClick={() => onNavigate('home')}>Retour à l'accueil</button>
      </div>
    );
  }

  // ── Computed values ──────────────────────────
  const totalFunds = stats?.totalFunds || 0;
  const platformRevenue = totalFunds * (stats?.commissionRate || 0.05);
  const activeCampaigns = stats?.activeCampaigns || 0;
  const successRate = stats?.successRate || 0;
  const totalUsers = stats?.totalUsers || 0;
  const categorySplit = stats?.categorySplit || [];
  const totalCategoryCount = categorySplit.reduce((sum, c) => sum + c.value, 0) || 1;

  return (
    <div className="admin-wrapper">
      
      {/* ──────── Sidebar ──────── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <span className="admin-logo" onClick={() => onNavigate('home')}>Hive.tn</span>
        </div>

        <div className="admin-nav">
          <div className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <div className="nav-label"><span className="nav-icon">◱</span> Tableau de Bord</div>
          </div>

          <div className={`admin-nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
            <div className="nav-label"><span className="nav-icon">⊟</span> Modération</div>
            {pendingCampaigns.length > 0 && <span className="nav-count">{pendingCampaigns.length}</span>}
          </div>

          <div className={`admin-nav-item ${activeTab === 'validation' ? 'active' : ''}`} onClick={() => setActiveTab('validation')}>
            <div className="nav-label"><span className="nav-icon">◧</span> Validation Fonds</div>
          </div>

          <div className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <div className="nav-label"><span className="nav-icon">☺</span> Utilisateurs & Rôles</div>
          </div>
        </div>

        {(() => {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const initials = (storedUser.name || 'AD').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
          return (
            <div className="admin-sidebar-footer">
              <div className="sidebar-profile-avatar" style={storedUser.avatar ? { background: `url(${storedUser.avatar}) center/cover`, color: 'transparent' } : {}}>
                {storedUser.avatar ? '' : initials}
              </div>
              <div className="sidebar-profile-name">{storedUser.name || 'Administrateur'}</div>
              <div className="sidebar-profile-role">{storedUser.email || 'admin'}</div>
            </div>
          );
        })()}
      </aside>

      {/* ──────── Main Content ──────── */}
      <main className="admin-main">

        <header className="admin-header">
          <div className="admin-header-left">
            <div className="search-placeholder">
              <span>🔍</span> Rechercher...
            </div>
            <div className="admin-date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <div className="admin-header-actions">
            <button className="btn-primary" onClick={() => onNavigate('home')}>Quitter l'Admin</button>
          </div>
        </header>

        <section className="admin-content">

          {/* ── TAB: Analytics ── */}
          {activeTab === 'analytics' && (
            <div className="fade-in">
              <div className="admin-widgets">
                <div className="admin-card">
                  <p className="widget-title">Fonds Totaux</p>
                  <p className="widget-value">{totalFunds.toLocaleString()} <span>DT</span></p>
                  <div className="widget-trend">{stats?.totalCampaigns || 0} campagnes au total</div>
                </div>
                <div className="admin-card">
                  <p className="widget-title">Revenus Plateforme (5%)</p>
                  <p className="widget-value">{platformRevenue.toLocaleString()} <span>DT</span></p>
                  <div className="widget-trend">Commission Nette</div>
                </div>
                <div className="admin-card">
                  <p className="widget-title">Campagnes Actives</p>
                  <p className="widget-value">{activeCampaigns}</p>
                  <div className="widget-trend">{stats?.pendingCampaigns || 0} en attente</div>
                </div>
                <div className="admin-card">
                  <p className="widget-title">Taux de Succès</p>
                  <p className="widget-value">{successRate} <span>%</span></p>
                  <div className="widget-trend">{totalUsers.toLocaleString()} Utilisateurs</div>
                </div>
              </div>

              <div className="analytics-grid">
                <div className="admin-table-wrapper" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                  <div className="analytics-card">
                    <p className="analytics-card-title">Répartition par Secteur</p>
                    {categorySplit.length > 0 ? categorySplit.map(cat => (
                      <div className="category-bar-item" key={cat.name}>
                        <div className="category-bar-header">
                          <span className="category-bar-label">{cat.name}</span>
                          <span className="category-bar-pct">{Math.round((cat.value / totalCategoryCount) * 100)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${Math.round((cat.value / totalCategoryCount) * 100)}%` }}></div>
                        </div>
                      </div>
                    )) : (
                      <p style={{ color: '#a1a1aa', fontSize: '14px', padding: '20px 0' }}>Aucune donnée de catégorie disponible.</p>
                    )}
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <div className="table-header-bar">
                    <h4>Résumé Rapide</h4>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Métrique</th>
                        <th>Valeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="cell-primary">Campagnes brouillon</td>
                        <td className="cell-secondary">{stats?.draftCampaigns || 0}</td>
                      </tr>
                      <tr>
                        <td className="cell-primary">En attente de modération</td>
                        <td className="cell-secondary">{stats?.pendingCampaigns || 0}</td>
                      </tr>
                      <tr>
                        <td className="cell-primary">Campagnes actives</td>
                        <td className="cell-secondary">{stats?.activeCampaigns || 0}</td>
                      </tr>
                      <tr>
                        <td className="cell-primary">Campagnes clôturées</td>
                        <td className="cell-secondary">{stats?.closedCampaigns || 0}</td>
                      </tr>
                      <tr>
                        <td className="cell-primary">Utilisateurs inscrits</td>
                        <td className="cell-secondary">{totalUsers}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Modération ── */}
          {activeTab === 'moderation' && (
            <div className="fade-in admin-table-wrapper">
              <div className="table-header-bar">
                <h4>En attente de Modération ({pendingCampaigns.length})</h4>
              </div>
              {pendingCampaigns.length === 0 ? (
                <p style={{ color: '#a1a1aa', padding: '40px', textAlign: 'center' }}>
                  ✅ Aucune campagne en attente de modération.
                </p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titre de la Campagne</th>
                      <th>Créateur</th>
                      <th>Objectif</th>
                      <th>Catégorie</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCampaigns.map(camp => (
                      <tr key={camp.id}>
                        <td className="cell-primary">{camp.title}</td>
                        <td className="cell-secondary">{camp.creator_name}</td>
                        <td className="cell-primary">{(camp.target_amount / 1000).toLocaleString()} DT</td>
                        <td><span className="status-badge attente">{camp.category}</span></td>
                        <td>
                          <button className="action-btn" onClick={() => handleApprove(camp.id)}>Approuver</button>
                          <button className="action-btn" onClick={() => setViewModal({ isOpen: true, campaign: camp })} style={{ color: '#0ea5e9' }}>Détails</button>
                          <button className="action-btn" onClick={() => handleRejectClick(camp.id)} style={{ color: '#ef4444' }}>Refuser</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── TAB: Validation Funds ── */}
          {activeTab === 'validation' && (
            <div className="fade-in admin-table-wrapper">
              <div className="table-header-bar">
                <h4>Vérification des Preuves (Jalons)</h4>
              </div>
              <p style={{ color: '#a1a1aa', padding: '40px', textAlign: 'center' }}>
                🔧 Cette fonctionnalité sera disponible lorsque le système de jalons sera intégré au backend.
              </p>
            </div>
          )}

          {/* ── TAB: Users ── */}
          {activeTab === 'users' && (
            <div className="fade-in admin-table-wrapper">
              <div className="table-header-bar">
                <h4>Utilisateurs de la Plateforme ({users.length})</h4>
              </div>
              {users.length === 0 ? (
                <p style={{ color: '#a1a1aa', padding: '40px', textAlign: 'center' }}>Aucun utilisateur trouvé.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Rôle</th>
                      <th>Email</th>
                      <th>Inscrit le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const isSelf = u.email === 'admin';
                      return (
                        <tr key={u.id}>
                          <td className="cell-primary">{u.name}</td>
                          <td>
                            <span className={`status-badge ${u.role === 'ADMIN' ? 'actif' : 'attente'}`}>
                              {u.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="cell-secondary">{u.email}</td>
                          <td className="cell-secondary">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                          <td>
                            {isSelf ? (
                              <span style={{ color: '#a1a1aa', fontSize: '12px', fontStyle: 'italic' }}>Vous (protégé)</span>
                            ) : (
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button className="action-btn" onClick={() => handleRenameUser(u)} title="Renommer">
                                  ✏️ Renommer
                                </button>
                                <button
                                  className="action-btn"
                                  onClick={() => handleToggleRole(u)}
                                  style={{ color: u.role === 'ADMIN' ? '#f59e0b' : '#10b981' }}
                                  title={u.role === 'ADMIN' ? 'Rétrograder en Utilisateur' : 'Promouvoir en Admin'}
                                >
                                  {u.role === 'ADMIN' ? '⬇ Rétrograder' : '⬆ Promouvoir'}
                                </button>
                                <button
                                  className="action-btn"
                                  onClick={() => handleDeleteUser(u)}
                                  style={{ color: '#ef4444' }}
                                  title="Supprimer définitivement"
                                >
                                  🗑 Supprimer
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </section>
      </main>

      {/* ──────── Modal de Refus ──────── */}
      {rejectModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Refuser la Campagne</h3>
            <p className="modal-desc">
              Fournissez une raison détaillée. Celle-ci sera automatiquement envoyée par email au créateur de la campagne.
            </p>
            <textarea
              className="modal-textarea"
              placeholder="Ex : Le plan d'affaires est incomplet..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            />
            <div className="modal-actions">
              <button className="action-btn" onClick={() => setRejectModal({ isOpen: false, campaignId: null, reason: '' })}>Annuler</button>
              <button className="btn-reject-confirm" onClick={confirmRejection}>Envoyer le Refus</button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── Modal de Détails (View 360) ──────── */}
      {viewModal.isOpen && viewModal.campaign && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '85vh', overflowY: 'auto', textAlign: 'left' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', color: '#fff', margin: 0 }}>Détails de la Campagne</h2>
              <button onClick={() => setViewModal({ isOpen: false, campaign: null })} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', color: '#a1a1aa', marginBottom: '10px', textTransform: 'uppercase' }}>Informations de Base</h3>
              <p><strong>Titre :</strong> {viewModal.campaign.title}</p>
              <p><strong>Catégorie :</strong> {viewModal.campaign.category}</p>
              <p><strong>Objectif :</strong> {(viewModal.campaign.target_amount / 1000).toLocaleString()} TND</p>
              <p><strong>Créateur :</strong> {viewModal.campaign.creator_name} ({viewModal.campaign.creator_email})</p>
              <div style={{ marginTop: '15px' }}>
                <strong>Sous-titre / Description :</strong>
                <p style={{ marginTop: '5px', color: '#d1d1d6', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {viewModal.campaign.description || <span style={{ fontStyle: 'italic', color: '#6b7280' }}>Aucune description fournie.</span>}
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', color: '#a1a1aa', marginBottom: '10px', textTransform: 'uppercase' }}>Récompenses Proposées</h3>
              {!viewModal.campaign.rewards || viewModal.campaign.rewards.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#6b7280' }}>Aucune récompense ajoutée par le créateur.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {viewModal.campaign.rewards.map((rew, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong style={{ fontSize: '16px', color: '#fff' }}>{rew.title}</strong>
                        <strong style={{ color: '#0ce688' }}>{rew.price} TND</strong>
                      </div>
                      {rew.desc && <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>{rew.desc}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', color: '#a1a1aa', marginBottom: '10px', textTransform: 'uppercase' }}>Histoire du Projet</h3>
              <div style={{ color: '#d1d1d6', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {viewModal.campaign.story ? (
                  viewModal.campaign.story
                ) : (
                  <span style={{ fontStyle: 'italic', color: '#6b7280' }}>L'histoire détaillée n'est pas encore complétée.</span>
                )}
              </div>
            </div>
            
            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button className="action-btn" onClick={() => setViewModal({ isOpen: false, campaign: null })}>Fermer</button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="action-btn" onClick={() => {
                  handleApprove(viewModal.campaign.id);
                  setViewModal({ isOpen: false, campaign: null });
                }}>Approuver</button>
                <button className="btn-reject-confirm" onClick={() => {
                  handleRejectClick(viewModal.campaign.id);
                  setViewModal({ isOpen: false, campaign: null });
                }}>Refuser</button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
