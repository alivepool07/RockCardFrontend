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
      className="glass-panel header-container"
      style={{
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            padding: 7,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <Flame size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            CARDS OF MAYHEM
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: connected ? '#10b981' : '#f43f5e',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }} className="hide-on-mobile">
              {connected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {roomId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            title="Click to copy room code"
          >
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }} className="hide-on-mobile">ROOM:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
              {roomId}
            </span>
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} color="#94a3b8" />}
          </div>

          {roomState?.phase && (
            <span className="badge badge-host hide-on-mobile" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
              {roomState.phase.replace('_', ' ')}
            </span>
          )}

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: 8 }}
            onClick={leaveRoom}
            title="Leave room"
          >
            <LogOut size={14} />
            <span className="hide-on-mobile">Leave</span>
          </button>
        </div>
      )}
    </header>
  );
};
