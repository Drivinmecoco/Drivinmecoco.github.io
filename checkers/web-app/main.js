import R from "./ramda.js";
import Checkers from "./checkers.js";
import Display from "./display.js";
import T from "./tools.js";

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

    let tdPlyPawn = {};
    tdPlyPawn[id] = pawns[id];

    setTdOnclick(
        td,
        tdPlyPawn[id].map(
            (pos) => document.getElementById(T.pos2Id(pos))
        ),
        tdPlyPawn
    );
    td.onclick();
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
const destOnclick = function (td, dest, tdDestinations) {
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
    if (T.id2Pos(dest.id)[1]%7!==0 && Checkers.isAttackMove(
        T.id2Pos(td.id), T.id2Pos(dest.id)
    )) {
        const [available, pawns] = Checkers.checkAvailableAttack(
            dest.id, g_board, g_ply
        );
        if (available) {
            recursiveAttack(dest, pawns);

        } else { nextPly(); }
    } else { nextPly(); }
};


/**
 * displays the possible destinations of this pawns and sets the onclick events
 * of those cells
 * @function
 * @param {HTMLElement} td
 * @param {HTMLElement[]} tdDestinations
 * @param {Checkers.PlyPawns} plyPawns
 * @returns {void}
 */
const setTdOnclick = function (td, tdDestinations, plyPawns) {
    td.onclick = function () {
        Display.resetOnclicks();

        tdDestinations.forEach((dest) => Display.highlight(dest));

        Display.highlight(td);
        tdDestinations.forEach(
            (dest) => dest.onclick = () => destOnclick(td, dest, tdDestinations)
        );
        //deselect
        td.onclick = function () {
            Display.resetOnclicks();

            tdDestinations.forEach((td) => Display.UnHighlight(td));
            Display.UnHighlight(td);

            setTableOnclick(plyPawns);
        };
    };
};

/**
 * sets onclick events for all active pawns
 * @function
 * @param {Checkers.PlyPawns} plyPawns
 * @returns {void}
 */
function setTableOnclick(plyPawns) {
    Object.entries(plyPawns).forEach(function([id,positions]){
        setTdOnclick(
            document.getElementById(id),
            positions.map(
                (pos) => document.getElementById(T.pos2Id(pos))
            ),
            plyPawns
        );
    });
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
    if (winner!==-1){
        Display.winner(winner);
        start()
    }else{
        g_ply ++;
        awaken();
    }
}


/**
 * starts the game by creating the table,
 * then filling the table with images,
 * then awakens the pawns that have a playable move.
 * @function
 * @returns {void}
 */
function start() {
    g_board = Object.freeze(Checkers.defaultBoard());
/*     g_board = [
        [[0,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
        [[0,0,0,0,0,1,0,0],[0,0,0,0,0,0,2,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
    ] */
    g_ply = g_ply%2+1;//next player starts the next turn

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
const setBottunOnclick = function () {
    Array.from(document.getElementsByClassName("restart")).forEach(
        function(button){button.onclick = start;}
    );
    document.getElementById("p0Surrender").onclick = function(){
        Display.winner(1);start();};
    document.getElementById("p1Surrender").onclick = function(){
        Display.winner(0);start();};
};
setBottunOnclick();