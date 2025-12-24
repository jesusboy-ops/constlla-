/**
 * Utility functions for formatting blockchain data
 */

/**
 * Format large numbers with appropriate suffixes
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (number === 0) return '0';
  if (number < 1000) return number.toFixed(decimals);
  if (number < 1000000) return (number / 1000).toFixed(decimals) + 'K';
  if (number < 1000000000) return (number / 1000000).toFixed(decimals) + 'M';
  if (number < 1000000000000) return (number / 1000000000).toFixed(decimals) + 'B';
  return (number / 1000000000000).toFixed(decimals) + 'T';
};

/**
 * Format Ethereum addresses
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format transaction hash
 */
export const formatTxHash = (hash, chars = 8) => {
  if (!hash) return '';
  return `${hash.slice(0, chars)}...`;
};

/**
 * Format gas values
 */
export const formatGas = (gas, unit = 'gwei') => {
  if (!gas) return '0';
  
  const gasNum = typeof gas === 'string' ? parseFloat(gas) : gas;
  
  if (unit === 'gwei') {
    return `${gasNum.toFixed(2)} gwei`;
  }
  
  return formatNumber(gasNum);
};

/**
 * Format Ether values
 */
export const formatEther = (wei, decimals = 4) => {
  if (!wei) return '0 ETH';
  
  const etherValue = typeof wei === 'string' ? parseFloat(wei) : wei;
  
  if (etherValue === 0) return '0 ETH';
  if (etherValue < 0.0001) return '<0.0001 ETH';
  
  return `${etherValue.toFixed(decimals)} ETH`;
};

/**
 * Format time ago
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = Date.now();
  const time = typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000;
  const diff = now - time;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

/**
 * Format block time
 */
export const formatBlockTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Format duration in milliseconds
 */
export const formatDuration = (ms) => {
  if (!ms) return '0ms';
  
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  
  return `${(ms / 3600000).toFixed(1)}h`;
};

/**
 * Format contract name
 */
export const formatContractName = (name, address) => {
  if (name && name !== 'Contract') return name;
  return formatAddress(address);
};

/**
 * Format chain name for display
 */
export const formatChainName = (chainName) => {
  const chainNames = {
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    base: 'Base',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
    bsc: 'BSC'
  };
  
  return chainNames[chainName] || chainName;
};

/**
 * Format transaction status
 */
export const formatTxStatus = (status) => {
  if (status === 1 || status === '1') return 'Success';
  if (status === 0 || status === '0') return 'Failed';
  return 'Pending';
};

/**
 * Format function signature
 */
export const formatFunctionSignature = (func) => {
  if (!func) return '';
  
  const inputs = func.inputs ? func.inputs.map(input => input.type).join(', ') : '';
  return `${func.name}(${inputs})`;
};

/**
 * Get status color class
 */
export const getStatusColor = (status) => {
  if (status === 1 || status === '1' || status === 'success') {
    return 'text-green-400';
  }
  if (status === 0 || status === '0' || status === 'failed') {
    return 'text-red-400';
  }
  return 'text-yellow-400';
};

/**
 * Get function type color
 */
export const getFunctionTypeColor = (func) => {
  if (func.isReadOnly) return 'text-green-400';
  if (func.type === 'payable') return 'text-yellow-400';
  return 'text-red-400';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format JSON for display
 */
export const formatJSON = (obj, indent = 2) => {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    return 'Invalid JSON';
  }
};

/**
 * Parse and format ABI
 */
export const formatABI = (abi) => {
  if (!abi) return 'No ABI available';
  
  try {
    const parsed = typeof abi === 'string' ? JSON.parse(abi) : abi;
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    return 'Invalid ABI format';
  }
};