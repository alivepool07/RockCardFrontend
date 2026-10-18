import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PromptCard } from '../components/Card';
import { Hand } from '../components/Hand';
import { SubmissionGrid } from '../components/SubmissionGrid';
import { RevealedGrid } from '../components/RevealedGrid';
import { PlayerList } from '../components/PlayerList';
import { Sparkles, Crown, Clock } from 'lucide-react';

export const GamePage = () => {
  const { roomState } = useGame();
  const phase = roomState?.phase || 'SUBMITTING';
  const judge = roomState?.judgeName || 'The Judge';
  const currentRound = roomState?.currentRound || 1;
  const maxRounds = roomState?.maxRounds || 5;
  const deadlineMs = roomState?.submissionDeadlineEpochMs;

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadlineMs || phase !== 'SUBMITTING') {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((deadlineMs - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [deadlineMs, phase]);

  return (
    <div className="page-container" style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div className="game-grid">
        {/* Main Stage */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          {/* Phase Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-judge">
                  <Crown size={11} /> Judge: {judge}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#c4b5fd',
                    background: 'rgba(124, 58, 237, 0.2)',
                    padding: '3px 8px',
                    borderRadius: 16,
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Round {currentRound}/{maxRounds}
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.35rem)', fontWeight: 800, color: '#fff', marginTop: 4 }}>
                {phase === 'SUBMITTING' && 'Card Submission Phase'}
                {phase === 'JUDGING' && 'Judging & Deliberation'}
                {phase === 'ROUND_OVER' && 'Round Results'}
              </h2>
            </div>

            {/* Live Countdown Timer in Submission Phase */}
            {phase === 'SUBMITTING' && timeLeft !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: timeLeft <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: timeLeft <= 10 ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.12)',
                  animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <Clock size={16} color={timeLeft <= 10 ? '#ef4444' : '#94a3b8'} />
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                    color: timeLeft <= 10 ? '#f87171' : '#f8fafc',
                  }}
                >
                  {timeLeft === 0 ? "Time's up!" : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
                </span>
              </div>
            )}
          </div>

          {/* Active Prompt Card */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <PromptCard prompt={roomState?.currentPrompt} />
          </div>

          {/* Dynamic Phase Content */}
          {phase === 'SUBMITTING' && <Hand />}
          {phase === 'JUDGING' && <SubmissionGrid />}
          {phase === 'ROUND_OVER' && <RevealedGrid />}
        </div>

        {/* Sidebar Player List */}
        <div>
          <PlayerList />
        </div>
      </div>
    </div>
  );
};
