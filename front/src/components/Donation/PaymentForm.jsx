import React from 'react';

const PaymentForm = ({
  values,
  errors,
  amountValue,
  minAmount,
  selection,
  onFieldChange,
  onAmountChange,
}) => (
  <div className="dp-payment-panel">
    <div className="dp-payment-panel__section">
      <p className="dp-payment-panel__eyebrow">Confirmation</p>
      <h2>Confirmez votre contribution</h2>
      <p className="dp-payment-panel__intro">
        Verifiez votre montant, choisissez votre mode de reglement et validez votre soutien. Dans cette version MVP, la contribution est enregistree comme un soutien confirme.
      </p>
    </div>

    <div className="dp-selection-recap">
      <div>
        <p className="dp-selection-recap__label">Option selectionnee</p>
        <h3>{selection?.type === 'reward' ? selection.reward?.title : 'Soutien libre'}</h3>
      </div>
      <p className="dp-selection-recap__meta">
        {selection?.type === 'reward'
          ? 'Vous pouvez augmenter le montant, tant qu il reste superieur ou egal au minimum de la recompense.'
          : 'Vous choisissez librement le montant qui vous semble juste pour soutenir cette campagne.'}
      </p>
    </div>

    <div className="dp-payment-panel__section">
      <label className="dp-field">
        <span>Montant de contribution (DT)</span>
        <input
          type="number"
          min={minAmount}
          step="1"
          value={amountValue}
          onChange={(e) => onAmountChange(e.target.value)}
          className={errors.amount ? 'has-error' : ''}
        />
        {minAmount > 0 && <small>Minimum requis : {minAmount} DT</small>}
        {errors.amount && <em>{errors.amount}</em>}
      </label>
    </div>

    <div className="dp-payment-panel__section">
      <div className="dp-payment-panel__header">
        <h3>Methode de paiement</h3>
        <p>Formulaire prepare pour une future integration de paiement securise.</p>
      </div>

      <div className="dp-form-grid dp-form-grid--two">
        <label className="dp-field dp-field--full">
          <span>Nom du titulaire</span>
          <input
            type="text"
            value={values.holderName}
            onChange={(e) => onFieldChange('holderName', e.target.value)}
            className={errors.holderName ? 'has-error' : ''}
            placeholder="Nom tel qu il apparait sur la carte"
          />
          {errors.holderName && <em>{errors.holderName}</em>}
        </label>

        <label className="dp-field dp-field--full">
          <span>Numero de carte</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.cardNumber}
            onChange={(e) => onFieldChange('cardNumber', e.target.value)}
            className={errors.cardNumber ? 'has-error' : ''}
            placeholder="1234 5678 9012 3456"
          />
          {errors.cardNumber && <em>{errors.cardNumber}</em>}
        </label>

        <label className="dp-field">
          <span>Date d expiration</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.expiry}
            onChange={(e) => onFieldChange('expiry', e.target.value)}
            className={errors.expiry ? 'has-error' : ''}
            placeholder="MM/AA"
          />
          {errors.expiry && <em>{errors.expiry}</em>}
        </label>

        <label className="dp-field">
          <span>CVC</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.cvc}
            onChange={(e) => onFieldChange('cvc', e.target.value)}
            className={errors.cvc ? 'has-error' : ''}
            placeholder="123"
          />
          {errors.cvc && <em>{errors.cvc}</em>}
        </label>

        <label className="dp-field dp-field--full">
          <span>Pays</span>
          <select
            value={values.country}
            onChange={(e) => onFieldChange('country', e.target.value)}
            className={errors.country ? 'has-error' : ''}
          >
            <option value="Tunisie">Tunisie</option>
            <option value="France">France</option>
            <option value="Algerie">Algerie</option>
            <option value="Maroc">Maroc</option>
            <option value="Autre">Autre</option>
          </select>
          {errors.country && <em>{errors.country}</em>}
        </label>
      </div>
    </div>

    <div className="dp-payment-panel__section">
      <div className="dp-checkboxes">
        <label className="dp-checkbox">
          <input
            type="checkbox"
            checked={values.savePaymentMethod}
            onChange={(e) => onFieldChange('savePaymentMethod', e.target.checked)}
          />
          <span>Memoriser ce moyen de paiement pour une prochaine contribution</span>
        </label>

        <label className="dp-checkbox">
          <input
            type="checkbox"
            checked={values.acceptTerms}
            onChange={(e) => onFieldChange('acceptTerms', e.target.checked)}
          />
          <span>Je comprends qu il s agit d un projet en cours de realisation et j accepte les conditions de contribution.</span>
        </label>
        {errors.acceptTerms && <em className="dp-checkbox-error">{errors.acceptTerms}</em>}
      </div>
    </div>
  </div>
);

export default PaymentForm;
