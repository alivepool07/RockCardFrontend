import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles, Users, PlusCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const HomePage = () => {
  const { username: savedUsername, createRoom, joinRoom, connected } = useGame();
  const [name, setName] = useState(savedUsername || '');
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom(name);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !joinCode.trim()) return;
    joinRoom(joinCode, name);
  };

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 20px' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: 48 }} className="animate-fade-in">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            color: '#c4b5fd',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          <Sparkles size={16} /> Real-Time STOMP Multiplayer Game
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 16,
            background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Cards of Mayhem
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: 600, margin: '0 auto' }}>
          The wildly irreverent party game for horrible people. Fast, synchronized, and completely in your browser.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            marginTop: 18,
            color: '#fca5a5',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <span style={{ background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800 }}>
            18+ ONLY
          </span>
          <span>Unhinged Adults Edition: Contains explicit adult humor, bedroom chaos & dark themes.</span>
        </div>
      </div>

      {/* Main Action Card */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: 500,
          margin: '0 auto',
          padding: 36,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Quick Rejoin Banner if session exists */}
        {sessionStorage.getItem('cah_roomId') && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.35)',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase' }}>
                Active Game Found
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                Room {sessionStorage.getItem('cah_roomId')}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => joinRoom(sessionStorage.getItem('cah_roomId'), savedUsername || name)}
            >
              Rejoin <ArrowRight size={14} />
            </button>
          </div>
        )}
        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 28,
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={() => setActiveTab('create')}
            style={{
              flex: 1,
              background: activeTab === 'create' ? '#7c3aed' : 'transparent',
              color: '#fff',
              padding: '10px 0',
              borderRadius: 8,
              boxShadow: activeTab === 'create' ? '0 2px 10px rgba(124, 58, 237, 0.4)' : 'none',
            }}
          >
            <PlusCircle size={16} /> Create Room
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveTab('join')}
            style={{
              flex: 1,
              background: activeTab === 'join' ? '#7c3aed' : 'transparent',
              color: '#fff',
              padding: '10px 0',
              borderRadius: 8,
              boxShadow: activeTab === 'join' ? '0 2px 10px rgba(124, 58, 237, 0.4)' : 'none',
            }}
          >
            <Users size={16} /> Join Room
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                Your Nickname
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. DangerDave"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 0', fontSize: '1.05rem' }}
              disabled={!name.trim() || !connected}
            >
              Create New Game <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                5-Letter Room Code
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. AB123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={5}
                style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                Your Nickname
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. MysteryPlayer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 0', fontSize: '1.05rem' }}
              disabled={!name.trim() || joinCode.length < 5 || !connected}
            >
              Join Game <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: 28,
            paddingTop: 20,
            color: '#64748b',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#06b6d4" /> Sub-5ms Latency
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="#10b981" /> Private Hands
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} color="#7c3aed" /> 3-20 Players
          </span>
        </div>
      </div>
    </div>
  );
};
