import React from 'react';
import { useGame } from '../context/GameContext';
import { Crown, Star, CheckCircle, Clock, WifiOff } from 'lucide-react';

export const PlayerList = () => {
  const { roomState, playerId, username } = useGame();

  const players = roomState?.players || [];
  const winningScore = roomState?.winningScore || 7;

  return (
    <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Players ({players.length})
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
          First to {winningScore}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {players.map((p) => {
          const isMe = (playerId && p.id === playerId) || (username && p.username.trim().toLowerCase() === username.trim().toLowerCase());
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 12,
                background: isMe ? 'rgba(124, 58, 237, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isMe ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                opacity: p.isConnected ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isMe ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#fff',
                  }}
                >
                  {p.username.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: isMe ? '#c4b5fd' : '#f8fafc' }}>
                      {p.username} {isMe ? '(You)' : ''}
                    </span>
                    {p.isHost && <Star size={14} color="#f59e0b" fill="#f59e0b" title="Host" />}
                    {p.isJudge && <Crown size={15} color="#eab308" title="Current Judge" />}
                    {!p.isConnected && <WifiOff size={14} color="#f43f5e" title="Disconnected" />}
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    {p.isJudge ? (
                      <span className="badge badge-judge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        Judge
                      </span>
                    ) : p.hasSubmitted ? (
                      <span className="badge badge-submitted" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        <CheckCircle size={10} /> Submitted
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Thinking...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: p.score > 0 ? '#fbbf24' : '#94a3b8',
                }}
              >
                {p.score} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
