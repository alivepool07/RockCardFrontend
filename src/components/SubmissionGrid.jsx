import React from 'react';
import { useGame } from '../context/GameContext';
import { ResponseCard } from './Card';
import { Crown, Sparkles, Clock } from 'lucide-react';

export const SubmissionGrid = () => {
  const { roomState, isJudge, judgeSubmission } = useGame();

  const submissions = roomState?.submissions || [];
  const judgeName = roomState?.judgeName || 'The Judge';

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="#f59e0b" />
          Submissions ({submissions.length})
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
          {isJudge
            ? 'You are the Judge! Tap the best submission to crown the winner.'
            : `Waiting for ${judgeName} to choose the winning submission...`}
        </p>
      </div>

      <div
        className="submissions-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {submissions.map((sub, idx) => (
          <div
            key={sub.submissionId}
            className="glass-panel animate-fade-in"
            style={{
              padding: 'clamp(10px, 3vw, 16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.03)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                OPTION #{idx + 1}
              </span>
            </div>

            {sub.cards.map((card) => (
              <ResponseCard
                key={card.id}
                card={card}
                onClick={isJudge ? () => judgeSubmission(sub.submissionId) : undefined}
                disabled={!isJudge}
              />
            ))}

            {isJudge && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 4, padding: '10px 14px', fontSize: '0.85rem' }}
                onClick={() => judgeSubmission(sub.submissionId)}
              >
                <Crown size={14} /> Pick Winner
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
