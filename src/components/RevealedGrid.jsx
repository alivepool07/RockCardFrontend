import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { ResponseCard } from './Card';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, User, FastForward, Clock } from 'lucide-react';

export const RevealedGrid = () => {
  const { roomState, nextRound } = useGame();
  const [countdown, setCountdown] = useState(5);

  const revealed = roomState?.revealedSubmissions || [];
  const winningPlayerName = roomState?.winningPlayerName || 'Someone';

  useEffect(() => {
    // Fire confetti for the round winner
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore in headless
    }
  }, [roomState?.winningSubmissionId]);

  useEffect(() => {
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [roomState?.winningSubmissionId]);

  return (
    <div style={{ marginTop: 20 }}>
      {/* Winner announcement banner */}
      <div
        className="glass-panel pulse-glow"
        style={{
          padding: 'clamp(12px, 3vw, 20px)',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Trophy size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)', fontWeight: 800, color: '#fef3c7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {winningPlayerName} won!
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Clock size={12} color="#c4b5fd" />
              <span>
                Next round in <strong style={{ color: '#fbbf24' }}>{countdown}s</strong>
              </span>
            </p>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={nextRound}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: '0.82rem',
            flexShrink: 0,
          }}
          title="Skip countdown and proceed immediately"
        >
          <FastForward size={14} /> Skip
        </button>
      </div>

      {/* Revealed submissions grid */}
      <div
        className="submissions-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {revealed.map((sub) => (
          <div
            key={sub.submissionId}
            className={`glass-panel animate-fade-in ${sub.isWinner ? 'winner' : ''}`}
            style={{
              padding: 'clamp(10px, 3vw, 16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 8,
              background: sub.isWinner ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              borderColor: sub.isWinner ? '#f59e0b' : 'var(--border-glass)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: sub.isWinner ? '#fbbf24' : '#94a3b8',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <User size={13} />
                {sub.playerName}
              </span>
              {sub.isWinner && (
                <span className="badge badge-judge" style={{ flexShrink: 0 }}>
                  WINNER +1
                </span>
              )}
            </div>

            {sub.cards.map((card) => (
              <ResponseCard
                key={card.id}
                card={card}
                isWinner={sub.isWinner}
                disabled
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
