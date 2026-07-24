# PLAN.md

## Goal
Rebuild the chess puzzle trainer as a modern Vite + React (TypeScript) application, replacing the Create React App prototype, while preserving proven concepts (puzzle JSON format, `chess.js` for legality/PGN) and fixing known gaps (puzzle progression, multi-set support, visible feedback).

## Status: implemented
The rewrite described in this plan has been carried out. `AGENTS.md` documents the resulting architecture in detail. This file is kept as a record of the plan and to track remaining follow-up work.

## What was done
- Deleted the CRA scaffold and rescaffolded with `npm create vite@latest . --template react-ts`.
- Installed `chess.js` and `react-chessboard` (v5, `options`-object API); no jQuery, no CDN scripts.
- Built `src/hooks/usePuzzleEngine.ts`: owns the `Chess` game instance, puzzle/set selection, ply index, move status, and feedback message. Move validation clones the game state before committing, so illegal/incorrect attempts never mutate the real board.
- Puzzle progression is index-based (`(puzzleIndex + 1) % puzzles.length`) — the old "hardcoded next-puzzle FEN" bug cannot recur by construction.
- All three puzzle sets (`mate_in_1`, `mate_in_2`, `mate_in_3`) are wired up from the start, with a set-selector in the header (`src/components/Header/Header.tsx`).
- Multi-move puzzles (mate-in-2/3): decided to store the **full mating line** (player + opponent moves) as `solution: string[]` and have the engine **auto-play the scripted opponent reply** rather than requiring it to be the objectively-forced/unique defense. This was the simplest correct design given the engine always controls both sides of the puzzle line.
- Visible move feedback is implemented via `MoveStatus` (`idle`/`correct`/`incorrect`/`illegal`/`solved`), shown as a color-coded banner in `PuzzlePanel` and as the chessboard's border color.
- Puzzle data (`src/data/mate_in_1.json`, `mate_in_2.json`, `mate_in_3.json`) was generated and validated with a throwaway Node script that replayed each `solution` line through `chess.js` and asserted the final position is `isCheckmate()`. Current seed data: 3 mate-in-1, 1 mate-in-2, 1 mate-in-3 puzzle.
- Tests added with Vitest + React Testing Library (`npm run test`): rendering the title/board/set-selector (`src/App.test.tsx`), and illegal-move rejection, incorrect-move rejection, correct-move acceptance/solve, puzzle advancement, and puzzle-set switching (`src/hooks/usePuzzleEngine.test.ts`).
- `npm run build` (tsc + vite build) and `npm run lint` (oxlint) both pass cleanly.

## UI layout (as implemented)
- **Header** (`Header.tsx`): app title, subtitle, and a row of pill-style tabs for Mate in 1 / 2 / 3.
- **Main area** (`App.tsx`, flex-wrap, centered): the chessboard (`PuzzleChessboard`) and the puzzle panel (`PuzzlePanel`) side by side on wide viewports; stacked vertically under 720px width.
- **Puzzle panel**: progress counter ("Puzzle N / M"), puzzle description, color-coded feedback banner, and Retry / Next Puzzle buttons (Next is disabled until the puzzle is solved).

## Remaining / follow-up work (not yet done)
- Expand puzzle datasets with more puzzles per set and more varied mate patterns (current seed data leans on back-rank/queen mates for reliability); ideally curate puzzles where the opponent's reply is the objectively forced defense, not just a scripted line.
- Add square highlighting for the last move and/or legal-move hints using `react-chessboard`'s `squareStyles` option.
- Persist streak/session progress (e.g. to `localStorage`).
- Add a "Show Solution" control.
- Visual/responsive polish pass beyond the current flex-wrap two-column layout.
- Consider moving `usePuzzleEngine`'s state to `useReducer` if more state fields are added.
- Write a project-specific `README.md` (still the Vite-generated default at time of writing).

## Definition of a good rewritten milestone (met)
The rewritten app lets a user:
1. run `npm run dev` and see a real project title and puzzle UI (no CRA/Vite starter leftovers) — done.
2. play mate-in-1, mate-in-2, and mate-in-3 puzzles via a set selector — done.
3. get clear, visible feedback for correct / incorrect / illegal moves — done.
4. advance, retry, or restart puzzles using index-based progression (no hardcoded FEN bugs) — done.
5. see a responsive layout on both desktop and mobile — done (basic flex-wrap breakpoint at 720px; further polish is a follow-up item).
6. run a test suite that reflects the actual interface and passes — done (`npm run test`, 8 passing tests).
