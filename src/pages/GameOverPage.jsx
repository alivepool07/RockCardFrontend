import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Home } from 'lucide-react';

export const GameOverPage = () => {
  const { roomState, leaveRoom } = useGame();

  const players = [...(roomState?.players || [])].sort((a, b) => b.score - a.score);
  const winner = players[0] || { username: 'Champion', score: 7 };

  useEffect(() => {
    // Grand finale confetti blast
    try {
      const end = Date.now() + 3000;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
        });
      }, 300);
      return () => clearInterval(interval);
    } catch (e) {
      // Ignored
    }
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: 720, margin: '20px auto' }}>
      <div className="glass-panel animate-fade-in pulse-glow" style={{ padding: 'clamp(24px, 5vw, 48px)', textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #e11d48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)',
          }}
        >
          <Trophy size={36} color="#fff" />
        </div>

        <span className="badge badge-judge" style={{ marginBottom: 12 }}>
          GAME OVER
        </span>

        <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          {winner.username} Wins!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: 24 }}>
          With a crushing total of <strong style={{ color: '#fbbf24' }}>{winner.score} points</strong>.
        </p>

        {/* Scoreboard */}
        <div style={{ maxWidth: 440, margin: '0 auto 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {players.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderRadius: 12,
                background: idx === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 800, color: idx === 0 ? '#f59e0b' : '#64748b', width: 24 }}>
                  #{idx + 1}
                </span>
                <span style={{ fontWeight: 700, color: '#fff' }}>
                  {p.username}
                </span>
                {idx === 0 && <Crown size={16} color="#f59e0b" fill="#f59e0b" />}
              </div>

              <span style={{ fontWeight: 800, color: idx === 0 ? '#fbbf24' : '#94a3b8' }}>
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button className="btn btn-primary" onClick={leaveRoom}>
            <Home size={18} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
