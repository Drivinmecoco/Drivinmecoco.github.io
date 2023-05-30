import Checkers from "../checkers.js";
import Rand from "./rand.js";


/**
 * Logs the entier board
 * @function
 * @param {Checkers.Board} board The board to display.
 */
function display(board) {
    const textBoard = [...board[0]].map((row, r) => row.map(
        function (pawn, c) {
            if (pawn === 0) {
                const p2Display = [" |", "a|", "A|"];
                return p2Display[board[1][r][c]];
            }
            if (pawn === 1) {
                return "b|";
            }
            return "B|";
        }
    ));
    textBoard.forEach(function (row) {
        row.forEach((pawn) => process.stdout.write(pawn));
        console.log("");
    });
}



display(Rand.board());
