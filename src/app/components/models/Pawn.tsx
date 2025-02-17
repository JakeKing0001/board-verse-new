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

export function Pawn(props: { position?: [number, number, number] }) {
  const { nodes, materials } = useGLTF('models/scene-transformed.glb') as GLTFResult

  // Riferimento al gruppo
  const modelRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Parametri di movimento più complessi e unici
  const movementParams = useMemo(() => {
    // Calcolo della zona di movimento basata sulla posizione iniziale
    const initialPosition = props.position || [0, 0, 0];
    const borderMultiplierX = Math.abs(initialPosition[0]) > 3 ? 2 : 1;
    const borderMultiplierZ = Math.abs(initialPosition[2]) > 3 ? 2 : 1;

    return {
      verticalFrequency: Math.random() * 2 + 1,
      horizontalFrequencyX: Math.random() * 0.5 + 0.1,
      horizontalFrequencyZ: Math.random() * 0.5 + 0.1,
      amplitudeX: (Math.abs(initialPosition[0]) + 1) * borderMultiplierX,
      amplitudeZ: (Math.abs(initialPosition[2]) + 1) * borderMultiplierZ,
      rotationSpeedX: Math.random() * 0.5,
      rotationSpeedY: Math.random() * 0.5,
      rotationSpeedZ: Math.random() * 0.5,
      baseX: initialPosition[0],
      baseZ: initialPosition[2]
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

useGLTF.preload('models/scene-transformed.glb')