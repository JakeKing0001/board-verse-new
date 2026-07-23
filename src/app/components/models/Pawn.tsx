import * as THREE from 'three'
import React, { useRef, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { useFrame } from '@react-three/fiber'

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh
  }
  materials: {
    ['Scene_-_Root']: THREE.MeshStandardMaterial
  }
}

const PAWN_MODEL_PATH = '/models/scene-transformed.glb';
const DRACO_DECODER_PATH = '/draco/';

const seededMovementValue = (
  x: number,
  z: number,
  offset: number,
): number => {
  const value = Math.sin(x * 12.9898 + z * 78.233 + offset * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

/**
 * Renders a 3D pawn model with animated movement and interactive hover effects.
 *
 * The pawn's movement parameters (amplitude, frequency, rotation speed) are randomized and
 * partially based on its initial position, creating unique and dynamic animations for each instance.
 * The pawn floats, vibrates, and rotates in 3D space, with increased movement amplitude near the board edges.
 * When hovered, the pawn scales up to provide visual feedback.
 *
 * @param props - Component props.
 * @param props.position - Optional initial position of the pawn as a tuple [x, y, z].
 *
 * @returns A React component rendering the animated pawn model.
 */
export function Pawn(props: { position?: [number, number, number] }) {
  const { nodes, materials } = useGLTF(PAWN_MODEL_PATH, DRACO_DECODER_PATH) as GLTFResult

  // Riferimento al gruppo
  const modelRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Parametri di movimento più complessi e unici
  const movementParams = useMemo(() => {
    // Calcolo della zona di movimento basata sulla posizione iniziale
    const initialPosition = props.position || [0, 0, 0];
    const borderMultiplierX = Math.abs(initialPosition[0]) > 3 ? 2 : 1;
    const borderMultiplierZ = Math.abs(initialPosition[2]) > 3 ? 2 : 1;
    const [baseX, , baseZ] = initialPosition;

    return {
      verticalFrequency: seededMovementValue(baseX, baseZ, 1) * 2 + 1,
      horizontalFrequencyX: seededMovementValue(baseX, baseZ, 2) * 0.5 + 0.1,
      horizontalFrequencyZ: seededMovementValue(baseX, baseZ, 3) * 0.5 + 0.1,
      amplitudeX: (Math.abs(initialPosition[0]) + 1) * borderMultiplierX,
      amplitudeZ: (Math.abs(initialPosition[2]) + 1) * borderMultiplierZ,
      rotationSpeedX: seededMovementValue(baseX, baseZ, 4) * 0.5,
      rotationSpeedY: seededMovementValue(baseX, baseZ, 5) * 0.5,
      rotationSpeedZ: seededMovementValue(baseX, baseZ, 6) * 0.5,
      baseX,
      baseZ,
    };
  }, [props.position]);

  // Stati per movimento e rotazione
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (modelRef.current && meshRef.current) {
      const time = state.clock.elapsedTime;

      // Movimento verticale più complesso e unico
      modelRef.current.position.y =
        Math.sin(time * movementParams.verticalFrequency) * 0.5 +  // Movimento base
        Math.cos(time * 0.7) * 0.3 +  // Movimento sovrapposto
        Math.sin(time * 2) * 0.2;     // Piccole vibrazioni

      // Movimento orizzontale con parametri unici e maggiore ampiezza ai bordi
      modelRef.current.position.x =
        movementParams.baseX +
        movementParams.amplitudeX * Math.sin(time * movementParams.horizontalFrequencyX);

      modelRef.current.position.z =
        movementParams.baseZ +
        movementParams.amplitudeZ * Math.cos(time * movementParams.horizontalFrequencyZ);

      // Rotazione multi-asse con velocità e direzioni diverse
      modelRef.current.rotation.x = Math.sin(time * movementParams.rotationSpeedX) * Math.PI;
      modelRef.current.rotation.y = Math.cos(time * movementParams.rotationSpeedY) * Math.PI;
      modelRef.current.rotation.z = Math.sin(time * movementParams.rotationSpeedZ) * Math.PI * 0.5;

      // Effetto hover
      if (isHovered) {
        const hoverScale = 0.4;
        modelRef.current.scale.set(hoverScale, hoverScale, hoverScale);
      } else {
        modelRef.current.scale.set(0.3, 0.3, 0.3);
      }
    }
  })

  return (
    <group ref={modelRef} {...props} dispose={null}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
        material={materials['Scene_-_Root']}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
        scale={0.3}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      />
    </group>
  )
}

useGLTF.preload(PAWN_MODEL_PATH, DRACO_DECODER_PATH)
