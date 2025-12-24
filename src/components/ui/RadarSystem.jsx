/**
 * Professional Planet Radar System
 * Real-time detection and tracking of planets in the massive planet system
 * Enhanced professional styling with accurate planet positioning
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrame, useThree } from '@react-three/fiber';

const RadarSystem = ({ planets = [], cameraPosition = [0, 0, 0], onPlanetClick, compact = false }) => {
  const canvasRef = useRef();
  const animationRef = useRef();
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [detectedPlanets, setDetectedPlanets] = useState([]);
  
  // Responsive radar configuration
  const RADAR_SIZE = compact ? 120 : window.innerWidth < 768 ? 140 : 180;
  const RADAR_RANGE = 800; // Detection range for planets
  const CENTER = RADAR_SIZE / 2;
  
  // Calculate planets within radar range
  const updateDetectedPlanets = useCallback(() => {
    if (!planets || planets.length === 0) return;
    
    const detected = planets.filter(planet => {
      const dx = planet.position[0] - cameraPosition[0];
      const dz = planet.position[2] - cameraPosition[2];
      const distance = Math.sqrt(dx * dx + dz * dz);
      return distance <= RADAR_RANGE;
    }).map(planet => {
      const dx = planet.position[0] - cameraPosition[0];
      const dz = planet.position[2] - cameraPosition[2];
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      return {
        ...planet,
        radarDistance: distance,
        radarX: CENTER + (dx / RADAR_RANGE) * (CENTER - 20),
        radarY: CENTER + (dz / RADAR_RANGE) * (CENTER - 20)
      };
    });
    
    setDetectedPlanets(detected);
  }, [planets, cameraPosition, RADAR_RANGE, CENTER]);

  useEffect(() => {
    updateDetectedPlanets();
  }, [updateDetectedPlanets]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const drawRadar = () => {
      // Clear canvas
      ctx.clearRect(0, 0, RADAR_SIZE, RADAR_SIZE);
      
      // Professional radar background
      const bgGradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, CENTER - 2);
      bgGradient.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      bgGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      
      ctx.fillStyle = bgGradient;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, CENTER - 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Professional radar grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 1;
      
      // Concentric circles
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, (CENTER - 2) * (i / 4), 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(CENTER, 6);
      ctx.lineTo(CENTER, RADAR_SIZE - 6);
      ctx.moveTo(6, CENTER);
      ctx.lineTo(RADAR_SIZE - 6, CENTER);
      ctx.stroke();
      
      // Diagonal guides
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 0.5;
      const diagonalLength = CENTER - 6;
      const diagonalOffset = diagonalLength * 0.707; // cos(45°)
      
      ctx.beginPath();
      ctx.moveTo(CENTER - diagonalOffset, CENTER - diagonalOffset);
      ctx.lineTo(CENTER + diagonalOffset, CENTER + diagonalOffset);
      ctx.moveTo(CENTER - diagonalOffset, CENTER + diagonalOffset);
      ctx.lineTo(CENTER + diagonalOffset, CENTER - diagonalOffset);
      ctx.stroke();
      
      // Professional radar border with glow
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, CENTER - 2, 0, Math.PI * 2);
      ctx.stroke();
      
      // Outer glow effect
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, CENTER - 1, 0, Math.PI * 2);
      ctx.stroke();
      
      // Camera/Observer position
      const cameraGradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 8);
      cameraGradient.addColorStop(0, 'rgba(34, 197, 94, 1)');
      cameraGradient.addColorStop(0.6, 'rgba(34, 197, 94, 0.8)');
      cameraGradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)');
      
      ctx.fillStyle = cameraGradient;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Camera direction indicator
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.lineTo(CENTER, CENTER - 25);
      ctx.stroke();
      
      // Draw detected planets
      detectedPlanets.forEach((planet, index) => {
        const isHovered = hoveredPlanet === planet.id;
        const distance = planet.radarDistance;
        
        // Planet classification based on distance and data
        let planetColor, glowColor, planetSize;
        
        if (distance < RADAR_RANGE * 0.25) {
          // Close planets - bright and large
          planetColor = 'rgba(196, 132, 252, 1)'; // Bright purple
          glowColor = 'rgba(196, 132, 252, 0.6)';
          planetSize = 4;
        } else if (distance < RADAR_RANGE * 0.5) {
          // Medium distance - moderate brightness
          planetColor = 'rgba(196, 132, 252, 0.8)';
          glowColor = 'rgba(196, 132, 252, 0.4)';
          planetSize = 3.5;
        } else {
          // Far planets - dimmer
          planetColor = 'rgba(196, 132, 252, 0.6)';
          glowColor = 'rgba(196, 132, 252, 0.3)';
          planetSize = 3;
        }
        
        // High-value planets get special treatment
        if (parseFloat(planet.totalValue) > 1000) {
          planetColor = 'rgba(245, 199, 122, 1)'; // Gold
          glowColor = 'rgba(245, 199, 122, 0.6)';
          planetSize += 1;
        }
        
        const finalSize = isHovered ? planetSize + 2 : planetSize;
        const glowSize = isHovered ? finalSize + 8 : finalSize + 4;
        
        // Planet glow effect
        const planetGradient = ctx.createRadialGradient(
          planet.radarX, planet.radarY, 0,
          planet.radarX, planet.radarY, glowSize
        );
        planetGradient.addColorStop(0, planetColor);
        planetGradient.addColorStop(0.4, glowColor);
        planetGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(planet.radarX, planet.radarY, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet core
        ctx.fillStyle = planetColor;
        ctx.beginPath();
        ctx.arc(planet.radarX, planet.radarY, finalSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Activity pulse for high-transaction planets
        if (planet.transactions > 500) {
          const time = Date.now() * 0.004;
          const pulse = Math.sin(time + index) * 0.5 + 0.5;
          
          ctx.strokeStyle = `rgba(6, 182, 212, ${pulse * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(planet.radarX, planet.radarY, finalSize + 3 + pulse * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Store position for interaction
        planet._radarPos = { 
          x: planet.radarX, 
          y: planet.radarY, 
          size: finalSize + 3 
        };
      });
      
      // Professional radar sweep
      const time = Date.now() * 0.0008;
      const sweepAngle = (time % (Math.PI * 2));
      
      const sweepGradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, CENTER - 2);
      sweepGradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      sweepGradient.addColorStop(0.6, 'rgba(6, 182, 212, 0.15)');
      sweepGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(sweepAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, CENTER - 2, -Math.PI / 6, Math.PI / 6);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(drawRadar);
    };
    
    drawRadar();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [detectedPlanets, hoveredPlanet, CENTER, RADAR_SIZE]);

  // Handle radar interactions
  const handleRadarClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    detectedPlanets.forEach((planet) => {
      if (!planet._radarPos) return;
      
      const dx = clickX - planet._radarPos.x;
      const dy = clickY - planet._radarPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= planet._radarPos.size) {
        onPlanetClick?.(planet);
      }
    });
  };

  const handleRadarHover = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const hoverY = event.clientY - rect.top;
    
    let foundPlanet = null;
    detectedPlanets.forEach((planet) => {
      if (!planet._radarPos) return;
      
      const dx = hoverX - planet._radarPos.x;
      const dy = hoverY - planet._radarPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= planet._radarPos.size) {
        foundPlanet = planet.id;
      }
    });
    
    setHoveredPlanet(foundPlanet);
  };
  
  return (
    <div className="fixed bottom-20 right-6 z-30 pointer-events-none">
      <div className="flex flex-col items-end gap-3">
        
        {/* Radar Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
          {/* Radar Canvas */}
          <canvas
            ref={canvasRef}
            width={RADAR_SIZE}
            height={RADAR_SIZE}
            className="rounded-full border-2 border-cyan-400/40 shadow-2xl cursor-pointer pointer-events-auto transition-all duration-300 hover:border-cyan-400/60 hover:shadow-cyan-500/30"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)',
              backdropFilter: 'blur(15px)'
            }}
            onClick={handleRadarClick}
            onMouseMove={handleRadarHover}
            onMouseLeave={() => setHoveredPlanet(null)}
          />
          
          {/* Professional Labels */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              <span className="text-cyan-300 text-sm font-bold tracking-wider">
                PLANET RADAR
              </span>
              <div className="text-cyan-400/60 text-xs mt-1">
                DETECTION SYSTEM
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
            <span className="text-cyan-300/80 text-xs font-mono">
              RANGE: {RADAR_RANGE}u
            </span>
            <div className="text-cyan-400/60 text-xs mt-1">
              DETECTED: {detectedPlanets.length}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-green-300 text-xs font-mono rotate-90 whitespace-nowrap">ACTIVE</span>
            </div>
          </div>

          {/* Planet Classification Legend */}
          <div className="absolute -right-20 top-1/2 transform -translate-y-1/2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-purple-300 text-xs">STD</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-yellow-300 text-xs">HVL</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-300 text-xs">ACT</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional Planet Info Panel */}
        <AnimatePresence>
          {hoveredPlanet && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="pointer-events-none bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-xl border border-cyan-400/40 rounded-xl px-4 py-3 text-xs text-white max-w-64 shadow-2xl"
              style={{
                boxShadow: '0 20px 60px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {(() => {
                const planet = detectedPlanets.find(p => p.id === hoveredPlanet);
                return planet ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-bold text-sm">
                        {planet.planetName}
                      </span>
                      <span className="text-purple-400 text-xs font-mono">
                        PLANET
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Distance:</span>
                        <div className="text-cyan-300 font-mono">
                          {Math.round(planet.radarDistance)}u
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Block:</span>
                        <div className="text-white font-mono">
                          {planet.blockNumber.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Value:</span>
                        <div className="text-green-400 font-mono">
                          {planet.totalValue} ETH
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">TXs:</span>
                        <div className="text-orange-400 font-mono">
                          {planet.transactions}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center pt-1 border-t border-slate-700/50">
                      <span className="text-cyan-400 text-xs">
                        Click to select planet
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RadarSystem;