/**
 * Fast Keyboard Controller
 * High-speed WASD movement for exploring the planet field
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FastKeyboardController = () => {
  const { camera } = useThree();
  const [keys, setKeys] = useState({
    w: false, a: false, s: false, d: false,
    space: false, shift: false
  });
  
  // Reusable vectors for performance
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;
      
      switch (event.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, w: true }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, a: true }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, s: true }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, d: true }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, space: true }));
          event.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys(prev => ({ ...prev, shift: true }));
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, w: false }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, a: false }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, s: false }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, d: false }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, space: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys(prev => ({ ...prev, shift: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Fast movement update
  useFrame((state, delta) => {
    const speed = 50; // Fast movement speed
    const acceleration = 3; // Quick acceleration
    const damping = 0.85; // Smooth deceleration
    
    // Get camera direction vectors
    camera.getWorldDirection(direction.current);
    right.current.crossVectors(direction.current, up.current).normalize();
    
    // Calculate movement based on keys
    const moveVector = new THREE.Vector3();
    
    if (keys.w) moveVector.add(direction.current);
    if (keys.s) moveVector.sub(direction.current);
    if (keys.a) moveVector.sub(right.current);
    if (keys.d) moveVector.add(right.current);
    if (keys.space) moveVector.add(up.current);
    if (keys.shift) moveVector.sub(up.current);
    
    // Normalize and apply speed
    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(speed * acceleration * delta);
      velocity.current.add(moveVector);
    }
    
    // Apply damping
    velocity.current.multiplyScalar(damping);
    
    // Limit max speed
    const maxSpeed = speed;
    if (velocity.current.length() > maxSpeed) {
      velocity.current.normalize().multiplyScalar(maxSpeed);
    }
    
    // Apply movement to camera
    camera.position.add(velocity.current.clone().multiplyScalar(delta));
  });

  return null; // This component only handles movement logic
};

export default FastKeyboardController;