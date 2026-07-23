import React from "react";
import { usePieceContext } from "./PieceContext";
import GameResultModal from "./GameResultModal";

interface CheckMateModalProps {
  onCheckMateComplete: (
    action: "retry" | "close",
  ) => void | Promise<void>;
  isWhite: boolean;
  isChallenge: boolean;
  isDraw?: boolean;
}

const CheckMateModal: React.FC<CheckMateModalProps> = ({
  onCheckMateComplete,
  isWhite,
  isChallenge,
  isDraw = false,
}) => {
  const { t } = usePieceContext();
  const winnerColor = !isWhite ? t.white : t.black;

  const handleRetry = async () => {
    await onCheckMateComplete(isChallenge ? "close" : "retry");
    if (!isChallenge) window.location.reload();
  };

  return (
    <GameResultModal
      title={isDraw ? t.drawTitle : t.checkMateTitle}
      description={
        isDraw ? (
          <strong>{t.drawText}</strong>
        ) : (
          <>
            <strong>{winnerColor}</strong> {t.checkMateText}
          </>
        )
      }
      primaryLabel={isChallenge ? t.close : t.retry}
      onPrimary={handleRetry}
      secondaryLabel={!isChallenge ? t.close : undefined}
      onSecondary={
        !isChallenge
          ? () => onCheckMateComplete("close")
          : undefined
      }
      celebration={!isDraw}
    />
  );
};

export default CheckMateModal;
