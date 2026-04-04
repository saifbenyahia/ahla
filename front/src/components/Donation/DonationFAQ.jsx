import React from 'react';

const DonationFAQ = ({ items, openIndex, onToggle }) => (
  <div className="dp-faq">
    <div className="dp-sidebar-section__header">
      <p className="dp-sidebar-section__eyebrow">Questions frequentes</p>
      <h3>Tout savoir avant de contribuer</h3>
    </div>

    <div className="dp-faq__list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className={`dp-faq__item ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="dp-faq__question"
              onClick={() => onToggle(index)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <span className="dp-faq__icon">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="dp-faq__answer">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  </div>
);

export default DonationFAQ;
