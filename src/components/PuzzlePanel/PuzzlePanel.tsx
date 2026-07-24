import type { MoveStatus, Puzzle } from '../../types/puzzle';
import './PuzzlePanel.css';

type PuzzlePanelProps = {
  puzzle: Puzzle;
  puzzleIndex: number;
  puzzleCount: number;
  orientation: 'white' | 'black';
  moveHistory: string[];
  status: MoveStatus;
  message: string;
  onNext: () => void;
  onRetry: () => void;
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
  onNext,
  onRetry,
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
      <p className={STATUS_CLASS[status]}>{message}</p>
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
    </section>
  );
}
