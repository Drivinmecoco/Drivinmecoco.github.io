import Checkers from "./checkers.js";
import Display from "./display.js";
import T from "./tools.js";

//Allows Enter key to set off onclick event
Display.tabIndexSetUp();


/**
 * The global board that stores the current state of the game
 * @typedef {Checkers.Board}
 */
let g_board;
/**
 * The global ply number that stores the number of plys,
 * if it is even p0 is playing,
 * if it is odd p1 is.
 * @typedef {number}
 */
let g_ply = 1; //p0 starts (its as though the previous turn was p1's)



/**
 * displays the possible destinations of this pawns and sets the onclick events
 * of those cells
 * @function
 * @param {HTMLElement} td
 * @param {HTMLElement[]} tdDestinations
 * @param {Checkers.PlyPawns} plyPawns
 * @returns {void}
 */
function tdOnclick(td, tdDestinations, plyPawns) {
    Display.resetOnclicks();

    tdDestinations.forEach((dest) => Display.highlight(dest));

    Display.highlight(td);
    tdDestinations.forEach(
        function (dest) {
            dest.onclick = () => destOnclick(td, dest, tdDestinations);
            dest.tabIndex = 0;
        }
    );
    //deselect
    td.tabIndex = 0;
    td.onclick = () => deselectPawn(td, tdDestinations, plyPawns);
}

/**
 * sets onclick events for all active pawns
 * @function
 * @param {Checkers.PlyPawns} plyPawns
 * @returns {void}
 */
function setTableOnclick(plyPawns) {
    Object.entries(plyPawns).forEach(function ([id, positions]) {
        document.getElementById(id).onclick = () => tdOnclick(
            document.getElementById(id),
            positions.map(
                (pos) => document.getElementById(T.pos2Id(pos))
            ),
            plyPawns
        );
        document.getElementById(id).tabIndex = 0;
    });
}


/**
 * After a jump, this code allows for follow up attacks.
 * @function
 * @param {HTMLElement} td
 * @param {Checkers.plyPawns} pawns
 * @returns {void}
 */
function recursiveAttack(td, pawns) {
    const id = td.id;
    const [row, column] = T.id2Pos(id);
    Display.setTdAwake(td, g_board[g_ply % 2][row][column], g_ply);

    //I only want the attacks that belong to the current pawn
    let tdPlyPawn = {};
    tdPlyPawn[id] = pawns[id];

    tdOnclick(
        td,
        tdPlyPawn[id].map(
            (pos) => document.getElementById(T.pos2Id(pos))
        ),
        tdPlyPawn
    );
}

/**
 * unhighlights cells, moves the pawn and initiates the recursive moves
 * if it applies (the current move is an attack and there is an available
 * attack).
 * @function
 * @param {HTMLElement} td
 * @param {HTMLElement} dest
 * @param {HTMLElement[]} tdDestinations
 * @returns {void}
 */
function destOnclick(td, dest, tdDestinations) {
    Display.resetOnclicks();

    tdDestinations.forEach((td) => Display.UnHighlight(td));
    Display.UnHighlight(td);

    g_board = Checkers.move(
        T.id2Pos(td.id),
        T.id2Pos(dest.id),
        g_board
    );

    Display.setTableImages(g_board);

    //if the pawn just attacked and hasn't reached the edges of the board
    //(the pawn can't move after kinging)
    if (T.id2Pos(dest.id)[1] % 7 !== 0 && Checkers.isAttackMove(
        T.id2Pos(td.id), T.id2Pos(dest.id)
    )) {
        const [available, pawns] = Checkers.checkAvailableAttack(
            dest.id, g_board, g_ply
        );
        if (available) {
            recursiveAttack(dest, pawns);

        } else { nextPly(); }
    } else { nextPly(); }
}

/**
 * removes current clickable pawn and destinations and
 * enables other potential awakened pawns.
 * @function
 * @param {HTMLElement} td
 * @param {HTMLElement[]} tdDestinations
 * @param {Checkers.PlyPawns} plyPawns
 * @returns {void}
 */
function deselectPawn(td, tdDestinations, plyPawns) {
    Display.resetOnclicks();

    tdDestinations.forEach((td) => Display.UnHighlight(td));
    Display.UnHighlight(td);

    setTableOnclick(plyPawns);
}

/**
 * finds and activates pawns that have a playable move
 * @function
 * @returns {void}
 */
function awaken() {
    const plyBoard = Checkers.orientBoard(g_board, g_ply);
    const plyPawns = Checkers.orientPawns(
        Checkers.awakePawns(plyBoard),
        g_ply
    );
    //if the player has no moves the other player wins
    if (Object.keys(plyPawns).length === 0){
        win(g_ply%2+1);
    }

    Display.setTableAwakeImages(plyPawns, g_board, g_ply);
    setTableOnclick(plyPawns);
}

/**
 * Starts the next ply
 * @function
 * @returns {void}
 */
function nextPly() {
    const winner = Checkers.whoWon(g_board);
    if (winner !== -1) {
        win(winner);
    } else {
        g_ply++;
        awaken();
    }
}

function win(player){
    Display.winner(player);
    const cover = document.getElementById("cover");
    document.getElementById("cover").onclick = function(){
        console.log("newgame");
        cover.style.display = "none";
        start();
    };
}


/**
 * starts the game by creating the table,
 * then filling the table with images,
 * then awakens the pawns that have a playable move.
 * @function
 * @returns {void}
 */
function start() {
    g_board = Checkers.defaultBoard();
    g_ply = g_ply % 2 + 1;//next player starts the next game

    document.getElementById("board").innerHTML = Display.boardHTML();
    Display.setTableImages(g_board);
    awaken();
}
start();



/**
 * sets the restart and surrender buttons
 * @function
 * @returns {void}
 */
function setBottunOnclick() {
    Array.from(document.getElementsByClassName("restart")).forEach(
        function (button) { button.onclick = start; }
    );
    document.getElementById("p0Surrender").onclick = function () {
        win(1);
    };
    document.getElementById("p1Surrender").onclick = function () {
        win(0);
    };
}
setBottunOnclick();