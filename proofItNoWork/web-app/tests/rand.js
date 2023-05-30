
/**
 * rand.js is a module to generate random information
 * for testing
 * @namespace Display
 * @author Maxim Weill
 * @version 2023
 */
const Rand = Object.create(null);



/**
 * Creates 2 paired random rows
 * @function
 * @return {Array<number[]>}
 */
Rand.pawn = function () {
    //probability that the board is empty 0.5^(8*8). basically 0
    const p = [0.5, 0.4];//probability of getting 0 or 1
    const border = [p[0], p[1] + p[0]];//probability border of 0,1,2
    const numb = Math.random();
    let pawn;
    if (numb < border[0]) {
        pawn = 0;
    } else if (numb < border[1]) {
        pawn = 1;
    } else {
        pawn = 2;
    }

    const player = Math.round(Math.random());
    let pawns = [0, 0];
    pawns[player] = pawn;
    return pawns;
};

/**
 * Creates 2 paired random rows
 * @function
 * @return {Array<number[]>}
 */
Rand.board = function () {
    const rowsOfPawnPairs = Array.from(
        {length: 8},
        (_, r) => Array.from(
            {length: 8},
            (_, c) => (
                (r + c) % 2 === 1
                ? Rand.pawn()
                : [0, 0]
            )
        )
    );
    const p0 = Array.from(
        {length: 8},
        (_, r) => [...rowsOfPawnPairs[r]].map(
            (pair, c) => ((c % 7 === 0) && (pair[0] !== 0))
            ? 2
            : pair[0]
        )
    );
    const p1 = Array.from(
        {length: 8},
        (_, r) => [...rowsOfPawnPairs[r]].map(
            (pair, c) => ((c % 7 === 0) && (pair[1] !== 0))
            ? 2
            : pair[1]
        )
    );
    return [p0, p1];
};

export default Object.freeze(Rand);
