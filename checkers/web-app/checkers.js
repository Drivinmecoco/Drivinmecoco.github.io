import R from "./ramda.js";
import T from "./tools.js";
/**
 * checkers.js is a module to model and play "checkers".
 * @namespace Checkers
 * @author Maxim Weill
 * @version 2023
 */
const Checkers = Object.create(null);

/**
 * A PlayerBoard is an rectangular grid that pawns can be moved around in.
 * Importantly A PlayerBoard only contains one players pawns.
 * Pawns can move diagonaly "forwards"
 * It is implemented as an array of rows of Pawns
 * @memberof Checkers
 * @typedef {Array<Checkers.Pawn[]>} PlayerBoard
 */

/**
 * A Board is an Array of two PlayerBoards, one for each player.
 * The left player is the first element of the Board,
 * the right player is the second.
 * in the intention of reusing code.
 * @memberof Checkers
 * @typedef {Checkers.PlayerBoard[]} Board
 */

/**
 * Either no pawns (0),
 * One pawn (a regular pawn),
 * Two pawns (a king as they are often represented with two stacked pawns).
 * @memberof Checkers
 * @typedef {(0 | 1 | 2)} Pawn
 */

/**
 * A Board is an Array of two PlayerBoards, one for each player.
 * The left player is the first element of the Board,
 * the right player is the second.
 * in the intention of reusing code.
 * @memberof Checkers
 * @typedef {Object} PlyPawns
 * @property {string} pos - r${number}c${number}
 * @property {Array<number[]>} movePos - the positions it can go to
 */

/**
 * The first number is the row and the second is the column
 * the element 0 is the moves for no pawns (none),
 * the element 1 is the moves for a regular pawn (diagonal forward)
 * the element 2 is the moves of a king (all diagonals)
 * @typedef {Array<number[]>}
 */
const possibleMoves = [
    [],
    [[1, 1], [-1, 1]],
    [[1, 1], [-1, 1], [1, -1], [-1, -1]]
];

/**
 * Flips a PlayerBoard horizontaly and verticaly
 * @function
 * @param {Checkers.PlayerBoard} playerBoard
 * @returns {Checkers.PlayerBoard}
 */
const flip = function (playerBoard) {
    const rowFlipped = playerBoard.map((row) => R.reverse(row));
    const columnFlipped = R.reverse(rowFlipped);
    return columnFlipped;
};

/**
 * Create a Board where the players are reversed
 * @function
 * @param {Checkers.Board} board The board to reverse.
 * @returns {Checkers.Board}
 */
const reverseBoard = function (board) {
    const reversed = [flip(board[1]), flip(board[0])];
    return reversed;
};

/**
 * Flips a PlayerBoard horizontaly and verticaly if
 * ply is odd (when the p1 is playing)
 * @memberof Checkers
 * @function
 * @param {Checkers.Board} board
 * @param {number} ply
 * @returns {Checkers.Board}
 */
Checkers.orientBoard = function (board, ply) {
    if (ply % 2 === 1) {
        return reverseBoard(board);
    }
    return board;
};

/**
 * Flips an PlyPawns horizontaly and verticaly if
 * ply is odd (when the p1 is playing)
 * @memberof Checkers
 * @function
 * @param {Checkers.PlyPawns} pawns
 * @param {number} ply
 * @returns {Checkers.PlyPawns}
 */
Checkers.orientPawns = function (pawns, ply) {
    if (ply % 2 === 1) {
        let plyPawns = {};
        Object.entries(pawns).forEach(function ([id, positions]) {
            plyPawns[`r${7 - id[1]}c${7 - id[3]}`] = positions.map(
                (pos) => [7 - pos[0], 7 - pos[1]]
            );
        });
        return plyPawns;
    }
    return pawns;
};


/**
 * Create a Board where the players are reversed
 * @memberof Checkers
 * @function
 * @param {Array<number[]>} positions [row,column]
 * @returns {Array<number[]>}
 */
Checkers.reversePos = function (positions) {
    return positions.map((pos) => [8 - pos[1], [8 - pos[0]]]);
};

/**
 * Create a default PlayerBoard
 * @function
 * @returns {Checkers.PlayerBoard}
 */
const defaultPlayerBoard = function () {
    const rowOneTwo = [
        [0, 1, 0, ...new Array(5).fill(0)],
        [1, 0, 1, ...new Array(5).fill(0)]
    ];
    return new Array(4).fill().map(() => R.clone(rowOneTwo)).flat();
};

/**
 * Create a default board
 * Optionally with a specified width and height,
 * otherwise returns a standard 7 wide, 6 high board.
 * @memberof Checkers
 * @function
 * @returns {Checkers.Board} A default board for starting a game.
 */
Checkers.defaultBoard = function () {
    return [
        defaultPlayerBoard(),
        flip(defaultPlayerBoard())
    ];
};

/**
 * This function takes a coordinate and checks if it is valid
 * and returns what positions the pawn can go to for a friendly move
 * @function
 * @param {number[]} pos position in (row,column)
 * @param {Checkers.Board} board The board
 * @returns {Array<number[]>} array of possible coordinate it can go to
 */
const checkPos = function (pos) {
    return pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8;
};



/**
 * This function takes a coordinate and  board,
 * and returns what positions the pawn can go to for a friendly move
 * @function
 * @param {number[]} pos position in (row,column)
 * @param {Checkers.Board} board The board
 * @returns {Array<number[]>} array of possible coordinate it can go to
 */
const findFriendlyMoves = function (pos, board) {
    const moves = possibleMoves[board[0][pos[0]][pos[1]]];
    let positions = moves.map((move) => [move[0] + pos[0], move[1] + pos[1]]);
    positions = positions.filter(checkPos);
    const available = positions.filter(
        (pawnspos) => (
            board[0][pawnspos[0]][pawnspos[1]] === 0 &&
            board[1][pawnspos[0]][pawnspos[1]] === 0
        )
    );
    return available;
};


/**
 * This function takes a coordinate and  board,
 * and returns what positions the pawn can go to for a friendly move
 * @memberof Checkers
 * @function
 * @param {number[]} pos position in (row,column)
 * @param {Checkers.Board} board The board
 * @returns {Array<number[]>} array of possible coordinate it can go to
 */
Checkers.findAttackMoves = function (pos, board) {
    let moves = possibleMoves[board[0][pos[0]][pos[1]]];
    //does the jump stay on the board?
    moves = moves.filter(
        (move) => checkPos([2 * move[0] + pos[0], 2 * move[1] + pos[1]])
    );
    //is an enemy infront?
    moves = moves.filter(
        (move) => board[1][move[0] + pos[0]][move[1] + pos[1]] !== 0
    );
    //position to the jump coordinate
    const positions = moves.map(
        (move) => [2 * move[0] + pos[0], 2 * move[1] + pos[1]]
    );
    //is the jump coordinate empty?
    const available = positions.filter(
        (pawnspos) => (
            board[0][pawnspos[0]][pawnspos[1]] === 0 &&
            board[1][pawnspos[0]][pawnspos[1]] === 0
        )
    );
    return available;
};





/**
 * This function takes a board,
 * and returns what positions a pawn has an Attack move
 * @function
 * @param {Checkers.Board} board The board to label.
 * @returns {Checkers.PlyPawns} dictionary of active pawns,
 * and their possible move positions
 */
const boardAttackPawns = function (board) {
    let pawns = {};
    const coords = R.range(0, 8);
    coords.forEach((r) => coords.forEach(function (c) {
        let attackMoves = Checkers.findAttackMoves([r, c], board);
        if (attackMoves.length !== 0) {
            pawns[`r${r}c${c}`] = attackMoves;
        }
    }));
    return pawns;
};

/**
 * This function takes a board,
 * and returns what positions a pawn has a friendly move
 * @function
 * @param {Checkers.Board} board The board to label.
 * @returns {Checkers.PlyPawns} dictionary of active pawns,
 * and their possible move positions
 */
const boardFriendlyPawns = function (board) {
    let pawns = {};
    const coords = R.range(0, 8);
    coords.forEach((r) => coords.forEach(function (c) {
        let friendlyMoves = findFriendlyMoves([r, c], board);
        if (friendlyMoves.length !== 0) {
            pawns[`r${r}c${c}`] = findFriendlyMoves([r, c], board);
        }
    }));
    return pawns;
};

/**
 * This function takes a board,
 * and returns what positions a pawn has an Attack move
 * @memberof Checkers
 * @function
 * @param {Checkers.Board} board The board to label.
 * @returns {Checkers.PlyPawns} dictionary of active pawns,
 * and their possible move positions
 */
Checkers.awakePawns = function (board) {
    const pawns = boardAttackPawns(board);
    if (Object.keys(pawns).length === 0) {
        return boardFriendlyPawns(board);
    }
    return pawns;
};



/**
 * This function takes a move and returns whether it is an attack or not
 * @memberof Checkers
 * @function
 * @param {number[]} init initial position
 * @param {number[]} end end position
 * @returns {bool} returns true if the move is an attack
 */
Checkers.isAttackMove = function (init, end) {
    const between = [end[0] / 2 + init[0] / 2, end[1] / 2 + init[1] / 2];
    return Number.isInteger(between[0]) && Number.isInteger(between[1]);
};

/**
 * This function takes a board,
 * and returns what positions a pawn has an Attack move
 * @memberof Checkers
 * @function
 * @param {number[]} init initial position
 * @param {number[]} end end position
 * @returns {Checkers.Board} the resulting board
 */
Checkers.move = function (init, end, board) {
    let newBoard = [...board];

    //remove hopped over pawn
    if (Checkers.isAttackMove(init, end)) {
        const between = [end[0] / 2 + init[0] / 2, end[1] / 2 + init[1] / 2];
        newBoard[1][between[0]].splice(between[1], 1, 0);
        newBoard[0][between[0]].splice(between[1], 1, 0);
    }

    //moves what was on init to end
    function translation(p) {
        const pawn = board[p][init[0]][init[1]];
        let insert;
        if (end[1] % 7 === 0 && pawn === 1) {
            insert = 2;
        } else {
            insert = pawn;
        }

        newBoard[p][end[0]].splice(
            end[1],
            1,
            insert
        );
        newBoard[p][init[0]].splice(init[1], 1, 0);
    }
    //movement
    translation(0);
    translation(1);

    return newBoard;
};


/**
 * This function takes a board,
 * and returns what positions a pawn has an Attack move
 * @memberof Checkers
 * @function
 * @param {string} id
 * @param {Checkers.Board} board
 * @param {number} ply
 * @returns {Checkers.Board} the resulting board
 */
Checkers.checkAvailableAttack = function (id, board, ply) {
    const plyBoard = Checkers.orientBoard(board, ply);
    const pawns = Checkers.orientPawns(
        Checkers.awakePawns(plyBoard),
        ply
    );
    const [row, column] = T.id2Pos(id);
    console.log(pawns);
    return [
        pawns.hasOwnProperty(id) &&
        Checkers.isAttackMove([row, column], pawns[id][0]),

        pawns
    ];
};



/**
 * This function takes a board,
 * returns whether the game is over or not,
 * and who won
 * @memberof Checkers
 * @function
 * @param {Checkers.Board} board
 * @returns {-1|0|1} -1 no one, 0 player0 won, 1 player1 won
 */
Checkers.whoWon = function (board) {
    function isEmpty(playerBoard) {
        return !(playerBoard.some(
            (row) => row.some((pawn) => pawn === 1 || pawn === 2)
        ));
    }
    if (isEmpty(board[0])) {
        return 1;
    }
    if (isEmpty(board[1])) {
        return 0;
    }
    return -1;
};


export default Object.freeze(Checkers);
