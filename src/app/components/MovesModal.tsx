import React from 'react';
import { usePieceContext } from './PieceContext';
import GameResultModal from './GameResultModal';

interface MovesModalProps {
    onMovesComplete: (piece: string) => void;
}

const MovesModal: React.FC<MovesModalProps> = ({ onMovesComplete }) => {
    const { t } = usePieceContext();

    const handleRetry = () => {
        onMovesComplete('');
        window.location.reload();
    };

    return (
        <GameResultModal
            title={t.youLose}
            description={<strong>{t.checkMateLoseDescription}</strong>}
            primaryLabel={t.playAgain}
            onPrimary={handleRetry}
            celebration={false}
        />
    );
};

export default MovesModal;
