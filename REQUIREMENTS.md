# Requirements

## Develop

_Add new feature requests / changes here. Each entry will be picked up and implemented in a future pass._

- (none pending)

## Features

- **Puzzle sets**: three selectable sets (`mate_in_1`, `mate_in_2`, `mate_in_3`), switchable via tabs in the header.
- **Chessboard gameplay**: drag-and-drop moves validated against the puzzle's scripted solution (`chess.js`); illegal moves snap back, legal-but-wrong moves are flagged "incorrect", correct moves advance the puzzle.
- **Scripted opponent replies**: after a correct player move, the opponent's reply auto-plays from the puzzle's solution after a short delay.
- **Move status feedback**: board border/panel glow color and feedback message change based on status (`idle`, `correct`, `incorrect`, `illegal`, `solved`).
- **Move history**: solved moves are displayed as numbered SAN pairs (e.g. "1. e4 e5"), respecting the puzzle's starting move number and side to move.
- **Retry puzzle**: resets the current puzzle to its starting position.
- **Next puzzle**: advances to the next puzzle in the active set (wraps around at the end), with an animated board transition from the current position to the next puzzle's starting position.
- **Jump to next puzzle (auto-advance) toggle**: when on, solving a puzzle automatically advances to the next one after a brief delay instead of waiting for a manual click.
- **Shuffle order toggle**: when on, "next puzzle" picks a random puzzle from the active set (never immediately repeating the current one) instead of the next incremental index.
- **Puzzle progress counter**: shows "Puzzle X / Y" for the active set.
- **Responsive board orientation**: board orientation follows whichever side is to move in the puzzle's starting FEN.
- **Solved/Unsolved indication**: If a user fails to solve the problem, there is a cross mark icon displayed on the panel; if the puzzle is solved correctly, a check mark icon is displayed instead. Either way, the next puzzle should load automatically after a brief delay.
- **Checkmark and Crossmark accumulation**: Checkmark and Crossmark icons accumulate over time to provide a visual history of the user's performance on puzzles, allowing users to quickly see which puzzles they have solved correctly and which they have failed. The accumulation should be one icon per puzzle, reflecting the outcome of each puzzle attempt, and should persist as the user progresses through the puzzle set.
