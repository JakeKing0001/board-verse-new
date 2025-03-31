import { getSquares, getLetters } from "./components/ChessBoard";

export function getCheck(isWhite: boolean): boolean {
    const king = isWhite ? 'wk' : 'bk';
    const enemy = isWhite ? 'b' : 'w';

    const letters = getLetters();
    const squares = getSquares();

    const kingPosition = squares.find((square) =>
        document.getElementById(square.props.id)?.children[0]?.getAttribute('src')?.includes(king)
    )?.props.id;

    if (!kingPosition) return false;

    const [letter, number] = kingPosition.split('');

    const directions = {
        vertical: [[0, 1], [0, -1]],
        horizontal: [[1, 0], [-1, 0]],
        diagonal: [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    };

    const isCheckDirection = (moves: number[][], threats: string[]): boolean => {
        for (const [dx, dy] of moves) {
            for (let i = 1; i < 8; i++) {
                const newLetter = letters[letters.findIndex((l) => l === letter) + dx * i];
                const newNumber = parseInt(number) + dy * i;
                if (!newLetter || newNumber < 1 || newNumber > 8) break;

                const square = `${newLetter}${newNumber}`;
                const piece = document.getElementById(square)?.children[0]?.getAttribute('src');

                if (piece) {
                    if (threats.some(threat => piece.includes(enemy + threat))) return true;
                    break;
                }
            }
        }
        return false;
    };

    let check = false;

    check ||= isCheckDirection([...directions.vertical, ...directions.horizontal], ['q', 'r']); // Torre e Regina
    check ||= isCheckDirection(directions.diagonal, ['q', 'b']); // Alfiere e Regina

    // Cavallo
    const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
    ];
    check ||= knightMoves.some(([dx, dy]) => {
        const square = letters[letters.findIndex((l) => l === letter) + dx] + (parseInt(number) + dy);
        return square && document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(enemy + 'n');
    });

    // Pedone
    const pawnMoves = isWhite ? [[1, 1], [-1, 1]] : [[1, -1], [-1, -1]];
    check ||= pawnMoves.some(([dx, dy]) => {
        const square = letters[letters.findIndex((l) => l === letter) + dx] + (parseInt(number) + dy);
        return square && document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(enemy + 'p');
    });

    // Re
    const kingMoves = [
        [1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]
    ];
    check ||= kingMoves.some(([dx, dy]) => {
        const square = letters[letters.findIndex((l) => l === letter) + dx] + (parseInt(number) + dy);
        return square && document.getElementById(square)?.children[0]?.getAttribute('src')?.includes(enemy + 'k');
    });

    console.log(check);
    return check;
}