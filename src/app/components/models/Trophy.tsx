"use client";

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { JSX } from 'react';
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Object_4: THREE.Mesh
    Object_5: THREE.Mesh
  }
  materials: {
    gold: THREE.MeshStandardMaterial
    grey: THREE.MeshStandardMaterial
  }
}

export function Trophy(props: JSX.IntrinsicElements['group']) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF('/models/trophy-transformed.glb') as GLTFResult

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group
      {...props}
      ref={groupRef}
      dispose={null}
      position={[0.32, -1.8, 0]}
      scale={[0.06, 0.06, 0.06]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_4.geometry}
        material={materials.gold}
        rotation={[Math.PI / 2, -0.09717, 0]}
        scale={[5.7907, 5.79069, 5.7907]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_5.geometry}
        material={materials.grey}
        rotation={[Math.PI / 2, -0.09717, 0]}
        scale={[5.7907, 5.79069, 5.7907]}
      />
    </group>
  )
}

useGLTF.preload('/models/trophy-transformed.glb')
