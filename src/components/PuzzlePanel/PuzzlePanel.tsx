import type { MoveStatus, PerformanceOutcome, Puzzle } from '../../types/puzzle';
import './PuzzlePanel.css';

type PuzzlePanelProps = {
  puzzle: Puzzle;
  puzzleIndex: number;
  puzzleCount: number;
  orientation: 'white' | 'black';
  moveHistory: string[];
  status: MoveStatus;
  message: string;
  performanceHistory: PerformanceOutcome[];
  autoAdvance: boolean;
  shuffle: boolean;
  onNext: () => void;
  onRetry: () => void;
  onToggleAutoAdvance: () => void;
  onToggleShuffle: () => void;
};

const STATUS_CLASS: Record<MoveStatus, string> = {
  idle: 'feedback feedback--idle',
  correct: 'feedback feedback--correct',
  solved: 'feedback feedback--solved',
  incorrect: 'feedback feedback--incorrect',
  illegal: 'feedback feedback--incorrect',
};

const STATUS_BORDER_COLOR: Record<MoveStatus, string> = {
  idle: '#3a3a3a',
  correct: '#3fae4f',
  solved: '#3fae4f',
  incorrect: '#d9534f',
  illegal: '#d9534f',
};

// Shown next to the feedback message: a check mark once the puzzle is
// solved, a cross mark on a failed attempt (incorrect/illegal move). No icon
// for the neutral "idle"/"correct" (mid-solve) states.
const STATUS_ICON: Partial<Record<MoveStatus, string>> = {
  solved: '\u2705',
  incorrect: '\u274C',
  illegal: '\u274C',
};

// Icons used to render the accumulated performance history strip.
const PERFORMANCE_ICON: Record<PerformanceOutcome, string> = {
  solved: '\u2705',
  incorrect: '\u274C',
};

// Groups a flat list of SAN moves into numbered move pairs (e.g. "1. e4 e5"),
// honouring the puzzle's starting move number and side to move so
// black-to-move puzzles correctly start with "1... " instead of "1. ".
function formatMoveHistory(fen: string, orientation: 'white' | 'black', moves: string[]): string[] {
  const fenParts = fen.split(' ');
  const startFullmove = Number(fenParts[5]) || 1;
  const lines: string[] = [];

  let moveNumber = startFullmove;
  let index = 0;

  if (orientation === 'black' && moves.length > 0) {
    lines.push(`${moveNumber}... ${moves[0]}`);
    index = 1;
    moveNumber += 1;
  }

  for (; index < moves.length; index += 2) {
    const whiteMove = moves[index];
    const blackMove = moves[index + 1];
    lines.push(blackMove ? `${moveNumber}. ${whiteMove} ${blackMove}` : `${moveNumber}. ${whiteMove}`);
    moveNumber += 1;
  }

  return lines;
}

export function PuzzlePanel({
  puzzle,
  puzzleIndex,
  puzzleCount,
  orientation,
  moveHistory,
  status,
  message,
  performanceHistory,
  autoAdvance,
  onNext,
  onRetry,
  onToggleAutoAdvance,
  shuffle,
  onToggleShuffle,
}: PuzzlePanelProps) {
  const formattedMoves = formatMoveHistory(puzzle.fen, orientation, moveHistory);
  const lastMoveIndex = formattedMoves.length - 1;

  return (
    <section
      className="puzzle-panel"
      style={{
        boxShadow: `0 0 10px 1px ${STATUS_BORDER_COLOR[status]}`,
        transition: 'box-shadow 150ms ease-in-out',
      }}
    >
      <p className="puzzle-panel__progress">
        Puzzle {puzzleIndex + 1} / {puzzleCount}
      </p>
      <p className="puzzle-panel__description">{puzzle.description}</p>
      <p className={STATUS_CLASS[status]}>
        {STATUS_ICON[status] && (
          <span className="puzzle-panel__status-icon" aria-hidden="true">
            {STATUS_ICON[status]}
          </span>
        )}
        {message}
      </p>
      <div className="puzzle-panel__moves">
        <span className="puzzle-panel__moves-label">Moves played</span>
        {formattedMoves.length > 0 ? (
          <p className="puzzle-panel__moves-text">
            {formattedMoves.map((line, index) => (
              <span
                key={line}
                className={index === lastMoveIndex ? 'puzzle-panel__move puzzle-panel__move--latest' : 'puzzle-panel__move'}
              >
                {line}
              </span>
            ))}
          </p>
        ) : (
          <p className="puzzle-panel__moves-empty">No moves played yet.</p>
        )}
      </div>
      <div className="puzzle-panel__controls">
        <button type="button" onClick={onRetry}>
          Retry
        </button>
        <button type="button" onClick={onNext} disabled={status !== 'solved'}>
          Next Puzzle
        </button>
      </div>
      <div className="puzzle-panel__performance">
        <span className="puzzle-panel__moves-label">Performance history</span>
        {performanceHistory.length > 0 ? (
          <p className="puzzle-panel__performance-icons">
            {performanceHistory.map((outcome, index) => (
              <span
                key={index}
                className="puzzle-panel__performance-icon"
                role="img"
                aria-label={outcome === 'solved' ? 'Solved' : 'Failed'}
              >
                {PERFORMANCE_ICON[outcome]}
              </span>
            ))}
          </p>
        ) : (
          <p className="puzzle-panel__moves-empty">No attempts yet.</p>
        )}
      </div>
      <label className="puzzle-panel__auto-advance">
        <input type="checkbox" checked={autoAdvance} onChange={onToggleAutoAdvance} />
        Jump to next puzzle
      </label>
      <label className="puzzle-panel__auto-advance">
        <input type="checkbox" checked={shuffle} onChange={onToggleShuffle} />
        Shuffle order
      </label>
    </section>
  );
}
