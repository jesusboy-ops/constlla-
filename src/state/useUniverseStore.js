/**
 * 3D Universe state store
 * Manages 3D scene state, blocks, transactions, and visual elements
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useUniverseStore = create(
  subscribeWithSelector((set, get) => ({
    // 3D Scene state
    sceneReady: false,
    cameraPosition: [0, 0, 100],
    cameraTarget: [0, 0, 0],
    
    // Blocks data (stars in the universe)
    blocks: new Map(), // blockNumber -> blockData
    maxBlocks: 100, // Maximum blocks to keep in memory
    
    // Contracts data (planets)
    contracts: new Map(), // address -> contractData
    
    // Transactions (particle trails)
    activeTransactions: new Map(), // txHash -> transactionData
    maxTransactions: 50,
    
    // Visual settings
    particleDensity: 1.0,
    bloomStrength: 1.0,
    animationSpeed: 1.0,
    showParticleTrails: true,
    showBlockLabels: true,
    
    // Performance settings
    enableBloom: true,
    enableParticles: true,
    targetFPS: 60,
    currentFPS: 60,
    
    // Animation state
    isAnimating: false,
    cameraAnimating: false,
    
    // Actions
    setSceneReady: (ready) => set({ sceneReady: ready }),
    
    setCameraPosition: (position) => set({ cameraPosition: position }),
    
    setCameraTarget: (target) => set({ cameraTarget: target }),
    
    setCameraAnimating: (animating) => set({ cameraAnimating: animating }),

    // Block management
    addBlock: (block) => {
      const { blocks, maxBlocks } = get();
      const newBlocks = new Map(blocks);
      
      newBlocks.set(block.number, {
        ...block,
        position: get().generateBlockPosition(block),
        addedAt: Date.now()
      });
      
      // Remove oldest blocks if we exceed maxBlocks
      if (newBlocks.size > maxBlocks) {
        const sortedBlocks = Array.from(newBlocks.entries())
          .sort(([a], [b]) => b - a); // Sort by block number descending
        
        // Keep only the latest maxBlocks
        const blocksToKeep = sortedBlocks.slice(0, maxBlocks);
        newBlocks.clear();
        blocksToKeep.forEach(([number, blockData]) => {
          newBlocks.set(number, blockData);
        });
      }
      
      set({ blocks: newBlocks });
    },

    removeBlock: (blockNumber) => {
      const { blocks } = get();
      const newBlocks = new Map(blocks);
      newBlocks.delete(blockNumber);
      set({ blocks: newBlocks });
    },

    getBlock: (blockNumber) => {
      const { blocks } = get();
      return blocks.get(blockNumber);
    },

    // Contract management
    addContract: (contract) => {
      const { contracts } = get();
      const newContracts = new Map(contracts);
      
      newContracts.set(contract.address, {
        ...contract,
        position: get().generateContractPosition(contract),
        addedAt: Date.now()
      });
      
      set({ contracts: newContracts });
    },

    removeContract: (address) => {
      const { contracts } = get();
      const newContracts = new Map(contracts);
      newContracts.delete(address);
      set({ contracts: newContracts });
    },

    getContract: (address) => {
      const { contracts } = get();
      return contracts.get(address);
    },

    // Transaction management
    addTransaction: (transaction) => {
      const { activeTransactions, maxTransactions } = get();
      const newTransactions = new Map(activeTransactions);
      
      newTransactions.set(transaction.hash, {
        ...transaction,
        startTime: Date.now(),
        duration: 3000 // 3 second animation
      });
      
      // Remove oldest transactions if we exceed maxTransactions
      if (newTransactions.size > maxTransactions) {
        const oldestTx = Array.from(newTransactions.entries())
          .sort(([, a], [, b]) => a.startTime - b.startTime)[0];
        newTransactions.delete(oldestTx[0]);
      }
      
      set({ activeTransactions: newTransactions });
      
      // Auto-remove transaction after animation completes
      setTimeout(() => {
        get().removeTransaction(transaction.hash);
      }, 3000);
    },

    removeTransaction: (txHash) => {
      const { activeTransactions } = get();
      const newTransactions = new Map(activeTransactions);
      newTransactions.delete(txHash);
      set({ activeTransactions: newTransactions });
    },

    // Position generators
    generateBlockPosition: (block) => {
      // Generate position based on block number and hash
      const hash = block.hash || '';
      const x = (parseInt(hash.slice(2, 10), 16) % 200) - 100;
      const y = (parseInt(hash.slice(10, 18), 16) % 200) - 100;
      const z = (parseInt(hash.slice(18, 26), 16) % 200) - 100;
      
      return [x, y, z];
    },

    generateContractPosition: (contract) => {
      // Generate position based on contract address
      const addr = contract.address || '';
      const x = (parseInt(addr.slice(2, 10), 16) % 300) - 150;
      const y = (parseInt(addr.slice(10, 18), 16) % 300) - 150;
      const z = (parseInt(addr.slice(18, 26), 16) % 300) - 150;
      
      return [x, y, z];
    },

    // Visual settings
    setParticleDensity: (density) => set({ particleDensity: Math.max(0.1, Math.min(2.0, density)) }),
    
    setBloomStrength: (strength) => set({ bloomStrength: Math.max(0, Math.min(3.0, strength)) }),
    
    setAnimationSpeed: (speed) => set({ animationSpeed: Math.max(0.1, Math.min(3.0, speed)) }),
    
    toggleParticleTrails: () => set(state => ({ showParticleTrails: !state.showParticleTrails })),
    
    toggleBlockLabels: () => set(state => ({ showBlockLabels: !state.showBlockLabels })),
    
    // Performance settings
    toggleBloom: () => set(state => ({ enableBloom: !state.enableBloom })),
    
    toggleParticles: () => set(state => ({ enableParticles: !state.enableParticles })),
    
    setTargetFPS: (fps) => set({ targetFPS: Math.max(15, Math.min(120, fps)) }),
    
    updateCurrentFPS: (fps) => set({ currentFPS: fps }),

    // Animation control
    setAnimating: (animating) => set({ isAnimating: animating }),

    // Camera animations
    animateToBlock: (blockNumber) => {
      const block = get().getBlock(blockNumber);
      if (!block) return;
      
      set({ cameraAnimating: true });
      
      // Calculate camera position to focus on block
      const targetPosition = [
        block.position[0] + 50,
        block.position[1] + 30,
        block.position[2] + 50
      ];
      
      set({
        cameraPosition: targetPosition,
        cameraTarget: block.position
      });
      
      // Reset camera animation state after animation completes
      setTimeout(() => {
        set({ cameraAnimating: false });
      }, 2000);
    },

    animateToContract: (address) => {
      const contract = get().getContract(address);
      if (!contract) return;
      
      set({ cameraAnimating: true });
      
      const targetPosition = [
        contract.position[0] + 80,
        contract.position[1] + 50,
        contract.position[2] + 80
      ];
      
      set({
        cameraPosition: targetPosition,
        cameraTarget: contract.position
      });
      
      setTimeout(() => {
        set({ cameraAnimating: false });
      }, 2000);
    },

    resetCamera: () => {
      set({
        cameraPosition: [0, 0, 100],
        cameraTarget: [0, 0, 0],
        cameraAnimating: false
      });
    },

    // Cleanup
    clearUniverse: () => set({
      blocks: new Map(),
      contracts: new Map(),
      activeTransactions: new Map()
    }),

    // Get universe statistics
    getUniverseStats: () => {
      const { blocks, contracts, activeTransactions } = get();
      return {
        blockCount: blocks.size,
        contractCount: contracts.size,
        activeTransactionCount: activeTransactions.size,
        totalElements: blocks.size + contracts.size + activeTransactions.size
      };
    }
  }))
);