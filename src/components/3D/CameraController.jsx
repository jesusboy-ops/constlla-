/**
 * WASD + Mouse Look Camera Controller
 * Smooth, professional camera movement with acceleration and damping
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../state/useSettingsStore.js';

const CameraController = () => {
  const { camera } = useThree();
  const { cameraSpeed } = useSettingsStore();
  
  // Movement state
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  });

  // Velocity and damping
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const speed = useRef(0);
  const maxSpeed = 5;
  const acceleration = 0.2;
  const damping = 0.85;

  // Mouse look state
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const PI_2 = Math.PI / 2;
  const sensitivity = 0.002;
  const isMousePressed = useRef(false);

  // Initialize camera rotation
  useEffect(() => {
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  // Keyboard handlers
  const handleKeyDown = useCallback((event) => {
    switch (event.code) {
      case 'KeyW': moveState.current.forward = true; break;
      case 'KeyS': moveState.current.backward = true; break;
      case 'KeyA': moveState.current.left = true; break;
      case 'KeyD': moveState.current.right = true; break;
      case 'Space': moveState.current.up = true; event.preventDefault(); break;
      case 'ShiftLeft': moveState.current.down = true; break;
    }
  }, []);

  const handleKeyUp = useCallback((event) => {
    switch (event.code) {
      case 'KeyW': moveState.current.forward = false; break;
      case 'KeyS': moveState.current.backward = false; break;
      case 'KeyA': moveState.current.left = false; break;
      case 'KeyD': moveState.current.right = false; break;
      case 'Space': moveState.current.up = false; event.preventDefault(); break;
      case 'ShiftLeft': moveState.current.down = false; break;
    }
  }, []);

  // Mouse look handlers - simple mouse movement without pointer lock
  const handleMouseMove = useCallback((event) => {
    if (!isMousePressed.current) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    euler.current.setFromQuaternion(camera.quaternion);
    euler.current.y -= movementX * sensitivity;
    euler.current.x -= movementY * sensitivity;

    // Prevent gimbal lock
    euler.current.x = Math.max(-PI_2, Math.min(PI_2, euler.current.x));

    camera.quaternion.setFromEuler(euler.current);
  }, [camera]);

  const handleMouseDown = useCallback(() => {
    isMousePressed.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isMousePressed.current = false;
  }, []);

  // Setup event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);

    // Mouse button events for camera look
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.style.cursor = 'crosshair';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleMouseUp]);

  // Update movement each frame
  useFrame((state, delta) => {
    const { forward, backward, left, right, up, down } = moveState.current;

    // Calculate movement direction
    direction.current.set(0, 0, 0);

    if (forward) direction.current.z -= 1;
    if (backward) direction.current.z += 1;
    if (left) direction.current.x -= 1;
    if (right) direction.current.x += 1;
    if (up) direction.current.y += 1;
    if (down) direction.current.y -= 1;

    // Normalize direction
    if (direction.current.length() > 0) {
      direction.current.normalize();
      
      // Apply camera rotation to movement direction
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      
      const rightVector = new THREE.Vector3();
      rightVector.crossVectors(cameraDirection, camera.up).normalize();
      
      const forwardVector = cameraDirection.clone();
      forwardVector.y = 0; // Keep movement horizontal
      forwardVector.normalize();
      
      const movement = new THREE.Vector3();
      movement.addScaledVector(forwardVector, direction.current.z);
      movement.addScaledVector(rightVector, direction.current.x);
      movement.y = direction.current.y;

      // Accelerate
      speed.current = Math.min(speed.current + acceleration * delta * 60, maxSpeed);
      velocity.current.copy(movement.multiplyScalar(speed.current * cameraSpeed));
    } else {
      // Decelerate
      speed.current *= damping;
      velocity.current.multiplyScalar(damping);
      
      // Stop if velocity is very small
      if (velocity.current.length() < 0.01) {
        velocity.current.set(0, 0, 0);
        speed.current = 0;
      }
    }

    // Apply velocity to camera
    camera.position.addScaledVector(velocity.current, delta);
  });

  return null;
};

export default CameraController;

