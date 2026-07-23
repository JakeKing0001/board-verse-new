import React from "react";
import { usePieceContext } from "./PieceContext";
import GameResultModal from "./GameResultModal";

interface TimerModalProps {
  onTimerComplete: () => void | Promise<void>;
  isWhite: boolean;
}

const TimerModal: React.FC<TimerModalProps> = ({
  isWhite,
  onTimerComplete,
}) => {
  const { t } = usePieceContext();
  const winnerColor = !isWhite ? t.white : t.black;

  const handleRetry = async () => {
    await onTimerComplete();
    window.location.reload();
  };

  return (
    <GameResultModal
      title={t.time}
      description={
        <>
          <strong>{winnerColor}</strong> {t.checkMateText}
        </>
      }
      primaryLabel={t.tryAgain}
      onPrimary={handleRetry}
      secondaryLabel={t.close}
      onSecondary={onTimerComplete}
    />
  );
};

export default TimerModal;
