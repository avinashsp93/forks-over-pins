import React, { useEffect, useState }from 'react'; // React
import $ from 'jquery'; // JQuery Library
import { Chess, Move } from 'chess.js'; // Chess Engine

import mate1 from '../data/mate_in_1.json';
import mate2 from '../data/mate_in_2.json';
import mate3 from '../data/mate_in_3.json';

import Chessboard from 'chessboardjsx';

window.$ = window.jQuery = $;

export default function ChessboardUI() {
    // constants
    const themePath = process.env.PUBLIC_URL + '/assets/img/chesspieces/{piece}.png';
    const boardRef = React.createRef();
    const boardId = "myBoard";

    // state variables
    const [puzzleNumber, setPuzzleNumber] = useState(0);
    const [chess, setChess] = useState(new Chess(mate1[0].fen))
    let move;
    


    // callbacks
    let onDragStart = (source, piece, position, orientation) => {
        console.log('On drag start:')
    }

    let onDragMove = (newLocation, oldLocation, source, piece, position, orientation) => {
        console.log('On drag move:')
    }

    let onDrop = (source, target, piece, newPos, oldPos, orientation) => {        
        // Validate if it is the right move
        validateMove(chess, move, source, target, piece);
    }

    let onMoveEnd = (oldPos, newPos) => {
        console.log('On move end:')
    }

    let [defaultConfig, setDefaultConfig] = useState({

        width: 800,
        appearSpeed: 25,
        draggable: true,
        dropOffBoard: 'snapback',
        moveSpeed: 25,
        orientation: 'white',
        position: mate1[0].fen,
        showErrors: 'console',
        showNotation: true,
        snapSpeed: 25,
        snapbackSpeed: 50,
        pieceTheme: themePath,
        sparePieces: false,
        trashSpeed: 25,

        onDragStart: onDragStart,
        onDragMove: onDragMove,
        onDrop: onDrop,
        onMoveEnd: onMoveEnd
    });


    

    return (
        <div>
            <h2 className='display-1'>Chessboard UI</h2>
            <Chessboard 
                width={defaultConfig.width}
                appearSpeed={defaultConfig.appearSpeed}
                draggable={defaultConfig.draggable}
                dropOffBoard={defaultConfig.dropOffBoard}
                moveSpeed={defaultConfig.moveSpeed}
                orientation={defaultConfig.orientation}
                position={defaultConfig.position}
                showErrors={defaultConfig.showErrors}
                showNotation={defaultConfig.showNotation}
                snapSpeed={defaultConfig.snapSpeed}
                snapbackSpeed={defaultConfig.snapbackSpeed}
                pieceTheme={defaultConfig.pieceTheme}
                sparePieces={defaultConfig.sparePieces}
                trashSpeed={defaultConfig.trashSpeed}
                onDragStart={defaultConfig.onDragStart}
                onDragMove={defaultConfig.onDragMove}
                onDrop={defaultConfig.onDrop}
                onMoveEnd={defaultConfig.onMoveEnd}
            />
            <button className='btn btn-primary'>Previous</button>
            <button className='btn btn-primary'>Next</button>
        </div>
    )
}


function validateMove(chess, move, source, target, piece) {
    console.log(new Move(chess, 'white', source, target, piece))
}