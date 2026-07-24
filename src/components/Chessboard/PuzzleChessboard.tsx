import { Chessboard } from 'react-chessboard';
import type { MoveStatus } from '../../types/puzzle';
import './PuzzleChessboard.css';

type PuzzleChessboardProps = {
  fen: string;
  status: MoveStatus;
  orientation: 'white' | 'black';
  puzzleKey: string;
  onMove: (sourceSquare: string, targetSquare: string, promotion?: string) => boolean;
};

const STATUS_BORDER_COLOR: Record<MoveStatus, string> = {
  idle: '#3a3a3a',
  correct: '#3fae4f',
  solved: '#3fae4f',
  incorrect: '#d9534f',
  illegal: '#d9534f',
};

export function PuzzleChessboard({ fen, status, orientation, puzzleKey, onMove }: PuzzleChessboardProps) {
  const options = {
    position: fen,
    onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
      if (!targetSquare) return false;
      return onMove(sourceSquare, targetSquare);
    },
    boardOrientation: orientation,
    boardStyle: {
      borderRadius: '8px',
      boxShadow: `0 0 0 4px ${STATUS_BORDER_COLOR[status]}`,
      transition: 'box-shadow 150ms ease-in-out',
    },
    allowDragging: status !== 'solved',
    showAnimations: true,
  };

  return (
    <div className="puzzle-chessboard">
      {/* Keying on the puzzle identity forces a full remount when the puzzle
          changes, so react-chessboard doesn't try to animate/tween pieces
          between two unrelated positions (a glitchy "flying pieces" effect). */}
      <Chessboard key={puzzleKey} options={options} />
    </div>
  );
}
