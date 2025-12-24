/**
 * Immersive Blockchain Visualization Store
 * Data-first approach: Stars = Blocks, Planets = Contracts, Moons = Transactions
 * No gamification - pure data visualization in space
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Visualization modes
export const VISUALIZATION_MODES = {
  CALM: 'CALM',           // Starfield only, aggregated data
  EXPLORE: 'EXPLORE'      // Full universe with detailed data
};

// Motion phases for debugging
export const MOTION_PHASES = {
  NORMAL: 'NORMAL',       // Standard cinematic motion
  FROZEN: 'FROZEN'        // All motion paused for debugging
};

// Data entity types
export const ENTITY_TYPES = {
  STAR: 'STAR',           // Individual blocks
  PLANET: 'PLANET',       // Smart contracts / validators
  MOON: 'MOON',           // Transactions
  ASTEROID: 'ASTEROID',   // Mempool transactions
  NEBULA: 'NEBULA'        // Network analytics
};

export const useVisualizationStore = create(
  subscribeWithSelector((set, get) => ({
    // Current visualization mode and phase
    mode: VISUALIZATION_MODES.CALM,
    phase: MOTION_PHASES.NORMAL,
    
    // Universe generation state to prevent multiple regenerations
    universeGenerated: false,
    lastModeChange: 0,
    
    // Camera state
    cameraPosition: [0, 0, 100],
    cameraTarget: [0, 0, 0],
    cameraInertia: { x: 0, y: 0, zoom: 0 },
    
    // Data entities
    stars: new Map(),           // Block stars
    planets: new Map(),         // Contract planets
    moons: new Map(),           // Transaction moons
    asteroids: new Map(),       // Mempool asteroids
    nebulae: new Map(),         // Network nebulae
    
    // Interaction state
    hoveredEntity: null,
    selectedEntity: null,
    focusedEntity: null,
    
    // Performance & LOD
    lodLevel: 1,                // 1 = high detail, 3 = low detail
    visibleEntityCount: 0,
    renderDistance: 500,
    
    // Data feeds
    blockchainData: {
      latestBlocks: [],
      activeContracts: [],
      mempoolTxs: [],
      networkStats: {}
    },
    
    // Actions
    setMode: (mode) => {
      const currentTime = Date.now();
      const lastChange = get().lastModeChange;
      
      // Prevent rapid mode changes that could cause regeneration
      if (currentTime - lastChange < 1000) return;
      
      console.log(`Setting mode to: ${mode}`);
      
      set({ 
        mode, 
        lastModeChange: currentTime
        // DON'T reset universeGenerated here to prevent infinite regeneration
      });
      get().handleModeTransition(mode);
    },
    
    setPhase: (phase) => {
      console.log(`Setting motion phase to: ${phase}`);
      set({ phase });
    },
    
    handleModeTransition: (mode) => {
      console.log(`handleModeTransition: Switching to ${mode}`);
      
      switch (mode) {
        case VISUALIZATION_MODES.CALM:
          // Show only aggregated stars, no detailed entities
          set({
            lodLevel: 3,
            renderDistance: 800,
            phase: MOTION_PHASES.NORMAL,
            planets: new Map(), // Clear planets in calm mode
            universeGenerated: false // Reset for next explore mode
          });
          break;
          
        case VISUALIZATION_MODES.EXPLORE:
          // Enable full detail mode - always generate planets
          set({
            lodLevel: 1,
            renderDistance: 4000,
            phase: MOTION_PHASES.NORMAL,
            universeGenerated: false // Reset flag to allow generation
          });
          
          console.log('Switching to EXPLORE mode - generating planets...');
          // Generate planets immediately
          get().generateDetailedUniverse();
          break;
      }
    },
    
    // Camera management
    updateCameraPosition: (position) => set({ cameraPosition: position }),
    
    updateCameraTarget: (target) => set({ cameraTarget: target }),
    
    updateCameraInertia: (inertia) => set({ cameraInertia: inertia }),
    
    // Entity generation with fixed planet limits and single generation
    generateAggregatedStars: () => {
      // In CALM mode, no planets are rendered (stars only)
      set({ 
        stars: new Map(),
        planets: new Map(), // Empty for landing page
        universeGenerated: true
      });
    },
    
    generateDetailedUniverse: () => {
      console.log('generateDetailedUniverse: Starting FAST meridian planet generation...');
      
      // Always generate planets when this function is called
      const newPlanets = new Map();
      
      // FAST LOADING: Only 6 planets for instant loading
      const maxPlanets = 6;
      
      console.log(`Generating ${maxPlanets} meridian planets for fast loading`);
      
      // Original planet names
      const planetNames = ['Mars', 'Venus', 'Jupiter', 'Saturn', 'Mercury', 'Uranus'];
      
      // Simple position generation - very close to camera for visibility
      for (let i = 0; i < maxPlanets; i++) {
        const planetId = `planet-${i}`;
        
        // Simple circular arrangement around origin - much closer
        const angle = (i / maxPlanets) * Math.PI * 2;
        const distance = 60 + (i * 10); // 60-110 units from origin (very close)
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = (Math.random() - 0.5) * 20; // Small height variation
        
        const position = [x, y, z];
        const planetName = planetNames[i];
        
        // Create meridian planet with simple fixed properties
        const planet = {
          id: planetId,
          type: 'PLANET',
          position: position,
          
          // Simple planet properties
          radius: 8, // Fixed radius for consistency
          planetName: planetName,
          rotationSpeed: 0.5,
          color: '#8B5CF6', // Purple color
          
          // Blockchain data
          contractAddress: `0x${i.toString(16).padStart(40, '0')}`,
          complexity: 50 + i * 10,
          dailyTransactions: 100 + i * 50,
          totalValue: (1000 + i * 500).toFixed(2),
          verified: true,
          planetType: 'Meridian Entity',
          
          // State
          visible: true,
          lodLevel: 1
        };
        
        newPlanets.set(planetId, planet);
        
        console.log(`Planet ${i} (${planetName}): Position [${x.toFixed(0)}, ${y.toFixed(0)}, ${z.toFixed(0)}], Distance: ${distance} units`);
      }
      
      // Set the planets and mark as generated
      set({ 
        planets: newPlanets, 
        universeGenerated: true
      });
      
      console.log(`SUCCESS: Generated ${newPlanets.size} purple planets. Store now has ${get().planets.size} planets.`);
      
      // Verify the planets were set correctly
      setTimeout(() => {
        const currentPlanets = get().planets;
        console.log(`VERIFICATION: Store has ${currentPlanets.size} planets after generation`);
        if (currentPlanets.size > 0) {
          const firstPlanet = Array.from(currentPlanets.values())[0];
          console.log('First planet:', firstPlanet.planetName, 'at position:', firstPlanet.position);
        }
      }, 100);
    },
    
    // Entity creators
    createBlockStar: (config) => {
      const txCount = config.aggregated ? 
        config.blockCount * 150 : 
        Math.floor(Math.random() * 300) + 50;
      
      const gasUsed = Math.random() * 8000000;
      const blockAge = Math.random() * 3600000; // Up to 1 hour old
      
      return {
        id: config.id,
        type: ENTITY_TYPES.STAR,
        position: config.position,
        
        // Visual encoding
        brightness: Math.min(txCount / 200, 1), // 0-1
        size: Math.max(0.5, Math.min(txCount / 100, 3)), // 0.5-3
        color: get().getNetworkColor('ethereum'), // Based on network
        pulse: Math.max(0, 1 - (blockAge / 3600000)), // Newer = more pulse
        
        // Blockchain data
        blockNumber: config.blockNumber || null,
        aggregated: config.aggregated || false,
        blockCount: config.blockCount || 1,
        transactions: txCount,
        gasUsed: Math.floor(gasUsed),
        timestamp: Date.now() - blockAge,
        network: 'ethereum',
        
        // State
        visible: true,
        lodLevel: 1
      };
    },
    
    createMeridianPlanet: (config) => {
      const complexity = Math.random() * 100;
      const activity = Math.random();
      
      // Purple/violet color variations for meridian planets
      const purpleColors = [
        '#8B5CF6', // Violet
        '#A855F7', // Purple
        '#9333EA', // Violet-600
        '#7C3AED', // Violet-700
        '#6D28D9', // Violet-800
        '#5B21B6', // Violet-900
        '#C084FC', // Purple-400
        '#B794F6', // Purple-300
      ];
      
      const planetColor = purpleColors[Math.floor(Math.random() * purpleColors.length)];
      
      return {
        id: config.id,
        type: ENTITY_TYPES.PLANET,
        position: config.position,
        systemId: config.systemId,
        systemCenter: config.systemCenter,
        
        // Meridian planet properties
        radius: config.radius || 15, // Use provided radius or default to 15
        planetName: config.planetName || 'Unknown Planet', // Real planet name
        rotationSpeed: 0.3, // Fixed rotation speed for consistency
        systemRotationSpeed: 0, // NO system rotation - planets stay in place
        color: planetColor, // Purple color variations
        
        // Blockchain data
        contractAddress: config.contractAddress,
        complexity: Math.floor(complexity),
        dailyTransactions: Math.floor(activity * 1500),
        totalValue: (Math.random() * 15000).toFixed(2),
        verified: Math.random() > 0.25,
        planetType: 'Meridian Entity',
        
        // State
        visible: true,
        lodLevel: 1
      };
    },

    createWireframeSphere: (config) => {
      const complexity = Math.random() * 100;
      const activity = Math.random();
      
      // Create realistic planet colors and properties
      const planetTypes = [
        { color: '#FF6B35', name: 'Mars-like', atmosphere: 0.1 }, // Red/orange
        { color: '#4A90E2', name: 'Earth-like', atmosphere: 0.8 }, // Blue
        { color: '#F5A623', name: 'Venus-like', atmosphere: 0.9 }, // Yellow/gold
        { color: '#8E44AD', name: 'Gas Giant', atmosphere: 0.6 }, // Purple
        { color: '#E67E22', name: 'Desert', atmosphere: 0.2 }, // Orange
        { color: '#2ECC71', name: 'Forest', atmosphere: 0.7 }, // Green
        { color: '#95A5A6', name: 'Rocky', atmosphere: 0.1 }, // Gray
        { color: '#E74C3C', name: 'Volcanic', atmosphere: 0.3 }, // Red
      ];
      
      const planetType = planetTypes[Math.floor(Math.random() * planetTypes.length)];
      
      return {
        id: config.id,
        type: ENTITY_TYPES.PLANET,
        position: config.position,
        
        // Realistic planet properties
        radius: 8 + Math.random() * 15, // 8-23 (varied sizes like real planets)
        wireframe: false, // Real planets, not wireframes
        rings: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0, // 20% chance of rings
        atmosphereIntensity: planetType.atmosphere,
        rotationSpeed: 0.05 + Math.random() * 0.15, // Varied rotation speeds
        color: planetType.color,
        planetType: planetType.name,
        
        // Blockchain data
        contractAddress: config.contractAddress,
        complexity: Math.floor(complexity),
        dailyTransactions: Math.floor(activity * 1000),
        totalValue: (Math.random() * 10000).toFixed(2),
        verified: Math.random() > 0.3,
        
        // State
        visible: true,
        moons: [],
        lodLevel: 1
      };
    },

    createContractPlanet: (config) => {
      const complexity = Math.random() * 100;
      const activity = Math.random();
      
      return {
        id: config.id,
        type: ENTITY_TYPES.PLANET,
        position: config.position,
        
        // Visual encoding - bigger planets with peach color
        radius: 4 + (complexity / 20), // 4-9 (bigger range)
        rings: Math.floor(complexity / 25), // 0-4 rings
        atmosphereIntensity: activity,
        rotationSpeed: activity * 0.5,
        color: get().getContractColor(complexity),
        
        // Blockchain data
        contractAddress: config.contractAddress,
        complexity: Math.floor(complexity),
        dailyTransactions: Math.floor(activity * 1000),
        totalValue: (Math.random() * 10000).toFixed(2),
        verified: Math.random() > 0.3,
        
        // State
        visible: true,
        moons: [],
        lodLevel: 1
      };
    },
    
    createTransactionMoon: (config) => {
      const value = Math.random() * 10;
      const gasPrice = 20 + Math.random() * 100;
      
      return {
        id: config.id,
        type: ENTITY_TYPES.MOON,
        parentPlanet: config.parentPlanet,
        
        // Orbital mechanics
        orbitRadius: config.orbitRadius,
        orbitSpeed: config.orbitSpeed,
        orbitAngle: Math.random() * Math.PI * 2,
        
        // Visual encoding
        size: Math.max(0.1, value / 5), // 0.1-2
        color: get().getTransactionColor(gasPrice),
        trail: value > 5, // High value transactions have trails
        
        // Blockchain data
        txHash: config.txHash,
        value: value.toFixed(4),
        gasPrice: gasPrice.toFixed(1),
        status: Math.random() > 0.1 ? 'confirmed' : 'pending',
        
        // State
        visible: true,
        lodLevel: 1
      };
    },
    
    // Color encoding functions
    getNetworkColor: (network) => {
      const colors = {
        ethereum: '#627EEA',
        bitcoin: '#F7931A',
        polygon: '#8247E5',
        arbitrum: '#28A0F0',
        optimism: '#FF0420'
      };
      return colors[network] || '#FFFFFF';
    },
    
    getContractColor: (complexity) => {
      // Bright peach/orange color variations based on complexity
      const lightness = 75 + (complexity * 0.15); // 75% to 90% lightness (much brighter)
      return `hsl(30, 95%, ${Math.min(lightness, 90)}%)`; // Bright peach/orange hue (30°) with high saturation
    },
    
    getTransactionColor: (gasPrice) => {
      // Green (low gas) to red (high gas)
      const normalized = Math.min(gasPrice / 100, 1);
      const hue = 120 - (normalized * 120); // 120° to 0°
      return `hsl(${hue}, 80%, 60%)`;
    },
    
    // Interaction handling
    setHoveredEntity: (entity) => set({ hoveredEntity: entity }),
    
    setSelectedEntity: (entity) => set({ selectedEntity: entity }),
    
    setFocusedEntity: (entity) => set({ focusedEntity: entity }),
    
    // Distance-based data disclosure
    updateEntityVisibility: (cameraPos) => {
      const { stars, planets, moons, renderDistance } = get();
      let visibleCount = 0;
      
      // Update star visibility and LOD
      stars.forEach((star, id) => {
        const distance = get().calculateDistance(star.position, cameraPos);
        const visible = distance < renderDistance;
        
        if (visible) {
          visibleCount++;
          // Update LOD based on distance
          const lodLevel = distance < 100 ? 1 : distance < 300 ? 2 : 3;
          stars.set(id, { ...star, visible, lodLevel });
        } else {
          stars.set(id, { ...star, visible: false });
        }
      });
      
      // Update planet visibility
      planets.forEach((planet, id) => {
        const distance = get().calculateDistance(planet.position, cameraPos);
        const visible = distance < renderDistance * 0.8; // Planets visible at shorter range
        
        if (visible) {
          visibleCount++;
          const lodLevel = distance < 150 ? 1 : distance < 400 ? 2 : 3;
          planets.set(id, { ...planet, visible, lodLevel });
        } else {
          planets.set(id, { ...planet, visible: false });
        }
      });
      
      set({ visibleEntityCount: visibleCount });
    },
    
    calculateDistance: (pos1, pos2) => {
      return Math.sqrt(
        Math.pow(pos1[0] - pos2[0], 2) +
        Math.pow(pos1[1] - pos2[1], 2) +
        Math.pow(pos1[2] - pos2[2], 2)
      );
    },
    
    // Performance management
    updateLOD: (fps) => {
      const currentLOD = get().lodLevel;
      let newLOD = currentLOD;
      
      if (fps < 30 && currentLOD < 3) {
        newLOD = currentLOD + 1;
      } else if (fps > 55 && currentLOD > 1) {
        newLOD = currentLOD - 1;
      }
      
      if (newLOD !== currentLOD) {
        set({ lodLevel: newLOD });
        console.log(`LOD adjusted to level ${newLOD} (FPS: ${fps})`);
      }
    },
    
    // Data updates (would connect to real blockchain APIs)
    updateBlockchainData: (data) => {
      set({ blockchainData: data });
      
      // Regenerate entities based on new data
      if (get().mode === VISUALIZATION_MODES.EXPLORE) {
        get().generateDetailedUniverse();
      }
    },
    
    // Reset state
    reset: () => {
      set({
        mode: VISUALIZATION_MODES.CALM,
        phase: MOTION_PHASES.NORMAL,
        stars: new Map(),
        planets: new Map(),
        moons: new Map(),
        asteroids: new Map(),
        nebulae: new Map(),
        hoveredEntity: null,
        selectedEntity: null,
        focusedEntity: null,
        lodLevel: 1,
        visibleEntityCount: 0,
        universeGenerated: false,
        lastModeChange: 0
      });
    }
  }))
);