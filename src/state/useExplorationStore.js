/**
 * Exploration Mode State Store
 * Manages the space exploration experience modes and interactions
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Exploration modes
export const EXPLORATION_MODES = {
  LANDING: 'LANDING',     // Starfield only, atmospheric
  EXPLORE: 'EXPLORE',     // Full spaceship experience
  DEEP_DIVE: 'DEEP_DIVE'  // Detailed planet analysis
};

export const useExplorationStore = create(
  subscribeWithSelector((set, get) => ({
    // Current exploration mode
    mode: EXPLORATION_MODES.LANDING,
    previousMode: null,
    
    // Spaceship state
    spaceshipVisible: false,
    spaceshipPosition: [0, 0, 0],
    spaceshipVelocity: [0, 0, 0],
    spaceshipTarget: null,
    
    // Camera state
    cameraMode: 'drift', // 'drift', 'follow', 'orbit'
    cameraTarget: null,
    
    // Planet system
    activePlanets: new Map(),
    scannedPlanets: new Set(),
    nearbyPlanets: [],
    
    // Scanner state
    scannerActive: false,
    scannerTarget: null,
    extractedData: null,
    
    // UI state
    radarVisible: false,
    dataCardVisible: false,
    deepDiveActive: false,
    
    // Performance tracking
    visibleObjectCount: 0,
    
    // Actions
    setMode: (mode) => {
      const currentMode = get().mode;
      if (currentMode !== mode) {
        set({ 
          previousMode: currentMode,
          mode 
        });
        
        // Handle mode transitions
        get().handleModeTransition(currentMode, mode);
      }
    },
    
    handleModeTransition: (fromMode, toMode) => {
      switch (toMode) {
        case EXPLORATION_MODES.LANDING:
          set({
            spaceshipVisible: false,
            radarVisible: false,
            cameraMode: 'drift',
            activePlanets: new Map(),
            nearbyPlanets: []
          });
          break;
          
        case EXPLORATION_MODES.EXPLORE:
          set({
            spaceshipVisible: true,
            radarVisible: true,
            cameraMode: 'follow'
          });
          // Initialize planet system
          get().initializePlanetSystem();
          break;
          
        case EXPLORATION_MODES.DEEP_DIVE:
          set({
            cameraMode: 'orbit',
            deepDiveActive: true
          });
          break;
      }
    },
    
    // Spaceship management
    updateSpaceshipPosition: (position) => set({ spaceshipPosition: position }),
    
    updateSpaceshipVelocity: (velocity) => set({ spaceshipVelocity: velocity }),
    
    setSpaceshipTarget: (target) => set({ spaceshipTarget: target }),
    
    // Planet system management
    initializePlanetSystem: () => {
      // Generate initial planets ahead of spaceship
      const planets = new Map();
      
      for (let i = 0; i < 8; i++) {
        const planetId = `planet-${Date.now()}-${i}`;
        const planet = get().generatePlanet(planetId, i);
        planets.set(planetId, planet);
      }
      
      set({ activePlanets: planets });
    },
    
    generatePlanet: (id, index) => {
      const blockNumber = 1000000 + index + Math.floor(Math.random() * 1000);
      const txCount = Math.floor(Math.random() * 500) + 50;
      const gasUsed = Math.random() * 8000000;
      
      return {
        id,
        blockNumber,
        position: [
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 100,
          -100 - (index * 150) // Spawn ahead of ship
        ],
        size: 3 + (txCount / 100), // Size based on transactions
        gasIntensity: gasUsed / 8000000,
        color: `hsl(${30 + Math.random() * 60}, 70%, ${60 + Math.random() * 20}%)`,
        
        // Blockchain data
        hash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
        timestamp: Date.now() - (index * 15000),
        transactions: txCount,
        gasUsed: Math.floor(gasUsed),
        gasPrice: (20 + Math.random() * 50).toFixed(1),
        difficulty: (Math.random() * 1000000000000).toExponential(2),
        totalValue: (Math.random() * 1000).toFixed(3),
        miner: `0x${Math.random().toString(16).substr(2, 40)}`,
        
        // State
        scanned: false,
        inRange: false,
        dissolving: false
      };
    },
    
    addPlanet: (planet) => {
      const { activePlanets } = get();
      const newPlanets = new Map(activePlanets);
      newPlanets.set(planet.id, planet);
      set({ activePlanets: newPlanets });
    },
    
    removePlanet: (planetId) => {
      const { activePlanets } = get();
      const newPlanets = new Map(activePlanets);
      newPlanets.delete(planetId);
      set({ activePlanets: newPlanets });
    },
    
    updatePlanet: (planetId, updates) => {
      const { activePlanets } = get();
      const planet = activePlanets.get(planetId);
      if (planet) {
        const newPlanets = new Map(activePlanets);
        newPlanets.set(planetId, { ...planet, ...updates });
        set({ activePlanets: newPlanets });
      }
    },
    
    // Proximity detection
    updateNearbyPlanets: (spaceshipPos) => {
      const { activePlanets } = get();
      const nearby = [];
      const DETECTION_RADIUS = 50;
      
      activePlanets.forEach((planet) => {
        const distance = Math.sqrt(
          Math.pow(planet.position[0] - spaceshipPos[0], 2) +
          Math.pow(planet.position[1] - spaceshipPos[1], 2) +
          Math.pow(planet.position[2] - spaceshipPos[2], 2)
        );
        
        if (distance < DETECTION_RADIUS) {
          nearby.push({ ...planet, distance });
          
          // Update planet in-range state
          if (!planet.inRange) {
            get().updatePlanet(planet.id, { inRange: true });
          }
        } else if (planet.inRange) {
          get().updatePlanet(planet.id, { inRange: false });
        }
      });
      
      set({ nearbyPlanets: nearby.sort((a, b) => a.distance - b.distance) });
    },
    
    // Scanner system
    activateScanner: (direction) => {
      set({ scannerActive: true });
      
      // Find target planet in scanner direction
      const target = get().findScannerTarget(direction);
      if (target) {
        set({ scannerTarget: target });
        get().scanPlanet(target);
      }
      
      // Deactivate scanner after animation
      setTimeout(() => {
        set({ scannerActive: false, scannerTarget: null });
      }, 1000);
    },
    
    findScannerTarget: (direction) => {
      const { activePlanets, spaceshipPosition } = get();
      const SCAN_RANGE = 100;
      const SCAN_ANGLE = Math.PI / 6; // 30 degrees
      
      let closestTarget = null;
      let closestDistance = Infinity;
      
      activePlanets.forEach((planet) => {
        if (planet.scanned) return;
        
        // Calculate vector from ship to planet
        const toPlanet = [
          planet.position[0] - spaceshipPosition[0],
          planet.position[1] - spaceshipPosition[1],
          planet.position[2] - spaceshipPosition[2]
        ];
        
        const distance = Math.sqrt(toPlanet[0]**2 + toPlanet[1]**2 + toPlanet[2]**2);
        
        if (distance > SCAN_RANGE) return;
        
        // Check if planet is in scanner cone
        const dotProduct = (
          toPlanet[0] * direction[0] +
          toPlanet[1] * direction[1] +
          toPlanet[2] * direction[2]
        ) / distance;
        
        const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
        
        if (angle < SCAN_ANGLE && distance < closestDistance) {
          closestTarget = planet;
          closestDistance = distance;
        }
      });
      
      return closestTarget;
    },
    
    scanPlanet: (planet) => {
      // Mark planet as scanned
      get().updatePlanet(planet.id, { scanned: true, dissolving: true });
      
      // Add to scanned set
      const { scannedPlanets } = get();
      const newScanned = new Set(scannedPlanets);
      newScanned.add(planet.id);
      set({ scannedPlanets: newScanned });
      
      // Show extracted data
      set({
        extractedData: planet,
        dataCardVisible: true
      });
      
      // Remove planet after dissolution animation
      setTimeout(() => {
        get().removePlanet(planet.id);
      }, 2000);
    },
    
    // Data card management
    hideDataCard: () => set({ dataCardVisible: false, extractedData: null }),
    
    inspectData: () => {
      set({ mode: EXPLORATION_MODES.DEEP_DIVE });
    },
    
    continueJourney: () => {
      get().hideDataCard();
      // Generate new planet to replace scanned one
      get().spawnNewPlanet();
    },
    
    spawnNewPlanet: () => {
      const { activePlanets, spaceshipPosition } = get();
      const planetCount = activePlanets.size;
      
      if (planetCount < 8) {
        const newPlanet = get().generatePlanet(
          `planet-${Date.now()}`,
          planetCount
        );
        
        // Position ahead of ship
        newPlanet.position[2] = spaceshipPosition[2] - 200 - (Math.random() * 100);
        
        get().addPlanet(newPlanet);
      }
    },
    
    // Performance management
    updateVisibleObjectCount: (count) => set({ visibleObjectCount: count }),
    
    // Cleanup old planets behind ship
    cleanupDistantPlanets: (spaceshipPos) => {
      const { activePlanets } = get();
      const CLEANUP_DISTANCE = 300;
      
      activePlanets.forEach((planet, id) => {
        const distance = planet.position[2] - spaceshipPos[2];
        if (distance > CLEANUP_DISTANCE) {
          get().removePlanet(id);
        }
      });
    },
    
    // Reset exploration state
    reset: () => set({
      mode: EXPLORATION_MODES.LANDING,
      spaceshipVisible: false,
      activePlanets: new Map(),
      scannedPlanets: new Set(),
      nearbyPlanets: [],
      scannerActive: false,
      scannerTarget: null,
      extractedData: null,
      dataCardVisible: false,
      deepDiveActive: false,
      radarVisible: false
    })
  }))
);