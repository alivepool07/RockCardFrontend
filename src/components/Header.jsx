import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Copy, Check, LogOut, Flame, Sparkles } from 'lucide-react';

export const Header = () => {
  const { roomId, roomState, leaveRoom, connected } = useGame();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header
      className="glass-panel"
      style={{
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            padding: 8,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Flame size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            CARDS OF MAYHEM
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: connected ? '#10b981' : '#f43f5e',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {connected ? 'Live WebSocket' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {roomId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            title="Click to copy room code"
          >
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ROOM:</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
              {roomId}
            </span>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} color="#94a3b8" />}
          </div>

          {roomState?.phase && (
            <span className="badge badge-host">
              {roomState.phase.replace('_', ' ')}
            </span>
          )}

          <button
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            onClick={leaveRoom}
            title="Leave room"
          >
            <LogOut size={14} /> Leave
          </button>
        </div>
      )}
    </header>
  );
};
