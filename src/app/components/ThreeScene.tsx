"use client";

import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import clsx from 'clsx';
import React, { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';

interface ThreeSceneProps {
  children: ReactNode;
  className?: string;
  gradientClassName?: string;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('Scena 3D non disponibile, uso lo sfondo semplificato.', {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export default function ThreeScene({
  children,
  className,
  gradientClassName = '',
}: ThreeSceneProps) {
  return (
    <div className={clsx('h-full w-full', gradientClassName)}>
      <SceneErrorBoundary>
        <Canvas className={clsx('h-full w-full', className)} shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <Suspense fallback={null}>
            <ambientLight intensity={0.65} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} />
            <directionalLight
              color="#dcfce7"
              intensity={1.2}
              position={[-4, 6, 4]}
              castShadow
            />
            <directionalLight
              color="#fef3c7"
              intensity={0.75}
              position={[5, -2, 3]}
            />
            {children}
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
