/**
 * Immersive Camera System
 * Mouse-first free look camera with inertia and smooth zoom
 * No locked FPS controls - pure exploration camera
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';

const ImmersiveCameraSystem = () => {
  const { camera, gl } = useThree();
  const { 
    mode, 
    cameraPosition, 
    cameraTarget, 
    cameraInertia,
    updateCameraPosition,
    updateCameraTarget,
    updateCameraInertia,
    updateEntityVisibility
  } = useVisualizationStore();
  
  // Camera state
  const mouseState = useRef({
    isDown: false,
    lastX: 0,
    lastY: 0,
    deltaX: 0,
    deltaY: 0
  });
  
  const cameraState = useRef({
    spherical: new THREE.Spherical(100, Math.PI / 2, 0),
    target: new THREE.Vector3(0, 0, 0),
    inertia: new THREE.Vector2(0, 0),
    zoomInertia: 0
  });
  
  // Auto-drift state for calm mode
  const driftState = useRef({
    time: 0,
    baseRadius: 100
  });
  
  // Mouse event handlers
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleMouseDown = (event) => {
      if (event.button === 0) { // Left mouse button
        event.preventDefault();
        mouseState.current.isDown = true;
        mouseState.current.lastX = event.clientX;
        mouseState.current.lastY = event.clientY;
        canvas.style.cursor = 'grabbing';
      }
    };
    
    const handleMouseMove = (event) => {
      if (mouseState.current.isDown) {
        event.preventDefault();
        const deltaX = event.clientX - mouseState.current.lastX;
        const deltaY = event.clientY - mouseState.current.lastY;
        
        mouseState.current.deltaX = deltaX;
        mouseState.current.deltaY = deltaY;
        mouseState.current.lastX = event.clientX;
        mouseState.current.lastY = event.clientY;
        
        // Apply rotation with sensitivity
        const sensitivity = 0.008;
        cameraState.current.spherical.theta -= deltaX * sensitivity;
        cameraState.current.spherical.phi += deltaY * sensitivity;
        
        // Clamp phi to prevent flipping
        cameraState.current.spherical.phi = Math.max(
          0.1, 
          Math.min(Math.PI - 0.1, cameraState.current.spherical.phi)
        );
        
        // Add inertia
        cameraState.current.inertia.x = deltaX * 0.015;
        cameraState.current.inertia.y = deltaY * 0.015;
      }
    };
    
    const handleMouseUp = (event) => {
      event.preventDefault();
      mouseState.current.isDown = false;
      canvas.style.cursor = 'grab';
    };
    
    const handleWheel = (event) => {
      event.preventDefault();
      
      const zoomSpeed = 0.1;
      const zoomDelta = event.deltaY * zoomSpeed;
      
      // Apply zoom with limits
      cameraState.current.spherical.radius = Math.max(
        10, 
        Math.min(1000, cameraState.current.spherical.radius + zoomDelta)
      );
      
      // Add zoom inertia
      cameraState.current.zoomInertia = zoomDelta * 0.1;
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // Set initial cursor
    canvas.style.cursor = 'grab';
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.style.cursor = 'default';
    };
  }, [gl]);
  
  // Camera update loop
  useFrame((state, delta) => {
    const dampingFactor = 0.95;
    const autoDriftSpeed = 0.1;
    
    if (mode === VISUALIZATION_MODES.CALM) {
      // Auto-drift in calm mode
      driftState.current.time += delta * autoDriftSpeed;
      
      const driftRadius = driftState.current.baseRadius + Math.sin(driftState.current.time * 0.3) * 20;
      const driftTheta = driftState.current.time * 0.1;
      const driftPhi = Math.PI / 2 + Math.sin(driftState.current.time * 0.2) * 0.3;
      
      // Blend auto-drift with user input
      const userInfluence = mouseState.current.isDown ? 1 : 0.3;
      
      cameraState.current.spherical.radius = THREE.MathUtils.lerp(
        cameraState.current.spherical.radius,
        driftRadius,
        (1 - userInfluence) * delta
      );
      
      cameraState.current.spherical.theta = THREE.MathUtils.lerp(
        cameraState.current.spherical.theta,
        driftTheta,
        (1 - userInfluence) * delta * 0.5
      );
      
      cameraState.current.spherical.phi = THREE.MathUtils.lerp(
        cameraState.current.spherical.phi,
        driftPhi,
        (1 - userInfluence) * delta * 0.3
      );
    }
    
    // Apply inertia damping
    cameraState.current.inertia.multiplyScalar(dampingFactor);
    cameraState.current.zoomInertia *= dampingFactor;
    
    // Continue rotation from inertia
    if (!mouseState.current.isDown) {
      cameraState.current.spherical.theta -= cameraState.current.inertia.x * delta * 10;
      cameraState.current.spherical.phi += cameraState.current.inertia.y * delta * 10;
      cameraState.current.spherical.radius += cameraState.current.zoomInertia * delta * 100;
    }
    
    // Clamp values
    cameraState.current.spherical.phi = Math.max(
      0.1, 
      Math.min(Math.PI - 0.1, cameraState.current.spherical.phi)
    );
    cameraState.current.spherical.radius = Math.max(
      10, 
      Math.min(1000, cameraState.current.spherical.radius)
    );
    
    // Convert spherical to cartesian
    const position = new THREE.Vector3();
    position.setFromSpherical(cameraState.current.spherical);
    position.add(cameraState.current.target);
    
    // Apply to camera
    camera.position.copy(position);
    camera.lookAt(cameraState.current.target);
    
    // Update store
    updateCameraPosition([position.x, position.y, position.z]);
    updateCameraTarget([
      cameraState.current.target.x,
      cameraState.current.target.y,
      cameraState.current.target.z
    ]);
    updateCameraInertia({
      x: cameraState.current.inertia.x,
      y: cameraState.current.inertia.y,
      zoom: cameraState.current.zoomInertia
    });
    
    // Update entity visibility based on camera position
    updateEntityVisibility([position.x, position.y, position.z]);
  });
  
  return null; // This component only handles camera logic
};

export default ImmersiveCameraSystem;