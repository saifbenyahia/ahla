import React from 'react';

const formatMoney = (amount) =>
  `${Number(amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} DT`;

const DonationSuccessState = ({ campaign, selection, amountTnd, pledgeId, onBackToCampaign, onDiscover }) => (
  <section className="dp-success-state">
    <div className="dp-success-state__badge">Contribution enregistree</div>
    <h1>Merci pour votre soutien</h1>
    <p className="dp-success-state__intro">
      Votre contribution a bien ete enregistree sur Hive.tn. Le createur pourra voir votre soutien dans le cadre de cette version MVP.
    </p>

    <div className="dp-success-state__grid">
      <div className="dp-success-state__card">
        <p className="dp-success-state__label">Campagne</p>
        <strong>{campaign.title}</strong>
      </div>
      <div className="dp-success-state__card">
        <p className="dp-success-state__label">Option</p>
        <strong>{selection?.type === 'reward' ? selection.reward?.title : 'Sans recompense'}</strong>
      </div>
      <div className="dp-success-state__card">
        <p className="dp-success-state__label">Montant</p>
        <strong>{formatMoney(amountTnd)}</strong>
      </div>
      <div className="dp-success-state__card">
        <p className="dp-success-state__label">Reference</p>
        <strong>{pledgeId || 'MVP-HIVE'}</strong>
      </div>
    </div>

    <div className="dp-success-state__actions">
      <button type="button" className="dp-primary-btn" onClick={onBackToCampaign}>
        Retour a la campagne
      </button>
      <button type="button" className="dp-secondary-btn" onClick={onDiscover}>
        Decouvrir d autres projets
      </button>
    </div>
  </section>
);

export default DonationSuccessState;
