/**
 * Live Stats Bar Component
 * Professional real-time blockchain metrics display with Web3 Constellation integration
 */

import { motion } from 'framer-motion';
import { useRealtimeBlockchain } from '../../hooks/useRealtimeBlockchain.js';
import { useChainStore } from '../../state/useChainStore.js';
import { formatNumber, formatGas, formatChainName } from '../../utils/formatters.js';

const LiveStatsBar = ({ compact = false }) => {
  const { 
    latestBlock, 
    networkActivity, 
    isConnected, 
    error 
  } = useRealtimeBlockchain();
  const { activeChain } = useChainStore();

  const stats = [
    {
      label: 'Latest Block',
      value: latestBlock?.number ? `#${formatNumber(latestBlock.number)}` : '-',
      icon: '⬢',
      color: 'text-blue-400'
    },
    {
      label: 'Gas Price',
      value: networkActivity?.gasPrice ? formatGas(networkActivity.gasPrice) : '-',
      icon: '⛽',
      color: 'text-orange-400'
    },
    {
      label: 'TPS',
      value: networkActivity?.tps ? networkActivity.tps.toFixed(1) : '-',
      icon: '⚡',
      color: 'text-yellow-400'
    },
    {
      label: 'Pending Txs',
      value: networkActivity?.pendingTxs ? formatNumber(networkActivity.pendingTxs) : '-',
      icon: '⏳',
      color: 'text-cyan-400'
    },
    {
      label: 'Network',
      value: formatChainName(activeChain),
      icon: '🌐',
      color: 'text-purple-400'
    }
  ];

  return (
    <motion.div
      className="fixed bottom-6 left-0 right-0 z-40 flex justify-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
    >
      <div className="glass rounded-3xl px-8 py-4 backdrop-blur-professional border border-white/20 shadow-2xl will-change-transform">
        <div className="flex items-center gap-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <div className={`text-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-white/50 text-xs uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
                <span className="text-white font-semibold text-sm">
                  {!isConnected && stat.value === '-' ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      <span className="text-white/60">Connecting...</span>
                    </div>
                  ) : error && stat.value === '-' ? (
                    <span className="text-red-400">Error</span>
                  ) : (
                    stat.value
                  )}
                </span>
              </div>
            </motion.div>
          ))}
          
          {/* Live Status Indicator */}
          <motion.div
            className="flex items-center gap-2 ml-6 pl-6 border-l border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-400' : error ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
              <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-30 ${
                isConnected ? 'bg-green-400' : error ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
            </motion.div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isConnected ? 'text-green-400' : error ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {isConnected ? 'LIVE' : error ? 'ERROR' : 'CONNECTING'}
              </span>
              <span className="text-white/60 text-xs">
                {isConnected ? 'Real-time data' : error ? 'Connection failed' : 'Establishing connection'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveStatsBar;