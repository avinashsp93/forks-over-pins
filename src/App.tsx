import { Header } from "./components/Header/Header";
import { PuzzleChessboard } from "./components/Chessboard/PuzzleChessboard";
import { PuzzlePanel } from "./components/PuzzlePanel/PuzzlePanel";
import { usePuzzleEngine } from "./hooks/usePuzzleEngine";
import "./App.css";

function App() {
  const {
    activeSet,
    puzzle,
    puzzleIndex,
    puzzleCount,
    fen,
    orientation,
    moveHistory,
    boardKey,
    status,
    message,
    selectSet,
    nextPuzzle,
    retryPuzzle,
    attemptMove,
  } = usePuzzleEngine();

  return (
    <div className="app-shell">
      <Header activeSet={activeSet} onSelectSet={selectSet} />
      <main className="app-main">
        <div className="puzzle-layout">
          <PuzzleChessboard
            fen={fen}
            status={status}
            orientation={orientation}
            puzzleKey={boardKey}
            onMove={attemptMove}
          />
          <PuzzlePanel
            puzzle={puzzle}
            puzzleIndex={puzzleIndex}
            puzzleCount={puzzleCount}
            orientation={orientation}
            moveHistory={moveHistory}
            status={status}
            message={message}
            onNext={nextPuzzle}
            onRetry={retryPuzzle}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
