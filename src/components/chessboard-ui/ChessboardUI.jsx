import React, { Component } from 'react'
import $ from 'jquery';
import { Chess } from 'chess.js';
import mate1 from './../../data/mate_in_1.json';
import mate2 from './../../data/mate_in_2.json';
import mate3 from './../../data/mate_in_3.json';


window.$ = window.jQuery = $;

export class ChessboardUI extends Component {
  constructor(props) {
    super(props);
    const themePath = process.env.PUBLIC_URL + '/assets/img/chesspieces/{piece}.png';
    this.state = {
        chess : new Chess(mate1[0].fen),
        boardRef : React.createRef(),
        boardId : "myBoard",
        defaultConfig : {
          appearSpeed: 25,
          draggable: true,
          dropOffBoard: 'snapback',
          moveSpeed: 25,
          onDragStart : this.onDragStart,
          onDragMove : this.onDragMove,
          onDrop : this.onDrop,
          onMoveEnd : this.onMoveEnd,
          orientation: 'white',
          position: mate1[0].fen,
          showErrors: 'console',
          showNotation: true,
          snapSpeed: 25,
          snapbackSpeed: 50,
          pieceTheme: themePath,
          sparePieces: false,
          trashSpeed: 25,
        },
        mate1 : []
    }
  }

  onDragStart = (source, piece, position, orientation) => {
    // console.log(this.state.chess.moves());
    // console.log('Drag started:')
    // console.log('Source: ' + source)
    // console.log('Piece: ' + piece)
    // console.log('Position: ' + window.ChessBoard.objToFen(position))
    // console.log('Orientation: ' + orientation)
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  }

  onDragMove (newLocation, oldLocation, source,
    piece, position, orientation) {
    // console.log('New location: ' + newLocation)
    // console.log('Old location: ' + oldLocation)
    // console.log('Source: ' + source)
    // console.log('Piece: ' + piece)
    // console.log('Position: ' + window.Chessboard.objToFen(position))
    // console.log('Orientation: ' + orientation)
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  }

  onDrop = (source, target, piece, newPos, oldPos, orientation) => {
    var moveToBeMade = source + '-' + target;
    // console.log(moveToBeMade);
    if(this.makeValidMove(moveToBeMade, oldPos)) {
      console.log('After move...');
      console.log(this.state.chess.pgn());
    }
    else {
      return 'snapback';
    }

    // console.log("PGN : " + this.state.chess.pgn());
    // console.log('Source: ' + source)
    // console.log('Target: ' + target)
    // console.log('Piece: ' + piece)
    // console.log('New position: ' + window.Chessboard.objToFen(newPos))
    // console.log('Old position: ' + window.Chessboard.objToFen(oldPos))
    // console.log('Orientation: ' + orientation)
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  }

  makeValidMove = (moveToBeMade, currPos) => {
    var moveResult = '';
      try {
        moveResult = this.state.chess.move(moveToBeMade);
        console.log('Valid move')
        console.log(moveResult)
      }
      catch(err) {
        // Reload UI with previous pgn
        
      }
      return !(moveResult == '');
  }

  onMoveEnd (oldPos, newPos) {
    // console.log('Move animation complete:')
    // console.log('Old position: ' + window.Chessboard.objToFen(oldPos))
    // console.log('New position: ' + window.Chessboard.objToFen(newPos))
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  }

  componentDidMount() {
    if (window && !window.ChessBoard) {
      console.log("Chessboard object is not created");
      return;
    }
    if (window && !window.$) {
      console.log("JQuery object is not created");
      return;
    }

    // If the control is here, it means chessboard and jquery are loaded appropriately


    // Initialize chessboard and pieces
    this.chessBoard = window.ChessBoard(this.state.boardId, this.state.defaultConfig);

    // Initialize chess engine with the position

    
    // Load FEN
    this.loadFEN();

  }


  loadFEN() {

  }

  render() {
    return (
        <div>
            <h2 className='display-1'>Chessboard UI</h2>
            <div id={this.state.boardId} 
            style={{ width: "600px", margin: 'auto'}}
            ref={this.state.boardRef}
            ></div>
        </div>
    )
  }
}

export default ChessboardUI