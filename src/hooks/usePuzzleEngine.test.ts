import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePuzzleEngine } from './usePuzzleEngine';

describe('usePuzzleEngine', () => {
  it('loads the initial mate-in-1 puzzle FEN', () => {
    const { result } = renderHook(() => usePuzzleEngine());
    expect(result.current.fen).toContain('3q1rk1/5pbp');
    expect(result.current.status).toBe('idle');
  });

  it('rejects an illegal move without evaluating or changing status', () => {
    const { result } = renderHook(() => usePuzzleEngine());
    const fenBefore = result.current.fen;
    const statusBefore = result.current.status;

    act(() => {
      // e2 is an empty square on this puzzle's FEN, so this move is illegal.
      const accepted = result.current.attemptMove('e2', 'e4');
      expect(accepted).toBe(false);
    });

    // Illegal moves are not evaluated against the solution - status/message
    // should remain unchanged, unlike a legal-but-wrong "incorrect" move.
    expect(result.current.status).toBe(statusBefore);
    expect(result.current.fen).toBe(fenBefore);
  });

  it('rejects a legal move that does not match the puzzle solution', () => {
    const { result } = renderHook(() => usePuzzleEngine());

    act(() => {
      // Bc3-d4 is legal but is not the winning move (Qxg7#).
      const accepted = result.current.attemptMove('c3', 'd4');
      expect(accepted).toBe(false);
    });

    expect(result.current.status).toBe('incorrect');
  });

  it('accepts the correct move and marks the puzzle solved', async () => {
    const { result } = renderHook(() => usePuzzleEngine());

    act(() => {
      const accepted = result.current.attemptMove('f6', 'g7');
      expect(accepted).toBe(true);
    });

    await waitFor(() => expect(result.current.status).toBe('solved'));
  });

  it('advances to the next puzzle in the active set', async () => {
    const { result } = renderHook(() => usePuzzleEngine());
    const firstFen = result.current.fen;

    act(() => {
      result.current.attemptMove('f6', 'g7');
    });
    await waitFor(() => expect(result.current.status).toBe('solved'));

    act(() => {
      result.current.nextPuzzle();
    });

    expect(result.current.puzzleIndex).toBe(1);
    expect(result.current.fen).not.toBe(firstFen);
    expect(result.current.status).toBe('idle');
  });

  it('switches puzzle sets and resets to the first puzzle', () => {
    const { result } = renderHook(() => usePuzzleEngine());

    act(() => {
      result.current.selectSet('mate_in_2');
    });

    expect(result.current.activeSet).toBe('mate_in_2');
    expect(result.current.puzzleIndex).toBe(0);
    expect(result.current.puzzle.fen).toMatch(/^r2qkb1r/);
  });

  it('auto-advances to the next puzzle when "jump to next puzzle" is on', async () => {
    const { result } = renderHook(() => usePuzzleEngine());
    const firstFen = result.current.fen;

    expect(result.current.autoAdvance).toBe(false);

    act(() => {
      result.current.toggleAutoAdvance();
    });
    expect(result.current.autoAdvance).toBe(true);

    act(() => {
      result.current.attemptMove('f6', 'g7');
    });
    await waitFor(() => expect(result.current.status).toBe('solved'));

    await waitFor(() => expect(result.current.puzzleIndex).toBe(1), { timeout: 2000 });
    expect(result.current.fen).not.toBe(firstFen);
    expect(result.current.status).toBe('idle');
  });

  it('also auto-advances after a failed (incorrect) move when "jump to next puzzle" is on', async () => {
    const { result } = renderHook(() => usePuzzleEngine());
    const firstFen = result.current.fen;

    act(() => {
      result.current.toggleAutoAdvance();
    });

    act(() => {
      // Bc3-d4 is legal but wrong.
      result.current.attemptMove('c3', 'd4');
    });
    expect(result.current.status).toBe('incorrect');
    // Recorded immediately as the puzzle's final outcome - no Retry needed.
    expect(result.current.performanceHistory).toEqual(['incorrect']);

    await waitFor(() => expect(result.current.puzzleIndex).toBe(1), { timeout: 2000 });
    expect(result.current.fen).not.toBe(firstFen);
    expect(result.current.status).toBe('idle');
    expect(result.current.performanceHistory).toEqual(['incorrect']);
  });

  it('does not auto-advance when "jump to next puzzle" is off', async () => {
    const { result } = renderHook(() => usePuzzleEngine());

    act(() => {
      result.current.attemptMove('f6', 'g7');
    });
    await waitFor(() => expect(result.current.status).toBe('solved'));

    // Give the auto-advance timeout window a chance to fire if it (wrongly) would.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(result.current.puzzleIndex).toBe(0);
    expect(result.current.status).toBe('solved');
  });

  it('does not auto-advance on a wrong move when "jump to next puzzle" is off', async () => {
    const { result } = renderHook(() => usePuzzleEngine());

    act(() => {
      result.current.attemptMove('c3', 'd4');
    });
    expect(result.current.status).toBe('incorrect');
    expect(result.current.performanceHistory).toEqual([]);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(result.current.puzzleIndex).toBe(0);
    expect(result.current.status).toBe('incorrect');
    expect(result.current.performanceHistory).toEqual([]);
  });

  it('picks a random, never-repeating puzzle index when "shuffle order" is on', () => {
    const { result } = renderHook(() => usePuzzleEngine());

    expect(result.current.shuffle).toBe(false);

    act(() => {
      result.current.toggleShuffle();
    });
    expect(result.current.shuffle).toBe(true);

    for (let i = 0; i < 10; i += 1) {
      const previousIndex = result.current.puzzleIndex;
      act(() => {
        result.current.nextPuzzle();
      });
      expect(result.current.puzzleIndex).not.toBe(previousIndex);
      expect(result.current.puzzleIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.puzzleIndex).toBeLessThan(result.current.puzzleCount);
    }
  });

  it('advances incrementally when "shuffle order" is off', () => {
    const { result } = renderHook(() => usePuzzleEngine());

    act(() => {
      result.current.nextPuzzle();
    });
    expect(result.current.puzzleIndex).toBe(1);

    act(() => {
      result.current.nextPuzzle();
    });
    expect(result.current.puzzleIndex).toBe(2);
  });

  it('records one "solved" entry per puzzle when solved on the first correct move', async () => {
    const { result } = renderHook(() => usePuzzleEngine());

    expect(result.current.performanceHistory).toEqual([]);

    act(() => {
      result.current.attemptMove('f6', 'g7');
    });
    await waitFor(() => expect(result.current.status).toBe('solved'));

    expect(result.current.performanceHistory).toEqual(['solved']);

    // Retrying/advancing must not clear the accumulated history.
    act(() => {
      result.current.nextPuzzle();
    });
    expect(result.current.performanceHistory).toEqual(['solved']);
  });

  it('records a single "solved" entry even if a wrong move was tried first (no Retry in between)', async () => {
    const { result } = renderHook(() => usePuzzleEngine());

    act(() => {
      // Bc3-d4 is legal but wrong - doesn't record anything by itself.
      result.current.attemptMove('c3', 'd4');
    });
    expect(result.current.status).toBe('incorrect');
    expect(result.current.performanceHistory).toEqual([]);

    act(() => {
      // e2 is empty in this FEN - illegal moves are not recorded either.
      result.current.attemptMove('e2', 'e4');
    });
    expect(result.current.performanceHistory).toEqual([]);

    act(() => {
      result.current.attemptMove('f6', 'g7');
    });
    await waitFor(() => expect(result.current.status).toBe('solved'));

    // The puzzle was ultimately solved, so it's one "solved" entry - not
    // "incorrect" for the earlier wrong try.
    expect(result.current.performanceHistory).toEqual(['solved']);
  });

  it('records one "incorrect" entry per puzzle only when retrying after a wrong move', () => {
    const { result } = renderHook(() => usePuzzleEngine());

    // Retrying a puzzle before any wrong move records nothing.
    act(() => {
      result.current.retryPuzzle();
    });
    expect(result.current.performanceHistory).toEqual([]);

    act(() => {
      result.current.attemptMove('c3', 'd4');
    });
    expect(result.current.status).toBe('incorrect');

    act(() => {
      result.current.retryPuzzle();
    });
    expect(result.current.performanceHistory).toEqual(['incorrect']);
    expect(result.current.status).toBe('idle');

    // A second failed attempt on the (reset) puzzle records a second entry.
    act(() => {
      result.current.attemptMove('c3', 'd4');
    });
    act(() => {
      result.current.retryPuzzle();
    });
    expect(result.current.performanceHistory).toEqual(['incorrect', 'incorrect']);
  });
});
