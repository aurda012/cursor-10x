/**
 * URDAFX Multi-Agent System API
 * 
 * This file provides an easy-to-use API interface for the URDAFX multi-agent system.
 * It allows access to all system components and agent functionality.
 */

// Load the initializer
const { initialize } = require('./init');

/**
 * Main API interface for the URDAFX multi-agent system
 */
class URDAFX_API {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the API and underlying systems
   * @param {boolean} force - Whether to force re-initialization
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize(force = false) {
    if (this.initialized && !force) {
      console.log("URDAFX API already initialized");
      return true;
    }
    
    const result = await initialize(force);
    this.initialized = result;
    
    return result;
  }

  /**
   * Display system banner
   * Shows the system banner to indicate the system is active
   * @param {boolean} minimal - Whether to show a minimal banner
   * @returns {string} The banner text
   */
  displaySystemBanner(minimal = false) {
    if (!global.BANNER_SYSTEM) {
      // Fallback banner if the banner system isn't available
      const banner = minimal ? 
        "── URDAFX MULTI-AGENT SYSTEM ACTIVE ──" :
        `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  URDAFX MULTI-AGENT SYSTEM                                         ║
║  Status: ACTIVE                                                    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
        `;
      
      console.log(banner);
      return banner;
    }
    
    // Use the banner system
    if (minimal) {
      return global.BANNER_SYSTEM.displayMinimal("System Active");
    } else {
      return global.BANNER_SYSTEM.displaySystemStatus();
    }
  }

  /**
   * Get the system status
   * @returns {object} System status
   */
  getSystemStatus() {
    if (!global.URDAFX_SYSTEM) {
      return { initialized: false };
    }
    
    return {
      initialized: this.initialized,
      date: global.URDAFX_SYSTEM.dateInitialized || false,
      memory: global.URDAFX_SYSTEM.memoryInitialized || false,
      scratchpad: global.URDAFX_SYSTEM.scratchpadInitialized || false,
      agent: global.URDAFX_SYSTEM.agentInitialized || false,
      mcp: global.URDAFX_SYSTEM.mcpInitialized || false,
      banner: global.URDAFX_SYSTEM.bannerInitialized || false
    };
  }

  /**
   * Get all agents in the system
   * @returns {Array} List of agents
   */
  getAgents() {
    if (!global.AGENT_SYSTEM) {
      return [];
    }
    
    return global.AGENT_SYSTEM.getAgents();
  }

  /**
   * Get a specific agent by ID
   * @param {string} agentId - Agent ID
   * @returns {object|null} Agent or null if not found
   */
  getAgent(agentId) {
    if (!global.AGENT_SYSTEM) {
      return null;
    }
    
    return global.AGENT_SYSTEM.getAgent(agentId);
  }

  /**
   * Create a new thread in the scratchpad
   * @param {string} threadId - Thread ID
   * @param {string} title - Thread title
   * @param {string} creatorId - Creator ID
   * @returns {Promise<string>} Thread ID
   */
  async createThread(threadId, title, creatorId = "system") {
    if (!global.SCRATCHPAD_SYSTEM) {
      throw new Error("Scratchpad system not initialized");
    }
    
    return global.SCRATCHPAD_SYSTEM.createThread(threadId, title, creatorId);
  }

  /**
   * Create a new message in the scratchpad
   * @param {object} messageOptions - Message options
   * @returns {Promise<string>} Message ID
   */
  async createMessage(messageOptions) {
    if (!global.SCRATCHPAD_SYSTEM) {
      throw new Error("Scratchpad system not initialized");
    }
    
    return global.SCRATCHPAD_SYSTEM.createMessage(messageOptions);
  }

  /**
   * Read messages in a thread
   * @param {string} threadId - Thread ID
   * @returns {Promise<Array>} Messages in the thread
   */
  async readThread(threadId) {
    if (!global.SCRATCHPAD_SYSTEM) {
      throw new Error("Scratchpad system not initialized");
    }
    
    return global.SCRATCHPAD_SYSTEM.readThread(threadId);
  }

  /**
   * Display a banner
   * @param {string} templateName - Template name
   * @param {object} variables - Template variables
   * @returns {string} Rendered banner
   */
  displayBanner(templateName, variables) {
    if (!global.BANNER_SYSTEM) {
      console.log("Banner system not initialized");
      return null;
    }
    
    return global.BANNER_SYSTEM.displayBanner(templateName, variables);
  }

  /**
   * Store a context value in memory
   * @param {string} key - Context key
   * @param {any} value - Context value
   */
  storeContext(key, value) {
    if (!global.MEMORY_SYSTEM) {
      console.log("Memory system not initialized");
      return;
    }
    
    global.MEMORY_SYSTEM.storeContext(key, value);
  }

  /**
   * Get a context value from memory
   * @param {string} key - Context key
   * @returns {any} Context value
   */
  getContext(key) {
    if (!global.MEMORY_SYSTEM) {
      console.log("Memory system not initialized");
      return null;
    }
    
    return global.MEMORY_SYSTEM.getContext(key);
  }

  /**
   * Get the current date (with year set to 2025)
   * @returns {Date} Current date
   */
  getCurrentDate() {
    if (!global.DATE_SYSTEM) {
      console.log("Date system not initialized");
      return new Date();
    }
    
    return global.DATE_SYSTEM.getCurrentDate();
  }

  /**
   * Format a date according to the specified format
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date
   */
  formatDate(date, format = 'yyyy-MM-dd') {
    if (!global.DATE_SYSTEM) {
      console.log("Date system not initialized");
      return date.toString();
    }
    
    return global.DATE_SYSTEM.formatDate(date, format);
  }

  /**
   * Get recommended agents for a task
   * @param {string} task - Task description
   * @returns {Array} Recommended agent IDs
   */
  getRecommendedAgents(task) {
    if (!global.AGENT_SYSTEM) {
      console.log("Agent system not initialized");
      return ["pm"];
    }
    
    return global.AGENT_SYSTEM.getRecommendedAgents(task);
  }

  /**
   * Create a collaboration session between agents
   * @param {Array} agentIds - Agent IDs
   * @param {string} taskDescription - Task description
   * @returns {string} Session ID
   */
  createCollaborationSession(agentIds, taskDescription) {
    if (!global.AGENT_SYSTEM) {
      console.log("Agent system not initialized");
      return null;
    }
    
    return global.AGENT_SYSTEM.createCollaborationSession(agentIds, taskDescription);
  }
}

// Singleton instance
const api = new URDAFX_API();

// Export the API
module.exports = api; 