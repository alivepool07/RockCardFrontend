import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Copy, Check, Play, Users, Star, Sparkles, Shield, Clock } from 'lucide-react';

export const LobbyPage = () => {
  const { roomId, roomState, isHost, startGame } = useGame();
  const [copied, setCopied] = useState(false);
  const [maxRounds, setMaxRounds] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(60);

  const players = roomState?.players || [];
  const minPlayers = 3;
  const canStart = players.length >= minPlayers;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 860, margin: '20px auto', padding: '0 20px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: 40, textAlign: 'center', marginBottom: 32 }}>
        <span className="badge badge-host" style={{ marginBottom: 16 }}>
          Game Lobby
        </span>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          Waiting for Players
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 500, margin: '0 auto 24px' }}>
          Share your room code with friends so they can join from their phones or laptops.
        </p>

        {/* Room Code Showcase */}
        <div
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(124, 58, 237, 0.15)',
            border: '2px dashed rgba(124, 58, 237, 0.4)',
            borderRadius: 16,
            padding: '16px 36px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Click to copy code"
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.25em', color: '#c4b5fd' }}>
            {roomId}
          </span>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem' }}
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Game Host Settings */}
        {isHost && (
          <div
            style={{
              marginTop: 32,
              marginBottom: 24,
              padding: '24px',
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'left',
              maxWidth: 580,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#c084fc" /> Match Configuration
            </h3>

            {/* Rounds Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>
                Number of Rounds: <strong style={{ color: '#fff' }}>{maxRounds} Rounds</strong>
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[3, 5, 7, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMaxRounds(r)}
                    style={{
                      flex: '1 1 70px',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: maxRounds === r ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                      background: maxRounds === r ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: maxRounds === r ? '#c4b5fd' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {r} {r === 5 ? '★' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Turn Timer Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>
                Submission Timer: <strong style={{ color: '#fff' }}>{timerSeconds === 0 ? 'Unlimited' : `${timerSeconds}s`}</strong>
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: '30s Blitz', val: 30 },
                  { label: '45s', val: 45 },
                  { label: '60s Standard', val: 60 },
                  { label: '90s Relaxed', val: 90 },
                  { label: 'No Timer', val: 0 },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setTimerSeconds(t.val)}
                    style={{
                      flex: '1 1 85px',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: timerSeconds === t.val ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                      background: timerSeconds === t.val ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: timerSeconds === t.val ? '#c4b5fd' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Start Game Action */}
        <div style={{ marginTop: 20 }}>
          {isHost ? (
            <div>
              <button
                className="btn btn-primary pulse-glow"
                style={{ padding: '16px 48px', fontSize: '1.15rem' }}
                onClick={() => startGame(maxRounds, timerSeconds)}
                disabled={!canStart}
              >
                <Play size={20} fill="#fff" /> Start Game
              </button>
              {!canStart && (
                <p style={{ color: '#f43f5e', fontSize: '0.85rem', marginTop: 12, fontWeight: 600 }}>
                  Need at least {minPlayers} players to begin ({players.length}/{minPlayers} joined)
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.95rem' }}>
              <Clock size={16} /> Waiting for the host to launch the match...
            </div>
          )}
        </div>
      </div>

      {/* Roster of Joined Players */}
      <div className="glass-panel animate-fade-in" style={{ padding: 32 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} color="#7c3aed" /> Roster ({players.length} Players)
        </h3>

        {!roomState ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '0.95rem' }}>Syncing room roster...</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {players.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  opacity: p.connected === false ? 0.7 : 1,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: p.isHost
                      ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                      : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {p.username.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                      {p.username}
                    </span>
                    {p.isHost && <Star size={14} color="#f59e0b" fill="#f59e0b" title="Host" />}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: p.connected === false ? '#fbbf24' : p.isHost ? '#f59e0b' : '#34d399',
                    }}
                  >
                    {p.connected === false ? 'Reconnecting...' : p.isHost ? 'Room Host' : 'Ready'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
