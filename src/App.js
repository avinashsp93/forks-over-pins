import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header.js';
import UserChoice from './components/UserChoice.js';
import './App.css';
import React from 'react';
import ChessboardUI from './components/ChessboardUI.js';

function App() {
  return (
    <div className="App">
      {/* Container */}
      <div className="container">
        {/* Header */}
        <Header />

        {/* User's choice goes here, selects if he wants to solve mate in 1, 2 or 3 */}
        <UserChoice />

        {/* Chessboard component goes here*/}
        <ChessboardUI />
      </div>
    </div>
  );
}

export default App;
