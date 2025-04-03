/**
 * Banner System
 * 
 * Displays visual confirmation banners for URDAFX system status.
 * Provides customizable templates for different system states.
 */

// Create global namespace if it doesn't exist
if (typeof globalThis.URDAFX_SYSTEM === 'undefined') {
  globalThis.URDAFX_SYSTEM = {};
}

// Core Node modules
const fs = require('fs');
const path = require('path');

// Define paths
const basePath = process.cwd();
const bannersDir = path.join(basePath, '.cursor/communication/banners');

// Ensure the directory exists
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true });
  console.log(`Created directory: ${bannersDir}`);
}

/**
 * BannerSystem manages and displays status banners
 */
class BannerSystem {
  constructor() {
    this.templates = {};
    this.initialized = false;
  }

  /**
   * Initialize the banner system
   */
  initialize() {
    console.log("Initializing Banner System...");
    
    try {
      // Load banner templates
      this.loadTemplates();
      
      this.initialized = true;
      console.log("Banner System initialized successfully");
      
      return true;
    } catch (error) {
      console.error("Error initializing Banner System:", error);
      return false;
    }
  }

  /**
   * Load banner templates
   */
  loadTemplates() {
    // Default templates
    const defaultTemplates = {
      system_active: `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  URDAFX {{systemName}} v{{version}}                               ║
║  Status: {{status}}                                               ║
║  Date: {{currentDate}}                                            ║
║                                                                    ║
║  Active Systems:                                                   ║
║  {{activeSystems}}                                                 ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
      `,
      system_error: `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  ⚠️  URDAFX SYSTEM ERROR                                           ║
║  {{errorMessage}}                                                  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
      `,
      agent_active: `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  Agent: {{agentName}}                                              ║
║  Role: {{agentRole}}                                               ║
║  Action: {{action}}                                                ║
║  Date: {{currentDate}}                                             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
      `,
      minimal: `
── URDAFX: {{message}} | {{currentDate}} ──
      `
    };
    
    // Try to load templates from disk, use defaults if not found
    for (const [name, template] of Object.entries(defaultTemplates)) {
      const templatePath = path.join(bannersDir, `${name}.txt`);
      
      try {
        if (fs.existsSync(templatePath)) {
          this.templates[name] = fs.readFileSync(templatePath, 'utf8');
        } else {
          // Save default template to disk
          fs.writeFileSync(templatePath, template, 'utf8');
          this.templates[name] = template;
        }
        
        console.log(`Loaded banner template: ${name}`);
      } catch (error) {
        console.error(`Error loading template ${name}:`, error);
        this.templates[name] = template;
      }
    }
  }

  /**
   * Get system status
   * @returns {object} System status
   */
  getSystemStatus() {
    if (!globalThis.URDAFX_SYSTEM) {
      return { status: "unknown" };
    }
    
    return {
      date: globalThis.URDAFX_SYSTEM.dateInitialized || false,
      memory: globalThis.URDAFX_SYSTEM.memoryInitialized || false,
      scratchpad: globalThis.URDAFX_SYSTEM.scratchpadInitialized || false,
      agent: globalThis.URDAFX_SYSTEM.agentInitialized || false,
      mcp: globalThis.URDAFX_SYSTEM.mcpInitialized || false,
      banner: globalThis.URDAFX_SYSTEM.bannerInitialized || false
    };
  }

  /**
   * Display a banner
   * @param {string} templateName - Name of the template to use
   * @param {object} variables - Variables to replace in the template
   */
  displayBanner(templateName, variables = {}) {
    if (!this.templates[templateName]) {
      console.error(`Banner template not found: ${templateName}`);
      return;
    }
    
    // Add current date to all banner templates
    if (!variables.currentDate) {
      try {
        if (globalThis.DATE_SYSTEM && typeof globalThis.DATE_SYSTEM.getCurrentDate === 'function') {
          const currentDate = globalThis.DATE_SYSTEM.getCurrentDate();
          const formattedDate = globalThis.DATE_SYSTEM.formatDate(currentDate, 'dddd, MMMM d, yyyy');
          variables.currentDate = formattedDate;
        } else {
          const now = new Date();
          // Ensure year is 2025 for consistency
          now.setFullYear(2025);
          variables.currentDate = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch (error) {
        console.error("Error getting current date:", error);
        variables.currentDate = "Unknown";
      }
    }
    
    let banner = this.templates[templateName];
    
    // Replace variables in the template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      banner = banner.replace(regex, value);
    }
    
    // Display the banner
    console.log(banner);
    
    return banner;
  }

  /**
   * Get agent information
   * @param {string} agentId - Agent ID
   * @returns {object|null} Agent information or null if not found
   */
  getAgentInfo(agentId) {
    if (!globalThis.AGENT_SYSTEM) {
      return null;
    }
    
    return globalThis.AGENT_SYSTEM.getAgent(agentId);
  }

  /**
   * Display system status banner
   */
  displaySystemStatus() {
    const status = this.getSystemStatus();
    
    const activeModules = Object.entries(status)
      .filter(([_, isActive]) => isActive)
      .map(([name]) => name);
    
    const statusMessage = activeModules.length === 6 
      ? "FULLY OPERATIONAL" 
      : `PARTIAL (${activeModules.length}/6 modules active)`;
      
    // Format active systems for display
    const systemsMapping = {
      date: "Date Verification System",
      memory: "Memory System",
      scratchpad: "Scratchpad System",
      agent: "Agent System",
      mcp: "MCP Server Integration",
      banner: "Banner System"
    };
    
    const formattedSystems = activeModules
      .map(name => `  • ${systemsMapping[name] || name}`)
      .join('\n');
    
    return this.displayBanner("system_active", {
      systemName: "Multi-Agent System",
      version: "1.0.0",
      status: statusMessage,
      activeSystems: formattedSystems
    });
  }

  /**
   * Display agent banner
   * @param {string} agentId - Agent ID
   * @param {string} action - Current action
   */
  displayAgentBanner(agentId, action) {
    const agent = this.getAgentInfo(agentId);
    
    if (!agent) {
      return this.displayBanner("system_error", {
        errorMessage: `Agent not found: ${agentId}`
      });
    }
    
    return this.displayBanner("agent_active", {
      agentName: agent.name,
      agentRole: agent.role,
      action: action
    });
  }

  /**
   * Display error banner
   * @param {string} errorMessage - Error message
   */
  displayError(errorMessage) {
    return this.displayBanner("system_error", { errorMessage });
  }

  /**
   * Display minimal banner
   * @param {string} message - Message to display
   */
  displayMinimal(message) {
    return this.displayBanner("minimal", { message });
  }
}

// Singleton instance
let bannerSystem = null;

/**
 * Initialize the banner system
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function initializeBannerSystem() {
  console.log("Initializing Banner System...");
  
  try {
    // Create banner system if it doesn't exist
    if (!bannerSystem) {
      bannerSystem = new BannerSystem();
      const initialized = bannerSystem.initialize();
      
      if (!initialized) {
        throw new Error("Failed to initialize Banner System");
      }
      
      // Set up global BANNER_SYSTEM reference
      console.log("Setting up global BANNER_SYSTEM reference");
      globalThis.BANNER_SYSTEM = bannerSystem;
    }
    
    // Update URDAFX_SYSTEM status
    globalThis.URDAFX_SYSTEM.bannerInitialized = true;
    
    console.log("Banner System initialized successfully");
    
    return true;
  } catch (error) {
    console.error("Error initializing Banner System:", error);
    return false;
  }
}

// Module exports
module.exports = {
  initializeBannerSystem,
  getBannerSystem: () => bannerSystem
};
