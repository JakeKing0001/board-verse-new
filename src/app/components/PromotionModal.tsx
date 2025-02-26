import React, { useEffect, useState } from 'react';
import { usePieceContext } from './PieceContext';
import Image from 'next/image';

interface PromotionModalProps {
  onPromotionComplete: (piece: string) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ onPromotionComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  const { isWhite } = usePieceContext();

  const buttonClass = `${!isWhite ? 'bg-gray-800' : 'bg-gray-300'} ${!isWhite ? 'hover:bg-black' : 'hover:bg-white'} text-white font-medium rounded-lg p-4 transition-colors duration-300`

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`w-64 h-64 p-4 backdrop-blur-md bg-white/30 rounded-lg z-[1000] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div className="grid grid-cols-2 gap-4 w-full h-full">
        <button
          onClick={() => onPromotionComplete('q')}
          className={buttonClass}
        >
          <Image src={`https://www.chess.com/chess-themes/pieces/neo/150/${!isWhite ? 'wq' : 'bq'}.png`} alt="queen" />
        </button>
        <button
          onClick={() => onPromotionComplete('r')}
          className={buttonClass}
        >
          <Image src={`https://www.chess.com/chess-themes/pieces/neo/150/${!isWhite ? 'wr' : 'br'}.png`} alt="rook" />
        </button>
        <button
          onClick={() => onPromotionComplete('b')}
          className={buttonClass}
        >
          <Image src={`https://www.chess.com/chess-themes/pieces/neo/150/${!isWhite ? 'wb' : 'bb'}.png`} alt="bishop" />
        </button>
        <button
          onClick={() => onPromotionComplete('n')}
          className={buttonClass}
        >
          <Image src={`https://www.chess.com/chess-themes/pieces/neo/150/${!isWhite ? 'wn' : 'bn'}.png`} alt="knight" />
        </button>
      </div>
    </div>
  );
};

export default PromotionModal;