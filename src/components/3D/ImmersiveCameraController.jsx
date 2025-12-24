/**
 * Immersive Camera Controller
 * Handles space-travel camera system with performance optimization
 * - No expensive per-frame calculations
 * - Reuses vectors and objects
 * - Fixed timestep for consistent physics
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCameraStore, CAMERA_MODES } from '../../state/useCameraStore.js';

const ImmersiveCameraController = () => {
  const { camera } = useThree();
  const { 
    updateCamera, 
    setKeys, 
    setMouseInput, 
    mode 
  } = useCameraStore();
  
  // Performance: track mouse movement with throttling
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseUpdate = useRef(0);
  const MOUSE_THROTTLE = 16; // ~60fps
  
  // Keyboard input handling
  useEffect(() => {
    const { undock } = useCameraStore.getState();
    
    const handleKeyDown = (event) => {
      if (event.repeat) return; // Ignore key repeat
      
      // ESC key for undocking
      if (event.code === 'Escape' && mode === CAMERA_MODES.DOCKED_ORBIT) {
        event.preventDefault();
        undock();
        return;
      }
      
      const keyMap = {
        'KeyW': 'w',
        'KeyA': 'a', 
        'KeyS': 's',
        'KeyD': 'd',
        'Space': 'space',
        'ShiftLeft': 'shift',
        'ShiftRight': 'shift'
      };
      
      const key = keyMap[event.code];
      if (key) {
        event.preventDefault();
        setKeys(prev => ({ ...prev, [key]: true }));
      }
    };
    
    const handleKeyUp = (event) => {
      const keyMap = {
        'KeyW': 'w',
        'KeyA': 'a',
        'KeyS': 's', 
        'KeyD': 'd',
        'Space': 'space',
        'ShiftLeft': 'shift',
        'ShiftRight': 'shift'
      };
      
      const key = keyMap[event.code];
      if (key) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKeys]);
  
  // Mouse input handling (throttled for performance)
  useEffect(() => {
    const handleMouseMove = (event) => {
      const now = Date.now();
      if (now - lastMouseUpdate.current < MOUSE_THROTTLE) return;
      
      // Only update mouse input in FREE_TRAVEL mode for steering
      if (mode === CAMERA_MODES.FREE_TRAVEL) {
        // Normalize mouse movement to [-1, 1] range
        const x = (event.movementX || 0) * 0.002;
        const y = (event.movementY || 0) * 0.002;
        
        // Clamp values
        mouseRef.current.x = Math.max(-1, Math.min(1, x));
        mouseRef.current.y = Math.max(-1, Math.min(1, y));
        
        setMouseInput(mouseRef.current);
        lastMouseUpdate.current = now;
      }
    };
    
    // Reset mouse input when not in free travel
    if (mode !== CAMERA_MODES.FREE_TRAVEL) {
      mouseRef.current = { x: 0, y: 0 };
      setMouseInput(mouseRef.current);
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mode, setMouseInput]);
  
  // Main camera update loop (performance critical)
  useFrame((state, delta) => {
    // Fixed timestep for consistent physics (max 60fps)
    const fixedDelta = Math.min(delta, 1/60);
    
    // Update camera physics
    updateCamera(fixedDelta, camera);
    
    // Decay mouse input for smooth steering
    if (mode === CAMERA_MODES.FREE_TRAVEL) {
      mouseRef.current.x *= 0.9;
      mouseRef.current.y *= 0.9;
      
      // Only update if significant change (avoid unnecessary updates)
      if (Math.abs(mouseRef.current.x) > 0.001 || Math.abs(mouseRef.current.y) > 0.001) {
        setMouseInput(mouseRef.current);
      }
    }
  });
  
  return null; // This component only handles camera logic
};

export default ImmersiveCameraController;