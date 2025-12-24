/**
 * AI Service for Contract Summarization
 * Uses Hugging Face API for AI-powered contract analysis
 */

const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY || '';
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

class AIService {
  constructor() {
    this.apiKey = HUGGING_FACE_API_KEY;
    this.cache = new Map();
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting helper
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Generate AI summary for a smart contract
   * Returns a concise summary (<150 words) with verification flags
   */
  async generateContractSummary(contract) {
    const cacheKey = `contract-${contract.address}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      await this.rateLimit();

      // Build contract context
      const functionCount = contract.functions?.length || 0;
      const readOnlyCount = contract.functions?.filter(f => f.isReadOnly).length || 0;
      const writeCount = contract.functions?.filter(f => !f.isReadOnly).length || 0;
      const isVerified = contract.isVerified || false;
      
      // Create prompt for AI
      const prompt = `Analyze this smart contract: ${contract.contractName || 'Unnamed Contract'}. 
      Functions: ${functionCount} total (${readOnlyCount} read-only, ${writeCount} state-changing). 
      Verified: ${isVerified ? 'Yes' : 'No'}. 
      Provide a concise technical summary in under 150 words focusing on purpose, key functions, and security considerations.`;

      // Use Hugging Face API (fallback to OpenAI-style if needed)
      let summary;
      
      try {
        // Try Hugging Face first
        const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-large', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 200,
              temperature: 0.7
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          summary = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
        } else {
          throw new Error('Hugging Face API failed');
        }
      } catch (hfError) {
        // Fallback to local generation
        summary = this.generateLocalSummary(contract, functionCount, readOnlyCount, writeCount, isVerified);
      }

      // Ensure summary is under 150 words
      const words = summary.split(' ');
      if (words.length > 150) {
        summary = words.slice(0, 150).join(' ') + '...';
      }

      const result = {
        summary,
        wordCount: summary.split(' ').length,
        isVerified,
        confidence: isVerified ? 0.9 : 0.7,
        generatedAt: Date.now()
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      // Return fallback summary
      return this.generateLocalSummary(contract, 
        contract.functions?.length || 0,
        contract.functions?.filter(f => f.isReadOnly).length || 0,
        contract.functions?.filter(f => !f.isReadOnly).length || 0,
        contract.isVerified || false
      );
    }
  }

  /**
   * Generate local summary as fallback
   */
  generateLocalSummary(contract, functionCount, readOnlyCount, writeCount, isVerified) {
    const contractName = contract.contractName || 'Smart Contract';
    const complexity = functionCount > 30 ? 'highly complex' : functionCount > 15 ? 'moderately complex' : 'simple';
    
    let summary = `${contractName} is a ${complexity} smart contract with ${functionCount} total functions. `;
    summary += `It includes ${readOnlyCount} read-only functions for data retrieval and ${writeCount} state-changing functions. `;
    
    if (isVerified) {
      summary += `The contract is verified, meaning its source code is publicly available and auditable. `;
    } else {
      summary += `The contract is unverified, so its source code is not publicly available. `;
    }
    
    if (writeCount > readOnlyCount) {
      summary += `This contract appears to be primarily focused on state management and transactions. `;
    } else {
      summary += `This contract appears to be primarily focused on data querying and retrieval. `;
    }
    
    summary += `Complexity level: ${functionCount > 20 ? 'High' : functionCount > 10 ? 'Medium' : 'Low'}.`;
    
    return {
      summary,
      wordCount: summary.split(' ').length,
      isVerified,
      confidence: 0.75,
      generatedAt: Date.now()
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;

