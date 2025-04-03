/**
 * System Launcher
 * 
 * Centralizes and orchestrates the initialization of all system components:
 * - Date Verification System
 * - Memory System
 * - Scratchpad System
 * - Agent System
 * - MCP Server Integration
 * - Banner System
 * - State Persistence System
 * 
 * This is the main entry point for system activation.
 */

// Core Node.js modules
const fs = require('fs');
const path = require('path');

// Get project name from current directory
const PROJECT_NAME = path.basename(process.cwd());

// Create global namespace if it doesn't exist
if (typeof globalThis.SYSTEM === 'undefined') {
  globalThis.SYSTEM = {
    projectName: PROJECT_NAME
  };
}

// Required modules for the system
const REQUIRED_MODULES = {
  date: "Date Verification System",
  memory: "Memory System",
  scratchpad: "Scratchpad System",
  agent: "Agent System", 
  mcp: "MCP Server Integration",
  banner: "Banner System"
};

// Define warning messages for missing modules
const moduleWarnings = {
  "Date Verification System": "Current date functionality may be limited.",
  "Memory System": "Some features may not work properly.",
  "Scratchpad System": "Agent communication may be limited.",
  "Agent System": "Multi-agent features will not be available.",
  "MCP Server Integration": "External model access may be limited.",
  "Banner System": "Status display may be limited."
};

// Initialize system with current status
globalThis.SYSTEM = {
  ...globalThis.SYSTEM,
  systemInitialized: false,
  dateSystemInitialized: false,
  memoryInitialized: false,
  scratchpadInitialized: false,
  agentSystemInitialized: false,
  mcpInitialized: false,
  bannerInitialized: false
};

// Set up system paths
const SYSTEM_PATHS = {
  date: './systems/date_verification.js',
  memory: './systems/comprehensive_memory.js',
  scratchpad: './systems/scratchpad.js',
  agent: './systems/agent_system.js',
  mcp: './systems/mcp_integration.js',
  banner: './systems/banner.js',
  statePersistence: './systems/state_persistence.js'
};

// Load modules with dynamic require()
async function loadModule(name, modulePath) {
  try {
    const module = require(modulePath);
    console.log(`Successfully loaded ${name} module`);
    return module;
  } catch (error) {
    console.log(`Warning: ${name} module missing or invalid. ${moduleWarnings[name] || ''}`);
    console.error(`Module load error for ${name}:`, error.message);
    return null;
  }
}

// Initialize all systems
async function initializeAllSystems(forceReinitialization = false) {
  console.log("Initializing all systems...");
  
  try {
    // Get project name from current directory
    const path = require('path');
    const fs = require('fs');
    const PROJECT_NAME = path.basename(process.cwd());
    
    console.log(`Initializing ${PROJECT_NAME} Multi-Agent System...`);
    
    // Force banner display flag for Cursor
    console.log("FORCE_BANNER_DISPLAY=true");
    
    // Force direct banner injection
    if (!globalThis.nextResponsePrepend) {
      globalThis.nextResponsePrepend = [];
    }
    
    // Add placeholder banner until proper initialization
    if (!globalThis.nextResponsePrepend.some(line => line.includes("Multi-Agent System"))) {
      globalThis.nextResponsePrepend.unshift(`🤖 [${PROJECT_NAME.toUpperCase()} MULTI-AGENT SYSTEM: INITIALIZING...]`);
    }
    
    // Initialize Banner System first
    try {
      const bannerSystemPath = path.join(process.cwd(), '.cursor/communication/systems/banner_system.js');
      
      // Clear cache to ensure fresh load
      if (require.cache[require.resolve(bannerSystemPath)]) {
        delete require.cache[require.resolve(bannerSystemPath)];
      }
      
      // Load banner system
      const bannerSystem = require(bannerSystemPath);
      
      if (bannerSystem && typeof bannerSystem.forceBanners === 'function') {
        console.log("Banner system loaded, forcing banners...");
        bannerSystem.forceBanners();
      } else {
        console.log("Banner system loaded but missing forceBanners function");
      }
    } catch (bannerError) {
      console.error("Error loading banner system:", bannerError);
    }
    
    // Initialize other systems...
    // Rest of your initialization code
  } catch (error) {
    console.error("Error in initializeAllSystems:", error);
    
    // Emergency banner injection
    if (!globalThis.nextResponsePrepend) {
      globalThis.nextResponsePrepend = [];
    }
    
    const path = require('path');
    const PROJECT_NAME = path.basename(process.cwd());
    
    globalThis.nextResponsePrepend.unshift(`❌ [${PROJECT_NAME.toUpperCase()} SYSTEM ERROR: ${error.message || "Initialization failed"}]`);
    
    return false;
  }
}

// Export module functions
module.exports = {
  initializeAllSystems
};

// Self-execution - optional, depending on how this file is loaded
if (require.main === module) {
  console.log("Launcher executed directly - initializing all systems now...");
  initializeAllSystems();
} 