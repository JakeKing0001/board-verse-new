import { getSquares, getLetters} from "./components/ChessBoard";


export function getCheck(isWhite: boolean, square?: string): boolean {
    const king = isWhite ? 'wk' : 'bk';
    const letters = getLetters();
    const squaress = getSquares();
    const kingPosition = squaress.find((square) => square.props.id === king)?.props.id;
    if (!kingPosition) return false;
    const [letter, number] = kingPosition.split('');
    const enemy = isWhite ? 'b' : 'w';

    const pieces = [
        ...squaress
            .filter((square) => square.props.id !== kingPosition)
            .filter((square) => square.props.id.includes(letter) && square.props.id !== kingPosition)
            .map((square) => square.props.id),
        ...squaress
            .filter((square) => square.props.id !== kingPosition)
            .filter((square) => square.props.id.includes(number) && square.props.id !== kingPosition)
            .map((square) => square.props.id),
        ...squaress
            .filter((square) => square.props.id !== kingPosition)
            .filter((square) => Math.abs(letters.indexOf(square.props.id[0]) - letters.indexOf(letter)) === 1 && Math.abs(parseInt(square.props.id[1]) - parseInt(number)) === 1)
            .map((square) => square.props.id),
        ...squaress
            .filter((square) => square.props.id !== kingPosition)
            .filter((square) => Math.abs(letters.indexOf(square.props.id[0]) - letters.indexOf(letter)) === 2 && Math.abs(parseInt(square.props.id[1]) - parseInt(number)) === 1)
            .map((square) => square.props.id),
    ];

    return pieces.some((piece) => document.getElementById(piece)?.children[0]?.getAttribute('src')?.includes(`${enemy}`));
}
