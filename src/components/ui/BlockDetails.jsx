/**
 * Block Details Component
 * Detailed view of blockchain block information
 */

import { motion } from 'framer-motion';
import { formatAddress, formatEther, formatGas, formatTimeAgo, formatNumber } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';

const BlockDetails = ({ block, onClose }) => {
  if (!block) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Block #{formatNumber(block.number)}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <span className="text-white/60 text-sm block">Hash</span>
              <p className="text-white font-mono text-xs break-all">
                {block.hash}
              </p>
            </div>

            <div>
              <span className="text-white/60 text-sm block">Parent Hash</span>
              <p className="text-white font-mono text-xs break-all">
                {block.parentHash}
              </p>
            </div>

            <div>
              <span className="text-white/60 text-sm block">Timestamp</span>
              <p className="text-white">
                {formatTimeAgo(block.timestamp)}
              </p>
            </div>

            <div>
              <span className="text-white/60 text-sm block">Miner</span>
              <p className="text-white font-mono text-xs">
                {formatAddress(block.miner)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-white/60 text-sm block">Transactions</span>
              <p className="text-white text-lg font-semibold">
                {formatNumber(block.transactionCount)}
              </p>
            </div>

            <div>
              <span className="text-white/60 text-sm block">Gas Used / Limit</span>
              <p className="text-white">
                {formatGas(block.gasUsed)} / {formatGas(block.gasLimit)}
              </p>
            </div>

            <div>
              <span className="text-white/60 text-sm block">Gas Utilization</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(parseFloat(block.gasUsed) / parseFloat(block.gasLimit)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-white text-sm">
                  {((parseFloat(block.gasUsed) / parseFloat(block.gasLimit)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {block.baseFeePerGas && (
              <div>
                <span className="text-white/60 text-sm block">Base Fee</span>
                <p className="text-white">
                  {formatGas(block.baseFeePerGas)}
                </p>
              </div>
            )}
          </div>
        </div>

        {block.transactions && block.transactions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white font-semibold mb-3">Recent Transactions</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {block.transactions.slice(0, 5).map((txHash, index) => (
                <div
                  key={txHash}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <span className="text-white/80 font-mono text-xs">
                    {formatAddress(txHash, 8, 6)}
                  </span>
                  <span className="text-white/60 text-xs">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default BlockDetails;