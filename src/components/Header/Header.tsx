import { PUZZLE_SET_LABELS } from '../../types/puzzle';
import type { PuzzleSetKey } from '../../types/puzzle';
import './Header.css';

type HeaderProps = {
  activeSet: PuzzleSetKey;
  onSelectSet: (set: PuzzleSetKey) => void;
};

const SET_KEYS: PuzzleSetKey[] = ['mate_in_1', 'mate_in_2', 'mate_in_3'];

export function Header({ activeSet, onSelectSet }: HeaderProps) {
  return (
    <header className="app-header">
      <h1 className="app-header__title">Forks Over Pins</h1>
      <p className="app-header__subtitle">Practice forced-mate chess puzzles</p>
      <nav className="app-header__set-selector" aria-label="Puzzle set selector">
        {SET_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={key === activeSet ? 'set-tab set-tab--active' : 'set-tab'}
            onClick={() => onSelectSet(key)}
          >
            {PUZZLE_SET_LABELS[key]}
          </button>
        ))}
      </nav>
    </header>
  );
}
