/**
 * Simple Planet Label - Always shows "Click for Data" button
 * Stable positioning that follows planet smoothly
 */

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const SimplePlanetLabel = ({ 
  planetName, 
  position, 
  planetRadius = 15,
  onClick = null
}) => {
  const textGroupRef = useRef();
  const nameTextRef = useRef();
  const buttonTextRef = useRef();
  
  // Calculate stable label positions above planet
  const labelHeight = planetRadius + 25; // Increased distance for better visibility
  const nameHeight = labelHeight + 8; // Name above button
  
  // Make text always face camera with smooth rotation
  useFrame(({ camera }) => {
    if (textGroupRef.current) {
      // Smooth camera-facing rotation
      textGroupRef.current.lookAt(camera.position);
    }
  });
  
  return (
    <group ref={textGroupRef} position={[position[0], position[1], position[2]]}>
      {/* Planet Name - stable positioning */}
      <Text
        ref={nameTextRef}
        position={[0, nameHeight, 0]}
        fontSize={6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.4}
        outlineColor="#000000"
        material-transparent={true}
        material-opacity={0.95}
        maxWidth={80}
        textAlign="center"
        font="/fonts/inter-bold.woff"
      >
        {planetName}
      </Text>
      
      {/* Click Button - stable positioning */}
      <Text
        ref={buttonTextRef}
        position={[0, labelHeight, 0]}
        fontSize={5}
        color="#ff6b6b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.5}
        outlineColor="#000000"
        material-transparent={true}
        material-opacity={1.0}
        maxWidth={100}
        textAlign="center"
        font="/fonts/inter-medium.woff"
        onPointerDown={(e) => {
          e.stopPropagation();
          console.log('SimplePlanetLabel: Text clicked for:', planetName);
          if (onClick) {
            onClick();
          }
        }}
      >
        📊 Click for Data
      </Text>
    </group>
  );
};

export default SimplePlanetLabel;