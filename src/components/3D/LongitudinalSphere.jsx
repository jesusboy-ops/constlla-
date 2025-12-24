/**
 * Longitudinal Line Sphere Component
 * Creates spheres made of vertical lines (meridians) running top to bottom
 * Like magnetic field lines or planetary meridians
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LongitudinalSphere = ({ 
  position = [0, 0, 0], 
  radius = 15, 
  lineCount = 24,
  color = '#ffffff',
  opacity = 0.8,
  rotationSpeed = 0.1,
  onHover = null,
  onClick = null,
  planet = null
}) => {
  const groupRef = useRef();
  
  // Create the longitudinal lines geometry
  const linesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];
    
    // Number of points per line (vertical resolution)
    const pointsPerLine = 32;
    
    // Create vertical lines around the sphere
    for (let i = 0; i < lineCount; i++) {
      const longitude = (i / lineCount) * Math.PI * 2; // 0 to 360 degrees
      
      // Create points from top to bottom of sphere
      for (let j = 0; j <= pointsPerLine; j++) {
        const latitude = (j / pointsPerLine) * Math.PI - Math.PI / 2; // -90 to +90 degrees
        
        // Convert spherical coordinates to cartesian
        const x = radius * Math.cos(latitude) * Math.cos(longitude);
        const y = radius * Math.sin(latitude);
        const z = radius * Math.cos(latitude) * Math.sin(longitude);
        
        positions.push(x, y, z);
      }
      
      // Create line indices for this meridian
      const startIndex = i * (pointsPerLine + 1);
      for (let j = 0; j < pointsPerLine; j++) {
        indices.push(startIndex + j, startIndex + j + 1);
      }
    }
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    return geometry;
  }, [radius, lineCount]);
  
  // Animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
      
      // Subtle breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1;
      groupRef.current.scale.setScalar(breathe);
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerEnter={() => onHover && onHover(planet)}
      onPointerLeave={() => onHover && onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(planet);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Longitudinal lines */}
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial
          color={color}
          transparent={true}
          opacity={opacity}
          linewidth={1}
        />
      </lineSegments>
      
      {/* Optional invisible sphere for better click detection */}
      <mesh visible={false}>
        <sphereGeometry args={[radius, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default LongitudinalSphere;