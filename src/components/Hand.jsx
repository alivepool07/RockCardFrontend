import React, { useState, useEffect } from 'react';
import { ResponseCard } from './Card';
import { useGame } from '../context/GameContext';
import { Send, CheckCircle2, Crown, RotateCcw } from 'lucide-react';

export const Hand = () => {
  const { myHand, roomState, hasSubmitted, isJudge, submitCards, requestHand } = useGame();
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  const pickCount = roomState?.currentPrompt?.pickCount || 1;

  // Clear selection if round or prompt changes
  useEffect(() => {
    setSelectedCardIds([]);
  }, [roomState?.currentPrompt?.id, roomState?.phase]);

  const handleCardClick = (id) => {
    if (hasSubmitted || isJudge) return;

    if (selectedCardIds.includes(id)) {
      setSelectedCardIds(selectedCardIds.filter((cId) => cId !== id));
    } else {
      if (selectedCardIds.length < pickCount) {
        setSelectedCardIds([...selectedCardIds, id]);
      } else if (pickCount === 1) {
        setSelectedCardIds([id]);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedCardIds.length === pickCount) {
      submitCards(selectedCardIds);
      setSelectedCardIds([]);
    }
  };

  if (isJudge) {
    return (
      <div className="glass-panel" style={{ padding: 'clamp(16px, 4vw, 24px)', textAlign: 'center', marginTop: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: '1rem', fontWeight: 700 }}>
          <Crown size={20} />
          You are the Judge this round!
        </div>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.88rem' }}>
          Relax and wait for other players to submit their best cards.
        </p>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="glass-panel" style={{ padding: 'clamp(16px, 4vw, 24px)', textAlign: 'center', marginTop: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>
          <CheckCircle2 size={20} />
          Cards Submitted!
        </div>
        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: '0.88rem' }}>
          Waiting for all other players to submit their answers...
        </p>
      </div>
    );
  }

  if (myHand.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 'clamp(16px, 4vw, 24px)', textAlign: 'center', marginTop: 16 }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 10 }}>
          Dealing your hand...
        </p>
        <button className="btn btn-secondary" onClick={requestHand}>
          <RotateCcw size={15} /> Deal / Refresh Cards
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header with card count and submit button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Your Hand ({myHand.length})
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Pick {pickCount} {pickCount > 1 ? 'cards' : 'card'} ({selectedCardIds.length}/{pickCount})
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedCardIds.length !== pickCount}
          style={{ padding: '8px 16px', fontSize: '0.85rem', flexShrink: 0 }}
        >
          <Send size={14} />
          Submit {selectedCardIds.length > 0 ? `(${selectedCardIds.length}/${pickCount})` : ''}
        </button>
      </div>

      {/* Horizontally scrollable hand track */}
      <div className="hand-scroll-track">
        {myHand.map((card) => (
          <ResponseCard
            key={card.id}
            card={card}
            selected={selectedCardIds.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>

      {/* Mobile-friendly bottom sticky bar when cards are selected */}
      {selectedCardIds.length === pickCount && (
        <div className="mobile-sticky-bar animate-fade-in">
          <button className="btn btn-primary pulse-glow" onClick={handleSubmit}>
            <Send size={16} /> Submit {pickCount > 1 ? `${pickCount} Cards` : 'Card'} Now
          </button>
        </div>
      )}
    </div>
  );
};
