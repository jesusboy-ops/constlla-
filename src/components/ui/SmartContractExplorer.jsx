/**
 * Smart Contract Explorer
 * Comprehensive contract analysis with address input, visualization, and AI insights
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractData } from '../../hooks/useContractData.js';
import ContractVisualizer from './ContractVisualizer.jsx';
import AIContractInsights from './AISummary.jsx';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';
import Loader from './Loader.jsx';

const SmartContractExplorer = ({ initialAddress = '', onClose }) => {
  const [inputAddress, setInputAddress] = useState(initialAddress);
  const [activeTab, setActiveTab] = useState('overview');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { fetchContractData } = useContractData();

  const loadContract = async (address) => {
    if (!address || address.length !== 42 || !address.startsWith('0x')) {
      setError('Please enter a valid Ethereum address (0x...)');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contractData = await fetchContractData(address);
      if (contractData) {
        setContract(contractData);
      } else {
        setError('Failed to load contract data. Address may not be a contract.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadContract(inputAddress);
  };

  // Load initial contract if provided
  useEffect(() => {
    if (initialAddress) {
      loadContract(initialAddress);
    }
  }, [initialAddress]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'functions', label: 'Functions', icon: '⚙️' },
    { id: 'visualizer', label: 'Graph', icon: '🕸️' },
    { id: 'ai-insights', label: 'AI Analysis', icon: '🤖' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              🔍 Smart Contract Explorer
            </h2>
            {onClose && (
              <GlassButton size="sm" onClick={onClose}>✕</GlassButton>
            )}
          </div>

          {/* Address Input */}
          <div className="p-6 border-b border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="Enter contract address (0x...)"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20"
              />
              <GlassButton
                type="submit"
                disabled={loading || !inputAddress}
                loading={loading}
              >
                {loading ? 'Loading...' : 'Analyze'}
              </GlassButton>
            </form>
            
            {error && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader type="spinner" size="xl" text="Analyzing contract..." />
              </div>
            )}

            {contract && !loading && (
              <div className="h-full flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-white/10 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <ContractOverview key="overview" contract={contract} />
                    )}
                    {activeTab === 'functions' && (
                      <ContractFunctions key="functions" contract={contract} />
                    )}
                    {activeTab === 'visualizer' && (
                      <ContractVisualizer key="visualizer" contract={contract} />
                    )}
                    {activeTab === 'ai-insights' && (
                      <AIContractInsights key="ai-insights" contract={contract} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {!contract && !loading && !error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Explore Smart Contracts
                  </h3>
                  <p className="text-white/60 mb-6">
                    Enter a contract address to analyze its functions, security, and behavior
                  </p>
                  <div className="space-y-2 text-sm text-white/40">
                    <p>• View contract functions and their relationships</p>
                    <p>• Get AI-powered security analysis</p>
                    <p>• Visualize contract architecture</p>
                    <p>• Understand economic models</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

// Contract Overview Tab
const ContractOverview = ({ contract }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Info */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-4">Contract Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Address:</span>
            <span className="text-white font-mono text-xs">{contract.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Name:</span>
            <span className="text-white">{contract.contractName || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Verified:</span>
            <span className={contract.isVerified ? 'text-green-400' : 'text-red-400'}>
              {contract.isVerified ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Compiler:</span>
            <span className="text-white">{contract.compilerVersion || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-4">Statistics</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Total Functions:</span>
            <span className="text-white">{contract.functions?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Read Functions:</span>
            <span className="text-green-400">
              {contract.functions?.filter(f => f.isReadOnly).length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Write Functions:</span>
            <span className="text-yellow-400">
              {contract.functions?.filter(f => !f.isReadOnly).length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Events:</span>
            <span className="text-blue-400">{contract.events?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Source Code Preview */}
    {contract.source?.SourceCode && (
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-4">Source Code Preview</h3>
        <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-white/80 text-xs font-mono whitespace-pre-wrap">
            {contract.source.SourceCode.substring(0, 1000)}
            {contract.source.SourceCode.length > 1000 && '...'}
          </pre>
        </div>
      </div>
    )}
  </motion.div>
);

// Contract Functions Tab
const ContractFunctions = ({ contract }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-white font-semibold">Contract Functions</h3>
      <span className="text-white/60 text-sm">
        {contract.functions?.length || 0} functions
      </span>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {contract.functions?.map((func, index) => (
        <div key={index} className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">{func.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              func.isReadOnly 
                ? 'bg-green-500/20 text-green-400' 
                : func.type === 'payable'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {func.isReadOnly ? 'READ' : func.type === 'payable' ? 'PAYABLE' : 'WRITE'}
            </span>
          </div>
          
          <div className="text-xs text-white/60 space-y-1">
            <div>
              <span className="text-white/40">Inputs:</span> {func.inputs?.length || 0}
            </div>
            <div>
              <span className="text-white/40">Outputs:</span> {func.outputs?.length || 0}
            </div>
          </div>
        </div>
      ))}
    </div>

    {(!contract.functions || contract.functions.length === 0) && (
      <div className="text-center py-12">
        <p className="text-white/60">No functions found or contract not verified</p>
      </div>
    )}
  </motion.div>
);

export default SmartContractExplorer;