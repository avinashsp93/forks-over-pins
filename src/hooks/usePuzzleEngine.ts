import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import mateIn1 from '../data/mate_in_1.json';
import mateIn2 from '../data/mate_in_2.json';
import mateIn3 from '../data/mate_in_3.json';
import type { MoveStatus, Puzzle, PuzzleSetKey, PuzzleSets, PerformanceOutcome } from '../types/puzzle';

const PUZZLE_SETS: PuzzleSets = {
  mate_in_1: mateIn1 as Puzzle[],
  mate_in_2: mateIn2 as Puzzle[],
  mate_in_3: mateIn3 as Puzzle[],
};

// Strip check/mate/annotation symbols so solution comparisons are lenient
// about exact SAN punctuation (e.g. "Rc8#" vs "Rc8").
function normalizeSan(san: string): string {
  return san.replace(/[+#!?]/g, '');
}

const OPPONENT_REPLY_DELAY_MS = 400;
// Delay before auto-advancing to the next puzzle when the "jump to next
// puzzle" toggle is on, so the player still gets to see the "solved"
// feedback/animation before the board moves on.
const AUTO_ADVANCE_DELAY_MS = 900;

export function usePuzzleEngine(initialSet: PuzzleSetKey = 'mate_in_1') {
  const [activeSet, setActiveSet] = useState<PuzzleSetKey>(initialSet);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzles = PUZZLE_SETS[activeSet];
  const puzzle = puzzles[puzzleIndex];

  const [game, setGame] = useState<Chess>(() => new Chess(puzzle.fen));
  const [plyIndex, setPlyIndex] = useState(0);
  const [status, setStatus] = useState<MoveStatus>('idle');
  const [message, setMessage] = useState<string>('Your move. Find the winning move!');
  // Bumped on every reset (next puzzle, retry, or set switch) - lets the
  // board tell "a fresh, unrelated starting position was just loaded" apart
  // from "a real move was just played", even when retrying the same puzzle.
  const [resetNonce, setResetNonce] = useState(0);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accumulates one entry per *puzzle attempt* ('solved' once the puzzle's
  // final move is played correctly, 'incorrect' once the attempt is given
  // up on - either via Retry, or immediately when "jump to next puzzle" is
  // on and a wrong move is made) so the panel can show a running
  // checkmark/crossmark history of the player's performance - one icon per
  // puzzle, not per move. Never cleared by retry/next/set-switch - it's a
  // running log for the whole session as the player progresses through the
  // puzzle set.
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceOutcome[]>([]);

  // "Jump to next puzzle" toggle: when on, solving a puzzle auto-advances to
  // the next one instead of waiting for the player to click "Next Puzzle".
  // Read via a ref inside timeouts/callbacks so a toggle mid-solve is always
  // respected using its latest value, not a stale closure.
  const [autoAdvance, setAutoAdvance] = useState(false);
  const autoAdvanceRef = useRef(autoAdvance);
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  // "Shuffle order" toggle: when on, advancing picks a random puzzle from
  // the active set (never repeating the just-solved one) instead of the
  // next incremental index.
  const [shuffle, setShuffle] = useState(false);

  // `remount` forces the board to fully remount (via `boardKey`), which
  // instantly snaps to the new position with no animation - used for retry
  // and puzzle-set switches, where the old position isn't a meaningful
  // "starting point" to animate from and a clean reset avoids leftover
  // animation state corrupting the next move. Advancing to the next puzzle
  // *does* want an animated transition (current board -> next puzzle's
  // starting position), so it skips the remount and just updates `fen`,
  // letting react-chessboard animate the piece-level diff between the two
  // positions on the same mounted board instance.
  const resetToPuzzle = useCallback((set: PuzzleSetKey, index: number, remount: boolean) => {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    const nextPuzzle = PUZZLE_SETS[set][index];
    setGame(new Chess(nextPuzzle.fen));
    setPlyIndex(0);
    setStatus('idle');
    setMessage('Your move. Find the winning move!');
    if (remount) {
      setResetNonce((n) => n + 1);
    }
  }, []);

  const selectSet = useCallback(
    (set: PuzzleSetKey) => {
      setActiveSet(set);
      setPuzzleIndex(0);
      resetToPuzzle(set, 0, true);
    },
    [resetToPuzzle],
  );

  const nextPuzzle = useCallback(() => {
    let nextIndex: number;
    if (shuffle && puzzles.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * puzzles.length);
      } while (nextIndex === puzzleIndex);
    } else {
      nextIndex = (puzzleIndex + 1) % puzzles.length;
    }
    setPuzzleIndex(nextIndex);
    resetToPuzzle(activeSet, nextIndex, false);
  }, [activeSet, puzzleIndex, puzzles.length, resetToPuzzle, shuffle]);

  const retryPuzzle = useCallback(() => {
    // Retrying after at least one wrong move records exactly one "failed"
    // entry for this puzzle attempt, before the board resets. Retrying a
    // puzzle that hasn't been attempted yet (still 'idle') records nothing.
    if (status === 'incorrect') {
      setPerformanceHistory((history) => [...history, 'incorrect']);
    }
    resetToPuzzle(activeSet, puzzleIndex, true);
  }, [activeSet, puzzleIndex, resetToPuzzle, status]);

  /**
   * Attempts to play the player's (White's) move. Returns true if the move
   * should be visually accepted by the board (i.e. it matched the solution),
   * false otherwise (illegal or incorrect - the board should snap back).
   */
  const attemptMove = useCallback(
    (sourceSquare: string, targetSquare: string, promotion = 'q'): boolean => {
      if (status === 'solved') return false;

      const attempt = new Chess(game.fen());
      let moveResult;
      try {
        moveResult = attempt.move({ from: sourceSquare, to: targetSquare, promotion });
      } catch {
        moveResult = null;
      }

      if (!moveResult) {
        // Illegal moves (not legal chess moves at all) are not evaluated
        // against the puzzle solution - just silently reject so the piece
        // snaps back with no status/message change.
        return false;
      }

      // If "jump to next puzzle" is on, auto-advance shortly after the
      // puzzle's outcome (solved or failed) is decided, so the player still
      // sees the solved/failed feedback before the board moves on.
      const scheduleAutoAdvance = () => {
        if (!autoAdvanceRef.current) return;
        if (advanceTimeoutRef.current) {
          clearTimeout(advanceTimeoutRef.current);
        }
        advanceTimeoutRef.current = setTimeout(() => {
          nextPuzzle();
        }, AUTO_ADVANCE_DELAY_MS);
      };

      const expectedSan = puzzle.solution[plyIndex];
      if (!expectedSan || normalizeSan(moveResult.san) !== normalizeSan(expectedSan)) {
        setStatus('incorrect');
        if (autoAdvanceRef.current) {
          // With auto-advance on, a wrong move *is* the final outcome for
          // this puzzle attempt (no manual Retry will happen), so record it
          // here rather than waiting for retryPuzzle().
          setMessage("That's not the winning move. Moving to the next puzzle...");
          setPerformanceHistory((history) => [...history, 'incorrect']);
          scheduleAutoAdvance();
        } else {
          setMessage("That's not the winning move. Try again.");
        }
        return false;
      }

      setGame(attempt);
      const nextPly = plyIndex + 1;

      if (nextPly >= puzzle.solution.length) {
        setPlyIndex(nextPly);
        setStatus('solved');
        setMessage('Puzzle solved! \u{1F389}');
        setPerformanceHistory((history) => [...history, 'solved']);
        scheduleAutoAdvance();
        return true;
      }

      // Auto-play the scripted opponent reply after a brief delay.
      const replySan = puzzle.solution[nextPly];
      setStatus('correct');
      setMessage('Correct! Opponent is replying...');
      replyTimeoutRef.current = setTimeout(() => {
        const withReply = new Chess(attempt.fen());
        withReply.move(replySan);
        setGame(withReply);
        const plyAfterReply = nextPly + 1;
        setPlyIndex(plyAfterReply);
        if (plyAfterReply >= puzzle.solution.length) {
          setStatus('solved');
          setMessage('Puzzle solved! \u{1F389}');
          setPerformanceHistory((history) => [...history, 'solved']);
          scheduleAutoAdvance();
        } else {
          setStatus('idle');
          setMessage('Correct! Keep going.');
        }
      }, OPPONENT_REPLY_DELAY_MS);

      return true;
    },
    [game, plyIndex, puzzle, status, nextPuzzle],
  );

  const fen = useMemo(() => game.fen(), [game]);
  // Derived from plyIndex (not game.history()) because each move re-instantiates
  // Chess from a FEN string, which resets chess.js's own move history.
  const moveHistory = useMemo(() => puzzle.solution.slice(0, plyIndex), [puzzle, plyIndex]);

  // The player's side is whoever is to move in the puzzle's starting
  // position, so the board should be oriented from that side's perspective.
  const orientation = useMemo<'white' | 'black'>(
    () => (puzzle.fen.split(' ')[1] === 'b' ? 'black' : 'white'),
    [puzzle.fen],
  );

  // Forces a full board remount only for retry/set-switch resets (bumped by
  // resetToPuzzle's `remount` flag) - advancing to the next puzzle
  // deliberately leaves this unchanged so the board stays mounted and
  // animates the transition from the current position to the next puzzle's
  // starting position instead of snapping instantly.
  const boardKey = `board-${resetNonce}`;

  const toggleAutoAdvance = useCallback(() => {
    setAutoAdvance((value) => !value);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((value) => !value);
  }, []);

  return {
    activeSet,
    puzzles,
    puzzle,
    puzzleIndex,
    puzzleCount: puzzles.length,
    fen,
    orientation,
    moveHistory,
    boardKey,
    status,
    message,
    performanceHistory,
    autoAdvance,
    toggleAutoAdvance,
    shuffle,
    toggleShuffle,
    selectSet,
    nextPuzzle,
    retryPuzzle,
    attemptMove,
  };
}
