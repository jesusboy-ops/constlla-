/**
 * Mobile Bottom Sheet
 * Swipe-up data display for mobile devices
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../state/useAppStore.js';
import { useRealtimeBlockchain } from '../../hooks/useRealtimeBlockchain.js';
import { useChainStore } from '../../state/useChainStore.js';
import { useVisualizationStore } from '../../state/useVisualizationStore.js';
import { formatNumber, formatGas, formatChainName } from '../../utils/formatters.js';

const MobileBottomSheet = ({ isVisible, onClose }) => {
  const [sheetHeight, setSheetHeight] = useState('collapsed'); // collapsed, half, full
  const { selectedBlock, selectedContract } = useAppStore();
  const { latestBlock, networkActivity } = useRealtimeBlockchain();
  const { activeChain } = useChainStore();
  const { selectedEntity, setSelectedEntity } = useVisualizationStore();

  // Debug: Log selected entity changes
  console.log('MobileBottomSheet: isVisible:', isVisible);
  console.log('MobileBottomSheet: selectedEntity:', selectedEntity);

  const handleClose = () => {
    setSelectedEntity(null); // Clear selected entity when closing
    onClose();
  };

  const heights = {
    collapsed: '20%',
    half: '50%',
    full: '90%'
  };

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    
    if (velocity.y > 500 || offset.y > 100) {
      // Swipe down - collapse or close
      if (sheetHeight === 'full') {
        setSheetHeight('half');
      } else if (sheetHeight === 'half') {
        setSheetHeight('collapsed');
      } else {
        handleClose();
      }
    } else if (velocity.y < -500 || offset.y < -100) {
      // Swipe up - expand
      if (sheetHeight === 'collapsed') {
        setSheetHeight('half');
      } else if (sheetHeight === 'half') {
        setSheetHeight('full');
      }
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50"
        style={{ height: heights[sheetHeight] }}
      >
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="w-full h-full bg-black/90 backdrop-blur-xl border-t border-white/20 rounded-t-3xl overflow-hidden"
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Content */}
          <div className="px-6 pb-6 h-full overflow-y-auto">
            {selectedEntity ? (
              <SelectedPlanetContent planet={selectedEntity} />
            ) : selectedBlock || selectedContract ? (
              <SelectedEntityContent 
                block={selectedBlock} 
                contract={selectedContract} 
              />
            ) : (
              <NetworkOverview 
                latestBlock={latestBlock}
                networkActivity={networkActivity}
                activeChain={activeChain}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Selected Planet Content (from visualization store)
const SelectedPlanetContent = ({ planet }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">
      {planet.planetName || `Planet ${planet.id}`}
    </h2>
    
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Type</div>
          <div className="text-white font-semibold">{planet.type || 'Contract'}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Value</div>
          <div className="text-white font-semibold">{planet.totalValue || '0'} ETH</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Daily TXs</div>
          <div className="text-white font-semibold">{planet.dailyTransactions || '0'}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Gas Used</div>
          <div className="text-white font-semibold">{formatNumber(planet.gasUsed || 0)}</div>
        </div>
      </div>
      
      {planet.contractAddress && (
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Contract Address</div>
          <div className="text-white font-mono text-xs break-all">{planet.contractAddress}</div>
        </div>
      )}
      
      {planet.description && (
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Description</div>
          <div className="text-white text-sm">{planet.description}</div>
        </div>
      )}
    </div>

    <div className="flex gap-2 mt-4">
      <button className="flex-1 bg-purple-500/20 border border-purple-400/30 rounded-lg py-2 px-4 text-white text-sm">
        Dock
      </button>
      <button className="flex-1 bg-blue-500/20 border border-blue-400/30 rounded-lg py-2 px-4 text-white text-sm">
        Focus
      </button>
    </div>
  </div>
);

// Selected Entity Content
const SelectedEntityContent = ({ block, contract }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">
      {block ? `Block #${block.number}` : contract?.name || 'Contract Details'}
    </h2>
    
    {block && (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/60 text-sm">Transactions</div>
            <div className="text-white font-semibold">{block.transactions?.length || 0}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/60 text-sm">Gas Used</div>
            <div className="text-white font-semibold">{formatNumber(block.gasUsed || 0)}</div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Hash</div>
          <div className="text-white font-mono text-xs break-all">{block.hash}</div>
        </div>
      </div>
    )}

    {contract && (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/60 text-sm">Total Value</div>
            <div className="text-white font-semibold">{contract.totalValue} ETH</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/60 text-sm">Daily TXs</div>
            <div className="text-white font-semibold">{contract.dailyTransactions}</div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white/60 text-sm">Address</div>
          <div className="text-white font-mono text-xs break-all">{contract.contractAddress}</div>
        </div>
      </div>
    )}
  </div>
);

// Network Overview Content
const NetworkOverview = ({ latestBlock, networkActivity, activeChain }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">Network Overview</h2>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white/5 rounded-lg p-3">
        <div className="text-white/60 text-sm">Latest Block</div>
        <div className="text-white font-semibold">
          #{formatNumber(latestBlock?.number || 0)}
        </div>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3">
        <div className="text-white/60 text-sm">Gas Price</div>
        <div className="text-white font-semibold">
          {networkActivity?.gasPrice ? formatGas(networkActivity.gasPrice) : '-'}
        </div>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3">
        <div className="text-white/60 text-sm">TPS</div>
        <div className="text-white font-semibold">
          {networkActivity?.tps?.toFixed(1) || '-'}
        </div>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3">
        <div className="text-white/60 text-sm">Network</div>
        <div className="text-white font-semibold">
          {formatChainName(activeChain)}
        </div>
      </div>
    </div>

    <div className="flex gap-2 mt-4">
      <button className="flex-1 bg-purple-500/20 border border-purple-400/30 rounded-lg py-2 px-4 text-white text-sm">
        Dock
      </button>
      <button className="flex-1 bg-blue-500/20 border border-blue-400/30 rounded-lg py-2 px-4 text-white text-sm">
        Focus
      </button>
    </div>
  </div>
);

export default MobileBottomSheet;