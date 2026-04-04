import React from 'react';

const formatMoney = (amount) =>
  `${Number(amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} DT`;

const DonationSummaryCard = ({
  campaign,
  selection,
  amountTnd,
  submitting,
  onSubmit,
  onBack,
}) => {
  const rewardLabel = selection?.type === 'reward' ? selection.reward?.title : 'Sans recompense';

  return (
    <aside className="dp-summary-card">
      <div className="dp-summary-card__header">
        <p className="dp-summary-card__eyebrow">Resume</p>
        <h3>Votre contribution</h3>
      </div>

      <div className="dp-summary-card__campaign">
        <p className="dp-summary-card__campaign-title">{campaign.title}</p>
        <p className="dp-summary-card__campaign-meta">{campaign.creator_name || 'Createur Hive.tn'}</p>
      </div>

      <div className="dp-summary-card__rows">
        <div className="dp-summary-card__row">
          <span>Option choisie</span>
          <strong>{rewardLabel}</strong>
        </div>
        <div className="dp-summary-card__row">
          <span>Contribution</span>
          <strong>{formatMoney(amountTnd)}</strong>
        </div>
        <div className="dp-summary-card__row">
          <span>Frais de service</span>
          <strong>0 DT</strong>
        </div>
      </div>

      <div className="dp-summary-card__total">
        <span>Total</span>
        <strong>{formatMoney(amountTnd)}</strong>
      </div>

      <button
        type="button"
        className="dp-primary-btn dp-primary-btn--full"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? 'Traitement en cours...' : 'Confirmer la contribution'}
      </button>

      <button type="button" className="dp-secondary-btn dp-secondary-btn--full" onClick={onBack}>
        Retour au choix
      </button>

      <p className="dp-summary-card__legal">
        Version pilote Hive.tn : aucune passerelle bancaire reelle n est encore connectee. La contribution est enregistree comme soutien MVP.
      </p>
    </aside>
  );
};

export default DonationSummaryCard;
