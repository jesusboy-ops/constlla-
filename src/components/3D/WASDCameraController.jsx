/**
 * WASD Camera Controller - Mouse-Hold Movement System
 * Proper first-person style controls for exploring scattered planets
 * Mouse must be held down to look around, WASD for movement
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useVisualizationStore, VISUALIZATION_MODES, MOTION_PHASES } from '../../state/useVisualizationStore.js';
import * as THREE from 'three';

const WASDCameraController = ({ onCameraUpdate }) => {
  const { camera, gl } = useThree();
  const { mode, phase, updateCameraPosition } = useVisualizationStore();
  
  // Camera state
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  
  // Input state
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  });
  
  const mouseRef = useRef({
    isPressed: false,
    x: 0,
    y: 0,
    sensitivity: 0.002
  });
  
  // Camera parameters
  const [cameraParams] = useState({
    moveSpeed: 150, // Increased for faster exploration
    fastMoveSpeed: 300, // Much faster with shift
    damping: 0.1,
    maxPitch: Math.PI / 2 - 0.1
  });
  
  // Mobile camera control event listener
  useEffect(() => {
    const handleMobileCameraMove = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      const { direction } = event.detail;
      const moveSpeed = 15; // Mobile movement speed
      
      console.log('Mobile camera move:', direction); // Debug log
      
      // Get camera vectors
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0); // World up vector
      
      camera.getWorldDirection(forward);
      right.crossVectors(forward, up).normalize();
      
      // Apply movement based on direction - CORRECTED MAPPING
      switch (direction) {
        case 'up':
          // Up button should move camera UP in world space (Y+)
          camera.position.y += moveSpeed;
          console.log('Moving UP (Y+)');
          break;
        case 'down':
          // Down button should move camera DOWN in world space (Y-)
          camera.position.y -= moveSpeed;
          console.log('Moving DOWN (Y-)');
          break;
        case 'left':
          // Left button should move camera LEFT relative to view direction
          camera.position.add(right.multiplyScalar(-moveSpeed));
          console.log('Moving LEFT');
          break;
        case 'right':
          // Right button should move camera RIGHT relative to view direction
          camera.position.add(right.multiplyScalar(moveSpeed));
          console.log('Moving RIGHT');
          break;
        case 'forward':
          // Forward button should move camera FORWARD in view direction
          camera.position.add(forward.multiplyScalar(moveSpeed));
          console.log('Moving FORWARD');
          break;
        case 'backward':
          // Backward button should move camera BACKWARD in view direction
          camera.position.add(forward.multiplyScalar(-moveSpeed));
          console.log('Moving BACKWARD');
          break;
      }
      
      // Update store
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    };
    
    // Listen for mobile camera movement events
    window.addEventListener('mobile-camera-move', handleMobileCameraMove);
    
    return () => {
      window.removeEventListener('mobile-camera-move', handleMobileCameraMove);
    };
  }, [mode, camera, updateCameraPosition]);

  // Initialize camera position for scattered exploration
  useEffect(() => {
    if (mode === VISUALIZATION_MODES.EXPLORE) {
      // Start camera FAR AWAY so users must navigate toward planets using WASD
      camera.position.set(0, 100, 800); // Much farther away - requires navigation
      camera.lookAt(0, 0, 0);
      
      // Initialize euler angles from camera rotation
      eulerRef.current.setFromQuaternion(camera.quaternion);
      
      console.log('WASDCameraController: Camera positioned at [0, 30, 150] for planet viewing');
    }
  }, [mode, camera]);
  
  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = true;
          break;
        case 'KeyQ':
        case 'Space':
          keysRef.current.up = true;
          break;
        case 'KeyE':
        case 'ShiftLeft':
          keysRef.current.down = true;
          break;
      }
    };
    
    const handleKeyUp = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = false;
          break;
        case 'KeyQ':
        case 'Space':
          keysRef.current.up = false;
          break;
        case 'KeyE':
        case 'ShiftLeft':
          keysRef.current.down = false;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode]);
  
  // Mouse and Touch event handlers - unified input system
  useEffect(() => {
    // Touch state for mobile gestures
    const touchRef = {
      isActive: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      touchCount: 0,
      initialDistance: 0,
      lastDistance: 0
    };

    const handleMouseDown = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      // Check if the click is on a UI element or 3D text
      const target = event.target;
      if (target && (target.tagName === 'CANVAS')) {
        // Only handle mouse down on canvas, not on UI elements
        if (event.button === 0) { // Left mouse button
          mouseRef.current.isPressed = true;
        }
      }
    };
    
    const handleMouseUp = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      if (event.button === 0) {
        mouseRef.current.isPressed = false;
      }
    };
    
    const handleMouseMove = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE || !mouseRef.current.isPressed) return;
      
      // Use regular mouse movement instead of pointer lock movement
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      
      // Update euler angles
      eulerRef.current.y -= movementX * mouseRef.current.sensitivity;
      eulerRef.current.x -= movementY * mouseRef.current.sensitivity;
      
      // Clamp pitch
      eulerRef.current.x = Math.max(
        -cameraParams.maxPitch,
        Math.min(cameraParams.maxPitch, eulerRef.current.x)
      );
      
      // Apply rotation to camera
      camera.quaternion.setFromEuler(eulerRef.current);
    };

    // Touch event handlers for mobile
    const handleTouchStart = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      const target = event.target;
      if (target && target.tagName === 'CANVAS') {
        event.preventDefault(); // Prevent default touch behaviors
        
        const touches = event.touches;
        touchRef.touchCount = touches.length;
        touchRef.isActive = true;
        
        if (touches.length === 1) {
          // Single finger - rotation
          touchRef.startX = touches[0].clientX;
          touchRef.startY = touches[0].clientY;
          touchRef.lastX = touches[0].clientX;
          touchRef.lastY = touches[0].clientY;
        } else if (touches.length === 2) {
          // Two fingers - zoom (pinch)
          const dx = touches[0].clientX - touches[1].clientX;
          const dy = touches[0].clientY - touches[1].clientY;
          touchRef.initialDistance = Math.sqrt(dx * dx + dy * dy);
          touchRef.lastDistance = touchRef.initialDistance;
        }
      }
    };

    const handleTouchMove = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE || !touchRef.isActive) return;
      
      const target = event.target;
      if (target && target.tagName === 'CANVAS') {
        event.preventDefault();
        
        const touches = event.touches;
        
        if (touches.length === 1 && touchRef.touchCount === 1) {
          // Single finger rotation - similar to mouse drag
          const currentX = touches[0].clientX;
          const currentY = touches[0].clientY;
          
          const deltaX = currentX - touchRef.lastX;
          const deltaY = currentY - touchRef.lastY;
          
          // Apply rotation with touch sensitivity (slightly higher than mouse)
          const touchSensitivity = mouseRef.current.sensitivity * 1.5;
          eulerRef.current.y -= deltaX * touchSensitivity;
          eulerRef.current.x -= deltaY * touchSensitivity;
          
          // Clamp pitch
          eulerRef.current.x = Math.max(
            -cameraParams.maxPitch,
            Math.min(cameraParams.maxPitch, eulerRef.current.x)
          );
          
          // Apply rotation to camera
          camera.quaternion.setFromEuler(eulerRef.current);
          
          touchRef.lastX = currentX;
          touchRef.lastY = currentY;
        } else if (touches.length === 2 && touchRef.touchCount === 2) {
          // Two finger pinch zoom
          const dx = touches[0].clientX - touches[1].clientX;
          const dy = touches[0].clientY - touches[1].clientY;
          const currentDistance = Math.sqrt(dx * dx + dy * dy);
          
          const deltaDistance = currentDistance - touchRef.lastDistance;
          const zoomFactor = deltaDistance * 0.01; // Adjust zoom sensitivity
          
          // Move camera forward/backward based on pinch
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.multiplyScalar(-zoomFactor * 10); // Negative for natural pinch direction
          
          camera.position.add(forward);
          
          touchRef.lastDistance = currentDistance;
        }
      }
    };

    const handleTouchEnd = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      const target = event.target;
      if (target && target.tagName === 'CANVAS') {
        event.preventDefault();
        
        if (event.touches.length === 0) {
          touchRef.isActive = false;
          touchRef.touchCount = 0;
        } else {
          // Update touch count for remaining touches
          touchRef.touchCount = event.touches.length;
        }
      }
    };
    
    if (mode === VISUALIZATION_MODES.EXPLORE) {
      // Mouse events
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
      
      // Touch events for mobile
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    return () => {
      // Clean up mouse events
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      
      // Clean up touch events
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mode, gl, camera, cameraParams]);
  
  // Camera movement logic
  useFrame((_, delta) => {
    if (mode !== VISUALIZATION_MODES.EXPLORE) return;
    
    // FROZEN phase: Allow manual movement but no automatic motion
    if (phase === MOTION_PHASES.FROZEN) {
      // Still allow WASD movement for exploration
    }
    
    // Calculate movement direction
    directionRef.current.set(0, 0, 0);
    
    // Get camera forward/right vectors
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    camera.getWorldDirection(forward);
    right.crossVectors(forward, camera.up).normalize();
    
    // WASD movement
    if (keysRef.current.forward) {
      directionRef.current.add(forward);
    }
    if (keysRef.current.backward) {
      directionRef.current.sub(forward);
    }
    if (keysRef.current.right) {
      directionRef.current.add(right);
    }
    if (keysRef.current.left) {
      directionRef.current.sub(right);
    }
    if (keysRef.current.up) {
      directionRef.current.add(camera.up);
    }
    if (keysRef.current.down) {
      directionRef.current.sub(camera.up);
    }
    
    // Normalize direction and apply speed
    if (directionRef.current.length() > 0) {
      directionRef.current.normalize();
      
      // Check for fast movement (Shift key)
      const isShiftPressed = keysRef.current.down; // Using 'E' as shift alternative
      const currentSpeed = isShiftPressed ? cameraParams.fastMoveSpeed : cameraParams.moveSpeed;
      
      // Phase-dependent speed multiplier
      let speedMultiplier = 1.0;
      switch (phase) {
        case MOTION_PHASES.FROZEN:
          speedMultiplier = 0.0; // No movement when frozen
          break;
        default:
          speedMultiplier = 1.0;
      }
      
      directionRef.current.multiplyScalar(currentSpeed * speedMultiplier * delta);
      
      // Apply movement with damping
      velocityRef.current.lerp(directionRef.current, 1 - Math.pow(cameraParams.damping, delta));
    } else {
      // Apply damping when no input
      velocityRef.current.multiplyScalar(Math.pow(cameraParams.damping, delta));
    }
    
    // Apply velocity to camera position
    camera.position.add(velocityRef.current);
    
    // Update store
    updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    
    // Notify parent component about camera position
    if (onCameraUpdate) {
      onCameraUpdate([camera.position.x, camera.position.y, camera.position.z]);
    }
  });
  
  return null;
};

export default WASDCameraController;