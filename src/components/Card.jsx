import React from 'react';

export const PromptCard = ({ prompt }) => {
  if (!prompt) return null;

  return (
    <div className="prompt-card animate-fade-in">
      <div>
        <span className="badge badge-host" style={{ marginBottom: 16 }}>
          Prompt Card
        </span>
        <h2 style={{ fontSize: '1.25rem', lineHeight: 1.4, fontWeight: 700, color: '#f8fafc' }}>
          {prompt.text}
        </h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          PARTY EDITION
        </span>
        {prompt.pickCount > 1 && (
          <span className="badge badge-judge">
            PICK {prompt.pickCount}
          </span>
        )}
      </div>
    </div>
  );
};

export const ResponseCard = ({ card, selected, onClick, isWinner, disabled }) => {
  if (!card) return null;

  return (
    <div
      className={`response-card ${selected ? 'selected' : ''} ${isWinner ? 'winner' : ''}`}
      onClick={!disabled ? onClick : undefined}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.75 : 1,
      }}
    >
      <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, color: '#0f172a' }}>
        {card.text}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
          RESPONSE
        </span>
        {selected && (
          <span style={{ fontSize: '0.75rem', background: '#7c3aed', color: '#fff', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>
            SELECTED
          </span>
        )}
      </div>
    </div>
  );
};
