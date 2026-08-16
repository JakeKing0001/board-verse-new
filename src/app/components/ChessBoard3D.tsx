"use client";

import { ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import React, { memo, useMemo, useState } from 'react';
import type { LegalMoveTarget, MoveHighlight } from '../../lib/chessView';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

interface ChessBoard3DProps {
  board: string[][];
  selectedSquare: string | null;
  legalMoves: LegalMoveTarget[];
  lastMove: string | null;
  isInCheck: boolean;
  whiteToMove: boolean;
  orientation: 'white' | 'black';
  darkMode: boolean;
  label: string;
  fallbackText: string;
  onSquareClick: (square: string) => void | Promise<void>;
}

interface SceneSquare {
  id: string;
  piece: string;
  fileIndex: number;
  rankIndex: number;
}

interface PiecePalette {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

function PieceMaterial({ color, emissive, emissiveIntensity }: PiecePalette) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      metalness={0.18}
      roughness={0.24}
    />
  );
}

function PieceBase({ palette }: { palette: PiecePalette }) {
  return (
    <>
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.34, 0.39, 0.14, 32]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.27, 0.33, 0.1, 32]} />
        <PieceMaterial {...palette} />
      </mesh>
    </>
  );
}

function PawnShape({ palette }: { palette: PiecePalette }) {
  return (
    <>
      <PieceBase palette={palette} />
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.14, 0.23, 0.42, 28]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.69, 0]}>
        <sphereGeometry args={[0.2, 28, 20]} />
        <PieceMaterial {...palette} />
      </mesh>
    </>
  );
}

function RookShape({ palette }: { palette: PiecePalette }) {
  const battlements = [
    [-0.2, 0, 0],
    [0.2, 0, 0],
    [0, 0, -0.2],
    [0, 0, 0.2],
  ] as const;

  return (
    <>
      <PieceBase palette={palette} />
      <mesh castShadow position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.24, 0.28, 0.6, 16]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.81, 0]}>
        <cylinderGeometry args={[0.32, 0.27, 0.16, 16]} />
        <PieceMaterial {...palette} />
      </mesh>
      {battlements.map(([x, , z], index) => (
        <mesh key={index} castShadow position={[x, 0.96, z]}>
          <boxGeometry args={[0.18, 0.22, 0.18]} />
          <PieceMaterial {...palette} />
        </mesh>
      ))}
    </>
  );
}

function KnightShape({ palette }: { palette: PiecePalette }) {
  return (
    <>
      <PieceBase palette={palette} />
      <mesh castShadow position={[0, 0.48, 0.03]} rotation={[-0.28, 0, 0]}>
        <coneGeometry args={[0.29, 0.62, 20]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0.14]} rotation={[-0.2, 0, 0]}>
        <sphereGeometry args={[0.24, 24, 18]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.82, 0.35]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[0.28, 0.2, 0.34]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[-0.11, 1.02, 0.07]} rotation={[0.05, 0, -0.14]}>
        <coneGeometry args={[0.07, 0.24, 12]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0.11, 1.02, 0.07]} rotation={[0.05, 0, 0.14]}>
        <coneGeometry args={[0.07, 0.24, 12]} />
        <PieceMaterial {...palette} />
      </mesh>
    </>
  );
}

function BishopShape({ palette }: { palette: PiecePalette }) {
  return (
    <>
      <PieceBase palette={palette} />
      <mesh castShadow position={[0, 0.51, 0]}>
        <coneGeometry args={[0.27, 0.6, 28]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.83, 0]}>
        <sphereGeometry args={[0.2, 28, 20]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 1.04, 0]}>
        <coneGeometry args={[0.09, 0.28, 20]} />
        <PieceMaterial {...palette} />
      </mesh>
    </>
  );
}

function QueenShape({ palette }: { palette: PiecePalette }) {
  const crownPoints = Array.from({ length: 6 }, (_, index) => {
    const angle = (index / 6) * Math.PI * 2;
    return [Math.cos(angle) * 0.23, 0.98, Math.sin(angle) * 0.23] as const;
  });

  return (
    <>
      <PieceBase palette={palette} />
      <mesh castShadow position={[0, 0.56, 0]}>
        <coneGeometry args={[0.31, 0.7, 32]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.87, 0]}>
        <torusGeometry args={[0.24, 0.065, 12, 32]} />
        <PieceMaterial {...palette} />
      </mesh>
      {crownPoints.map(([x, y, z], index) => (
        <mesh key={index} castShadow position={[x, y, z]}>
          <sphereGeometry args={[0.085, 18, 14]} />
          <PieceMaterial {...palette} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.07, 0]}>
        <sphereGeometry args={[0.12, 22, 16]} />
        <PieceMaterial {...palette} />
      </mesh>
    </>
  );
}

function KingShape({ palette }: { palette: PiecePalette }) {
  return (
    <>
      <PieceBase palette={palette} />
      <mesh castShadow position={[0, 0.57, 0]}>
        <coneGeometry args={[0.31, 0.72, 32]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 0.91, 0]}>
        <cylinderGeometry args={[0.22, 0.27, 0.13, 28]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 1.13, 0]}>
        <boxGeometry args={[0.12, 0.38, 0.12]} />
        <PieceMaterial {...palette} />
      </mesh>
      <mesh castShadow position={[0, 1.18, 0]}>
        <boxGeometry args={[0.38, 0.12, 0.12]} />
        <PieceMaterial {...palette} />
      </mesh>
    </>
  );
}

function PieceShape({ piece, palette }: { piece: string; palette: PiecePalette }) {
  switch (piece.toLowerCase()) {
    case 'r':
      return <RookShape palette={palette} />;
    case 'n':
      return <KnightShape palette={palette} />;
    case 'b':
      return <BishopShape palette={palette} />;
    case 'q':
      return <QueenShape palette={palette} />;
    case 'k':
      return <KingShape palette={palette} />;
    default:
      return <PawnShape palette={palette} />;
  }
}

const ChessPiece3D = memo(function ChessPiece3D({
  piece,
  position,
  selected,
  checked,
  onSelect,
}: {
  piece: string;
  position: [number, number, number];
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isWhite = piece === piece.toUpperCase();
  const palette: PiecePalette = {
    color: isWhite ? '#f7f1e6' : '#182433',
    emissive: checked ? '#ef4444' : selected ? '#fbbf24' : hovered ? '#14b8a6' : '#000000',
    emissiveIntensity: checked ? 0.75 : selected ? 0.48 : hovered ? 0.18 : 0,
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <group
      position={position}
      scale={hovered ? 1.045 : 1}
      onClick={handleClick}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <PieceShape piece={piece} palette={palette} />
    </group>
  );
});

function MoveMarker({ kind }: { kind: MoveHighlight }) {
  const color = kind === 'capture'
    ? '#fb7185'
    : kind === 'en-passant'
      ? '#38bdf8'
      : kind === 'castle'
        ? '#a78bfa'
        : '#34d399';

  if (kind === 'quiet') {
    return (
      <mesh position={[0, 0.105, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.035, 28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.41, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} side={2} />
    </mesh>
  );
}

function BoardSquare3D({
  square,
  fileIndex,
  rankIndex,
  selected,
  highlight,
  isLastMove,
  darkMode,
  onSelect,
}: {
  square: string;
  fileIndex: number;
  rankIndex: number;
  selected: boolean;
  highlight?: MoveHighlight;
  isLastMove: boolean;
  darkMode: boolean;
  onSelect: () => void;
}) {
  const light = (fileIndex + rankIndex) % 2 === 0;
  const baseColor = darkMode
    ? light ? '#60758a' : '#1e3044'
    : light ? '#ead8b7' : '#945b40';
  const emissive = selected
    ? '#fbbf24'
    : isLastMove
      ? '#22d3ee'
      : highlight
        ? '#10b981'
        : '#000000';

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <group position={[fileIndex - 3.5, 0, rankIndex - 3.5]} onClick={handleClick} name={square}>
      <mesh receiveShadow>
        <boxGeometry args={[0.98, 0.12, 0.98]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissive}
          emissiveIntensity={selected ? 0.5 : isLastMove ? 0.25 : highlight ? 0.14 : 0}
          metalness={0.05}
          roughness={0.62}
        />
      </mesh>
      {highlight && <MoveMarker kind={highlight} />}
    </group>
  );
}

function BoardFrame({ darkMode }: { darkMode: boolean }) {
  const frameColor = darkMode ? '#0b1320' : '#4a2b21';
  return (
    <>
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[9.05, 0.35, 9.05]} />
        <meshStandardMaterial color={frameColor} metalness={0.12} roughness={0.38} />
      </mesh>
      <mesh position={[0, -0.01, -4.24]}>
        <boxGeometry args={[8.95, 0.28, 0.48]} />
        <meshStandardMaterial color={frameColor} metalness={0.18} roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.01, 4.24]}>
        <boxGeometry args={[8.95, 0.28, 0.48]} />
        <meshStandardMaterial color={frameColor} metalness={0.18} roughness={0.32} />
      </mesh>
      <mesh position={[-4.24, -0.01, 0]}>
        <boxGeometry args={[0.48, 0.28, 8.95]} />
        <meshStandardMaterial color={frameColor} metalness={0.18} roughness={0.32} />
      </mesh>
      <mesh position={[4.24, -0.01, 0]}>
        <boxGeometry args={[0.48, 0.28, 8.95]} />
        <meshStandardMaterial color={frameColor} metalness={0.18} roughness={0.32} />
      </mesh>
    </>
  );
}

function ChessScene({
  squares,
  selectedSquare,
  legalMoves,
  lastMove,
  isInCheck,
  whiteToMove,
  orientation,
  darkMode,
  onSquareClick,
}: Omit<ChessBoard3DProps, 'board' | 'label' | 'fallbackText'> & { squares: SceneSquare[] }) {
  const legalMoveMap = useMemo(
    () => new Map<string, MoveHighlight>(legalMoves.map((move) => [move.square, move.highlight])),
    [legalMoves],
  );
  const lastMoveSquares = useMemo(
    () => new Set(lastMove ? [lastMove.slice(0, 2), lastMove.slice(2, 4)] : []),
    [lastMove],
  );
  const checkedPiece = isInCheck ? (whiteToMove ? 'K' : 'k') : null;

  return (
    <>
      <PerspectiveCamera makeDefault fov={43} position={[0, 8.5, 8.8]} />
      <ambientLight intensity={0.78} />
      <hemisphereLight args={[darkMode ? '#9bd8ff' : '#fff8df', darkMode ? '#07101b' : '#6b4533', 1.1]} />
      <directionalLight
        castShadow
        color={darkMode ? '#d8f5ff' : '#fff4d6'}
        intensity={2.15}
        position={[5, 9, 6]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight color="#8b5cf6" intensity={darkMode ? 9 : 4} position={[-5, 3, -4]} distance={12} />
      <group rotation={[0, orientation === 'black' ? Math.PI : 0, 0]}>
        <BoardFrame darkMode={darkMode} />
        {squares.map((square) => {
          const position: [number, number, number] = [
            square.fileIndex - 3.5,
            0.08,
            square.rankIndex - 3.5,
          ];
          return (
            <React.Fragment key={square.id}>
              <BoardSquare3D
                square={square.id}
                fileIndex={square.fileIndex}
                rankIndex={square.rankIndex}
                selected={selectedSquare === square.id}
                highlight={legalMoveMap.get(square.id)}
                isLastMove={lastMoveSquares.has(square.id)}
                darkMode={darkMode}
                onSelect={() => void onSquareClick(square.id)}
              />
              {square.piece && (
                <ChessPiece3D
                  piece={square.piece}
                  position={position}
                  selected={selectedSquare === square.id}
                  checked={square.piece === checkedPiece}
                  onSelect={() => void onSquareClick(square.id)}
                />
              )}
            </React.Fragment>
          );
        })}
      </group>
      <ContactShadows position={[0, -0.38, 0]} scale={11} opacity={0.42} blur={2.5} far={5} />
      <OrbitControls
        makeDefault
        target={[0, 0.1, 0]}
        enablePan={false}
        minDistance={8.6}
        maxDistance={15}
        minPolarAngle={0.48}
        maxPolarAngle={1.34}
        dampingFactor={0.08}
      />
    </>
  );
}

export default function ChessBoard3D({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  isInCheck,
  whiteToMove,
  orientation,
  darkMode,
  label,
  fallbackText,
  onSquareClick,
}: ChessBoard3DProps) {
  const squares = useMemo<SceneSquare[]>(() => (
    board.flatMap((row, rowIndex) => row.map((piece, fileIndex) => ({
      id: `${FILES[fileIndex]}${8 - rowIndex}`,
      piece,
      fileIndex,
      rankIndex: rowIndex,
    })))
  ), [board]);

  return (
    <div className="board-3d-stage" role="group" aria-label={label}>
      <Canvas
        shadows
        dpr={[1, 1.55]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        fallback={(
          <div role="alert" className="grid h-full place-items-center p-8 text-center font-bold text-[var(--bv-text)]">
            {fallbackText}
          </div>
        )}
      >
        <ChessScene
          squares={squares}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          isInCheck={isInCheck}
          whiteToMove={whiteToMove}
          orientation={orientation}
          darkMode={darkMode}
          onSquareClick={onSquareClick}
        />
      </Canvas>
    </div>
  );
}
