import { getSquares, getLetters } from "./components/ChessBoard";

export function getCheck(isWhite: boolean): boolean {
    const king = isWhite ? 'wk' : 'bk';
    const letters = getLetters();
    const squaress = getSquares();
    const kingPosition = squaress.find((square) => document.getElementById(square.props.id)?.children[0]?.getAttribute('src')?.includes(king))?.props.id;
    if (!kingPosition) return false;
    const [letter, number] = kingPosition.split('');
    const enemy = isWhite ? 'b' : 'w';
    const allie = isWhite ? 'w' : 'b';
    let check = false;

    //Sopra
    for (let i = 1; i < 8; i++) {
        const foundLetter = letters.find((l) => l === letter);
        if (!foundLetter) break;
        const square = foundLetter + (parseInt(number) + i);
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'r')) check = true;
            break;
        }
    }

    //Sotto
    for (let i = 1; i < 8; i++) {
        const foundLetter = letters.find((l) => l === letter);
        if (!foundLetter) break;
        const square = foundLetter + (parseInt(number) - i);
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'r')) check = true;
            break;
        }
    }

    //Destra
    for (let i = 1; i < 8; i++) {
        const index = letters.findIndex((l) => l === letter);
        if (index === -1) break;
        const square = letters[index + i] + number;
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'r')) check = true;
            break;
        }
    }

    //Sinistra
    for (let i = 1; i < 8; i++) {
        const index = letters.findIndex((l) => l === letter);
        if (index === -1) break;
        const square = letters[index - i] + number;
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'r')) check = true;
            break;
        }
    }

    //Diagonale in alto a destra
    for (let i = 1; i < 8; i++) {
        const index = letters.findIndex((l) => l === letter);
        if (index === -1) break;
        const square = letters[index + i] + (parseInt(number) + i);
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'b')) check = true;
            break;
        }
    }

    //Diagonale in alto a sinistra
    for (let i = 1; i < 8; i++) {
        const index = letters.findIndex((l) => l === letter);
        if (index === -1) break;
        const square = letters[index - i] + (parseInt(number) + i);
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'b')) check = true;
            break;
        }
    }

    //Diagonale in basso a destra
    for (let i = 1; i < 8; i++) {
        const index = letters.findIndex((l) => l === letter);
        if (index === -1) break;
        const square = letters[index + i] + (parseInt(number) - i);
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'b')) check = true;
            break;
        }
    }

    //Diagonale in basso a sinistra
    for (let i = 1; i < 8; i++) {
        const index = letters.findIndex((l) => l === letter);
        if (index === -1) break;
        const square = letters[index - i] + (parseInt(number) - i);
        if (!square) break;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece) {
            if (piece.includes(enemy + 'q') || piece.includes(enemy + 'b')) check = true;
            break;
        }
    }

    //Cavallo
    const knightMoves = [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2]
    ];
    knightMoves.forEach((move) => {
        const square = letters[letters.findIndex((l) => l === letter) + move[0]] + (parseInt(number) + move[1]);
        if (!square) return;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece && piece.includes(enemy + 'n')) check = true;
    });

    //Pedone
    const pawnMoves = isWhite ? [[1, 1], [-1, 1]] : [[1, -1], [-1, -1]]; // [x, y]
    pawnMoves.forEach((move) => {
        const square = letters[letters.findIndex((l) => l === letter) + move[0]] + (parseInt(number) + move[1]);
        if (!square) return;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece && piece.includes(enemy + 'p')) check = true;
    });

    //Re
    const kingMoves = [
        [1, 1],
        [1, 0],
        [1, -1],
        [0, 1],
        [0, -1],
        [-1, 1],
        [-1, 0],
        [-1, -1]
    ];
    kingMoves.forEach((move) => {
        const square = letters[letters.findIndex((l) => l === letter) + move[0]] + (parseInt(number) + move[1]);
        if (!square) return;
        const piece = document.getElementById(square)?.children[0]?.getAttribute('src');
        if (piece && piece.includes(enemy + 'k')) check = true;
    });

    console.log(check);

    return check;
}
