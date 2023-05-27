import Checkers from "../checkers.js";


/**
 * Logs the entier board
 * @function
 * @param {Checkers.Board} board The board to display.
 */
function display(board) {
    const textBoard = [...board[0]].map((row, r) => row.map(
        function (pawn, c) {
            if (pawn === 0) {
                const p2Display = ["", "o", "O"];
                return p2Display[board[1][r][c]];
            }
            if (pawn === 1) {
                return "x";
            }
            return "X";
        }
    ));
    textBoard.forEach((row) => console.log(row));
}
