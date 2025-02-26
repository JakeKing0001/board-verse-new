import { getCheck } from './checkMateLogic';

let enPassant: boolean | null = null;
let castlingWhite = true; let castlingBlack = true;
let littleCastlingWhite = true; let littleCastlingBlack = true;
let bigCastlingWhite = true; let bigCastlingBlack = true;

export function getEnpassant(passant: boolean | null) : void{
    enPassant = passant;
}

export function getWhiteCastling() : boolean {
    return castlingWhite;
}

export function getBlackCastling() : boolean {
    return castlingBlack;
}

export function setWhiteCastling(bool : boolean) : void {
    castlingWhite = bool;
}

export function setBlackCastling(bool : boolean) : void {
    castlingBlack = bool;
}

export function movePiece(fromSquare: string, toSquare: string): void {

    const fromDiv = document.getElementById(fromSquare) as HTMLDivElement;
    const toDiv = document.getElementById(toSquare) as HTMLDivElement;

    const pieceContent = fromDiv.innerHTML;
    

    fromDiv.innerHTML = '';
    toDiv.innerHTML = pieceContent;

}

function checkCastling(isWhite: boolean): number { // 0 = false, 1 = littleCastling, 2 = bigCastling, 3 = entrambe
    console.log(isWhite);
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


function showPossibleMove(letter: string, number: string, letterNumber: number, numberNumber: number): void | boolean {

    const isWhite = document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes('https://www.chess.com/chess-themes/pieces/neo/150/w') ? true : false;
    const target = document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '');
    let targetPiece = document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '')?.children[0];
    const stringInclusion = 'https://www.chess.com/chess-themes/pieces/neo/150/';
    const fromSquare = letter + number;
    const toSquare = String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber);

    if (target?.hasChildNodes()) {
        if (target?.children[0]?.getAttribute('src')?.includes(`${stringInclusion}${isWhite ? 'b' : 'w'}`) &&
        !document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes(`${stringInclusion}${isWhite ? 'wp' : 'bp'}`)) {
            targetPiece = target.children[0];
            movePiece(fromSquare, toSquare);
            if(!getCheck(isWhite)){
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
            if(!getCheck(isWhite)){
                movePiece(toSquare, fromSquare);
                return target?.classList.add('bg-gray-400/75', 'scale-[0.50]', 'rounded-full'), true;
            } else {
                movePiece(toSquare, fromSquare);
                return false;
            }
        }
    }
}

function showPossibleCapturePawn(letter: string, number: string, letterNumber: number, numberNumber: number): void | boolean {

    const isWhite = document.getElementById(letter + number)?.children[0]?.getAttribute('src')?.includes('https://www.chess.com/chess-themes/pieces/neo/150/w') ? true : false;

    if (document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '')?.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'b' : 'w'}`)) {
        return document.getElementById(String.fromCharCode(letter.charCodeAt(0) + letterNumber) + (parseInt(number) + numberNumber) + '')?.classList.add('bg-red-400/75', 'rounded-full'), false;
    } else {
        return false;
    }
}

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

export function showPiece(square: string, isWhite: boolean, lastMove: string | null): NodeListOf<HTMLDivElement> {

    const div = document.getElementById(square) as HTMLDivElement;

    const coordinates = square.split('');
    const letter = coordinates[0];
    const number = coordinates[1];

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wp' : 'bp'}`)) {

        pawnMove(letter, number, isWhite ? 1 : -1, lastMove);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wr' : 'br'}`)) {

        rookMove(letter, number);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wn' : 'bn'}`)) {

        knightMove(letter, number);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wb' : 'bb'}`)) {

        bishopMove(letter, number);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wq' : 'bq'}`)) {

        queenMove(letter, number);

    }

    if (div.children[0]?.getAttribute('src')?.includes(`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'wk' : 'bk'}`)) {

        kingMove(letter, number, isWhite);

    }

    const graySquares = document.querySelectorAll('.bg-gray-400\\/75') as NodeListOf<HTMLDivElement>;
    const redSquares = document.querySelectorAll('.bg-red-400\\/75') as NodeListOf<HTMLDivElement>;
    const blueSquares = document.querySelectorAll('.bg-blue-400\\/75') as NodeListOf<HTMLDivElement>;
    const purpleSquares = document.querySelectorAll('.bg-purple-400\\/75') as NodeListOf<HTMLDivElement>;

    const chessboard = combineNodeLists(graySquares, redSquares, blueSquares, purpleSquares);

    return chessboard;

}

function pawnMove(letter: string, number: string, direction: number, lastMove: string | null): void {
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
        return showPossibleMove(letter, number, 0, dy);
    };

    checkCapture(1, offsets[0]);
    checkCapture(-1, offsets[0]);

    if(!getCheck(direction === 1 ? true : false)) {
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

function rookMove(letter: string, number: string): void {

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, i, 0)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, -i, 0)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, 0, i)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, 0, -i)) {
            break;
        }
    }
}


function knightMove(letter: string, number: string): void {
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
        showPossibleMove(letter, number, x, y);
    }
}

function bishopMove(letter: string, number: string): void {

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, i, i)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, -i, i)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, i, -i)) {
            break;
        }
    }

    for (let i = 1; i < 8; i++) {
        if (!showPossibleMove(letter, number, -i, -i)) {
            break;
        }
    }

}

function queenMove(letter: string, number: string): void {

    rookMove(letter, number);
    bishopMove(letter, number);

}

function kingMove(letter: string, number: string, isWhite: boolean): void {
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
        showPossibleMove(letter, number, x, y);
    }
}
