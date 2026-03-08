
/**
 * Token Usage Fix Module
 * Fixes #39620: Token usage shows as 'unknown' in 2026.3.7
 * 
 * This module ensures proper token usage tracking and reporting
 * for all model providers including kimi-k2.5
 */

class TokenUsageTracker {
  constructor() {
    this.usage = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      contextWindow: 0,
      contextUsed: 0,
    };
    this.lastUpdate = null;
  }

  updateUsage(usageData) {
    if (!usageData) return;
    
    // Handle various usage payload formats
    if (usageData.input_tokens !== undefined) {
      this.usage.inputTokens = usageData.input_tokens;
    } else if (usageData.prompt_tokens !== undefined) {
      this.usage.inputTokens = usageData.prompt_tokens;
    }
    
    if (usageData.output_tokens !== undefined) {
      this.usage.outputTokens = usageData.output_tokens;
    } else if (usageData.completion_tokens !== undefined) {
      this.usage.outputTokens = usageData.completion_tokens;
    }
    
    if (usageData.total_tokens !== undefined) {
      this.usage.totalTokens = usageData.total_tokens;
    } else {
      this.usage.totalTokens = this.usage.inputTokens + this.usage.outputTokens;
    }
    
    if (usageData.context_window !== undefined) {
      this.usage.contextWindow = usageData.context_window;
    }
    
    if (usageData.context_used !== undefined) {
      this.usage.contextUsed = usageData.context_used;
    }
    
    this.lastUpdate = Date.now();
  }

  getUsage() {
    return {
      ...this.usage,
      percentage: this.usage.contextWindow > 0 
        ? Math.round((this.usage.contextUsed / this.usage.contextWindow) * 100)
        : 0,
      formatted: this.formatUsage(),
    };
  }

  formatUsage() {
    const formatNumber = (n) => {
      if (n >= 1000) return (n / 1000).toFixed(1) + "k";
      return n.toString();
    };
    
    return {
      input: formatNumber(this.usage.inputTokens),
      output: formatNumber(this.usage.outputTokens),
      context: `${formatNumber(this.usage.contextUsed)}/${formatNumber(this.usage.contextWindow)}`,
    };
  }

  static create() {
    return new TokenUsageTracker();
  }
}

// Export for CommonJS
module.exports = {
  TokenUsageTracker,
  createTokenUsageTracker: TokenUsageTracker.create,
};

