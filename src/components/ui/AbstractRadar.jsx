/**
 * Abstract Radar System
 * Shows blockchain activity patterns, not a minimap
 * Displays: block density, activity bursts, major entities
 */

import { useRef, useEffect } from 'react';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';

const AbstractRadar = () => {
  const canvasRef = useRef();
  const animationRef = useRef();
  
  const { 
    mode,
    cameraPosition,
    stars,
    planets,
    blockchainData
  } = useVisualizationStore();
  
  // Radar configuration
  const RADAR_SIZE = 140;
  const CENTER = RADAR_SIZE / 2;
  const DETECTION_RANGE = 300;
  
  useEffect(() => {
    if (mode !== VISUALIZATION_MODES.EXPLORE) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const drawRadar = () => {
      // Clear canvas
      ctx.clearRect(0, 0, RADAR_SIZE, RADAR_SIZE);
      
      // Radar background
      const gradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, CENTER - 5);
      gradient.addColorStop(0, 'rgba(0, 30, 60, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 15, 30, 0.4)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, CENTER - 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Concentric circles (activity zones)
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, (CENTER - 5) * (i / 4), 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Activity density visualization
      drawActivityDensity(ctx);
      
      // Major entities (contracts/validators)
      drawMajorEntities(ctx);
      
      // Activity bursts
      drawActivityBursts(ctx);
      
      // Radar border
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, CENTER - 5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Center indicator
      ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 2, 0, Math.PI * 2);
      ctx.fill();
      
      animationRef.current = requestAnimationFrame(drawRadar);
    };
    
    const drawActivityDensity = (ctx) => {
      // Calculate block density in sectors
      const sectors = 8;
      const densities = new Array(sectors).fill(0);
      
      stars.forEach((star) => {
        if (!star.visible) return;
        
        const relativePos = [
          star.position[0] - cameraPosition[0],
          star.position[2] - cameraPosition[2]
        ];
        
        const distance = Math.sqrt(relativePos[0]**2 + relativePos[1]**2);
        if (distance > DETECTION_RANGE) return;
        
        const angle = Math.atan2(relativePos[1], relativePos[0]);
        const sectorIndex = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * sectors) % sectors;
        
        densities[sectorIndex] += star.transactions / 100;
      });
      
      // Draw density as colored sectors
      for (let i = 0; i < sectors; i++) {
        const density = Math.min(densities[i], 1);
        if (density < 0.1) continue;
        
        const startAngle = (i / sectors) * Math.PI * 2 - Math.PI / 2;
        const endAngle = ((i + 1) / sectors) * Math.PI * 2 - Math.PI / 2;
        
        const alpha = density * 0.4;
        const hue = 200 + density * 60; // Blue to cyan based on density
        
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.arc(CENTER, CENTER, CENTER - 10, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }
    };
    
    const drawMajorEntities = (ctx) => {
      planets.forEach((planet) => {
        if (!planet.visible) return;
        
        const relativePos = [
          planet.position[0] - cameraPosition[0],
          planet.position[2] - cameraPosition[2]
        ];
        
        const distance = Math.sqrt(relativePos[0]**2 + relativePos[1]**2);
        if (distance > DETECTION_RANGE) return;
        
        // Convert to radar coordinates
        const radarX = CENTER + (relativePos[0] / DETECTION_RANGE) * (CENTER - 15);
        const radarY = CENTER + (relativePos[1] / DETECTION_RANGE) * (CENTER - 15);
        
        // Entity size based on importance
        const entitySize = 3 + (planet.complexity / 25);
        
        // Draw entity
        ctx.fillStyle = planet.verified ? 
          'rgba(100, 255, 150, 0.8)' : 
          'rgba(255, 200, 100, 0.6)';
        
        ctx.beginPath();
        ctx.arc(radarX, radarY, entitySize, 0, Math.PI * 2);
        ctx.fill();
        
        // Activity ring for high-activity contracts
        if (planet.dailyTransactions > 500) {
          const time = Date.now() * 0.003;
          const pulse = Math.sin(time) * 0.3 + 0.7;
          
          ctx.strokeStyle = `rgba(100, 255, 150, ${pulse * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(radarX, radarY, entitySize + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };
    
    const drawActivityBursts = (ctx) => {
      // Simulate incoming activity (would be real-time in production)
      const time = Date.now() * 0.002;
      const burstCount = 3;
      
      for (let i = 0; i < burstCount; i++) {
        const angle = (time + i * 2) % (Math.PI * 2);
        const radius = ((time * 0.5 + i) % 1) * (CENTER - 10);
        
        const x = CENTER + Math.cos(angle) * radius;
        const y = CENTER + Math.sin(angle) * radius;
        
        const alpha = 1 - (radius / (CENTER - 10));
        
        ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, 2 + alpha * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    drawRadar();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, cameraPosition, stars, planets, blockchainData]);
  
  if (mode !== VISUALIZATION_MODES.EXPLORE) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-30 pointer-events-none">
      <div className="relative">
        {/* Radar Canvas */}
        <canvas
          ref={canvasRef}
          width={RADAR_SIZE}
          height={RADAR_SIZE}
          className="rounded-full border border-blue-400/20 shadow-lg"
          style={{
            background: 'radial-gradient(circle, rgba(0,20,40,0.1) 0%, rgba(0,10,20,0.3) 100%)',
            backdropFilter: 'blur(8px)'
          }}
        />
        
        {/* Radar Label */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
          <span className="text-blue-300 text-xs font-light opacity-70 tracking-wide">
            ACTIVITY
          </span>
        </div>
        
        {/* Legend */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full opacity-80"></div>
            <span className="text-green-300 opacity-60">Contracts</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full opacity-80"></div>
            <span className="text-orange-300 opacity-60">Activity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbstractRadar;