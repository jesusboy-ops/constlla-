/**
 * Professional Cinematic Camera System
 * Smooth, elegant camera movements for immersive universe exploration
 * Enhanced for professional astronomical viewing experience
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useVisualizationStore, VISUALIZATION_MODES, MOTION_PHASES } from '../../state/useVisualizationStore.js';
import * as THREE from 'three';

const CinematicCameraSystem = () => {
  const { camera, gl } = useThree();
  const { mode, phase, updateCameraPosition } = useVisualizationStore();
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(new THREE.Vector3());
  const userControlRef = useRef(false);
  const lastUserInputRef = useRef(0);
  
  // Professional auto-movement parameters
  const autoMovementRef = useRef({ 
    angle: 0, 
    verticalAngle: 0,
    radius: mode === VISUALIZATION_MODES.CALM ? 400 : 180,
    initialized: false,
    lookAtTarget: new THREE.Vector3(0, 0, 0)
  });
  
  // Enhanced mouse movement tracking
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      userControlRef.current = true;
      lastUserInputRef.current = Date.now();
    };
    
    const handleWheel = (event) => {
      if (mode !== VISUALIZATION_MODES.EXPLORE) return;
      
      event.preventDefault();
      const zoomSpeed = 0.08;
      const zoomDelta = event.deltaY * zoomSpeed;
      
      // Enhanced zoom bounds for better viewing
      const minZ = 80;
      const maxZ = 300;
      
      targetRef.current.z += zoomDelta;
      targetRef.current.z = Math.max(minZ, Math.min(targetRef.current.z, maxZ));
      
      userControlRef.current = true;
      lastUserInputRef.current = Date.now();
    };
    
    if (mode === VISUALIZATION_MODES.EXPLORE) {
      gl.domElement.addEventListener('mousemove', handleMouseMove);
      gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl, mode, phase]);
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const timeSinceLastInput = Date.now() - lastUserInputRef.current;
    
    // Initialize professional camera position
    if (!autoMovementRef.current.initialized) {
      if (mode === VISUALIZATION_MODES.CALM) {
        // Professional universe viewing position
        targetRef.current.set(350, 100, 250);
        camera.position.copy(targetRef.current);
        autoMovementRef.current.lookAtTarget.set(0, 0, 0);
      } else {
        // Explorer mode - start FAR AWAY so users must navigate toward planets
        targetRef.current.set(0, 100, 800);
        camera.position.copy(targetRef.current);
        autoMovementRef.current.lookAtTarget.set(0, 0, 0);
      }
      autoMovementRef.current.initialized = true;
    }
    
    // FROZEN phase: Stable viewing position
    if (phase === MOTION_PHASES.FROZEN && mode === VISUALIZATION_MODES.EXPLORE) {
      if (!camera.position.equals(targetRef.current)) {
        camera.position.copy(targetRef.current);
        camera.lookAt(autoMovementRef.current.lookAtTarget);
      }
      
      // Allow precise user controls for inspection
      if (userControlRef.current && timeSinceLastInput < 5000) {
        const sensitivity = 60;
        const maxOffset = 100;
        
        const offsetX = Math.max(-maxOffset, Math.min(maxOffset, mouseRef.current.x * sensitivity));
        const offsetY = Math.max(-maxOffset, Math.min(maxOffset, mouseRef.current.y * sensitivity));
        
        const newPosition = new THREE.Vector3(
          targetRef.current.x + offsetX,
          targetRef.current.y + offsetY,
          targetRef.current.z
        );
        
        camera.position.lerp(newPosition, delta * 3);
        camera.lookAt(autoMovementRef.current.lookAtTarget);
      }
      
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
      return;
    }
    
    // Professional cinematic movement for CALM mode (universe page)
    if (mode === VISUALIZATION_MODES.CALM) {
      // Elegant, slow orbital movement
      autoMovementRef.current.angle += delta * 0.08; // Very slow rotation
      autoMovementRef.current.verticalAngle += delta * 0.05; // Gentle vertical motion
      
      const radius = 400 + Math.sin(time * 0.1) * 50; // Breathing distance
      const height = 100 + Math.sin(autoMovementRef.current.verticalAngle) * 80; // Vertical variation
      
      const x = Math.cos(autoMovementRef.current.angle) * radius;
      const z = Math.sin(autoMovementRef.current.angle) * radius;
      const y = height;
      
      targetRef.current.set(x, y, z);
      
      // Smooth camera movement
      camera.position.lerp(targetRef.current, delta * 0.5);
      
      // Professional look-at with slight offset for interest
      const lookAtOffset = new THREE.Vector3(
        Math.sin(time * 0.15) * 20,
        Math.cos(time * 0.12) * 15,
        Math.sin(time * 0.18) * 10
      );
      
      autoMovementRef.current.lookAtTarget.copy(lookAtOffset);
      camera.lookAt(autoMovementRef.current.lookAtTarget);
      
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
      return;
    }
    
    // Explorer mode with user interaction
    if (mode === VISUALIZATION_MODES.EXPLORE) {
      // Return to auto-movement after user inactivity
      if (timeSinceLastInput > 6000) {
        userControlRef.current = false;
        
        // Gentle auto-movement in explorer mode - start from far position
        autoMovementRef.current.angle += delta * 0.05;
        const radius = 600 + Math.sin(time * 0.08) * 100; // Much farther out
        const height = 100 + Math.sin(time * 0.06) * 50;
        
        const autoX = Math.cos(autoMovementRef.current.angle) * radius;
        const autoZ = Math.sin(autoMovementRef.current.angle) * radius;
        const autoY = height;
        
        targetRef.current.set(autoX, autoY, autoZ);
      } else if (userControlRef.current) {
        // User-controlled movement - start from far position
        const sensitivity = 80;
        const maxOffset = 200; // Increased range for far viewing
        
        const offsetX = Math.max(-maxOffset, Math.min(maxOffset, mouseRef.current.x * sensitivity));
        const offsetY = Math.max(-maxOffset, Math.min(maxOffset, mouseRef.current.y * sensitivity));
        
        targetRef.current.x = 0 + offsetX; // Start from far position (0, 100, 800)
        targetRef.current.y = 100 + offsetY;
        // Z is controlled by wheel
      }
      
      // Smooth camera movement
      camera.position.lerp(targetRef.current, delta * 2);
      camera.lookAt(autoMovementRef.current.lookAtTarget);
      
      updateCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    }
  });
  
  return null;
};

export default CinematicCameraSystem;