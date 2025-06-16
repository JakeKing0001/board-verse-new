import { getCheck } from './checkMateLogic';
import { Chess } from 'chess.js';

let enPassant: boolean | null = null;
let castlingWhite = true; let castlingBlack = true;
let littleCastlingWhite = true; let littleCastlingBlack = true;
let bigCastlingWhite = true; let bigCastlingBlack = true;

/**
 * Sets the en passant state for a chess piece.
 *
 * @param passant - A boolean indicating whether en passant is possible, or null if not applicable.
 */
export function getEnpassant(passant: boolean | null) : void{
    enPassant = passant;
}

/**
 * Returns the castling availability status for the white player.
 *
 * @returns {boolean} `true` if white is allowed to castle, otherwise `false`.
 */
export function getWhiteCastling() : boolean {
    return castlingWhite;
}

/**
 * Returns the current castling status for the black player.
 *
 * @returns {boolean} `true` if black is allowed to castle, otherwise `false`.
 */
export function getBlackCastling() : boolean {
    return castlingBlack;
}

/**
 * Sets the castling availability for the white player.
 *
 * @param bool - A boolean value indicating whether white can castle (`true`) or not (`false`).
 */
export function setWhiteCastling(bool : boolean) : void {
    castlingWhite = bool;
}

/**
 * Sets the castling availability for the black player.
 *
 * @param bool - A boolean value indicating whether black is allowed to castle.
 */
export function setBlackCastling(bool : boolean) : void {
    castlingBlack = bool;
}

/**
 * Moves a chess piece (or any HTML content) from one square to another on the board.
 *
 * This function transfers the inner HTML content from the `fromSquare` element to the `toSquare` element,
 * effectively moving the piece. The source square is cleared after the move.
 *
 * @param fromSquare - The ID of the HTML element representing the square to move the piece from.
 * @param toSquare - The ID of the HTML element representing the square to move the piece to.
 */
export function movePiece(fromSquare: string, toSquare: string): void {

    const fromDiv = document.getElementById(fromSquare) as HTMLDivElement;
    const toDiv = document.getElementById(toSquare) as HTMLDivElement;

    const pieceContent = fromDiv.innerHTML;
    

    fromDiv.innerHTML = '';
    toDiv.innerHTML = pieceContent;

}

/**
 * Checks the availability of castling moves for the specified color.
 *
 * This function inspects the DOM to determine if the king and rooks are in their original positions
 * and if the squares between them are empty, indicating whether castling is possible.
 * It updates global castling state variables accordingly.
 *
 * @param isWhite - `true` to check castling for white, `false` for black.
 * @returns A number indicating castling availability:
 *   - `0`: No castling available
 *   - `1`: Only kingside (little) castling available
 *   - `2`: Only queenside (big) castling available
 *   - `3`: Both kingside and queenside castling available
 */
function checkCastling(isWhite: boolean): number { // 0 = false, 1 = littleCastling, 2 = bigCastling, 3 = entrambe
    // console.log(isWhite);
    let ret = 0;

    if (
        document.getElementById(`${isWhite ? 'e1' : 'e8'}`)?.children[0]?.getAttribute('src') !== undefined ||
        document.getElementById(`${isWhite ? 'h1' : 'h8'}`)?.children[0]?.getAttribute('src') !== undefined
    ) {
        if (
            !document.getElementById(`${isWhite ? 'e1' : 'e8'}`)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'wk' : 'bk'}`) ||
            !document.getElementById(`${isWhite ? 'h1' : 'h8'}`)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'wr' : 'br'}`)
        ) {
            if (isWhite) {
                castlingWhite = false;
                littleCastlingWhite = false;
            } else {
                castlingBlack = false;
                littleCastlingBlack = false;
            }
        }
    } else {
        if (isWhite) {
            castlingWhite = false;
            littleCastlingWhite = false;
        } else {
            castlingBlack = false;
            littleCastlingBlack = false;
        }
    }

    if (
        document.getElementById(`${isWhite ? 'e1' : 'e8'}`)?.children[0]?.getAttribute('src') !== undefined ||
        document.getElementById(`${isWhite ? 'a1' : 'a8'}`)?.children[0]?.getAttribute('src') !== undefined
    ) {
        if (
            !document.getElementById(`${isWhite ? 'e1' : 'e8'}`)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'wk' : 'bk'}`) ||
            !document.getElementById(`${isWhite ? 'a1' : 'a8'}`)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'wr' : 'br'}`)
        ) {
            if (isWhite) {
                castlingWhite = false;
                bigCastlingWhite = false;
            } else {
                castlingBlack = false;
                bigCastlingBlack = false;
            }
        }
    } else {
        if (isWhite) {
            castlingWhite = false;
            bigCastlingWhite = false;
        } else {
            castlingBlack = false;
            bigCastlingBlack = false;
        }
    }

    if (isWhite ? littleCastlingWhite : littleCastlingBlack) {
        if (
            !document.getElementById(`${isWhite ? 'f1' : 'f8'}`)?.hasChildNodes() &&
            !document.getElementById(`${isWhite ? 'g1' : 'g8'}`)?.hasChildNodes()
        ) {
            ret = 1;
        }
    }

    if (isWhite ? bigCastlingWhite : bigCastlingBlack) {
        if (
            !document.getElementById(`${isWhite ? 'd1' : 'd8'}`)?.hasChildNodes() &&
            !document.getElementById(`${isWhite ? 'c1' : 'c8'}`)?.hasChildNodes() &&
            !document.getElementById(`${isWhite ? 'b1' : 'b8'}`)?.hasChildNodes()
        ) {
            ret = ret === 1 ? 3 : 2;
        }
    }

    return ret;
}


/**
 * Highlights and validates a possible chess move on the board, handling both captures and regular moves.
 *
 * This function checks if a move from a given square to a target square is possible, visually indicates the move,
 * and ensures the move does not leave the player's king in check. It supports both capturing and non-capturing moves.
 *
 * @param letter - The file (column) of the starting square (e.g., 'a', 'b', ..., 'h').
 * @param number - The rank (row) of the starting square (e.g., '1', '2', ..., '8').
 * @param letterNumber - The file offset to calculate the target square (positive or negative integer).
 * @param numberNumber - The rank offset to calculate the target square (positive or negative integer).
 * @returns Returns `true` if the move is possible and visually indicated, `false` if not possible or leaves the king in check, or `void` if the target square is invalid.
 *
 * @remarks
 * - Visually highlights the target square for possible moves or captures.
 * - Temporarily performs the move to check for checks, then reverts it.
 * - Assumes the presence of DOM elements representing the chessboard and pieces.
 * - Relies on external functions: `movePiece` and `getCheck`.
 */
function showPossibleMove(letter: string, number: string, letterNumber: number, numberNumber: number, fen: string): void | boolean {

    const isWhite = document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes('https://www.chess.com/chess-themes/pieces/neo/150/w') ? true : false;
    const target = document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '');
    let targetPiece = document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '')?.children[0];
    const stringInclusion = 'https://www.chess.com/chess-themes/pieces/neo/150/';
    const fromSquare = letter + number;
    const toSquare = String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber);

    const chess = new Chess(fen);
    try {
        chess.move({ from: fromSquare, to: toSquare });
    } catch {
        return false;
    }

    const newFen = chess.fen();
    const checkFen = newFen.replace(/ (w|b) /, ` ${isWhite ? 'w' : 'b'} `);

    if (target?.hasChildNodes()) {
        if (target?.children[0]?.getAttribute('src')?.includes(`${stringInclusion}${isWhite ? 'b' : 'w'}`) &&
        !document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes(`${stringInclusion}${isWhite ? 'wp' : 'bp'}`)) {
            targetPiece = target.children[0];
            movePiece(fromSquare, toSquare);
            if(!getCheck(checkFen)) {
                movePiece(toSquare, fromSquare);
                target.appendChild(targetPiece);
                return target?.classList.add('bg-red-400/75', 'rounded-full'), false;
            } else {
                movePiece(toSquare, fromSquare);
                target.appendChild(targetPiece);
                return false;
            }
        } else {
            return false;
        }
    } else {
        if(target !== null) {
            movePiece(letter + number, String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber));
            if(!getCheck(checkFen)) {
                movePiece(toSquare, fromSquare);
                return target?.classList.add('bg-gray-400/75', 'scale-[0.50]', 'rounded-full'), true;
            } else {
                movePiece(toSquare, fromSquare);
                return false;
            }
        }
    }
}

/**
 * Highlights a possible pawn capture square on the chessboard if an opponent's piece is present.
 *
 * @param letter - The file (column) of the pawn's current position (e.g., 'e').
 * @param number - The rank (row) of the pawn's current position (e.g., '4').
 * @param letterNumber - The offset to apply to the file for the capture direction (-1 for left, +1 for right).
 * @param numberNumber - The offset to apply to the rank for the capture direction (+1 for white, -1 for black).
 * @returns Returns `false` if no capture is possible, or `void | false` if a capture square is highlighted.
 */
function showPossibleCapturePawn(letter: string, number: string, letterNumber: number, numberNumber: number): void | boolean {

    const isWhite = document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes('https://www.chess.com/chess-themes/pieces/neo/150/w') ? true : false;

    if (document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '')?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'b' : 'w'}`)) {
        return document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '')?.classList.add('bg-red-400/75', 'rounded-full'), false;
    } else {
        return false;
    }
}

/**
 * Highlights the possible en passant capture squares for a pawn, if the move is available.
 *
 * This function checks if an en passant move is possible for the pawn located at the given board position.
 * If so, it highlights the appropriate square(s) on the board by adding specific CSS classes.
 *
 * @param letter - The file (column) of the pawn's current position (e.g., 'e').
 * @param number - The rank (row) of the pawn's current position (e.g., '5').
 * @param lastMove - The last move made in algebraic notation (e.g., 'e5e6'), or null if no move has been made.
 * @returns Returns `void` if a highlight is applied, or `false` if no en passant move is possible.
 */
function showEnPassant(letter: string, number: string, lastMove: string | null): void | boolean {

    
    const isWhite = document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes('https://www.chess.com/chess-themes/pieces/neo/150/w') ? true : false;

    if(checkPossibleEnPassant(isWhite, lastMove)){
        if((lastMove?.charAt(0) === String.fromCharCode(letter.charCodeAt(0) + 1) && lastMove?.charAt(3) === number) || (lastMove?.charAt(0) === String.fromCharCode(letter.charCodeAt(0) - 1) && lastMove?.charAt(3) === number)){
            if (document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'wp' : 'bp'}`) &&
                document.getElementById(String.fromCharCode(letter.charCodeAt(0) - 1) + number)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'bp' : 'wp'}`)) {
                return document.getElementById(String.fromCharCode(letter.charCodeAt(0) - 1) + (parseInt(number) + (isWhite ? 1 : -1)) + '')?.classList.add('bg-blue-400/75', 'rounded-full');
            } else if (document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'wp' : 'bp'}`) &&
                document.getElementById(String.fromCharCode(letter.charCodeAt(0) + 1) + number)?.children[0]?.getAttribute('src')?.includes(`${isWhite ? 'bp' : 'wp'}`)) {
                return document.getElementById(String.fromCharCode(letter.charCodeAt(0) + 1) + (parseInt(number) + (isWhite ? 1 : -1)) + '')?.classList.add('bg-blue-400/75', 'rounded-full');
            } else {
                return false;
            }
        }
    }
}

/**
 * Checks if an en passant move is possible based on the color of the player and the last move made.
 *
 * This function determines whether an en passant capture can be performed by the current player.
 * It inspects the last move string and the DOM to verify if the opponent's pawn has just moved two squares forward,
 * and is in the correct position for en passant.
 *
 * @param isWhite - Indicates if the current player is white (`true`) or black (`false`).
 * @param lastMove - The last move made, represented as a string (e.g., "e2e4"), or `null` if there was no previous move.
 * @returns `true` if an en passant move is possible; otherwise, `false`.
 */
function checkPossibleEnPassant(isWhite: boolean, lastMove: string | null): boolean {
    if (!lastMove) return false;

    // Determina i valori corretti in base al turno
    const startRow = isWhite ? '7' : '2';
    const targetRow = isWhite ? '5' : '4';
    const pawnColor = isWhite ? 'bp' : 'wp';


    // Verifica la mossa e la pedina
    if (
        lastMove.charAt(1) === startRow &&
        lastMove.charAt(3) === targetRow &&
        document
            .getElementById(lastMove.charAt(2) + targetRow)
            ?.children[0]?.getAttribute('src')
            ?.includes(pawnColor)
    ) {
        return true;
    }

    return false;
}    

/**
 * Combines four NodeListOf<HTMLDivElement> into a single NodeListOf<HTMLDivElement>.
 *
 * Each node from the input lists is cloned and appended to a new container,
 * ensuring the original nodes are not modified. The function returns a NodeList
 * containing all cloned div elements.
 *
 * @param list1 - The first NodeList of HTMLDivElement to combine.
 * @param list2 - The second NodeList of HTMLDivElement to combine.
 * @param list3 - The third NodeList of HTMLDivElement to combine.
 * @param list4 - The fourth NodeList of HTMLDivElement to combine.
 * @returns A NodeListOf<HTMLDivElement> containing all cloned div elements from the input lists.
 */
function combineNodeLists(
    list1: NodeListOf<HTMLDivElement>,
    list2: NodeListOf<HTMLDivElement>,
    list3: NodeListOf<HTMLDivElement>,
    list4: NodeListOf<HTMLDivElement>
): NodeListOf<HTMLDivElement> {
    const fragment = document.createDocumentFragment();

    list1.forEach((node) => fragment.appendChild(node.cloneNode(true)));
    list2.forEach((node) => fragment.appendChild(node.cloneNode(true)));
    list3.forEach((node) => fragment.appendChild(node.cloneNode(true)));
    list4.forEach((node) => fragment.appendChild(node.cloneNode(true)));

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container.querySelectorAll<HTMLDivElement>("div");
}

/**
 * Highlights possible moves for the chess piece located at the specified square.
 *
 * Determines the type of piece based on the image source in the square's div,
 * then calls the appropriate move function (pawn, rook, knight, bishop, queen, king)
 * to highlight valid moves. The function also considers the piece's color and the last move made.
 *
 * After highlighting, it returns a combined NodeList of all squares currently highlighted
 * with specific background color classes (gray, red, blue, purple).
 *
 * @param square - The chessboard square identifier (e.g., "e4").
 * @param isWhite - Indicates if the piece is white (`true`) or black (`false`).
 * @param lastMove - The last move made in the game, or `null` if there is none.
 * @returns A NodeList of all highlighted chessboard squares as HTMLDivElements.
 */
export function showPiece(square: string, isWhite: boolean, lastMove: string | null, fen: string): NodeListOf<HTMLDivElement> {

    const div = document.getElementById(square) as HTMLDivElement;

    const coordinates = square.split('');
    const letter = coordinates[0];
    const number = coordinates[1];

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wp' : 'bp'}`)) {

        pawnMove(letter, number, isWhite ? 1 : -1, lastMove, fen);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wr' : 'br'}`)) {

        rookMove(letter, number, fen);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wn' : 'bn'}`)) {

        knightMove(letter, number, fen);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wb' : 'bb'}`)) {

        bishopMove(letter, number, fen);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wq' : 'bq'}`)) {

        queenMove(letter, number, fen);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wk' : 'bk'}`)) {

        kingMove(letter, number, isWhite, fen);

    }

    const graySquares = document.querySelectorAll('.bg-gray-400\\/75') as NodeListOf<HTMLDivElement>;
    const redSquares = document.querySelectorAll('.bg-red-400\\/75') as NodeListOf<HTMLDivElement>;
    const blueSquares = document.querySelectorAll('.bg-blue-400\\/75') as NodeListOf<HTMLDivElement>;
    const purpleSquares = document.querySelectorAll('.bg-purple-400\\/75') as NodeListOf<HTMLDivElement>;

    const chessboard = combineNodeLists(graySquares, redSquares, blueSquares, purpleSquares);

    return chessboard;

}

/**
 * Calculates and displays possible moves for a pawn on a chessboard, including standard moves,
 * captures, double moves from the starting position, and en passant. Also considers check conditions.
 *
 * @param letter - The file (column) of the pawn's current position, as a letter (e.g., 'a', 'b', ...).
 * @param number - The rank (row) of the pawn's current position, as a string (e.g., '2', '7').
 * @param direction - The direction the pawn moves: 1 for white (up the board), -1 for black (down the board).
 * @param lastMove - The last move made in the game, used to determine en passant eligibility; can be null.
 */
function pawnMove(letter: string, number: string, direction: number, lastMove: string | null, fen: string): void {
    const num = parseInt(number);
    const offsets = direction === 1 ? [1, 2] : [-1, -2];
    const enemy = direction === 1 ? 'b' : 'w';

    const checkCapture = (dx: number, dy: number) => {
        const target = document.getElementById(String.fromCharCode(letter.charCodeAt(0) + dx) + (num + dy));
        if (target?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${enemy}`)) {
            showPossibleCapturePawn(letter, number, dx, dy);
        }
    };

    const checkMove = (dy: number) => {
        return showPossibleMove(letter, number, 0, dy, fen);
    };

    checkCapture(1, offsets[0]);
    checkCapture(-1, offsets[0]);

    if(!getCheck(fen)) {
        if (checkMove(offsets[0])) {
            if ((direction === 1 && number === '2') || (direction === -1 && number === '7')) {
                checkMove(offsets[1]);
            }
        }
    } else {
        checkMove(offsets[0])
        if ((direction === 1 && number === '2') || (direction === -1 && number === '7')) {
            checkMove(offsets[1]);
        }
    }

    if (enPassant) {
        showEnPassant(letter, number, lastMove);
    }
}

/**
 * Calculates and displays all possible moves for a rook piece on a chessboard from the given position.
 * Iterates in all four straight directions (horizontal and vertical) from the current position,
 * calling `showPossibleMove` for each square until the edge of the board or an obstruction is encountered.
 *
 * @param letter - The column letter of the rook's current position (e.g., 'a' through 'h').
 * @param number - The row number of the rook's current position (e.g., '1' through '8').
 */
function rookMove(letter: string, number: string, fen: string): void {

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, i, 0, fen)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, -i, 0, fen)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, 0, i, fen)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, 0, -i, fen)) {
            break;
        }
    }
}


/**
 * Calculates and displays all possible moves for a knight piece on a chessboard from a given position.
 *
 * @param letter - The column letter of the knight's current position (e.g., 'a' through 'h').
 * @param number - The row number of the knight's current position (e.g., '1' through '8').
 *
 * @remarks
 * This function uses the standard L-shaped movement rules for a knight in chess.
 * It calls `showPossibleMove` for each valid move offset.
 */
function knightMove(letter: string, number: string, fen: string): void {
    const moves = [
        [1, 2],
        [-1, 2],
        [1, -2],
        [-1, -2],
        [2, 1],
        [-2, 1],
        [2, -1],
        [-2, -1],
    ];

    for (const [x, y] of moves) {
        showPossibleMove(letter, number, x, y, fen);
    }
}

/**
 * Calculates and displays all possible moves for a bishop piece on a chessboard,
 * starting from the given position. The function iterates in all four diagonal
 * directions and calls `showPossibleMove` for each possible move until an invalid
 * move is encountered in that direction.
 *
 * @param letter - The column (file) of the bishop's current position, typically a letter from 'a' to 'h'.
 * @param number - The row (rank) of the bishop's current position, typically a number from '1' to '8'.
 */
function bishopMove(letter: string, number: string, fen: string): void {

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, i, i, fen)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, -i, i, fen)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, i, -i, fen)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, -i, -i, fen)) {
            break;
        }
    }

}

/**
 * Calculates and executes all possible moves for a queen piece on a chessboard.
 * The queen's movement combines both rook and bishop moves, allowing it to move
 * any number of squares along a rank, file, or diagonal.
 *
 * @param letter - The column (file) of the queen's current position, typically represented as a letter (e.g., 'a' to 'h').
 * @param number - The row (rank) of the queen's current position, typically represented as a string (e.g., '1' to '8').
 *
 * @remarks
 * This function delegates the movement logic to `rookMove` and `bishopMove` to cover all possible queen moves.
 */
function queenMove(letter: string, number: string, fen: string): void {

    rookMove(letter, number, fen);
    bishopMove(letter, number, fen);

}

/**
 * Highlights all possible moves for a king piece on a chessboard, including standard moves and castling options.
 *
 * @param letter - The file (column) of the king's current position, represented as a string (e.g., 'e').
 * @param number - The rank (row) of the king's current position, represented as a string (e.g., '1').
 * @param isWhite - A boolean indicating whether the king is white (`true`) or black (`false`).
 *
 * @remarks
 * - Standard king moves (one square in any direction) are highlighted by calling `showPossibleMove`.
 * - If castling is available for the current color, the function checks castling rights and highlights the appropriate rook squares.
 * - Relies on external functions and variables: `castlingWhite`, `castlingBlack`, `checkCastling`, and `showPossibleMove`.
 */
function kingMove(letter: string, number: string, isWhite: boolean, fen: string): void {
    const moves = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
    ];

    if((isWhite)? castlingWhite: castlingBlack) {
        if(checkCastling(isWhite) === 1) {
            document.getElementById(`${isWhite ? 'h1':'h8'}`)?.classList.add('bg-purple-400/75', 'rounded-full');
        }
        if(checkCastling(isWhite) === 2) {
            document.getElementById(`${isWhite ? 'a1':'a8'}`)?.classList.add('bg-purple-400/75', 'rounded-full');
        }
        if(checkCastling(isWhite) === 3) {
            document.getElementById(`${isWhite ? 'h1':'h8'}`)?.classList.add('bg-purple-400/75', 'rounded-full');
            document.getElementById(`${isWhite ? 'a1':'a8'}`)?.classList.add('bg-purple-400/75', 'rounded-full');
        }
    }

    for (const [x, y] of moves) {
        showPossibleMove(letter, number, x, y, fen);
    }
}