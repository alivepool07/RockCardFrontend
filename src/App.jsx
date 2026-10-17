import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { GameOverPage } from './pages/GameOverPage';
import { AlertCircle, Info } from 'lucide-react';

const GameContainer = () => {
  const { roomId, roomState, errorToast, infoToast } = useGame();

  const phase = roomState?.phase;

  const renderCurrentView = () => {
    if (!roomId) {
      return <HomePage />;
    }
    if (!phase || phase === 'LOBBY') {
      return <LobbyPage />;
    }
    if (phase === 'GAME_OVER') {
      return <GameOverPage />;
    }
    return <GamePage />;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notifications */}
      {errorToast && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: 'rgba(244, 63, 94, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(244, 63, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          {errorToast}
        </div>
      )}

      {infoToast && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(18, 20, 29, 0.95)',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            backdropFilter: 'blur(10px)',
            color: '#f8fafc',
            padding: '10px 22px',
            borderRadius: 999,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 600,
            fontSize: '0.88rem',
          }}
        >
          <Info size={16} color="#7c3aed" />
          {infoToast}
        </div>
      )}

      <Header />
      <main style={{ flex: 1, paddingBottom: 60 }}>
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
