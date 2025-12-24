/**
 * Contextual Data Panel
 * Distance-based data disclosure - appears beside focused entities
 * Persistent modal that stays open until explicitly closed
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useVisualizationStore, ENTITY_TYPES } from '../../state/useVisualizationStore.js';

const ContextualDataPanel = () => {
  const { 
    selectedEntity, 
    focusedEntity,
    setSelectedEntity,
    setFocusedEntity
  } = useVisualizationStore();
  
  // Determine which entity to show data for - ONLY selected/focused
  const activeEntity = focusedEntity || selectedEntity;
  
  if (!activeEntity) return null;
  
  const handleClose = () => {
    setSelectedEntity(null);
    setFocusedEntity(null);
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={handleClose} // Close when clicking backdrop
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            type: 'spring',
            stiffness: 400,
            damping: 25,
            duration: 0.3
          }}
          className="relative mx-4 max-w-lg w-full pointer-events-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
          style={{
            background: 'rgba(0, 15, 30, 0.95)', // More opaque background
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(100, 200, 255, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 80px rgba(0, 150, 255, 0.15)'
          }}
        >
          {/* Entity Type Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <EntityTypeIndicator entity={activeEntity} />
              
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white text-xl p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Entity Data */}
          <div className="p-4">
            {activeEntity.type === ENTITY_TYPES.STAR && (
              <BlockStarData entity={activeEntity} />
            )}
            
            {activeEntity.type === ENTITY_TYPES.PLANET && (
              <ContractPlanetData entity={activeEntity} />
            )}
            
            {activeEntity.type === ENTITY_TYPES.MOON && (
              <TransactionMoonData entity={activeEntity} />
            )}
          </div>
          
          {/* Actions */}
          <div className="p-4 border-t border-white/10 flex gap-2">
            <motion.button
              onClick={() => setFocusedEntity(activeEntity)}
              className="flex-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg py-3 text-blue-200 text-sm font-medium hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Focus View
            </motion.button>
            
            <motion.button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-400/30 rounded-lg py-3 text-gray-200 text-sm font-medium hover:from-gray-500/30 hover:to-gray-600/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </div>
          
          {/* Subtle glow effect */}
          <div 
            className="absolute inset-0 rounded-16 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${activeEntity.color || '#8b5cf6'}20 0%, transparent 70%)`,
              filter: 'blur(15px)'
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Entity Type Indicator
 */
const EntityTypeIndicator = ({ entity }) => {
  const getTypeInfo = () => {
    switch (entity.type) {
      case ENTITY_TYPES.STAR:
        return {
          icon: '⭐',
          label: entity.aggregated ? 'Block Cluster' : 'Blockchain Block',
          color: 'text-yellow-300'
        };
      case ENTITY_TYPES.PLANET:
        return {
          icon: '🪐',
          label: 'Smart Contract',
          color: 'text-purple-300'
        };
      case ENTITY_TYPES.MOON:
        return {
          icon: '🌙',
          label: 'Transaction',
          color: 'text-blue-300'
        };
      default:
        return {
          icon: '✨',
          label: 'Entity',
          color: 'text-white'
        };
    }
  };
  
  const typeInfo = getTypeInfo();
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{typeInfo.icon}</span>
      <div>
        <div className={`font-medium ${typeInfo.color}`}>
          {typeInfo.label}
        </div>
        {entity.network && (
          <div className="text-white/50 text-xs capitalize">
            {entity.network} Network
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Block Star Data Component
 */
const BlockStarData = ({ entity }) => (
  <div className="space-y-3">
    {entity.aggregated ? (
      <>
        <DataField 
          label="Block Count" 
          value={entity.blockCount.toLocaleString()}
          icon="📊"
        />
        <DataField 
          label="Total Transactions" 
          value={entity.transactions.toLocaleString()}
          icon="🔄"
        />
      </>
    ) : (
      <>
        <div className="text-center mb-3">
          <div className="text-xl font-mono text-blue-300">
            #{entity.blockNumber}
          </div>
          <div className="text-white/50 text-xs">
            {new Date(entity.timestamp).toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <DataField 
            label="Transactions" 
            value={entity.transactions.toLocaleString()}
            icon="🔄"
          />
          <DataField 
            label="Gas Used" 
            value={`${(entity.gasUsed / 1000000).toFixed(1)}M`}
            icon="⛽"
          />
        </div>
      </>
    )}
    
    <div className="pt-2 border-t border-white/10">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">Age:</span>
        <span className="text-white">
          {Math.floor((Date.now() - entity.timestamp) / 60000)}m ago
        </span>
      </div>
    </div>
  </div>
);

/**
 * Contract Planet Data Component
 */
const ContractPlanetData = ({ entity }) => (
  <div className="space-y-3">
    <div className="text-center mb-3">
      <div className="text-lg font-bold text-purple-300 mb-1">
        {entity.planetName || 'Unknown Planet'}
      </div>
      <div className="text-sm font-mono text-purple-200 break-all">
        {entity.contractAddress.substring(0, 20)}...
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <DataField 
        label="Complexity" 
        value={entity.complexity}
        icon="🧠"
      />
      <DataField 
        label="Daily TXs" 
        value={entity.dailyTransactions.toLocaleString()}
        icon="📈"
      />
      <DataField 
        label="Total Value" 
        value={`${entity.totalValue} ETH`}
        icon="💎"
        highlight={parseFloat(entity.totalValue) > 1000}
      />
      <DataField 
        label="Verified" 
        value={entity.verified ? 'Yes' : 'No'}
        icon="✅"
        highlight={entity.verified}
      />
    </div>
    
    <div className="pt-2 border-t border-white/10">
      <div className="text-xs text-white/60 text-center">
        Planet Type: {entity.planetType || 'Meridian Entity'}
      </div>
    </div>
  </div>
);

/**
 * Transaction Moon Data Component
 */
const TransactionMoonData = ({ entity }) => (
  <div className="space-y-3">
    <div className="text-center mb-3">
      <div className="text-xs font-mono text-blue-300 break-all">
        {entity.txHash.substring(0, 16)}...
      </div>
      <div className={`text-xs mt-1 ${
        entity.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
      }`}>
        {entity.status}
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <DataField 
        label="Value" 
        value={`${entity.value} ETH`}
        icon="💰"
        highlight={parseFloat(entity.value) > 1}
      />
      <DataField 
        label="Gas Price" 
        value={`${entity.gasPrice} gwei`}
        icon="⚡"
      />
    </div>
  </div>
);

/**
 * Data Field Component
 */
const DataField = ({ label, value, icon, highlight = false }) => (
  <div className={`p-2 rounded-lg ${
    highlight ? 'bg-green-500/10 border border-green-400/20' : 'bg-white/3'
  }`}>
    <div className="flex items-center gap-1 mb-1">
      <span className="text-xs">{icon}</span>
      <span className="text-white/60 text-xs">{label}</span>
    </div>
    <div className={`text-sm font-medium ${
      highlight ? 'text-green-300' : 'text-white'
    }`}>
      {value}
    </div>
  </div>
);

export default ContextualDataPanel;