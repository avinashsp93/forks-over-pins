/**
 * A single puzzle record. `solution` is the full forced mating line in SAN,
 * alternating player (White) moves and scripted opponent (Black) replies,
 * e.g. ["Rc3", "Kh8", "Rc8#"] for a mate-in-2 (player plays index 0 and 2,
 * the opponent reply at index 1 is auto-played by the engine).
 */
export type Puzzle = {
  description: string;
  fen: string;
  solution: string[];
};

export type PuzzleSetKey = 'mate_in_1' | 'mate_in_2' | 'mate_in_3';

export type PuzzleSets = Record<PuzzleSetKey, Puzzle[]>;

export const PUZZLE_SET_LABELS: Record<PuzzleSetKey, string> = {
  mate_in_1: 'Mate in 1',
  mate_in_2: 'Mate in 2',
  mate_in_3: 'Mate in 3',
};

export type MoveStatus = 'idle' | 'correct' | 'incorrect' | 'illegal' | 'solved';

// One entry per recorded move outcome, used to build a running
// checkmark/crossmark performance history (see usePuzzleEngine's
// `performanceHistory`).
export type PerformanceOutcome = 'solved' | 'incorrect';
