import React from 'react';
import { useGame } from '../context/GameContext';
import { ResponseCard } from './Card';
import { Crown, Sparkles, Clock } from 'lucide-react';

export const SubmissionGrid = () => {
  const { roomState, isJudge, judgeSubmission } = useGame();

  const submissions = roomState?.submissions || [];
  const judgeName = roomState?.judgeName || 'The Judge';

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} color="#f59e0b" />
          Submissions for this Round ({submissions.length})
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          {isJudge
            ? 'You are the Judge! Click on the best submission below to crown the winner.'
            : `Waiting for ${judgeName} to choose the winning submission...`}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 20,
        }}
      >
        {submissions.map((sub, idx) => (
          <div
            key={sub.submissionId}
            className="glass-panel animate-fade-in"
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
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
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => judgeSubmission(sub.submissionId)}
              >
                <Crown size={16} /> Pick as Winner
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
