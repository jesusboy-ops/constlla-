/**
 * Utility functions for mapping blockchain data to 3D visualizations
 */

/**
 * Map block data to star properties
 */
export const mapBlockToStar = (block) => {
  if (!block) return null;

  // Calculate star size based on transaction count
  const baseSize = 0.5;
  const sizeMultiplier = Math.min(block.transactionCount / 10, 3);
  const size = baseSize + sizeMultiplier;

  // Calculate brightness based on gas usage
  const gasUsed = parseFloat(block.gasUsed) || 0;
  const gasLimit = parseFloat(block.gasLimit) || 1;
  const gasUtilization = gasUsed / gasLimit;
  const brightness = 0.3 + (gasUtilization * 0.7);

  // Calculate color based on block age - all white for consistency
  const now = Date.now() / 1000;
  const age = now - block.timestamp;
  const maxAge = 3600; // 1 hour
  const ageRatio = Math.min(age / maxAge, 1);
  
  // Pure white color with varying brightness based on age
  const lightness = 90 - (ageRatio * 20); // Bright white to dim white

  return {
    position: generateBlockPosition(block),
    size,
    brightness,
    color: `hsl(0, 0%, ${lightness}%)`, // Pure white with varying brightness
    glowIntensity: brightness,
    pulseSpeed: 1 + (gasUtilization * 2),
    metadata: {
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      transactionCount: block.transactionCount,
      gasUsed: block.gasUsed,
      gasLimit: block.gasLimit,
      miner: block.miner
    }
  };
};

/**
 * Map contract data to realistic planet properties
 */
export const mapContractToPlanet = (contract) => {
  if (!contract) return null;

  // Calculate planet size based on function count
  const functionCount = contract.functions ? contract.functions.length : 0;
  const baseSize = 1.2;
  const sizeMultiplier = Math.min(functionCount / 15, 3);
  const size = baseSize + sizeMultiplier;

  // All planets are white/silver for realism
  const color = '#ffffff';

  // Calculate orbit ring properties based on function types
  const hasReadFunctions = contract.functions?.some(f => f.isReadOnly) || false;
  const hasWriteFunctions = contract.functions?.some(f => !f.isReadOnly) || false;
  
  const orbitRings = [];
  if (hasReadFunctions) {
    orbitRings.push({
      radius: size * 2.2,
      color: '#ffffff',
      opacity: 0.4,
      speed: 2 // Faster ring rotation
    });
  }
  if (hasWriteFunctions) {
    orbitRings.push({
      radius: size * 3.5,
      color: '#e0e0e0',
      opacity: 0.3,
      speed: 1.2 // Faster ring rotation
    });
  }
  
  // Add additional rings for complex contracts
  if (functionCount > 30) {
    orbitRings.push({
      radius: size * 4.8,
      color: '#d0d0d0',
      opacity: 0.2,
      speed: 0.8
    });
  }

  return {
    position: generateContractPosition(contract),
    size,
    color,
    orbitRings,
    rotationSpeed: 0.008 + (functionCount * 0.0005), // Enhanced rotation speed
    glowIntensity: contract.isVerified ? 0.6 : 0.2,
    metadata: {
      address: contract.address,
      name: contract.contractName || 'Contract',
      isVerified: contract.isVerified,
      functionCount,
      chainName: contract.chainName
    }
  };
};

/**
 * Map transaction to particle trail properties
 */
export const mapTransactionToTrail = (transaction, fromBlock, toContract) => {
  if (!transaction) return null;

  // Calculate trail properties based on transaction value
  const value = parseFloat(transaction.value) || 0;
  const gasUsed = parseFloat(transaction.gasUsed) || 0;
  
  // Trail intensity based on value
  const intensity = Math.min(value / 10, 1); // Normalize to 0-1
  const thickness = 0.1 + (intensity * 0.5);
  
  // Color based on transaction status and type
  let color = '#3B82F6'; // Default blue
  if (transaction.status === 0) {
    color = '#EF4444'; // Red for failed
  } else if (transaction.isContractInteraction) {
    color = '#F59E0B'; // Orange for contract calls
  } else if (value > 0) {
    color = '#10B981'; // Green for value transfers
  }

  // Calculate start and end positions
  const startPos = fromBlock ? fromBlock.position : [0, 0, 0];
  const endPos = toContract ? toContract.position : 
                 transaction.to ? generateAddressPosition(transaction.to) : [0, 0, 0];

  return {
    startPosition: startPos,
    endPosition: endPos,
    thickness,
    color,
    intensity,
    duration: 3000, // 3 seconds
    particleCount: Math.floor(10 + (intensity * 20)),
    speed: 1 + (gasUsed / 100000), // Faster for higher gas
    metadata: {
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      gasUsed: transaction.gasUsed,
      status: transaction.status
    }
  };
};

/**
 * Generate 3D position based on block hash
 */
export const generateBlockPosition = (block) => {
  const hash = block.hash || block.number.toString();
  const seed = hashToSeed(hash);
  
  // Use deterministic random based on hash
  const rng = createSeededRandom(seed);
  
  const spread = 200;
  const x = (rng() - 0.5) * spread;
  const y = (rng() - 0.5) * spread;
  const z = (rng() - 0.5) * spread;
  
  return [x, y, z];
};

/**
 * Generate 3D position based on contract address
 */
export const generateContractPosition = (contract) => {
  const address = contract.address || '';
  const seed = hashToSeed(address);
  
  const rng = createSeededRandom(seed);
  
  const spread = 300;
  const x = (rng() - 0.5) * spread;
  const y = (rng() - 0.5) * spread;
  const z = (rng() - 0.5) * spread;
  
  return [x, y, z];
};

/**
 * Generate position for any address
 */
export const generateAddressPosition = (address) => {
  const seed = hashToSeed(address);
  const rng = createSeededRandom(seed);
  
  const spread = 150;
  const x = (rng() - 0.5) * spread;
  const y = (rng() - 0.5) * spread;
  const z = (rng() - 0.5) * spread;
  
  return [x, y, z];
};

/**
 * Convert hash string to numeric seed
 */
const hashToSeed = (hash) => {
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    seed = ((seed << 5) - seed) + char;
    seed = seed & seed; // Convert to 32-bit integer
  }
  return Math.abs(seed);
};

/**
 * Create seeded random number generator
 */
const createSeededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};