import { Chessboard } from "react-chessboard";
import type { MoveStatus } from "../../types/puzzle";
import "./PuzzleChessboard.css";

type PuzzleChessboardProps = {
  fen: string;
  status: MoveStatus;
  orientation: "white" | "black";
  puzzleKey: string;
  onMove: (
    sourceSquare: string,
    targetSquare: string,
    promotion?: string,
  ) => boolean;
};

// react-chessboard's default animation speed (300ms) slowed down to 0.8x
// speed (i.e. 1.25x the duration) so piece-slide transitions - including
// the next-puzzle transition - read more clearly.
const ANIMATION_DURATION_MS = 300 / 0.8;

const STATUS_BORDER_COLOR: Record<MoveStatus, string> = {
  idle: "#3a3a3a",
  correct: "#3fae4f",
  solved: "#3fae4f",
  incorrect: "#d9534f",
  illegal: "#d9534f",
};

export function PuzzleChessboard({
  fen,
  status,
  orientation,
  puzzleKey,
  onMove,
}: PuzzleChessboardProps) {
  // react-chessboard keeps internal animation bookkeeping (a "waiting for
  // animation" position + timer) that isn't fully reset when we skip an
  // animation - if that happens right before a real in-puzzle move, the
  // leftover state corrupts the next move's animation with a bogus,
  // unrelated piece slide before snapping to the correct spot. `puzzleKey`
  // (from usePuzzleEngine's `boardKey`) only changes for retry/set-switch
  // resets, forcing a full remount that resets react-chessboard's internal
  // state cleanly and snaps instantly to the new position. Advancing to the
  // next puzzle leaves `puzzleKey` unchanged, so the same board instance
  // stays mounted and animates the transition from the current position to
  // the next puzzle's starting position, same as a genuine in-puzzle move.
  const options = {
    position: fen,
    onPieceDrop: ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare) return false;
      return onMove(sourceSquare, targetSquare);
    },
    boardOrientation: orientation,
    boardStyle: {
      boxShadow: `0 0 10px 1px ${STATUS_BORDER_COLOR[status]}`,
      transition: "box-shadow 150ms ease-in-out",
    },
    allowDragging: status !== "solved",
    animationDurationInMs: ANIMATION_DURATION_MS,
  };

  return (
    <div className="puzzle-chessboard">
      <Chessboard key={puzzleKey} options={options} />
    </div>
  );
}
