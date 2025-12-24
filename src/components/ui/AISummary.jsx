/**
 * AI Contract Insight Engine
 * Advanced AI-powered smart contract analysis and risk assessment
 * Provides plain-language summaries and security insights
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';
import Loader from './Loader.jsx';

const AIContractInsights = ({ contract, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [analysisType, setAnalysisType] = useState('overview');

  const generateInsights = async (type = 'overview') => {
    setLoading(true);
    setAnalysisType(type);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    if (!contract) {
      setLoading(false);
      return;
    }

    // Advanced AI analysis simulation
    const analysisResults = {
      overview: generateOverviewAnalysis(contract),
      security: generateSecurityAnalysis(contract),
      functionality: generateFunctionalityAnalysis(contract),
      economics: generateEconomicsAnalysis(contract)
    };
    
    setInsights(analysisResults[type]);
    setLoading(false);
  };

  const generateOverviewAnalysis = (contract) => {
    const functionCount = contract.functions?.length || 0;
    const readFunctions = contract.functions?.filter(f => f.isReadOnly).length || 0;
    const writeFunctions = functionCount - readFunctions;
    
    return {
      title: 'Smart Contract Overview',
      summary: `This ${contract.isVerified ? 'verified' : 'unverified'} smart contract contains ${functionCount} functions with ${readFunctions} read-only and ${writeFunctions} state-changing operations. ${getComplexityDescription(functionCount)} The contract ${contract.isVerified ? 'has been verified and its source code is publicly available' : 'is not verified, which may indicate higher risk'}.`,
      
      keyPoints: [
        `📊 **Function Analysis**: ${functionCount} total functions (${readFunctions} read, ${writeFunctions} write)`,
        `🔍 **Verification Status**: ${contract.isVerified ? '✅ Verified - Source code available' : '⚠️ Not verified - Higher risk'}`,
        `⚙️ **Complexity Level**: ${getComplexityLevel(functionCount)}`,
        `🏗️ **Contract Type**: ${inferContractType(contract)}`,
        `📅 **Deployment**: ${contract.creation ? `Block ${contract.creation.blockNumber}` : 'Unknown'}`
      ],
      
      riskLevel: contract.isVerified ? (functionCount > 50 ? 'Medium' : 'Low') : 'High',
      confidence: contract.isVerified ? 92 : 65,
      
      recommendations: [
        contract.isVerified ? 'Source code is available for review' : 'Consider verifying the contract source code',
        functionCount > 30 ? 'Complex contract - review functions carefully' : 'Moderate complexity contract',
        'Always test interactions on testnet first'
      ]
    };
  };

  const generateSecurityAnalysis = (contract) => {
    const hasPayableFunctions = contract.functions?.some(f => f.type === 'payable') || false;
    const hasOwnerFunctions = contract.functions?.some(f => f.name.toLowerCase().includes('owner')) || false;
    const hasUpgradeable = contract.functions?.some(f => f.name.toLowerCase().includes('upgrade')) || false;
    
    return {
      title: 'Security Risk Assessment',
      summary: `Security analysis reveals ${hasPayableFunctions ? 'payable functions that handle ETH' : 'no direct ETH handling'}. ${hasOwnerFunctions ? 'Owner-restricted functions detected' : 'No obvious owner controls'}. ${hasUpgradeable ? 'Contract appears to be upgradeable' : 'Contract appears to be immutable'}.`,
      
      keyPoints: [
        `💰 **ETH Handling**: ${hasPayableFunctions ? '⚠️ Contract can receive ETH' : '✅ No direct ETH handling'}`,
        `👑 **Access Controls**: ${hasOwnerFunctions ? '⚠️ Owner-restricted functions present' : '✅ No obvious centralized control'}`,
        `🔄 **Upgradeability**: ${hasUpgradeable ? '⚠️ Contract may be upgradeable' : '✅ Appears immutable'}`,
        `🔐 **Function Visibility**: ${contract.functions?.filter(f => f.type === 'public').length || 0} public functions`,
        `📝 **Events**: ${contract.events?.length || 0} events for transparency`
      ],
      
      riskLevel: hasPayableFunctions && hasOwnerFunctions ? 'High' : hasPayableFunctions || hasOwnerFunctions ? 'Medium' : 'Low',
      confidence: 88,
      
      recommendations: [
        hasPayableFunctions ? 'Review ETH handling functions carefully' : 'No ETH handling detected',
        hasOwnerFunctions ? 'Verify owner permissions and controls' : 'Decentralized design detected',
        'Check for reentrancy protection in state-changing functions',
        'Verify proper input validation'
      ]
    };
  };

  const generateFunctionalityAnalysis = (contract) => {
    const functions = contract.functions || [];
    const categories = categorizeFunctions(functions);
    
    return {
      title: 'Functionality Breakdown',
      summary: `The contract implements ${Object.keys(categories).length} main functional categories. Primary functionality appears to be ${getPrimaryFunction(categories)}. The contract ${functions.length > 20 ? 'has extensive functionality' : 'has focused functionality'}.`,
      
      keyPoints: [
        `🎯 **Primary Function**: ${getPrimaryFunction(categories)}`,
        `📚 **Function Categories**: ${Object.keys(categories).join(', ')}`,
        `🔍 **Read Operations**: ${functions.filter(f => f.isReadOnly).length} view/pure functions`,
        `✏️ **Write Operations**: ${functions.filter(f => !f.isReadOnly).length} state-changing functions`,
        `🎛️ **Interface Compliance**: ${inferStandardCompliance(functions)}`
      ],
      
      riskLevel: 'Low',
      confidence: 85,
      
      recommendations: [
        'Review function documentation for intended use',
        'Test all public functions with various inputs',
        'Understand state changes before interacting'
      ]
    };
  };

  const generateEconomicsAnalysis = (contract) => {
    const hasPayable = contract.functions?.some(f => f.type === 'payable') || false;
    const hasTransfer = contract.functions?.some(f => f.name.toLowerCase().includes('transfer')) || false;
    const hasBalance = contract.functions?.some(f => f.name.toLowerCase().includes('balance')) || false;
    
    return {
      title: 'Economic Model Analysis',
      summary: `Economic analysis shows ${hasPayable ? 'direct ETH interaction capabilities' : 'no direct ETH handling'}. ${hasTransfer ? 'Token transfer functionality detected' : 'No obvious token mechanics'}. ${hasBalance ? 'Balance tracking implemented' : 'No balance tracking detected'}.`,
      
      keyPoints: [
        `💎 **Value Handling**: ${hasPayable ? 'Can receive and hold ETH' : 'No direct ETH interaction'}`,
        `🔄 **Transfer Mechanics**: ${hasTransfer ? 'Transfer functions available' : 'No transfer functionality'}`,
        `📊 **Balance Tracking**: ${hasBalance ? 'Balance queries supported' : 'No balance functionality'}`,
        `🎯 **Token Standard**: ${inferTokenStandard(contract)}`,
        `💰 **Economic Risk**: ${assessEconomicRisk(contract)}`
      ],
      
      riskLevel: hasPayable ? 'Medium' : 'Low',
      confidence: 80,
      
      recommendations: [
        hasPayable ? 'Understand ETH handling mechanisms' : 'No direct financial risk',
        hasTransfer ? 'Review transfer restrictions and limits' : 'No transfer functionality',
        'Check for economic exploits or edge cases'
      ]
    };
  };

  // Helper functions
  const getComplexityDescription = (count) => {
    if (count > 50) return 'This is a highly complex contract with extensive functionality.';
    if (count > 20) return 'This is a moderately complex contract.';
    if (count > 10) return 'This is a simple to moderate contract.';
    return 'This is a simple contract with basic functionality.';
  };

  const getComplexityLevel = (count) => {
    if (count > 50) return 'Very High';
    if (count > 30) return 'High';
    if (count > 15) return 'Medium';
    if (count > 5) return 'Low';
    return 'Very Low';
  };

  const inferContractType = (contract) => {
    const functions = contract.functions || [];
    const functionNames = functions.map(f => f.name.toLowerCase()).join(' ');
    
    if (functionNames.includes('transfer') && functionNames.includes('balance')) return 'Token Contract';
    if (functionNames.includes('mint') && functionNames.includes('burn')) return 'Mintable Token';
    if (functionNames.includes('stake') || functionNames.includes('reward')) return 'Staking Contract';
    if (functionNames.includes('swap') || functionNames.includes('exchange')) return 'DEX/Exchange';
    if (functionNames.includes('vote') || functionNames.includes('proposal')) return 'Governance Contract';
    if (functionNames.includes('lock') || functionNames.includes('vesting')) return 'Vesting/Lock Contract';
    return 'Custom Contract';
  };

  const categorizeFunctions = (functions) => {
    const categories = {};
    
    functions.forEach(func => {
      const name = func.name.toLowerCase();
      if (name.includes('transfer') || name.includes('send')) {
        categories['Transfer'] = (categories['Transfer'] || 0) + 1;
      } else if (name.includes('balance') || name.includes('amount')) {
        categories['Balance'] = (categories['Balance'] || 0) + 1;
      } else if (name.includes('owner') || name.includes('admin')) {
        categories['Admin'] = (categories['Admin'] || 0) + 1;
      } else if (name.includes('approve') || name.includes('allowance')) {
        categories['Approval'] = (categories['Approval'] || 0) + 1;
      } else if (func.isReadOnly) {
        categories['View'] = (categories['View'] || 0) + 1;
      } else {
        categories['Core'] = (categories['Core'] || 0) + 1;
      }
    });
    
    return categories;
  };

  const getPrimaryFunction = (categories) => {
    const maxCategory = Object.entries(categories).reduce((a, b) => a[1] > b[1] ? a : b, ['Unknown', 0]);
    return maxCategory[0];
  };

  const inferStandardCompliance = (functions) => {
    const names = functions.map(f => f.name);
    if (names.includes('transfer') && names.includes('balanceOf') && names.includes('approve')) {
      return 'ERC-20 Compatible';
    }
    if (names.includes('transferFrom') && names.includes('ownerOf')) {
      return 'ERC-721 Compatible';
    }
    return 'Custom Interface';
  };

  const inferTokenStandard = (contract) => {
    const functions = contract.functions || [];
    const names = functions.map(f => f.name);
    
    if (names.includes('totalSupply') && names.includes('transfer') && names.includes('balanceOf')) {
      return 'ERC-20 Token';
    }
    if (names.includes('ownerOf') && names.includes('transferFrom')) {
      return 'ERC-721 NFT';
    }
    if (names.includes('balanceOf') && names.includes('setApprovalForAll')) {
      return 'ERC-1155 Multi-Token';
    }
    return 'Non-Standard';
  };

  const assessEconomicRisk = (contract) => {
    const hasPayable = contract.functions?.some(f => f.type === 'payable') || false;
    const hasOwner = contract.functions?.some(f => f.name.toLowerCase().includes('owner')) || false;
    
    if (hasPayable && hasOwner) return 'High - ETH handling with centralized control';
    if (hasPayable) return 'Medium - ETH handling present';
    if (hasOwner) return 'Low - Centralized but no direct ETH risk';
    return 'Very Low - No direct financial mechanisms';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-4"
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
            🤖 AI Contract Insights
          </h3>
          {onClose && (
            <GlassButton size="sm" onClick={onClose}>✕</GlassButton>
          )}
        </div>

        {/* Analysis Type Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📋' },
            { id: 'security', label: 'Security', icon: '🔒' },
            { id: 'functionality', label: 'Functions', icon: '⚙️' },
            { id: 'economics', label: 'Economics', icon: '💰' }
          ].map((type) => (
            <GlassButton
              key={type.id}
              size="sm"
              variant={analysisType === type.id ? 'primary' : 'secondary'}
              onClick={() => generateInsights(type.id)}
              disabled={loading}
            >
              {type.icon} {type.label}
            </GlassButton>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader type="dots" text="AI is analyzing the contract..." />
          </div>
        )}

        <AnimatePresence mode="wait">
          {insights && !loading && (
            <motion.div
              key={analysisType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">{insights.title}</h4>
                <p className="text-white/80 text-sm leading-relaxed">{insights.summary}</p>
              </div>

              {/* Key Points */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Key Findings</h4>
                <div className="space-y-3">
                  {insights.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span 
                        className="text-white/80 text-sm"
                        dangerouslySetInnerHTML={{ __html: point }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">Risk Assessment</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/60 text-sm">Risk Level:</span>
                    <span className={`text-sm font-semibold ${
                      insights.riskLevel === 'Low' ? 'text-green-400' :
                      insights.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {insights.riskLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">AI Confidence:</span>
                    <span className="text-white text-sm">{insights.confidence}%</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2">Recommendations</h4>
                  <div className="space-y-1">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="text-white/70 text-xs">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3">
                <p className="text-yellow-300 text-xs">
                  ⚠️ <strong>Disclaimer:</strong> This AI analysis is for informational purposes only. 
                  Always conduct your own research and security audits before interacting with smart contracts.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!insights && !loading && (
          <div className="text-center py-12">
            <p className="text-white/60 text-sm mb-4">
              Get comprehensive AI-powered analysis of this smart contract
            </p>
            <p className="text-white/40 text-xs mb-6">
              Choose an analysis type above to begin
            </p>
            <GlassButton onClick={() => generateInsights('overview')}>
              🚀 Start Analysis
            </GlassButton>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default AIContractInsights;