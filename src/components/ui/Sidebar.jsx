/**
 * Professional Sidebar Component
 * Elegant detailed information panel for blockchain elements
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../state/useAppStore.js';
import { formatAddress, formatEther, formatGas, formatTimeAgo, formatNumber } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const Sidebar = () => {
  const { 
    selectedBlock, 
    selectedContract, 
    selectedTransaction, 
    clearSelection 
  } = useAppStore();

  const renderBlockDetails = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">⬢</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Block Details</h3>
            <p className="text-white/60 text-sm">#{formatNumber(selectedBlock.number)}</p>
          </div>
        </div>
        <motion.button
          onClick={clearSelection}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Transactions</div>
          <div className="text-white text-2xl font-bold">{formatNumber(selectedBlock.transactionCount)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Gas Used</div>
          <div className="text-white text-lg font-semibold">{formatGas(selectedBlock.gasUsed)}</div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Block Hash</div>
          <div className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded-lg">
            {selectedBlock.hash}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Miner</div>
          <div className="text-white font-mono text-sm">
            {formatAddress(selectedBlock.miner, 8, 6)}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Timestamp</div>
          <div className="text-white text-sm">{formatTimeAgo(selectedBlock.timestamp)}</div>
        </div>

        {/* Gas Utilization Bar */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Gas Utilization</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/30 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(parseFloat(selectedBlock.gasUsed) / parseFloat(selectedBlock.gasLimit)) * 100}%` 
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-white text-sm font-semibold">
              {((parseFloat(selectedBlock.gasUsed) / parseFloat(selectedBlock.gasLimit)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderContractDetails = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🪐</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Smart Contract</h3>
            <p className="text-white/60 text-sm">{selectedContract.contractName || 'Unknown Contract'}</p>
          </div>
        </div>
        <motion.button
          onClick={clearSelection}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>

      {/* Verification Status */}
      <div className={`rounded-xl p-4 border ${selectedContract.isVerified ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedContract.isVerified ? '✅' : '⚠️'}</span>
          <span className={`font-semibold ${selectedContract.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
            {selectedContract.isVerified ? 'Verified Contract' : 'Unverified Contract'}
          </span>
        </div>
      </div>

      {/* Function Stats */}
      {selectedContract.functions && selectedContract.functions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
            <div className="text-green-400 text-xs uppercase tracking-wider mb-1">Read</div>
            <div className="text-white text-xl font-bold">
              {selectedContract.functions.filter(f => f.isReadOnly).length}
            </div>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
            <div className="text-red-400 text-xs uppercase tracking-wider mb-1">Write</div>
            <div className="text-white text-xl font-bold">
              {selectedContract.functions.filter(f => !f.isReadOnly && f.type !== 'payable').length}
            </div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
            <div className="text-yellow-400 text-xs uppercase tracking-wider mb-1">Payable</div>
            <div className="text-white text-xl font-bold">
              {selectedContract.functions.filter(f => f.type === 'payable').length}
            </div>
          </div>
        </div>
      )}

      {/* Contract Address */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Contract Address</div>
        <div className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded-lg">
          {selectedContract.address}
        </div>
      </div>

      {/* Action Button */}
      <GlassButton className="w-full !py-3 !bg-gradient-to-r !from-purple-500/20 !to-pink-500/20 border-purple-400/30">
        <span className="mr-2">📊</span>
        Analyze Contract
      </GlassButton>
    </motion.div>
  );

  const renderTransactionDetails = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">⚡</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Transaction</h3>
            <p className="text-white/60 text-sm">Blockchain Transfer</p>
          </div>
        </div>
        <motion.button
          onClick={clearSelection}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>

      {/* Status & Value */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl p-4 border ${selectedTransaction.status === 1 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Status</div>
          <div className={`font-semibold ${selectedTransaction.status === 1 ? 'text-green-400' : 'text-red-400'}`}>
            {selectedTransaction.status === 1 ? '✓ Success' : '✗ Failed'}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Value</div>
          <div className="text-white font-semibold">{formatEther(selectedTransaction.value)}</div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Transaction Hash</div>
          <div className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded-lg">
            {selectedTransaction.hash}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs uppercase tracking-wider mb-2">From</div>
            <div className="text-white font-mono text-xs">
              {formatAddress(selectedTransaction.from, 6, 4)}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs uppercase tracking-wider mb-2">To</div>
            <div className="text-white font-mono text-xs">
              {formatAddress(selectedTransaction.to, 6, 4)}
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Gas Used</div>
          <div className="text-white text-sm">{formatGas(selectedTransaction.gasUsed)}</div>
        </div>
      </div>
    </motion.div>
  );

  if (!selectedBlock && !selectedContract && !selectedTransaction) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-4 md:right-6 top-20 md:top-24 w-[calc(100%-2rem)] md:w-96 z-[999] max-h-[calc(100vh-120px)] overflow-y-auto"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          pointerEvents: 'auto'
        }}
      >
        <div className="glass rounded-3xl p-6 backdrop-blur-professional border border-white/20 shadow-2xl card-professional">
          {selectedBlock && renderBlockDetails()}
          {selectedContract && renderContractDetails()}
          {selectedTransaction && renderTransactionDetails()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Sidebar;