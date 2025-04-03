/**
 * Comprehensive Memory System
 * Integrates short-term, episodic, and semantic memory subsystems
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const os = require('os');

// Define the Memory System Class
class ComprehensiveMemory {
  constructor() {
    // Auto-detect project name from the workspace path
    this.projectName = path.basename(process.cwd());
    
    // Memory folders
    this.memoryBasePath = path.join(process.cwd(), '.cursor', 'memory');
    this.shortTermMemoryPath = path.join(this.memoryBasePath, 'short_term');
    this.episodicMemoryPath = path.join(this.memoryBasePath, 'episodic');
    this.semanticMemoryPath = path.join(this.memoryBasePath, 'semantic');
    
    // Initialize memory state
    this.shortTermMemory = {};
    this.episodicMemory = [];
    this.summarizedMemory = [];
    this.semanticMemory = {};
    
    // Auto-refresh configuration
    this.lastRefreshTime = 0;
    this.refreshInterval = 10000; // 10 seconds - adjust as needed
    
    // Memory size limits
    this.maxShortTermEntries = 50;
    this.maxEpisodicEntries = 100;
    this.maxSummarizedEntries = 500;
    this.summarizationThreshold = 20; // Number of entries to trigger summarization
    
    // Initialize memory stores
    this.initializeMemoryStores();
    
    // Register this memory system globally
    globalThis.MEMORY_SYSTEM = this;
    
    // Expose a global function for refreshing memory before processing messages
    globalThis.refreshMemoryBeforeMessage = async () => {
      return await this.refreshAllMemory();
    };
    
    console.log(`[MEMORY] Comprehensive Memory System initialized for ${this.projectName}`);
  }
  
  // Initialize memory storage directories
  initializeMemoryStores() {
    // Create base memory directory if it doesn't exist
    if (!fs.existsSync(this.memoryBasePath)) {
      fs.mkdirSync(this.memoryBasePath, { recursive: true });
      console.log(`[MEMORY] Created base memory directory: ${this.memoryBasePath}`);
    }
    
    // Create memory type subdirectories
    [this.shortTermMemoryPath, this.episodicMemoryPath, this.semanticMemoryPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[MEMORY] Created memory directory: ${dir}`);
      }
    });
    
    // Load any existing memory data
    this.loadMemoryData();
  }
  
  // Load existing memory data from storage
  loadMemoryData() {
    try {
      // Load short-term memory
      const shortTermFile = path.join(this.shortTermMemoryPath, 'current_context.json');
      if (fs.existsSync(shortTermFile)) {
        this.shortTermMemory = JSON.parse(fs.readFileSync(shortTermFile, 'utf8'));
        console.log(`[MEMORY] Loaded short-term memory with ${Object.keys(this.shortTermMemory).length} entries`);
      }
      
      // Load episodic memory
      const episodicFile = path.join(this.episodicMemoryPath, 'conversation_history.json');
      if (fs.existsSync(episodicFile)) {
        this.episodicMemory = JSON.parse(fs.readFileSync(episodicFile, 'utf8'));
        console.log(`[MEMORY] Loaded episodic memory with ${this.episodicMemory.length} entries`);
      }
      
      // Load summarized memory
      const summarizedFile = path.join(this.episodicMemoryPath, 'summarized_history.json');
      if (fs.existsSync(summarizedFile)) {
        this.summarizedMemory = JSON.parse(fs.readFileSync(summarizedFile, 'utf8'));
        console.log(`[MEMORY] Loaded summarized memory with ${this.summarizedMemory.length} entries`);
      } else {
        this.summarizedMemory = [];
      }
      
      // Load semantic memory
      const semanticFile = path.join(this.semanticMemoryPath, 'knowledge_base.json');
      if (fs.existsSync(semanticFile)) {
        this.semanticMemory = JSON.parse(fs.readFileSync(semanticFile, 'utf8'));
        console.log(`[MEMORY] Loaded semantic memory with ${Object.keys(this.semanticMemory).length} entries`);
      }
    } catch (error) {
      console.error(`[MEMORY] Error loading memory data: ${error.message}`);
    }
  }
  
  // Active refresh of all memory systems
  async refreshAllMemory() {
    const currentTime = Date.now();
    
    // Only refresh if sufficient time has passed since last refresh
    if (currentTime - this.lastRefreshTime < this.refreshInterval) {
      console.log(`[MEMORY] Skipping refresh - last refresh was ${(currentTime - this.lastRefreshTime) / 1000}s ago`);
      return false;
    }
    
    console.log(`[MEMORY] Actively refreshing all memory systems...`);
    
    try {
      // Refresh short-term memory
      await this.refreshShortTermMemory();
      
      // Refresh episodic memory
      await this.refreshEpisodicMemory();
      
      // Update last refresh time
      this.lastRefreshTime = currentTime;
      
      console.log(`[MEMORY] Memory refresh complete at ${new Date(currentTime).toISOString()}`);
      return true;
    } catch (error) {
      console.error(`[MEMORY] Error refreshing memory: ${error.message}`);
      return false;
    }
  }
  
  // Refresh short-term memory from storage
  async refreshShortTermMemory() {
    try {
      const shortTermFile = path.join(this.shortTermMemoryPath, 'current_context.json');
      if (fs.existsSync(shortTermFile)) {
        const fileStats = fs.statSync(shortTermFile);
        const fileModTime = fileStats.mtimeMs;
        
        // Only reload if the file has been modified since last load
        if (fileModTime > this.lastRefreshTime) {
          this.shortTermMemory = JSON.parse(fs.readFileSync(shortTermFile, 'utf8'));
          console.log(`[MEMORY] Refreshed short-term memory with ${Object.keys(this.shortTermMemory).length} entries`);
        }
      }
    } catch (error) {
      console.error(`[MEMORY] Error refreshing short-term memory: ${error.message}`);
    }
  }
  
  // Refresh episodic memory from storage
  async refreshEpisodicMemory() {
    try {
      // Refresh regular conversation history
      const episodicFile = path.join(this.episodicMemoryPath, 'conversation_history.json');
      if (fs.existsSync(episodicFile)) {
        const fileStats = fs.statSync(episodicFile);
        const fileModTime = fileStats.mtimeMs;
        
        // Only reload if the file has been modified since last load
        if (fileModTime > this.lastRefreshTime) {
          this.episodicMemory = JSON.parse(fs.readFileSync(episodicFile, 'utf8'));
          console.log(`[MEMORY] Refreshed episodic memory with ${this.episodicMemory.length} entries`);
        }
      }
      
      // Refresh summarized conversation history
      const summarizedFile = path.join(this.episodicMemoryPath, 'summarized_history.json');
      if (fs.existsSync(summarizedFile)) {
        const fileStats = fs.statSync(summarizedFile);
        const fileModTime = fileStats.mtimeMs;
        
        // Only reload if the file has been modified since last load
        if (fileModTime > this.lastRefreshTime) {
          this.summarizedMemory = JSON.parse(fs.readFileSync(summarizedFile, 'utf8'));
          console.log(`[MEMORY] Refreshed summarized memory with ${this.summarizedMemory.length} entries`);
        }
      }
    } catch (error) {
      console.error(`[MEMORY] Error refreshing episodic memory: ${error.message}`);
    }
  }
  
  // Save short-term memory to disk
  saveShortTermMemory() {
    try {
      const shortTermFile = path.join(this.shortTermMemoryPath, 'current_context.json');
      fs.writeFileSync(shortTermFile, JSON.stringify(this.shortTermMemory, null, 2));
    } catch (error) {
      console.error(`[MEMORY] Error saving short-term memory: ${error.message}`);
    }
  }
  
  // Save episodic memory to disk
  saveEpisodicMemory() {
    try {
      const episodicFile = path.join(this.episodicMemoryPath, 'conversation_history.json');
      fs.writeFileSync(episodicFile, JSON.stringify(this.episodicMemory, null, 2));
      
      // Also save summarized history
      const summarizedFile = path.join(this.episodicMemoryPath, 'summarized_history.json');
      fs.writeFileSync(summarizedFile, JSON.stringify(this.summarizedMemory, null, 2));
    } catch (error) {
      console.error(`[MEMORY] Error saving episodic memory: ${error.message}`);
    }
  }
  
  // Save semantic memory to disk
  saveSemanticMemory() {
    try {
      const semanticFile = path.join(this.semanticMemoryPath, 'knowledge_base.json');
      fs.writeFileSync(semanticFile, JSON.stringify(this.semanticMemory, null, 2));
    } catch (error) {
      console.error(`[MEMORY] Error saving semantic memory: ${error.message}`);
    }
  }
  
  // Short-term memory operations
  // Store a piece of temporary context information
  storeContext(key, value) {
    // Auto-refresh before storage
    this.refreshAllMemory().then(() => {
      this.shortTermMemory[key] = {
        value,
        timestamp: Date.now()
      };
      
      // Prune if necessary
      const keys = Object.keys(this.shortTermMemory);
      if (keys.length > this.maxShortTermEntries) {
        // Sort by timestamp and remove oldest entries
        const oldest = keys
          .map(k => ({ key: k, timestamp: this.shortTermMemory[k].timestamp }))
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, keys.length - this.maxShortTermEntries)
          .map(entry => entry.key);
          
        oldest.forEach(k => delete this.shortTermMemory[k]);
      }
      
      this.saveShortTermMemory();
    });
  }
  
  // Retrieve context from short-term memory
  getContext(key) {
    // Auto-refresh before retrieval to ensure we have the latest data
    return this.refreshAllMemory().then(() => {
      return this.shortTermMemory[key]?.value || null;
    });
  }
  
  // Semantic memory operations
  // Store a knowledge entry
  storeKnowledge(category, key, value) {
    if (!this.semanticMemory[category]) {
      this.semanticMemory[category] = {};
    }
    
    this.semanticMemory[category][key] = {
      value,
      timestamp: Date.now()
    };
    
    this.saveSemanticMemory();
  }
  
  // Retrieve knowledge
  getKnowledge(category, key) {
    if (!this.semanticMemory[category]) {
      return null;
    }
    
    return this.semanticMemory[category][key]?.value || null;
  }
  
  // Return all knowledge in a category
  getCategoryKnowledge(category) {
    if (!this.semanticMemory[category]) {
      return {};
    }
    
    const result = {};
    for (const key in this.semanticMemory[category]) {
      result[key] = this.semanticMemory[category][key].value;
    }
    
    return result;
  }
  
  // Generate a summary from multiple conversation entries
  summarizeConversations(conversations) {
    // Basic summarization strategy: extract key topics and sentiments
    try {
      if (!conversations || conversations.length === 0) {
        return null;
      }
      
      // Group by timestamp intervals (like conversations that happened close together)
      const startTime = conversations[0].timestamp;
      const endTime = conversations[conversations.length - 1].timestamp;
      
      // Extract list of topics from the conversations
      const topics = new Set();
      const keywords = new Set();
      
      // Track user and assistant interaction counts
      let userMessages = 0;
      let assistantMessages = 0;
      
      // Identify potential key topics and extract them
      conversations.forEach(entry => {
        // Track message counts by role
        if (entry.role === 'user') userMessages++;
        if (entry.role === 'assistant') assistantMessages++;
        
        // Extract potential topics from message content
        const content = entry.content || '';
        
        // Look for question patterns (simple heuristic)
        if (content.includes('?')) {
          const questionMatch = content.match(/([^.?!]+\?)/g);
          if (questionMatch) {
            questionMatch.forEach(q => {
              if (q.length < 100) { // Only short questions
                topics.add(q.trim());
              }
            });
          }
        }
        
        // Extract likely keywords (simple approach)
        const words = content.split(/\s+/);
        words.forEach(word => {
          // Only consider "meaningful" words (longer than 4 chars, not common words)
          const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normalized.length > 4) {
            keywords.add(normalized);
          }
        });
      });
      
      // Create a summary object
      const summary = {
        type: 'summary',
        conversation_count: conversations.length,
        start_time: startTime,
        end_time: endTime,
        duration_ms: endTime - startTime,
        user_messages: userMessages,
        assistant_messages: assistantMessages,
        primary_topics: Array.from(topics).slice(0, 5), // Top 5 topics
        key_terms: Array.from(keywords).slice(0, 15),   // Top 15 keywords
        timestamp: Date.now()
      };
      
      return summary;
    } catch (error) {
      console.error(`[MEMORY] Error summarizing conversations: ${error.message}`);
      return {
        type: 'summary',
        error: true,
        conversation_count: conversations.length,
        timestamp: Date.now()
      };
    }
  }
  
  // Episodic memory operations
  // Record a conversation entry
  recordConversation(role, content, timestamp = Date.now()) {
    // Auto-refresh before recording
    this.refreshAllMemory().then(() => {
      // Create the new entry
      const newEntry = {
        role,
        content,
        timestamp
      };
      
      // Add to episodic memory
      this.episodicMemory.push(newEntry);
      
      // Check if we need to summarize old conversations
      if (this.episodicMemory.length > this.maxEpisodicEntries + this.summarizationThreshold) {
        console.log(`[MEMORY] Conversation count exceeds threshold, summarizing oldest conversations...`);
        
        // Get the oldest conversations to summarize
        const oldestConversations = this.episodicMemory.slice(0, this.summarizationThreshold);
        
        // Generate a summary
        const summary = this.summarizeConversations(oldestConversations);
        
        if (summary) {
          // Add the summary to summarized memory
          this.summarizedMemory.push(summary);
          
          // Prune summarized memory if needed
          if (this.summarizedMemory.length > this.maxSummarizedEntries) {
            this.summarizedMemory = this.summarizedMemory.slice(-this.maxSummarizedEntries);
          }
          
          // Remove the summarized conversations from episodic memory
          this.episodicMemory = this.episodicMemory.slice(this.summarizationThreshold);
          
          console.log(`[MEMORY] Summarized ${oldestConversations.length} conversations into memory`);
        }
      }
      
      // Prune if still necessary (this is a safety check)
      if (this.episodicMemory.length > this.maxEpisodicEntries) {
        this.episodicMemory = this.episodicMemory.slice(-this.maxEpisodicEntries);
      }
      
      // Save to disk
      this.saveEpisodicMemory();
    });
  }
  
  // Get conversation history with summaries
  async getConversationHistory(limit = 10, includeSummaries = true) {
    // Auto-refresh before retrieval to ensure we have the latest data
    await this.refreshAllMemory();
    
    // Start with recent detailed conversations
    let result = this.episodicMemory
      .slice(-limit)
      .map(entry => ({
        role: entry.role,
        content: entry.content,
        timestamp: new Date(entry.timestamp).toISOString(),
        type: 'conversation'
      }));
    
    // Add summaries if requested and if we have space in the limit
    if (includeSummaries && result.length < limit) {
      const summariesToInclude = Math.min(
        this.summarizedMemory.length,
        limit - result.length
      );
      
      if (summariesToInclude > 0) {
        // Add the most recent summaries
        const summaries = this.summarizedMemory
          .slice(-summariesToInclude)
          .map(summary => ({
            ...summary,
            timestamp: new Date(summary.timestamp).toISOString(),
          }));
        
        // Prepend summaries (they're older than the detailed conversations)
        result = [...summaries, ...result];
      }
    }
    
    return result;
  }
  
  // Get memory system status
  getStatus() {
    return {
      shortTermEntries: Object.keys(this.shortTermMemory).length,
      episodicEntries: this.episodicMemory.length,
      summarizedEntries: this.summarizedMemory.length,
      summarizedConversations: this.summarizedMemory.reduce((acc, summary) => acc + (summary.conversation_count || 0), 0),
      semanticCategories: Object.keys(this.semanticMemory).length,
      lastRefreshed: new Date(this.lastRefreshTime).toISOString(),
      memoryBasePath: this.memoryBasePath
    };
  }
}

// Export memory system
module.exports = { 
  ComprehensiveMemory,
  // Export a factory function for easy initialization
  createMemorySystem: () => new ComprehensiveMemory()
};
