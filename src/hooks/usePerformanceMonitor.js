/**
 * Performance Monitoring Hook
 * Tracks FPS, frame times, and provides optimization recommendations
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitor = (enabled = true) => {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  const [quality, setQuality] = useState('high');
  const [recommendations, setRecommendations] = useState([]);

  const frameTimes = useRef([]);
  const lastFrameTime = useRef(performance.now());
  const frameCount = useRef(0);
  const animationFrameRef = useRef();

  const updatePerformance = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    const delta = now - lastFrameTime.current;
    lastFrameTime.current = now;

    // Track frame times (keep last 60 frames)
    frameTimes.current.push(delta);
    if (frameTimes.current.length > 60) {
      frameTimes.current.shift();
    }

    // Calculate average frame time and FPS
    const avgFrameTime = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
    const currentFPS = Math.round(1000 / avgFrameTime);

    setFrameTime(avgFrameTime);
    setFps(currentFPS);

    // Determine quality level
    let newQuality = 'high';
    const newRecommendations = [];

    if (currentFPS < 30) {
      newQuality = 'low';
      newRecommendations.push('Consider reducing particle density');
      newRecommendations.push('Disable post-processing effects');
      newRecommendations.push('Reduce visible objects count');
    } else if (currentFPS < 45) {
      newQuality = 'medium';
      newRecommendations.push('Consider reducing bloom strength');
      newRecommendations.push('Enable adaptive quality');
    } else if (currentFPS >= 60) {
      newQuality = 'high';
    }

    setQuality(newQuality);
    setRecommendations(newRecommendations);

    frameCount.current++;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const monitor = () => {
      updatePerformance();
      animationFrameRef.current = requestAnimationFrame(monitor);
    };

    animationFrameRef.current = requestAnimationFrame(monitor);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, updatePerformance]);

  // Get performance stats
  const getStats = useCallback(() => {
    return {
      fps,
      frameTime,
      quality,
      recommendations,
      frameCount: frameCount.current
    };
  }, [fps, frameTime, quality, recommendations]);

  // Reset counters
  const reset = useCallback(() => {
    frameTimes.current = [];
    frameCount.current = 0;
    lastFrameTime.current = performance.now();
  }, []);

  return {
    fps,
    frameTime,
    quality,
    recommendations,
    getStats,
    reset
  };
};

export default usePerformanceMonitor;

