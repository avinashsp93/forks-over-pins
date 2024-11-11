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

  onDragStart (source, piece, position, orientation) {
    console.log('Drag started:')
    console.log('Source: ' + source)
    console.log('Piece: ' + piece)
    console.log('Position: ' + this.chessBoard.objToFen(position))
    console.log('Orientation: ' + orientation)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  }

  componentDidMount() {
    console.log(this.chessBoard);
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
    
    // Load FEN
    this.loadFEN();

  }


  loadFEN() {

  }

  render() {
    return (
        <div>
            <h1>Chessboard UI</h1>
            <div id={this.state.boardId} 
            style={{ width: "600px", margin: 'auto'}}
            ref={this.state.boardRef}
            ></div>
        </div>
    )
  }
}

export default ChessboardUI