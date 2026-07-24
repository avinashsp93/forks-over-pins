# AGENTS.md

## Purpose
This repository is a small React-based chess tactics app focused on practicing forced mates from preset puzzle positions. The app was rewritten from scratch on **Vite + React + TypeScript**, replacing an earlier Create React App prototype. This file documents the current architecture as implemented.

## Current architecture
- **Runtime:** Vite + React 19 + TypeScript (`npm create vite@latest -- --template react-ts`).
- **Entry point:** `src/main.tsx` renders `<App />` into `#root`; `index.html` is the Vite entry HTML (no external CDN scripts, no jQuery).
- **Top-level app shell:** `src/App.tsx` composes `Header`, `PuzzleChessboard`, and `PuzzlePanel`, all driven by the `usePuzzleEngine` hook.
- **Chessboard component:** [`react-chessboard`](https://github.com/Clariity/react-chessboard) v5 (`options`-object API), wrapped in `src/components/Chessboard/PuzzleChessboard.tsx`. Board border color reflects move status (idle/correct/incorrect/illegal/solved).
- **Move legality / PGN:** `chess.js`, used inside `src/hooks/usePuzzleEngine.ts`.
- **State management:** function components + hooks. `usePuzzleEngine` (a custom hook, not a reducer) owns all puzzle/game state: active puzzle set, puzzle index, the `Chess` game instance, ply index into the solution, move status, and feedback message.
- **Styling:** plain CSS files colocated per component (`Header.css`, `PuzzlePanel.css`, `PuzzleChessboard.css`, `App.css`, `index.css`). No Bootstrap/CDN dependency.
- **Testing:** Vitest + React Testing Library. `src/App.test.tsx` covers rendering; `src/hooks/usePuzzleEngine.test.ts` covers illegal/incorrect/correct move handling, puzzle advancement, and puzzle-set switching. Run with `npm run test`.
- **Static assets:** `public/favicon.svg` only; piece art comes from `react-chessboard`'s built-in piece set (no manual PNGs needed).

## Implemented behavior
- `usePuzzleEngine` initializes a `Chess` instance from the active puzzle's FEN.
- The player (always White) drags a piece; `PuzzleChessboard`'s `onPieceDrop` calls `attemptMove(sourceSquare, targetSquare)`.
- `attemptMove` plays the move on a **cloned** `Chess` instance first:
  - If illegal, status becomes `'illegal'` and the real game state is untouched (board snaps back).
  - If legal but its SAN doesn't match the expected next entry in `puzzle.solution` (compared with check/mate symbols stripped), status becomes `'incorrect'` and the real game state is untouched.
  - If it matches, the move is committed to real state. If more plies remain, the engine auto-plays the **scripted opponent reply** from `puzzle.solution` after a short delay (`OPPONENT_REPLY_DELAY_MS`), then either sets status to `'idle'` (more to solve) or `'solved'` (done).
- Puzzle data format: `{ description: string; fen: string; solution: string[] }`, where `solution` is the **full mating line in SAN**, alternating player and scripted-opponent moves (e.g. `["Rc3", "Kh8", "Rc8#"]` for mate-in-2). This is a deliberate design choice: the opponent's replies are **scripted, not computed** — the engine does not need black's move to be objectively forced/unique, since it always auto-plays exactly what's stored in `solution`.
- `nextPuzzle()` advances via `(puzzleIndex + 1) % puzzles.length` — never a hardcoded FEN/index (this was the core bug in the old CRA prototype and has been fixed by construction).
- `selectSet(set)` switches the active puzzle set (`mate_in_1` / `mate_in_2` / `mate_in_3`) and resets to puzzle index 0.
- All puzzle JSON in `src/data/*.json` was validated programmatically (a throwaway Node script using `chess.js` replayed every `solution` line and asserted `isCheckmate()` on the final position) before being committed — do the same if you add more puzzles.

## Repository map
- `index.html` — Vite entry HTML.
- `src/main.tsx` — React root.
- `src/App.tsx` / `src/App.css` — page shell, wires `usePuzzleEngine` to the header/board/panel.
- `src/hooks/usePuzzleEngine.ts` — core puzzle/game engine (state + move validation + progression). Treat this as the primary source of truth for gameplay flow, replacing the old class-based `ChessboardUI`.
- `src/components/Header/` — title + puzzle-set selector tabs.
- `src/components/Chessboard/PuzzleChessboard.tsx` — thin `react-chessboard` wrapper; do not add game logic here, delegate to `usePuzzleEngine`.
- `src/components/PuzzlePanel/` — puzzle description, feedback banner, Retry/Next controls, progress counter.
- `src/types/puzzle.ts` — `Puzzle`, `PuzzleSetKey`, `PuzzleSets`, `MoveStatus` types and `PUZZLE_SET_LABELS`.
- `src/data/mate_in_1.json`, `mate_in_2.json`, `mate_in_3.json` — puzzle datasets (currently 3 / 1 / 1 seed puzzles respectively; intended to be expanded).
- `src/App.test.tsx`, `src/hooks/usePuzzleEngine.test.ts` — Vitest + RTL tests.
- `vite.config.ts` — includes a `test` block (jsdom environment, `src/setupTests.ts`) for Vitest.

## Development guidance for future agents
1. Treat `usePuzzleEngine` as the source of truth for gameplay flow; UI components should stay presentational and call its exposed functions (`attemptMove`, `nextPuzzle`, `retryPuzzle`, `selectSet`).
2. Never hardcode a specific puzzle FEN/index for "next puzzle" — always derive it from `puzzleIndex` / `puzzles.length`.
3. When adding puzzles, keep the `solution` array as a full SAN line (player + scripted opponent moves) and validate it with a quick `chess.js` script (replay the line, assert `isCheckmate()`) before committing — don't hand-verify mate patterns by inspection alone.
4. Do not reintroduce jQuery, global `window.ChessBoard`, or CDN `<script>` tags — `react-chessboard` is a normal npm dependency configured via its `options` object.
5. Keep puzzle data field names stable (`description`, `fen`, `solution`) since `src/types/puzzle.ts` and `usePuzzleEngine` depend on them.
6. Run `npm run build`, `npm run lint` (oxlint), and `npm run test` (Vitest) before considering a change complete — all three are wired up and passing as of this rewrite.

## Suggested near-term maintenance / follow-up tasks
- Expand puzzle datasets (currently minimal seed data: 3 mate-in-1, 1 mate-in-2, 1 mate-in-3) with more thematically varied, ideally uniquely-forced mates.
- Decide whether to move to `localStorage`-backed streak/progress tracking.
- Add square highlighting for the last move / hint system using `react-chessboard`'s `squareStyles` option.
- Consider extracting puzzle-engine state into `useReducer` if the state shape grows more complex.
- Add responsive/mobile visual polish pass beyond the current flex-wrap layout.
