import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import clsx from 'clsx';
import React, { Suspense } from 'react';

interface RenderModelProps {
  children: React.ReactNode;
  className?: string;
  gradientClassName?: string;
}

export default function RenderModel({ 
  children, 
  className,
  gradientClassName = "" 
}: RenderModelProps) {

  return (
    <div className={clsx("w-full h-full", gradientClassName)}>
      <Canvas
        className={clsx("w-full h-full", className)}
        shadows
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          {children}
        </Suspense>
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
