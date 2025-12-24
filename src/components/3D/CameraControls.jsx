/**
 * Physics-Aware Camera Controls Component
 * Smooth, inertia-based camera with spring physics and keyboard controls
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useUniverseStore } from '../../state/useUniverseStore.js';
import { useSettingsStore } from '../../state/useSettingsStore.js';
import * as THREE from 'three';

const CameraControls = ({ controlsRef }) => {
  const { camera } = useThree();
  const { 
    cameraPosition, 
    cameraTarget, 
    cameraAnimating,
    setCameraPosition,
    setCameraTarget 
  } = useUniverseStore();
  
  const { cameraDamping, autoRotate, autoRotateSpeed } = useSettingsStore();
  
  // Physics-based camera state
  const cameraVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetPosition = useRef(new THREE.Vector3(...cameraPosition));
  const targetLookAt = useRef(new THREE.Vector3(...cameraTarget));
  const currentPosition = useRef(new THREE.Vector3(...cameraPosition));
  const currentLookAt = useRef(new THREE.Vector3(...cameraTarget));

  // Enhanced camera physics constants
  const CAMERA_SPRING = 0.035;
  const CAMERA_DAMPING = 0.82;
  const MAX_CAMERA_SPEED = 8.0;
  const KEYBOARD_SPEED = 15.0;

  // Keyboard state
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false
  });

  // Update target positions when store changes
  useEffect(() => {
    targetPosition.current.set(...cameraPosition);
    targetLookAt.current.set(...cameraTarget);
  }, [cameraPosition, cameraTarget]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.w = true;
          console.log('W key pressed - Moving forward');
          break;
        case 'KeyA':
          keys.current.a = true;
          console.log('A key pressed - Moving left');
          break;
        case 'KeyS':
          keys.current.s = true;
          console.log('S key pressed - Moving backward');
          break;
        case 'KeyD':
          keys.current.d = true;
          console.log('D key pressed - Moving right');
          break;
        case 'Space':
          keys.current.space = true;
          console.log('Space key pressed - Moving up');
          event.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = true;
          console.log('Shift key pressed - Moving down');
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.w = false;
          break;
        case 'KeyA':
          keys.current.a = false;
          break;
        case 'KeyS':
          keys.current.s = false;
          break;
        case 'KeyD':
          keys.current.d = false;
          break;
        case 'Space':
          keys.current.space = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = false;
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

  // Physics-based smooth camera animation
  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Handle keyboard input
    const keyboardForce = new THREE.Vector3();
    
    if (keys.current.w || keys.current.s || keys.current.a || keys.current.d || keys.current.space || keys.current.shift) {
      // Get camera direction vectors
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      
      camera.getWorldDirection(forward);
      right.crossVectors(forward, up).normalize();
      
      // Apply keyboard forces
      if (keys.current.w) keyboardForce.add(forward.clone().multiplyScalar(KEYBOARD_SPEED));
      if (keys.current.s) keyboardForce.add(forward.clone().multiplyScalar(-KEYBOARD_SPEED));
      if (keys.current.a) keyboardForce.add(right.clone().multiplyScalar(-KEYBOARD_SPEED));
      if (keys.current.d) keyboardForce.add(right.clone().multiplyScalar(KEYBOARD_SPEED));
      if (keys.current.space) keyboardForce.add(up.clone().multiplyScalar(KEYBOARD_SPEED));
      if (keys.current.shift) keyboardForce.add(up.clone().multiplyScalar(-KEYBOARD_SPEED));
      
      // Apply keyboard force to target position
      targetPosition.current.add(keyboardForce.multiplyScalar(delta));
      targetLookAt.current.add(keyboardForce.multiplyScalar(delta));
    }

    // Calculate spring forces for position
    const positionForce = new THREE.Vector3()
      .subVectors(targetPosition.current, currentPosition.current)
      .multiplyScalar(CAMERA_SPRING);
    
    // Apply damping
    const dampingForce = new THREE.Vector3()
      .copy(cameraVelocity.current)
      .multiplyScalar(-CAMERA_DAMPING);
    
    // Update velocity
    cameraVelocity.current.add(positionForce).add(dampingForce);
    
    // Clamp velocity
    if (cameraVelocity.current.length() > MAX_CAMERA_SPEED) {
      cameraVelocity.current.normalize().multiplyScalar(MAX_CAMERA_SPEED);
    }
    
    // Update position
    currentPosition.current.add(
      new THREE.Vector3().copy(cameraVelocity.current).multiplyScalar(delta)
    );
    
    // Calculate spring forces for look-at target
    const targetForce = new THREE.Vector3()
      .subVectors(targetLookAt.current, currentLookAt.current)
      .multiplyScalar(CAMERA_SPRING);
    
    // Apply damping to target velocity
    const targetDampingForce = new THREE.Vector3()
      .copy(targetVelocity.current)
      .multiplyScalar(-CAMERA_DAMPING);
    
    // Update target velocity
    targetVelocity.current.add(targetForce).add(targetDampingForce);
    
    // Clamp target velocity
    if (targetVelocity.current.length() > MAX_CAMERA_SPEED) {
      targetVelocity.current.normalize().multiplyScalar(MAX_CAMERA_SPEED);
    }
    
    // Update look-at target
    currentLookAt.current.add(
      new THREE.Vector3().copy(targetVelocity.current).multiplyScalar(delta)
    );
    
    // Apply to camera
    camera.position.copy(currentPosition.current);
    controlsRef.current.target.copy(currentLookAt.current);
    controlsRef.current.update();

    // Auto-rotate when enabled and not animating (with physics)
    if (autoRotate && !cameraAnimating) {
      const radius = currentPosition.current.distanceTo(currentLookAt.current);
      const angle = state.clock.elapsedTime * 0.1 * autoRotateSpeed;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      targetPosition.current.set(x, currentPosition.current.y, z);
    }
  });

  return null;
};

export default CameraControls;