import T from "./tools.js";
/**
 * checkers.js is a module to model and play "checkers".
 * @namespace Display
 * @author Maxim Weill
 * @version 2023
 */
const Display = Object.create(null);

/**
 * the id of a cell is in the format `r${row number}c${column number}`
 * ex: r1c2
 * @memberof Display
 * @typedef {string} Id
 */

/**
 * it is an Array containing the row number followed by the column number
 * @memberof Display
 * @typedef {Array<number[]>} Position
 */


/**
 * generates the html of the table while asigning each cell
 * an id (ex: r1c2) row 1, column 2
 * @memberof Display
 * @function
 * @param {string} id
 * @returns {number[]}
 */
Display.boardHTML = function () {
    let text = "";
    const coords = T.range(0, 8);
    coords.forEach(function (r) {
        text += `<tr id="r${r}">`;
        coords.forEach(function (c) {
            text += `<td id="${T.pos2Id([r, c])}"></td>`;
        });
        text += "</tr>";
    });
    return text;
};

/**
 * fetchs an array of each row and cell in the table
 * @memberof Display
 * @function
 * @returns {Array<HTMLElement[]>}
 */
Display.getTable = function () {
    let table = [];
    const coords = T.range(0, 8);
    coords.forEach(function (r) {
        let row = [];
        coords.forEach(function (c) {
            row.push(document.getElementById(T.pos2Id([r, c])));
        });
        table.push(row);
    });
    return table;
};

/**
 * @type {Array<string[]>}
 * @description An array of asleep images.
 * @property {string} [0] empty path for an empty cell.
 * @property {string} [1] The path to the image file.
 * @property {string} [2] The path to the image file for the king.
 */
const asleepImages = [
    ["", "assets/leftAsleep.png", "assets/leftAsleepKing.png"],//p0
    ["", "assets/rightAsleep.png", "assets/rightAsleepKing.png"]//p1
];
/**
 * sets the asleep image of a given html element based on it's pawn type
 * @function
 * @param {HTMLElement} td
 * @param {Checkers.pawnType} pawnType
 * @param {number} p
 * @returns {void}
 */
function setTdAsleep(td, pawnType, p) {
    td.style.backgroundImage = `url(${asleepImages[p][pawnType]})`;
}

/**
 * sets the asleep image of a given board
 * @function
 * @memberof Display
 * @param {Checkers.Board} board
* @returns {void}
 */
Display.setTableImages = function (board) {
    Display.getTable().forEach((row, r) => row.forEach(function (td, c) {
        const p0 = board[0][r][c];
        if (p0 === 0) {
            const p1 = board[1][r][c];
            setTdAsleep(td, p1, 1);
        } else {
            setTdAsleep(td, p0, 0);
        }
    }));
};



/**
 * @type {Array<string[]>}
 * @description An array of awake images.
 * @property {string} [0] empty path for an empty cell.
 * @property {string} [1] The path to the image file.
 * @property {string} [2] The path to the image file for the king.
 */
const awakeImages = [
    ["", "assets/leftAwake.png", "assets/leftAwakeKing.png"],//p0
    ["", "assets/rightAwake.png", "assets/rightAwakeKing.png"]//p1
];
/**
 * sets the awkae image of a given html element based on it's pawn type
 * @function
 * @param {HTMLElement} td
 * @param {Checkers.pawnType} pawnType
 * @param {number} p
 * @returns {void}
 */
Display.setTdAwake = function (td, pawnType, ply) {
    td.style.backgroundImage = `url(${awakeImages[ply % 2][pawnType]})`;
};
/**
 * sets the awake image of a given board
 * @function
 * @memberof Display
 * @param {Checkers.PlyPawns} plyPawns
 * @param {Checkers.Board} board
 * @param {number} ply
* @returns {void}
 */
Display.setTableAwakeImages = function (plyPawns, board, ply) {
    Object.keys(plyPawns).forEach(function (id) {
        Display.setTdAwake(
            document.getElementById(id),
            board[ply % 2][id[1]][id[3]],
            ply
        );
    });
};


/**
 * adds highlight image to the background a cell
 * @function
 * @memberof Display
 * @param {HTMLElement} td
* @returns {void}
 */
Display.highlight = function (td) {
    let img = td.style.backgroundImage;
    if (img === "url('')") {
        img = "";
    } else {
        img += ",";
    }

    img += "url(assets/highlight.png)";
    td.style.backgroundImage = img;
};
/**
 * removes the highlight image of the cell
 * @function
 * @memberof Display
 * @param {HTMLElement} td
 * @returns {void}
 */
Display.UnHighlight = function (td) {
    const img = td.style.backgroundImage.split(",")[0];
    td.style.backgroundImage = img;
};

/**
 * removes all the onclick events in the table
 * @function
 * @memberof Display
 * @returns {void}
 */
Display.resetOnclicks = function () {
    Display.getTable().forEach(
        (row) => row.forEach(function (td) {
            td.onclick = "";
            td.tabIndex = -1;
        })
    );
};

/**
 * shows who the winner is
 * @function
 * @memberof Display
 * @param {0|1} p
 * @returns {void}
 */
Display.winner = function (p) {
    const cover = document.getElementById("cover");
    cover.style.display = "block";
    const name = ["Alexphibian the Great", "Emperor Frogaparte"];
    const text = document.getElementById("winner");
    text.innerHTML = `${name[p]} has won!<br> He is the new king!`;

};


/**
 * Adds active listener to Board
 * which allows the Enter key
 * to set off the onclick event
 * of the focused cell
 * @function
 * @memberof Display
 * @returns {void}
 */
Display.tabIndexSetUp = function () {
    document.getElementById("board").addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Enter") {
                document.activeElement.onclick();
            }
        }
    );
};

export default Object.freeze(Display);