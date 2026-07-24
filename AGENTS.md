# AGENTS.md

## Purpose
This repository is a small React-based chess tactics app focused on practicing forced mates from preset puzzle positions. The current implementation is centered around a single playable chessboard UI that loads puzzle data from local JSON files and validates user moves against stored solutions.

## Current architecture
- **Runtime:** Create React App (`react-scripts`) with React 18.
- **Entry point:** `src/index.js` renders `App` and loads Bootstrap CSS.
- **Top-level app shell:** `src/App.js` shows the page title and renders `ChessboardUI`.
- **Main feature component:** `src/components/chessboard-ui/ChessboardUI.jsx`
  - Class component.
  - Uses `chess.js` for move legality and PGN generation.
  - Uses `@chrisoakman/chessboardjs` for the draggable board widget.
  - Pulls puzzle data from `src/data/mate_in_1.json`, `mate_in_2.json`, and `mate_in_3.json`.
- **Static assets:** chess piece images are expected under `public/assets/img/chesspieces/{piece}.png` and the external chessboardjs CSS/JS is loaded from CDN in `public/index.html`.

## Implemented behavior
- The app currently renders a heading and a chessboard.
- `ChessboardUI` initializes a `Chess` instance from the first `mate_in_1.json` FEN.
- A player can drag pieces on the board.
- `onDrop` attempts to apply the move with `chess.js`.
- If the move is legal, the component compares the generated PGN move text with the stored `solution` string for the current mate-in-1 puzzle.
- When the move matches the expected solution, the component increments `puzzleNumber` and reinitializes the board for the next puzzle.

## Important implementation notes
- The progression logic is only wired for `mate_in_1` puzzles right now even though mate-in-2 and mate-in-3 datasets are imported.
- The next-puzzle board position is currently hardcoded to `mate1[1].fen` during reset instead of using the updated puzzle index dynamically.
- `loadFEN()` exists but is empty.
- `makeValidMove()` swallows invalid move errors and only returns a boolean-like result.
- The app still contains Create React App starter leftovers:
  - `README.md` is the default CRA README.
  - `src/App.test.js` still checks for a "learn react" link that no longer exists.
  - `src/App.js` imports `logo.svg` but does not use it.
  - Default CRA files such as `reportWebVitals.js`, `setupTests.js`, `logo.svg`, and generic CSS remain in place.
- `public/index.html` still uses the default title/description and depends on global CDN scripts for jQuery and chessboardjs.

## Repository map
- `src/App.js` – page shell.
- `src/components/chessboard-ui/ChessboardUI.jsx` – main puzzle UI and move validation logic.
- `src/data/mate_in_1.json` – implemented puzzle source currently used by the UI.
- `src/data/mate_in_2.json` / `src/data/mate_in_3.json` – imported datasets not yet integrated into flow.
- `src/data/solutions.txt` – additional solution reference data, not currently used by the app.
- `public/index.html` – loads external chessboardjs assets and bootstraps the React app.

## Development guidance for future agents
1. Treat `ChessboardUI.jsx` as the primary source of truth for gameplay flow.
2. Preserve the interplay between `chess.js` state and the visual `window.ChessBoard(...)` widget when refactoring.
3. Prefer replacing hardcoded puzzle advancement logic with index-based state derived from the active puzzle collection.
4. If modernizing, consider removing jQuery/global script dependencies and using a React-native chessboard integration or a wrapper.
5. Update tests whenever UI text or puzzle flow changes; the current starter test is already stale.
6. Keep puzzle data format compatible with existing records: objects currently include `description`, `fen`, and `solution`.

## Suggested near-term maintenance tasks
- Replace the default README with project-specific documentation.
- Fix puzzle advancement so it uses the current puzzle index correctly.
- Add support for choosing and playing mate-in-1 / 2 / 3 sets.
- Surface correct/incorrect feedback in the UI instead of only logging to the console.
- Add real tests for rendering, move validation, and puzzle progression.
- Clean up unused CRA starter files and imports.
