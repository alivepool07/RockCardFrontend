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
    <div style={{ marginTop: 24 }}>
      <div
        className="glass-panel pulse-glow"
        style={{
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Trophy size={32} color="#f59e0b" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fef3c7' }}>
              {winningPlayerName} won the round!
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Clock size={15} color="#c4b5fd" />
              <span>
                Next round starting in <strong style={{ color: '#fbbf24' }}>{countdown}s</strong> &mdash; rotating judge automatically!
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
            gap: 8,
            padding: '10px 20px',
            borderRadius: 10,
            fontSize: '0.9rem',
          }}
          title="Skip countdown and proceed immediately"
        >
          <FastForward size={16} /> Skip Countdown
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 20,
        }}
      >
        {revealed.map((sub) => (
          <div
            key={sub.submissionId}
            className={`glass-panel animate-fade-in ${sub.isWinner ? 'winner' : ''}`}
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              background: sub.isWinner ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              borderColor: sub.isWinner ? '#f59e0b' : 'var(--border-glass)',
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: sub.isWinner ? '#fbbf24' : '#94a3b8',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <User size={14} />
                {sub.playerName}
              </span>
              {sub.isWinner && (
                <span className="badge badge-judge">
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
