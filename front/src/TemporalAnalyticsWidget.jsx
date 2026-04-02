import React, { useState, useEffect } from 'react';
import './TemporalAnalyticsWidget.css';

const TemporalAnalyticsWidget = () => {
  const [selectedFilter, setSelectedFilter] = useState("Ce mois-ci");
  const [isLoading, setIsLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Mock data qui changera selon le filtre
  const [metrics, setMetrics] = useState({
    funds: 0,
    commission: 0,
    projects: 0
  });

  const filters = ["7 derniers jours", "Ce mois-ci", "Trimestre dernier", "Année en cours"];

  // Simulation du chargement réseau lors du changement de filtre
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      // Génération de data fictive cohérente selon le filtre
      let baseFunds = 0;
      let newProjects = 0;

      switch (selectedFilter) {
        case "7 derniers jours":
          baseFunds = 3500;
          newProjects = 2;
          break;
        case "Ce mois-ci":
          baseFunds = 12500;
          newProjects = 4;
          break;
        case "Trimestre dernier":
          baseFunds = 48000;
          newProjects = 15;
          break;
        case "Année en cours":
          baseFunds = 185000;
          newProjects = 52;
          break;
        default:
          baseFunds = 0;
      }

      setMetrics({
        funds: baseFunds,
        commission: baseFunds * 0.05, // 5% de commission nette
        projects: newProjects
      });
      
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedFilter]);

  // Données fictives pour le graphique en barres
  const chartSectors = [
    { label: "TECH", heightPct: isLoading ? 0 : 75 },
    { label: "AGRI", heightPct: isLoading ? 0 : 45 },
    { label: "CULT", heightPct: isLoading ? 0 : 30 },
    { label: "SOLI", heightPct: isLoading ? 0 : 60 }
  ];

  return (
    <div className="temporal-widget-container">
      
      {/* 1. EN-TÊTE DE CONTRÔLE */}
      <header className="temporal-header">
        <div className="temporal-title-group">
          <h2 className="temporal-title">Rapports Financiers & Croissance</h2>
          
          <div className="temporal-filters">
            {filters.map(filter => (
              <button 
                key={filter}
                className={`temporal-filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter)}
                disabled={isLoading}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="temporal-export-container">
          <button 
            className="btn-export"
            onClick={() => setIsExportOpen(!isExportOpen)}
          >
            Exporter le rapport ▾
          </button>
          
          {isExportOpen && (
            <div className="export-dropdown">
              <button className="dropdown-item" onClick={() => setIsExportOpen(false)}>Format PDF (.pdf)</button>
              <button className="dropdown-item" onClick={() => setIsExportOpen(false)}>Format CSV (.csv)</button>
            </div>
          )}
        </div>
      </header>

      {/* 2. ZONE DE DONNÉES */}
      <div className={`temporal-data-zone ${isLoading ? 'loading-overlay' : ''}`}>
        
        {/* Vue des KPIs */}
        <div className="temporal-kpi-grid">
          <div className="temporal-kpi-card">
            <span className="kpi-title">Fonds Collectés (Période)</span>
            <div className="kpi-value">
              {isLoading ? (
                <span className="skeleton-text"></span>
              ) : (
                <>{metrics.funds.toLocaleString()} <span>DT</span></>
              )}
            </div>
          </div>
          
          <div className="temporal-kpi-card">
            <span className="kpi-title">Commission Nette (5%)</span>
            <div className="kpi-value">
              {isLoading ? (
                <span className="skeleton-text"></span>
              ) : (
                <>{metrics.commission.toLocaleString()} <span>DT</span></>
              )}
            </div>
          </div>
          
          <div className="temporal-kpi-card">
            <span className="kpi-title">Nouveaux Projets</span>
            <div className="kpi-value">
              {isLoading ? (
                <span className="skeleton-text" style={{ width: '40px' }}></span>
              ) : (
                <>+{metrics.projects}</>
              )}
            </div>
          </div>
        </div>

        {/* Placeholder Graphique */}
        <div className="temporal-chart-zone">
          {chartSectors.map((sector, index) => (
            <div className="chart-bar-group" key={index}>
              <div 
                className={`chart-bar ${isLoading ? 'skeleton-chart-bar' : ''}`} 
                style={{ height: isLoading ? '20%' : `${sector.heightPct}%` }}
              ></div>
              <span className="chart-label">{sector.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TemporalAnalyticsWidget;
