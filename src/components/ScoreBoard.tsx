import type { FeedbackType } from '../hooks/useGameLogic';

interface ScoreBoardProps {
  score: number;
  streak: number;
  feedback: FeedbackType;
}

export function ScoreBoard({ score, streak, feedback }: ScoreBoardProps) {
  return (
    <div className="score-board">
      <div className="score-stats">
        <div className="score-item">
          <span className="score-label">Score</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-item streak">
          <span className="score-label">Streak</span>
          <span className="score-value">{streak}</span>
        </div>
      </div>
      {feedback === 'correct' && (
        <div className="feedback correct" role="status">
          Correct!
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="feedback wrong" role="status">
          Try again!
        </div>
      )}
    </div>
  );
}
