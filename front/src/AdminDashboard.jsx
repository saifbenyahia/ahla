import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_URL = 'http://localhost:5000';
const emptyEditCampaignModal = () => ({
  isOpen: false,
  campaignId: null,
  title: '',
  description: '',
  category: '',
  targetAmount: '',
  imageUrl: '',
  imagePreview: '',
  imageFile: null,
  videoUrl: '',
  videoPreview: '',
  videoFile: null,
});

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_URL}${url}`;
};

/**
 * AdminDashboard — Connected to real backend API
 * All mock data removed. KPIs, pending campaigns, and users
 * are fetched from /api/admin/* endpoints.
 */
const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [rejectModal, setRejectModal] = useState({ isOpen: false, campaignId: null, reason: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, campaign: null });
  const [editCampaignModal, setEditCampaignModal] = useState(emptyEditCampaignModal);
  const [editUserModal, setEditUserModal] = useState({
    isOpen: false,
    userId: null,
    name: '',
    email: '',
    role: 'USER',
    bio: '',
    avatar: '',
  });

  // ── Live State (fetched from API) ────────────
  const [stats, setStats] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
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

  const fetchAllCampaigns = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/campaigns`, { headers });
      const data = await res.json();
      if (data.success) setAllCampaigns(data.campaigns);
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
      await Promise.all([fetchStats(), fetchPending(), fetchAllCampaigns(), fetchUsers()]);
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
        fetchStats();
        fetchAllCampaigns();
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

  const handleOpenEditCampaign = (campaign) => {
    setEditCampaignModal({
      ...emptyEditCampaignModal(),
      isOpen: true,
      campaignId: campaign.id,
      title: campaign.title || '',
      description: campaign.description || '',
      category: campaign.category || '',
      targetAmount: campaign.target_amount ? String(campaign.target_amount / 1000) : '',
      imageUrl: campaign.image_url || '',
      imagePreview: resolveMediaUrl(campaign.image_url),
      videoUrl: campaign.video_url || '',
      videoPreview: resolveMediaUrl(campaign.video_url),
    });
  };

  const handleEditCampaignImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop volumineuse (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditCampaignModal(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: event.target?.result || '',
        videoUrl: '',
        videoPreview: '',
        videoFile: null,
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEditCampaignVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      alert('La video est trop volumineuse (max 200MB).');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setEditCampaignModal(prev => ({
      ...prev,
      videoFile: file,
      videoPreview: objectUrl,
      imageUrl: '',
      imagePreview: '',
      imageFile: null,
    }));
    e.target.value = '';
  };

  const handleSaveEditedCampaign = async () => {
    if (!editCampaignModal.title.trim() || !editCampaignModal.category.trim() || !editCampaignModal.targetAmount) {
      alert('Titre, catégorie et objectif sont obligatoires.');
      return;
    }

    const targetAmount = Number(editCampaignModal.targetAmount);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      alert("L'objectif doit être un montant positif.");
      return;
    }

    try {
      let nextImageUrl = editCampaignModal.imageUrl || '';
      let nextVideoUrl = editCampaignModal.videoUrl || '';

      if (editCampaignModal.imageFile) {
        nextVideoUrl = '';
        const formData = new FormData();
        formData.append('file', editCampaignModal.imageFile);

        const uploadRes = await fetch(`${API_URL}/api/admin/campaigns/${editCampaignModal.campaignId}/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          alert(uploadData.message || "Erreur lors de l'upload de l'image.");
          return;
        }

        nextImageUrl = uploadData.fileUrl || nextImageUrl;
      }

      if (editCampaignModal.videoFile) {
        nextImageUrl = '';
        const formData = new FormData();
        formData.append('file', editCampaignModal.videoFile);

        const uploadRes = await fetch(`${API_URL}/api/admin/campaigns/${editCampaignModal.campaignId}/video`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          alert(uploadData.message || "Erreur lors de l'upload de la video.");
          return;
        }

        nextVideoUrl = uploadData.fileUrl || nextVideoUrl;
      }

      const res = await fetch(`${API_URL}/api/admin/campaigns/${editCampaignModal.campaignId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: editCampaignModal.title.trim(),
          description: editCampaignModal.description.trim(),
          category: editCampaignModal.category.trim(),
          target_amount: Math.round(targetAmount * 1000),
          image_url: nextImageUrl,
          video_url: nextVideoUrl,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setEditCampaignModal(emptyEditCampaignModal());
        fetchAllCampaigns();
        alert(data.message);
      } else {
        alert(data.message || 'Erreur de mise à jour.');
      }
    } catch {
      alert('Erreur réseau.');
    }
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
        fetchAllCampaigns();
      }
      alert(data.message || 'Campagne refusée.');
    } catch { alert('Erreur réseau.'); }
    setRejectModal({ isOpen: false, campaignId: null, reason: '' });
  };

  // ── Delete user ──────────────────────────────
  const handleDeleteCampaign = async (campaign) => {
    const statusLabel =
      campaign.status === 'DRAFT'
        ? 'brouillon'
        : campaign.status === 'PENDING'
          ? 'en attente'
          : campaign.status === 'ACTIVE'
            ? 'active'
            : 'selectionnee';
    if (!window.confirm(`Supprimer definitivement la campagne "${campaign.title}" (${statusLabel}) ?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/campaigns/${campaign.id}`, {
        method: 'DELETE', headers,
      });
      const data = await res.json();
      if (data.success) {
        setAllCampaigns(prev => prev.filter(item => item.id !== campaign.id));
        setPendingCampaigns(prev => prev.filter(item => item.id !== campaign.id));
        fetchStats();
        fetchPending();
        fetchAllCampaigns();
      }
      alert(data.message || 'Campagne supprimee.');
    } catch {
      alert('Erreur reseau.');
    }
  };

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
        fetchAllCampaigns();
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
  const handleOpenEditUser = (user) => {
    setEditUserModal({
      isOpen: true,
      userId: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
  };

  const handleEditUserAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop volumineuse (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditUserModal(prev => ({ ...prev, avatar: event.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditedUser = async () => {
    if (!editUserModal.name.trim()) {
      alert('Le nom est obligatoire.');
      return;
    }

    if (!editUserModal.email.trim()) {
      alert("L'email est obligatoire.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${editUserModal.userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: editUserModal.name.trim(),
          email: editUserModal.email.trim(),
          role: editUserModal.role,
          bio: editUserModal.bio,
          avatar: editUserModal.avatar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(user => user.id === data.user.id ? data.user : user));
        if (data.user.id === currentUser.id) {
          localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user }));
        }
        setEditUserModal({
          isOpen: false,
          userId: null,
          name: '',
          email: '',
          role: 'USER',
          bio: '',
          avatar: '',
        });
        alert(data.message);
      } else {
        alert(data.message || "Erreur lors de la mise a jour de l'utilisateur.");
      }
    } catch {
      alert('Erreur reseau.');
    }
  };

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
  const getCampaignStatusClass = (status) => {
    if (status === 'ACTIVE') return 'actif';
    if (status === 'PENDING') return 'attente';
    if (status === 'DRAFT') return 'attente';
    if (status === 'REJECTED') return 'refuse';
    return 'archive';
  };
  const getCampaignStatusLabel = (status) => {
    if (status === 'ACTIVE') return 'Active';
    if (status === 'PENDING') return 'En attente';
    if (status === 'DRAFT') return 'Brouillon';
    if (status === 'REJECTED') return 'RefusÃ©e';
    if (status === 'CLOSED') return 'ClÃ´turÃ©e';
    return status;
  };

  const formatCampaignStatus = (status) => {
    if (status === 'ACTIVE') return 'Active';
    if (status === 'PENDING') return 'En attente';
    if (status === 'DRAFT') return 'Brouillon';
    if (status === 'REJECTED') return 'Refusee';
    if (status === 'CLOSED') return 'Cloturee';
    return status;
  };

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

          <div className={`admin-nav-item ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>
            <div className="nav-label"><span className="nav-icon">◨</span> Toutes les campagnes</div>
            {allCampaigns.length > 0 && <span className="nav-count">{allCampaigns.length}</span>}
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
                      <th>Créée le</th>
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
                        <td className="cell-secondary">{new Date(camp.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <button className="action-btn" onClick={() => handleApprove(camp.id)}>Approuver</button>
                          <button className="action-btn" onClick={() => setViewModal({ isOpen: true, campaign: camp })} style={{ color: '#0ea5e9' }}>Détails</button>
                          <button className="action-btn" onClick={() => handleRejectClick(camp.id)} style={{ color: '#ef4444' }}>Refuser</button>
                          <button className="action-btn" onClick={() => handleDeleteCampaign(camp)} style={{ color: '#f97316' }}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── TAB: Validation Funds ── */}
          {activeTab === 'campaigns' && (
            <div className="fade-in admin-table-wrapper">
              <div className="table-header-bar">
                <h4>Toutes les campagnes ({allCampaigns.length})</h4>
              </div>
              {allCampaigns.length === 0 ? (
                <p style={{ color: '#a1a1aa', padding: '40px', textAlign: 'center' }}>
                  Aucune campagne trouvée.
                </p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Créateur</th>
                      <th>Catégorie</th>
                      <th>Objectif</th>
                      <th>Statut</th>
                      <th>Créée le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCampaigns.map(campaign => (
                      <tr key={campaign.id}>
                        <td className="cell-primary">{campaign.title}</td>
                        <td className="cell-secondary">{campaign.creator_name}</td>
                        <td className="cell-secondary">{campaign.category || 'Non catégorisé'}</td>
                        <td className="cell-primary">{(campaign.target_amount / 1000).toLocaleString()} DT</td>
                        <td>
                          <span className={`status-badge ${getCampaignStatusClass(campaign.status)}`}>
                            {formatCampaignStatus(campaign.status)}
                          </span>
                        </td>
                        <td className="cell-secondary">{new Date(campaign.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>
                          {campaign.status === 'ACTIVE' ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button className="action-btn" onClick={() => handleOpenEditCampaign(campaign)}>
                                Modifier
                              </button>
                              <button className="action-btn" onClick={() => handleDeleteCampaign(campaign)} style={{ color: '#f97316' }}>
                                Supprimer
                              </button>
                            </div>
                          ) : campaign.status === 'DRAFT' || campaign.status === 'PENDING' ? (
                            <button className="action-btn" onClick={() => handleDeleteCampaign(campaign)} style={{ color: '#f97316' }}>
                              Supprimer
                            </button>
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Non modifiable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                      const isSelf = u.id === currentUser.id;
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
                                <button className="action-btn user-edit-btn" data-label="Modifier" onClick={() => handleOpenEditUser(u)} title="Modifier l'utilisateur">
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
      {editCampaignModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '760px', width: '90%', maxHeight: '85vh', overflowY: 'auto', textAlign: 'left' }}>
            <h3 className="modal-title">Modifier une campagne active</h3>
            <p className="modal-desc">
              L'administrateur peut corriger les informations de base d'une campagne acceptée.
            </p>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Image de campagne</label>
                <div className="admin-avatar-editor">
                  <label
                    className="admin-avatar-upload"
                    style={editCampaignModal.imagePreview ? {
                      backgroundImage: `url(${editCampaignModal.imagePreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'transparent',
                    } : {}}
                  >
                    {editCampaignModal.imagePreview ? "Apercu de l'image" : 'Choisir une image'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleEditCampaignImageChange}
                    />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#8b949e', fontSize: '12px' }}>
                      {editCampaignModal.imageFile ? 'Nouvelle image prete a etre enregistree. La video sera retiree.' : "Une campagne ne peut garder qu'un seul media principal a la fois."}
                    </span>
                    {editCampaignModal.imagePreview && (
                      <button
                        type="button"
                        className="action-btn"
                        style={{ color: '#ef4444' }}
                        onClick={() => setEditCampaignModal(prev => ({
                          ...prev,
                          imageUrl: '',
                          imagePreview: '',
                          imageFile: null,
                        }))}
                      >
                        Supprimer l'image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Video de campagne</label>
                <div className="admin-avatar-editor">
                  <label className="admin-avatar-upload admin-video-upload">
                    {editCampaignModal.videoPreview ? (
                      <video
                        src={editCampaignModal.videoPreview}
                        controls
                        className="admin-campaign-video-preview"
                      />
                    ) : (
                      'Choisir une video'
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      style={{ display: 'none' }}
                      onChange={handleEditCampaignVideoChange}
                    />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#8b949e', fontSize: '12px' }}>
                      {editCampaignModal.videoFile ? 'Nouvelle video prete a etre enregistree. L image sera retiree.' : "Une campagne ne peut garder qu'un seul media principal a la fois."}
                    </span>
                    {editCampaignModal.videoPreview && (
                      <button
                        type="button"
                        className="action-btn"
                        style={{ color: '#ef4444' }}
                        onClick={() => setEditCampaignModal(prev => ({
                          ...prev,
                          videoUrl: '',
                          videoPreview: '',
                          videoFile: null,
                        }))}
                      >
                        Supprimer la video
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Titre</label>
                <input
                  className="modal-textarea"
                  style={{ minHeight: 'auto', height: '46px' }}
                  value={editCampaignModal.title}
                  onChange={(e) => setEditCampaignModal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Description</label>
                <textarea
                  className="modal-textarea"
                  value={editCampaignModal.description}
                  onChange={(e) => setEditCampaignModal(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Catégorie</label>
                  <input
                    className="modal-textarea"
                    style={{ minHeight: 'auto', height: '46px' }}
                    value={editCampaignModal.category}
                    onChange={(e) => setEditCampaignModal(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Objectif (TND)</label>
                  <input
                    type="number"
                    className="modal-textarea"
                    style={{ minHeight: 'auto', height: '46px' }}
                    value={editCampaignModal.targetAmount}
                    onChange={(e) => setEditCampaignModal(prev => ({ ...prev, targetAmount: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ position: 'sticky', bottom: 0, background: '#161b22', paddingTop: '16px' }}>
              <button
                className="action-btn"
                onClick={() => setEditCampaignModal(emptyEditCampaignModal())}
              >
                Annuler
              </button>
              <button className="btn-primary" onClick={handleSaveEditedCampaign}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {editUserModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '760px', width: '90%', textAlign: 'left' }}>
            <h3 className="modal-title">Modifier un utilisateur</h3>
            <p className="modal-desc">
              L'administrateur peut mettre a jour les informations du compte et le role.
            </p>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Nom</label>
                  <input
                    className="modal-textarea"
                    style={{ minHeight: 'auto', height: '46px' }}
                    value={editUserModal.name}
                    onChange={(e) => setEditUserModal(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Role</label>
                  <select
                    className="modal-textarea"
                    style={{ minHeight: 'auto', height: '46px' }}
                    value={editUserModal.role}
                    onChange={(e) => setEditUserModal(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Email</label>
                <input
                  className="modal-textarea"
                  style={{ minHeight: 'auto', height: '46px' }}
                  value={editUserModal.email}
                  onChange={(e) => setEditUserModal(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Bio</label>
                <textarea
                  className="modal-textarea"
                  value={editUserModal.bio}
                  onChange={(e) => setEditUserModal(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>Avatar</label>
                <div className="admin-avatar-editor">
                  <label
                    className="admin-avatar-upload"
                    style={editUserModal.avatar ? {
                      backgroundImage: `url(${editUserModal.avatar})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: 'transparent',
                    } : {}}
                  >
                    {editUserModal.avatar ? 'Avatar actuel' : 'Choisir une image'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleEditUserAvatarChange}
                    />
                  </label>
                  {editUserModal.avatar && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#8b949e', fontSize: '12px' }}>Apercu de l'image actuelle</span>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ color: '#ef4444' }}
                        onClick={() => setEditUserModal(prev => ({ ...prev, avatar: '' }))}
                      >
                        Supprimer l'image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="action-btn"
                onClick={() => setEditUserModal({
                  isOpen: false,
                  userId: null,
                  name: '',
                  email: '',
                  role: 'USER',
                  bio: '',
                  avatar: '',
                })}
              >
                Annuler
              </button>
              <button className="btn-primary" onClick={handleSaveEditedUser}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

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
              <p><strong>Date de création :</strong> {viewModal.campaign.created_at ? new Date(viewModal.campaign.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}</p>
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
                      {(rew.image || rew.image_url) && (
                        <img
                          src={resolveMediaUrl(rew.image || rew.image_url)}
                          alt={rew.title || `Recompense ${idx + 1}`}
                          style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                        />
                      )}
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

