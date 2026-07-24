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
});
