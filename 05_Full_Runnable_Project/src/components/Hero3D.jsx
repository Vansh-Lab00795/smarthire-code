import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingIcosahedron() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.35}
          emissive="#6366f1"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

function OrbitingSphere({ radius, speed, size, color, offset }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed + offset;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.y = Math.sin(t * 0.7) * radius * 0.4;
      meshRef.current.position.z = Math.sin(t) * radius;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <MeshDistortMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        transparent
        opacity={0.8}
        distort={0.3}
        speed={2}
      />
    </mesh>
  );
}

function ParticleField() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const pointsRef = useRef();

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#818cf8"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  const orbitingSpheres = [
    { radius: 3.5, speed: 0.5, size: 0.12, color: '#818cf8', offset: 0 },
    { radius: 4.0, speed: 0.3, size: 0.08, color: '#a78bfa', offset: 2 },
    { radius: 3.0, speed: 0.7, size: 0.15, color: '#6366f1', offset: 4 },
    { radius: 4.5, speed: 0.4, size: 0.1, color: '#c4b5fd', offset: 1 },
    { radius: 3.8, speed: 0.6, size: 0.06, color: '#93c5fd', offset: 3 },
    { radius: 2.8, speed: 0.45, size: 0.09, color: '#818cf8', offset: 5 },
    { radius: 5.0, speed: 0.25, size: 0.11, color: '#a5b4fc', offset: 1.5 },
    { radius: 3.2, speed: 0.55, size: 0.07, color: '#7c3aed', offset: 3.5 },
  ];

  return (
    <>
      <ambientLight intensity={0.15} color="#818cf8" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#6366f1" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#7c3aed" />
      <pointLight position={[0, 0, 5]} intensity={0.2} color="#818cf8" />

      <FloatingIcosahedron />

      {orbitingSpheres.map((props, i) => (
        <OrbitingSphere key={i} {...props} />
      ))}

      <ParticleField />

      <Stars
        radius={50}
        depth={50}
        count={1500}
        factor={3}
        saturation={0.5}
        fade
        speed={0.5}
      />
    </>
  );
}

function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default Hero3D;
