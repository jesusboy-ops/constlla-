/**
 * Enhanced Universe Controller Hook
 * Manages 3D universe interactions, validator integration, and advanced filtering
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUniverseStore } from '../state/useUniverseStore.js';
import { useAppStore } from '../state/useAppStore.js';
import { useSettingsStore } from '../state/useSettingsStore.js';
import { useValidators } from './useValidators.js';

export const useUniverseController = () => {
  const {
    sceneReady,
    cameraPosition,
    cameraTarget,
    cameraAnimating,
    blocks,
    contracts,
    activeTransactions,
    setSceneReady,
    setCameraPosition,
    setCameraTarget,
    setCameraAnimating,
    animateToBlock,
    animateToContract,
    resetCamera,
    clearUniverse
  } = useUniverseStore();

  const {
    selectedBlock,
    selectedContract,
    selectedTransaction,
    selectBlock,
    selectContract,
    selectTransaction
  } = useAppStore();

  const {
    cameraSpeed,
    cameraDamping,
    autoRotate,
    autoRotateSpeed,
    adaptiveQuality,
    targetFPS
  } = useSettingsStore();

  // Validator integration
  const { validators = [], getValidator, getTopValidators } = useValidators();
  
  // Filtering and interaction state
  const [isInteracting, setIsInteracting] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'validator', 'era', 'activity'
  const [filterValue, setFilterValue] = useState(null);
  const [performance, setPerformance] = useState({
    fps: 60,
    frameTime: 16.67,
    quality: 'high'
  });

  const frameTimeRef = useRef([]);
  const lastFrameTime = useRef(window.performance?.now() || Date.now());
  const autoRotateAngle = useRef(0);

  /**
   * Handle block selection and camera animation
   */
  const handleBlockClick = useCallback((blockNumber) => {
    const block = blocks.get(blockNumber);
    if (block) {
      selectBlock(block);
      animateToBlock(blockNumber);
    }
  }, [blocks, selectBlock, animateToBlock]);

  /**
   * Handle contract selection and camera animation
   */
  const handleContractClick = useCallback((address) => {
    const contract = contracts.get(address);
    if (contract) {
      selectContract(contract);
      animateToContract(address);
    }
  }, [contracts, selectContract, animateToContract]);

  /**
   * Handle transaction visualization
   */
  const handleTransactionClick = useCallback((txHash) => {
    const transaction = activeTransactions.get(txHash);
    if (transaction) {
      selectTransaction(transaction);
    }
  }, [activeTransactions, selectTransaction]);

  /**
   * Handle validator selection and filtering
   */
  const handleValidatorClick = useCallback((validatorAddress) => {
    const validator = getValidator(validatorAddress);
    if (validator) {
      setSelectedValidator(validator);
      setFilterMode('validator');
      setFilterValue(validatorAddress);
    }
  }, [getValidator]);

  /**
   * Filter blocks by validator
   */
  const filteredBlocks = useMemo(() => {
    const blocksArray = Array.from(blocks.values());
    if (filterMode === 'validator' && filterValue) {
      return blocksArray.filter(block => {
        const validatorAddress = `validator${(block.number % 297).toString().padStart(3, '0')}`;
        return validatorAddress === filterValue;
      });
    }
    return blocksArray;
  }, [blocks, filterMode, filterValue]);

  /**
   * Filter contracts by activity level
   */
  const filteredContracts = useMemo(() => {
    const contractsArray = Array.from(contracts.values());
    if (filterMode === 'activity' && filterValue) {
      return contractsArray.filter(contract => {
        const functionCount = contract.functions?.length || 0;
        switch (filterValue) {
          case 'high': return functionCount > 20;
          case 'medium': return functionCount >= 10 && functionCount <= 20;
          case 'low': return functionCount < 10;
          default: return true;
        }
      });
    }
    return contractsArray;
  }, [contracts, filterMode, filterValue]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilterMode('all');
    setFilterValue(null);
    setSelectedValidator(null);
  }, []);

  /**
   * Get validator network for selected validator
   */
  const getValidatorNetwork = useCallback((validatorAddress) => {
    const validator = getValidator(validatorAddress);
    if (!validator) return { blocks: [], connections: [] };

    const blocksArray = Array.from(blocks.values());
    const validatorBlocks = blocksArray.filter(block => {
      const blockValidator = `validator${(block.number % 297).toString().padStart(3, '0')}`;
      return blockValidator === validatorAddress;
    });

    return {
      blocks: validatorBlocks,
      validator: validator,
      connections: validatorBlocks.map(block => ({
        from: validator.position,
        to: block.position || [0, 0, 0]
      }))
    };
  }, [getValidator, blocks]);

  /**
   * Update camera position smoothly
   */
  const updateCameraPosition = useCallback((newPosition, newTarget = null) => {
    if (cameraAnimating) return;

    setCameraPosition(newPosition);
    if (newTarget) {
      setCameraTarget(newTarget);
    }
  }, [cameraAnimating, setCameraPosition, setCameraTarget]);

  /**
   * Handle camera controls
   */
  const cameraControls = {
    moveForward: () => {
      if (!cameraAnimating) {
        const [x, y, z] = cameraPosition;
        updateCameraPosition([x, y, z - 10 * cameraSpeed]);
      }
    },
    
    moveBackward: () => {
      if (!cameraAnimating) {
        const [x, y, z] = cameraPosition;
        updateCameraPosition([x, y, z + 10 * cameraSpeed]);
      }
    },
    
    moveLeft: () => {
      if (!cameraAnimating) {
        const [x, y, z] = cameraPosition;
        updateCameraPosition([x - 10 * cameraSpeed, y, z]);
      }
    },
    
    moveRight: () => {
      if (!cameraAnimating) {
        const [x, y, z] = cameraPosition;
        updateCameraPosition([x + 10 * cameraSpeed, y, z]);
      }
    },
    
    moveUp: () => {
      if (!cameraAnimating) {
        const [x, y, z] = cameraPosition;
        updateCameraPosition([x, y + 10 * cameraSpeed, z]);
      }
    },
    
    moveDown: () => {
      if (!cameraAnimating) {
        const [x, y, z] = cameraPosition;
        updateCameraPosition([x, y - 10 * cameraSpeed, z]);
      }
    },
    
    reset: resetCamera
  };

  /**
   * Auto-rotate camera around the universe
   */
  const updateAutoRotate = useCallback(() => {
    if (!autoRotate || cameraAnimating || isInteracting) return;

    autoRotateAngle.current += autoRotateSpeed * 0.01;
    const radius = 150;
    const x = Math.cos(autoRotateAngle.current) * radius;
    const z = Math.sin(autoRotateAngle.current) * radius;
    
    updateCameraPosition([x, cameraPosition[1], z], [0, 0, 0]);
  }, [autoRotate, autoRotateSpeed, cameraAnimating, isInteracting, cameraPosition, updateCameraPosition]);

  /**
   * Performance monitoring
   */
  const updatePerformance = useCallback(() => {
    const now = window.performance?.now() || Date.now();
    const frameTime = now - lastFrameTime.current;
    lastFrameTime.current = now;

    // Keep track of last 60 frame times
    frameTimeRef.current.push(frameTime);
    if (frameTimeRef.current.length > 60) {
      frameTimeRef.current.shift();
    }

    // Calculate average FPS
    const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
    const fps = Math.round(1000 / avgFrameTime);

    // Determine quality based on performance
    let quality = 'high';
    if (adaptiveQuality) {
      if (fps < targetFPS * 0.7) {
        quality = 'low';
      } else if (fps < targetFPS * 0.85) {
        quality = 'medium';
      }
    }

    setPerformance({
      fps,
      frameTime: avgFrameTime,
      quality
    });
  }, [adaptiveQuality, targetFPS]);

  /**
   * Get universe statistics
   */
  const getUniverseStats = useCallback(() => {
    return {
      blocks: blocks.size,
      contracts: contracts.size,
      activeTransactions: activeTransactions.size,
      totalElements: blocks.size + contracts.size + activeTransactions.size,
      cameraPosition,
      cameraTarget,
      performance
    };
  }, [blocks.size, contracts.size, activeTransactions.size, cameraPosition, cameraTarget, performance]);

  /**
   * Find nearest element to camera
   */
  const findNearestElement = useCallback(() => {
    let nearest = null;
    let minDistance = Infinity;

    // Check blocks
    Array.from(blocks.values()).forEach((block) => {
      const distance = Math.sqrt(
        Math.pow(block.position[0] - cameraPosition[0], 2) +
        Math.pow(block.position[1] - cameraPosition[1], 2) +
        Math.pow(block.position[2] - cameraPosition[2], 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { type: 'block', data: block, distance };
      }
    });

    // Check contracts
    Array.from(contracts.values()).forEach((contract) => {
      const distance = Math.sqrt(
        Math.pow(contract.position[0] - cameraPosition[0], 2) +
        Math.pow(contract.position[1] - cameraPosition[1], 2) +
        Math.pow(contract.position[2] - cameraPosition[2], 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { type: 'contract', data: contract, distance };
      }
    });

    return nearest;
  }, [blocks, contracts, cameraPosition]);

  /**
   * Navigate to random element
   */
  const navigateToRandom = useCallback(() => {
    const blocksArray = Array.from(blocks.values());
    const contractsArray = Array.from(contracts.values());
    const allElements = [
      ...blocksArray.map(block => ({ type: 'block', data: block })),
      ...contractsArray.map(contract => ({ type: 'contract', data: contract }))
    ];

    if (allElements.length === 0) return;

    const randomElement = allElements[Math.floor(Math.random() * allElements.length)];
    
    if (randomElement.type === 'block') {
      handleBlockClick(randomElement.data.number);
    } else if (randomElement.type === 'contract') {
      handleContractClick(randomElement.data.address);
    }
  }, [blocks, contracts, handleBlockClick, handleContractClick]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'w':
          cameraControls.moveForward();
          break;
        case 's':
          cameraControls.moveBackward();
          break;
        case 'a':
          cameraControls.moveLeft();
          break;
        case 'd':
          cameraControls.moveRight();
          break;
        case 'q':
          cameraControls.moveUp();
          break;
        case 'e':
          cameraControls.moveDown();
          break;
        case 'r':
          cameraControls.reset();
          break;
        case ' ':
          event.preventDefault();
          navigateToRandom();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cameraControls, navigateToRandom]);

  // Auto-rotate animation loop
  useEffect(() => {
    let animationFrame;
    
    const animate = () => {
      updateAutoRotate();
      updatePerformance();
      animationFrame = requestAnimationFrame(animate);
    };

    if (sceneReady) {
      animate();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [sceneReady, updateAutoRotate, updatePerformance]);

  return {
    // State
    sceneReady,
    isInteracting,
    performance,
    cameraPosition,
    cameraTarget,
    cameraAnimating,
    
    // Validator state
    selectedValidator,
    filterMode,
    filterValue,
    
    // Actions
    setSceneReady,
    setIsInteracting,
    handleBlockClick,
    handleContractClick,
    handleTransactionClick,
    handleValidatorClick,
    updateCameraPosition,
    
    // Filtering
    clearFilters,
    setFilterMode,
    setFilterValue,
    
    // Camera controls
    cameraControls,
    
    // Utils
    getUniverseStats,
    findNearestElement,
    navigateToRandom,
    getValidatorNetwork,
    clearUniverse,
    
    // Data (filtered)
    blocks: filteredBlocks,
    contracts: filteredContracts,
    activeTransactions: Array.from(activeTransactions.values()),
    
    // Validator data
    validators,
    getValidator,
    getTopValidators
  };
};