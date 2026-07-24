import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app title and the initial puzzle description', () => {
    render(<App />);
    expect(screen.getByText(/Forks Over Pins/i)).toBeInTheDocument();
    expect(screen.getByText(/White to move\. Mate in 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Puzzle 1 \/ \d+/i)).toBeInTheDocument();
  });

  it('renders the puzzle-set selector tabs', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Mate in 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mate in 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mate in 3' })).toBeInTheDocument();
  });
});
