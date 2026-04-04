import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import './DonationPage.css';
import Navbar from './Navbar';
import RewardOptionCard from './components/Donation/RewardOptionCard';
import DonationFAQ from './components/Donation/DonationFAQ';
import DonationSummaryCard from './components/Donation/DonationSummaryCard';
import PaymentForm from './components/Donation/PaymentForm';
import DonationSuccessState from './components/Donation/DonationSuccessState';

const API_URL = 'http://localhost:5000';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1528157777178-0062a444aeb8?w=1200&q=80';

const FAQ_ITEMS = [
  {
    question: 'Quand serai-je debite ?',
    answer: "Dans cette version pilote, aucun debit bancaire reel n'est effectue. Votre contribution est enregistree comme un soutien MVP.",
  },
  {
    question: 'Puis-je modifier mon montant ?',
    answer: 'Oui. Vous pouvez revenir a l etape precedente avant confirmation finale pour changer votre option ou votre montant.',
  },
  {
    question: 'Vais-je recevoir un recu ?',
    answer: 'Un recapitulatif de contribution est affiche a la fin du parcours. Une emission de recu automatisee pourra etre ajoutee lors de la vraie integration paiement.',
  },
  {
    question: "Que se passe-t-il si le projet n'aboutit pas ?",
    answer: 'Les contributions soutiennent un projet en cours de realisation. Les calendriers, livraisons et resultats peuvent evoluer selon l avancement du createur.',
  },
  {
    question: 'Comment fonctionne une recompense ?',
    answer: 'Chaque recompense correspond a un montant minimum. Vous pouvez contribuer au minimum requis ou au-dessus si vous souhaitez soutenir davantage le projet.',
  },
  {
    question: 'Mes informations sont-elles securisees ?',
    answer: 'Le formulaire est concu pour une future integration paiement securisee. Sur cette version MVP, les donnees servent uniquement a simuler un parcours realiste.',
  },
];

const initialPaymentState = {
  holderName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
  country: 'Tunisie',
  savePaymentMethod: false,
  acceptTerms: false,
};

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_URL}${url}`;
};

const parseRewards = (rewards) => {
  if (!rewards) return [];
  if (Array.isArray(rewards)) return rewards;

  if (typeof rewards === 'string') {
    try {
      const parsed = JSON.parse(rewards);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const getInitials = (value) =>
  String(value || 'Hive')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const formatDate = (value) => {
  if (!value) return 'Non disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Non disponible';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatMoney = (amount) =>
  `${Number(amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} DT`;

const normalizeReward = (reward, index) => {
  const rawMinimum = reward?.minimum_amount !== undefined
    ? Number(reward.minimum_amount) / 1000
    : Number(reward?.amount ?? reward?.price ?? reward?.minimum ?? 0);

  const minimumTnd = Number.isFinite(rawMinimum) && rawMinimum > 0 ? rawMinimum : index === 0 ? 10 : 0;
  const quantity = reward?.quantity !== undefined && reward?.quantity !== null && reward?.quantity !== ''
    ? Number(reward.quantity)
    : null;
  const backerCount = reward?.backer_count !== undefined && reward?.backer_count !== null && reward?.backer_count !== ''
    ? Number(reward.backer_count)
    : 0;
  const remaining = quantity !== null && Number.isFinite(quantity)
    ? Math.max(quantity - (Number.isFinite(backerCount) ? backerCount : 0), 0)
    : null;

  return {
    id: reward?.id || `reward-${index + 1}`,
    title: reward?.title || `Recompense ${index + 1}`,
    minimumTnd,
    description: reward?.description || reward?.desc || '',
    estimatedDelivery: reward?.estimated_delivery || reward?.estimatedDelivery || reward?.delivery_estimate || '',
    quantity: quantity !== null && Number.isFinite(quantity) ? quantity : null,
    backerCount: Number.isFinite(backerCount) ? backerCount : 0,
    remaining,
    disabled: reward?.available === false || remaining === 0,
    image: resolveMediaUrl(reward?.image || reward?.image_url || ''),
  };
};

const sanitizeCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

const sanitizeExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const sanitizeCvc = (value) => value.replace(/\D/g, '').slice(0, 4);

const DonationPage = ({ onNavigate, isAuthenticated, onLogout, onLoginSuccess }) => {
  const { id: campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('select');
  const [selection, setSelection] = useState(null);
  const [freeSupportAmount, setFreeSupportAmount] = useState('25');
  const [contributionAmount, setContributionAmount] = useState('');
  const [paymentValues, setPaymentValues] = useState(initialPaymentState);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successPledge, setSuccessPledge] = useState(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) {
        setLoading(false);
        setError('Aucune campagne n a ete selectionnee.');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || 'Campagne introuvable.');
          return;
        }
        setCampaign(data.campaign);
      } catch (fetchError) {
        console.error('Donation page load error:', fetchError);
        setError('Impossible de charger cette campagne pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const rewards = useMemo(
    () => parseRewards(campaign?.rewards).map((reward, index) => normalizeReward(reward, index)),
    [campaign?.rewards]
  );

  const currentAmountNumber = Number(String(contributionAmount).replace(',', '.'));
  const safeCurrentAmount = Number.isFinite(currentAmountNumber) ? currentAmountNumber : 0;
  const creatorInitials = getInitials(campaign?.creator_name || 'Hive');
  const campaignImage = resolveMediaUrl(campaign?.image_url) || FALLBACK_IMAGE;
  const campaignActive = campaign?.status === 'ACTIVE';
  const minimumAmount = selection?.type === 'reward' ? Math.max(selection.reward.minimumTnd, 1) : 1;

  const updateFieldError = (name) => {
    if (paymentErrors[name]) {
      setPaymentErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectFreeSupport = () => {
    const parsed = Number(String(freeSupportAmount).replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 1) {
      setPaymentErrors((prev) => ({ ...prev, freeSupportAmount: 'Veuillez saisir au moins 1 DT.' }));
      return;
    }

    setPaymentErrors((prev) => ({ ...prev, freeSupportAmount: '' }));
    setSubmitError('');
    setSelection({ type: 'free' });
    setContributionAmount(String(parsed));
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReward = (reward) => {
    setSubmitError('');
    setSelection({ type: 'reward', reward });
    setContributionAmount(String(reward.minimumTnd));
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFieldChange = (field, value) => {
    let nextValue = value;

    if (field === 'cardNumber') nextValue = sanitizeCardNumber(value);
    if (field === 'expiry') nextValue = sanitizeExpiry(value);
    if (field === 'cvc') nextValue = sanitizeCvc(value);

    setPaymentValues((prev) => ({ ...prev, [field]: nextValue }));
    updateFieldError(field);

    if (field === 'acceptTerms') {
      updateFieldError('acceptTerms');
    }
  };

  const validatePaymentForm = () => {
    const nextErrors = {};
    const parsedAmount = Number(String(contributionAmount).replace(',', '.'));
    const cardDigits = paymentValues.cardNumber.replace(/\s/g, '');
    const expiryMatch = paymentValues.expiry.match(/^(\d{2})\/(\d{2})$/);

    if (!Number.isFinite(parsedAmount) || parsedAmount < minimumAmount) {
      nextErrors.amount = `Le montant doit etre d'au moins ${minimumAmount} DT.`;
    }
    if (!paymentValues.holderName.trim()) {
      nextErrors.holderName = 'Le nom du titulaire est requis.';
    }
    if (cardDigits.length !== 16) {
      nextErrors.cardNumber = 'Le numero de carte doit contenir 16 chiffres.';
    }
    if (!expiryMatch) {
      nextErrors.expiry = 'Utilisez le format MM/AA.';
    } else {
      const month = Number(expiryMatch[1]);
      if (month < 1 || month > 12) {
        nextErrors.expiry = 'Le mois doit etre compris entre 01 et 12.';
      }
    }
    if (!/^\d{3,4}$/.test(paymentValues.cvc)) {
      nextErrors.cvc = 'Le CVC doit contenir 3 ou 4 chiffres.';
    }
    if (!paymentValues.country.trim()) {
      nextErrors.country = 'Veuillez choisir un pays.';
    }
    if (!paymentValues.acceptTerms) {
      nextErrors.acceptTerms = 'Vous devez accepter les conditions de contribution.';
    }

    setPaymentErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitContribution = async (tokenOverride) => {
    if (!selection || !campaign) {
      setStep('select');
      return;
    }

    if (!validatePaymentForm()) {
      return;
    }

    const token = tokenOverride || localStorage.getItem('token');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`${API_URL}/api/pledges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          amount: Math.round(Number(String(contributionAmount).replace(',', '.')) * 1000),
          reward_title: selection.type === 'reward' ? selection.reward.title : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) {
          setShowLoginModal(true);
          setLoginError(data.message || '');
          return;
        }

        setSubmitError(data.message || 'Impossible d enregistrer votre contribution pour le moment.');
        return;
      }

      setSuccessPledge(data.pledge || null);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitRequestError) {
      console.error('Submit pledge error:', submitRequestError);
      setSubmitError('Une erreur reseau est survenue pendant la confirmation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setLoginError(data.message || 'Identifiants incorrects.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onLoginSuccess) onLoginSuccess();
      setShowLoginModal(false);
      setLoginError('');
      await handleSubmitContribution(data.token);
    } catch (loginRequestError) {
      console.error('Quick login error:', loginRequestError);
      setLoginError('Erreur de connexion serveur.');
    }
  };

  if (loading) {
    return (
      <div className="dp-page">
        <Navbar onNavigate={onNavigate} isAuthenticated={isAuthenticated} onLogout={onLogout} activeTab="projectDetails" />
        <main className="dp-shell">
          <section className="dp-loading-state">
            <p className="dp-loading-state__eyebrow">Hive.tn</p>
            <h1>Preparation de votre contribution...</h1>
            <p>Nous chargeons les informations de la campagne et les options de soutien.</p>
          </section>
        </main>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="dp-page">
        <Navbar onNavigate={onNavigate} isAuthenticated={isAuthenticated} onLogout={onLogout} activeTab="projectDetails" />
        <main className="dp-shell">
          <section className="dp-loading-state dp-loading-state--error">
            <p className="dp-loading-state__eyebrow">Contribution indisponible</p>
            <h1>Impossible de preparer cette page</h1>
            <p>{error || 'Cette campagne est actuellement indisponible.'}</p>
            <button type="button" className="dp-primary-btn" onClick={() => onNavigate('discover')}>
              Retour a la decouverte
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dp-page">
      <Navbar onNavigate={onNavigate} isAuthenticated={isAuthenticated} onLogout={onLogout} activeTab="projectDetails" />

      <main className="dp-shell">
        <section className="dp-hero">
          <div className="dp-hero__media">
            <img src={campaignImage} alt={campaign.title} />
          </div>

          <div className="dp-hero__content">
            <div className="dp-progress">
              <span className={`is-current ${step === 'select' ? 'is-active' : ''}`}>1. Contribution</span>
              <span className={`is-current ${step === 'payment' ? 'is-active' : ''}`}>2. Paiement</span>
              <span className={`is-current ${step === 'success' ? 'is-active' : ''}`}>3. Confirmation</span>
            </div>

            <div className="dp-hero__identity">
              <div className="dp-hero__avatar">{creatorInitials}</div>
              <div>
                <p className="dp-hero__creator-label">Porte par</p>
                <strong>{campaign.creator_name || 'Createur Hive.tn'}</strong>
              </div>
            </div>

            <h1>{step === 'success' ? 'Contribution confirmee' : 'Choisissez votre contribution'}</h1>
            <p className="dp-hero__subtitle">
              {campaign.title}
            </p>
            <p className="dp-hero__description">
              {campaign.description || 'Soutenez ce projet tunisien avec une contribution libre ou en choisissant une recompense adaptee.'}
            </p>

            <div className="dp-hero__meta">
              <span>{campaign.category || 'Projet en cours'}</span>
              <span>{formatMoney(Number(campaign.target_amount || 0) / 1000)} d objectif</span>
              <span>{formatDate(campaign.created_at)}</span>
              {campaignActive && <span>Projet approuve par moderation</span>}
            </div>
          </div>
        </section>

        {!campaignActive && step !== 'success' && (
          <section className="dp-blocked-state">
            <p className="dp-blocked-state__eyebrow">Contribution fermee</p>
            <h2>Cette campagne ne peut pas recevoir de soutien pour le moment.</h2>
            <p>Seules les campagnes actives peuvent etre financees dans cette version de Hive.tn.</p>
            <button type="button" className="dp-primary-btn" onClick={() => onNavigate('projectDetails', campaign.id)}>
              Retour a la campagne
            </button>
          </section>
        )}

        {campaignActive && step === 'select' && (
          <section className="dp-layout">
            <div className="dp-main-column">
              <div className="dp-free-card">
                <div className="dp-free-card__header">
                  <div>
                    <p className="dp-free-card__eyebrow">Option libre</p>
                    <h2>Soutien sans recompense</h2>
                  </div>
                  <span className="dp-free-card__chip">Flexible</span>
                </div>

                <p className="dp-free-card__copy">
                  Vous souhaitez soutenir le projet sans contrepartie precise ? Choisissez un montant libre et confirmez votre contribution a l etape suivante.
                </p>

                <div className="dp-free-card__controls">
                  <label className="dp-field">
                    <span>Montant libre (DT)</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={freeSupportAmount}
                      onChange={(e) => {
                        setFreeSupportAmount(e.target.value);
                        if (paymentErrors.freeSupportAmount) {
                          setPaymentErrors((prev) => ({ ...prev, freeSupportAmount: '' }));
                        }
                      }}
                    />
                    {paymentErrors.freeSupportAmount && <em>{paymentErrors.freeSupportAmount}</em>}
                  </label>

                  <button type="button" className="dp-primary-btn" onClick={handleSelectFreeSupport}>
                    Continuer sans recompense
                  </button>
                </div>
              </div>

              <div className="dp-section-header">
                <p className="dp-section-header__eyebrow">Recompenses</p>
                <h2>Choisissez une contrepartie</h2>
                <p>Selectionnez un palier pour soutenir le createur tout en profitant d une recompense si elle vous convient.</p>
              </div>

              {rewards.length === 0 ? (
                <div className="dp-empty-state">
                  <h3>Aucune recompense disponible</h3>
                  <p>Le createur n a pas encore defini de contreparties. Vous pouvez tout de meme soutenir la campagne avec un montant libre.</p>
                </div>
              ) : (
                <div className="dp-reward-grid">
                  {rewards.map((reward) => (
                    <RewardOptionCard
                      key={reward.id}
                      reward={reward}
                      selected={selection?.type === 'reward' && selection.reward?.id === reward.id}
                      onSelect={() => handleSelectReward(reward)}
                    />
                  ))}
                </div>
              )}
            </div>

            <aside className="dp-sidebar">
              <div className="dp-sidebar-card dp-sidebar-card--accent">
                <p className="dp-sidebar-card__eyebrow">Contribution en confiance</p>
                <h3>Ce que vous devez savoir</h3>
                <p>
                  Les contributions soutiennent un projet en cours de realisation. Les delais, livraisons et ajustements de production peuvent evoluer.
                </p>
                <ul className="dp-trust-list">
                  <li>Paiement reel non active sur cette version pilote</li>
                  <li>Projet visible seulement s il a passe la moderation</li>
                  <li>Contribution enregistree immediatement dans le parcours MVP</li>
                </ul>
              </div>

              <div className="dp-sidebar-card">
                <div className="dp-sidebar-section__header">
                  <p className="dp-sidebar-section__eyebrow">Apercu campagne</p>
                  <h3>Avant de confirmer</h3>
                </div>
                <div className="dp-compact-summary">
                  <div>
                    <span>Createur</span>
                    <strong>{campaign.creator_name || 'Createur Hive.tn'}</strong>
                  </div>
                  <div>
                    <span>Objectif</span>
                    <strong>{formatMoney(Number(campaign.target_amount || 0) / 1000)}</strong>
                  </div>
                  <div>
                    <span>Recompenses</span>
                    <strong>{rewards.length}</strong>
                  </div>
                  <div>
                    <span>Statut</span>
                    <strong>{campaign.status === 'ACTIVE' ? 'Active' : campaign.status}</strong>
                  </div>
                </div>
              </div>

              <div className="dp-sidebar-card">
                <DonationFAQ
                  items={FAQ_ITEMS}
                  openIndex={faqOpenIndex}
                  onToggle={(index) => setFaqOpenIndex((prev) => (prev === index ? -1 : index))}
                />
              </div>
            </aside>
          </section>
        )}

        {campaignActive && step === 'payment' && selection && (
          <section className="dp-layout dp-layout--payment">
            <div className="dp-main-column">
              {!isAuthenticated && (
                <div className="dp-auth-notice">
                  <div>
                    <p className="dp-auth-notice__eyebrow">Connexion requise</p>
                    <h3>Vous devrez vous connecter avant la validation finale</h3>
                  </div>
                  <button type="button" className="dp-secondary-btn" onClick={() => setShowLoginModal(true)}>
                    Se connecter
                  </button>
                </div>
              )}

              {submitError && <div className="dp-inline-error">{submitError}</div>}

              <PaymentForm
                values={paymentValues}
                errors={paymentErrors}
                amountValue={contributionAmount}
                minAmount={minimumAmount}
                selection={selection}
                onFieldChange={handleFieldChange}
                onAmountChange={(value) => {
                  setContributionAmount(value);
                  updateFieldError('amount');
                }}
              />
            </div>

            <div className="dp-sidebar">
              <DonationSummaryCard
                campaign={campaign}
                selection={selection}
                amountTnd={safeCurrentAmount}
                submitting={submitting}
                onSubmit={() => handleSubmitContribution()}
                onBack={() => {
                  setStep('select');
                  setSubmitError('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </section>
        )}

        {campaignActive && step === 'success' && (
          <DonationSuccessState
            campaign={campaign}
            selection={selection}
            amountTnd={safeCurrentAmount}
            pledgeId={successPledge?.id}
            onBackToCampaign={() => onNavigate('projectDetails', campaign.id)}
            onDiscover={() => onNavigate('discover')}
          />
        )}
      </main>

      {showLoginModal && (
        <div className="dp-modal-backdrop">
          <div className="dp-modal">
            <div className="dp-modal__header">
              <div>
                <p className="dp-modal__eyebrow">Connexion</p>
                <h3>Finalisez votre contribution</h3>
              </div>
              <button
                type="button"
                className="dp-modal__close"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                }}
              >
                ×
              </button>
            </div>

            <p className="dp-modal__copy">
              Connectez-vous pour associer votre contribution a votre compte Hive.tn et retrouver vos soutiens plus tard.
            </p>

            {loginError && <div className="dp-inline-error">{loginError}</div>}

            <label className="dp-field">
              <span>Adresse e-mail</span>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            </label>

            <label className="dp-field">
              <span>Mot de passe</span>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </label>

            <div className="dp-modal__actions">
              <button type="button" className="dp-primary-btn dp-primary-btn--full" onClick={handleQuickLogin}>
                Se connecter et continuer
              </button>
              <button
                type="button"
                className="dp-secondary-btn dp-secondary-btn--full"
                onClick={() => {
                  setShowLoginModal(false);
                  onNavigate('signUp');
                }}
              >
                Creer un compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationPage;
