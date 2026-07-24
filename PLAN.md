# PLAN.md

## Goal
Turn the current prototype into a usable chess puzzle trainer for practicing common mating patterns, starting from the existing mate-in-1 implementation.

## What exists today
- A Create React App frontend renders a single chessboard view.
- Puzzle state is managed inside `src/components/chessboard-ui/ChessboardUI.jsx`.
- The board starts from the first FEN in `src/data/mate_in_1.json`.
- Legal move checking is handled by `chess.js`.
- Visual board interactions are handled by chessboardjs loaded globally from CDN.
- Correct move checking is done by comparing generated PGN text to the stored solution string.
- There are local datasets for mate-in-1, mate-in-2, and mate-in-3 puzzles, but only mate-in-1 is effectively wired in.

## Gaps in the current implementation
1. Puzzle progression is incomplete:
   - the code increments `puzzleNumber`,
   - but then resets the board using `mate1[1].fen` instead of the current index.
2. Puzzle set selection does not exist yet despite importing `mate2` and `mate3`.
3. User feedback is console-only; there is no visible success/error/progress UI.
4. `loadFEN()` is a stub.
5. Tests are outdated and currently assert old CRA starter text.
6. Repo documentation does not describe the actual app.
7. The app still depends on global jQuery/chessboardjs setup in `public/index.html`.

## Recommended implementation plan

### Phase 1: Stabilize the current mate-in-1 flow
- Remove unused starter code (`logo` import, stale test assumptions, generic metadata where appropriate).
- Fix next-puzzle loading to use the active `puzzleNumber`.
- Keep a single source of truth for the active puzzle and board position.
- Make invalid and incorrect moves visible in the UI.
- Ensure the board resets or stays synchronized after failed moves.

### Phase 2: Model puzzle data cleanly
- Introduce an `activePuzzleSet` concept (`mate1`, `mate2`, `mate3`).
- Normalize puzzle access so the component does not directly hardcode `mate1[...]` everywhere.
- Decide whether `solutions.txt` is redundant or should be removed / transformed into structured data.

### Phase 3: Add puzzle progression UX
- Show current puzzle number and total puzzles.
- Add a way to advance, retry, or restart.
- Add a selector for mate-in-1 / mate-in-2 / mate-in-3 collections.
- Optionally show puzzle completion state and session progress.

### Phase 4: Handle multi-move puzzles
- Define how mate-in-2 and mate-in-3 solutions should be validated.
- Decide whether the app should:
  - validate only the player’s first move,
  - or simulate opponent replies and complete the full line.
- Update the data model if a single PGN string is not sufficient for multi-move checking.

### Phase 5: Improve code quality
- Refactor `ChessboardUI` into smaller units or hooks-based React components if desired.
- Reduce reliance on nested `setState` callbacks.
- Replace global script coupling where practical.
- Add clearer state fields for status, active dataset, and board reset behavior.

### Phase 6: Add tests
- Replace the default CRA test with app-specific tests.
- Add coverage for:
  - rendering the title and board container,
  - loading the initial FEN,
  - rejecting illegal moves,
  - accepting correct puzzle moves,
  - advancing to the next puzzle,
  - switching puzzle sets.

## Concrete next tasks
- [ ] Create a project-specific `README.md`.
- [ ] Fix stale `App.test.js`.
- [ ] Remove the unused `logo.svg` import from `src/App.js`.
- [ ] Replace hardcoded `mate1[1].fen` with dynamic next-puzzle lookup.
- [ ] Add UI state for correct / wrong / invalid move feedback.
- [ ] Add puzzle counters and reset controls.
- [ ] Wire in mate-in-2 and mate-in-3 puzzle selection.
- [ ] Reassess whether `solutions.txt` should stay in the repo.

## Definition of a better first milestone
The app should let a user:
1. start the site locally,
2. see a real project title and puzzle UI,
3. solve mate-in-1 puzzles in sequence,
4. get visible feedback for right and wrong answers,
5. restart or change puzzle sets,
6. run tests that reflect the actual interface.
