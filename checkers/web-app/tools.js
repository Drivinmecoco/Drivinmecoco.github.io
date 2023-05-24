/**
 * tool.js is a module that contains commonly used functions
 * @namespace T
 * @author Maxim Weill
 * @version 2023
 */
const T = Object.create(null);


/**
 * turns the id (r1c2) to a position [1,2]
 * @memberof T
 * @function
 * @param {string} id
 * @returns {number[]}
 */
T.id2Pos = function (id) {
    return [id[1], id[3]];
};
/**
 * turns a position [1,2] to an id (r1c2)
 * @memberof T
 * @function
 * @param {number[]} pos
 * @returns {string}
 */
T.pos2Id = function (pos) {
    return `r${pos[0]}c${pos[1]}`;
};

export default Object.freeze(T);