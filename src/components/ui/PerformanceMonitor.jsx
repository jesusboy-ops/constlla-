/**
 * Performance Monitor
 * Shows FPS and performance metrics in development
 * This version works outside the Canvas using requestAnimationFrame
 */

import { useState, useRef, useEffect } from 'react';

const PerformanceMonitor = ({ enabled = false }) => {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const frameTimes = useRef([]);
  const animationId = useRef();
  
  useEffect(() => {
    if (!enabled) return;
    
    const animate = () => {
      const now = Date.now();
      const currentFrameTime = now - lastTime.current;
      
      frameCount.current++;
      frameTimes.current.push(currentFrameTime);
      
      // Keep only last 60 frame times
      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }
      
      // Update FPS every second
      if (frameCount.current >= 60) {
        const avgFrameTime = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
        const currentFps = Math.round(1000 / avgFrameTime);
        
        setFps(currentFps);
        setFrameTime(avgFrameTime);
        
        frameCount.current = 0;
      }
      
      lastTime.current = now;
      animationId.current = requestAnimationFrame(animate);
    };
    
    animationId.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [enabled]);
  
  if (!enabled) return null;
  
  const fpsColor = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className="fixed top-20 right-4 z-50 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs font-mono pointer-events-auto">
      <div className="text-white/70 mb-1">Performance</div>
      <div className={`${fpsColor} font-bold`}>
        {fps} FPS
      </div>
      <div className="text-white/50">
        {frameTime.toFixed(1)}ms
      </div>
    </div>
  );
};

export default PerformanceMonitor;