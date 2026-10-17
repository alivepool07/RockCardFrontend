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
      <div className="glass-panel" style={{ padding: '24px 32px', textAlign: 'center', marginTop: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: '1.1rem', fontWeight: 700 }}>
          <Crown size={22} />
          You are the Judge this round!
        </div>
        <p style={{ color: '#94a3b8', marginTop: 8, fontSize: '0.95rem' }}>
          Relax and wait for other players to submit their best cards.
        </p>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="glass-panel" style={{ padding: '24px 32px', textAlign: 'center', marginTop: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '1.1rem', fontWeight: 700 }}>
          <CheckCircle2 size={22} />
          Cards Submitted!
        </div>
        <p style={{ color: '#94a3b8', marginTop: 8, fontSize: '0.95rem' }}>
          Waiting for all other players to submit their answers...
        </p>
      </div>
    );
  }

  if (myHand.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px 32px', textAlign: 'center', marginTop: 24 }}>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 12 }}>
          Dealing your hand...
        </p>
        <button className="btn btn-secondary" onClick={requestHand}>
          <RotateCcw size={16} /> Deal / Refresh Cards
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Your Hand ({myHand.length} cards)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Pick {pickCount} {pickCount > 1 ? 'cards' : 'card'} to play ({selectedCardIds.length}/{pickCount} selected)
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedCardIds.length !== pickCount}
        >
          <Send size={16} />
          Submit {selectedCardIds.length > 0 ? `(${selectedCardIds.length}/${pickCount})` : ''}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 20,
          paddingTop: 10,
        }}
      >
        {myHand.map((card) => (
          <ResponseCard
            key={card.id}
            card={card}
            selected={selectedCardIds.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  );
};
