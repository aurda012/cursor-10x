/**
 * System Initialization Script
 *
 * Primary entry point for initializing the multi-agent system, memory, and other subsystems
 */

// Get project name from the current working directory
const path = require("path");
const PROJECT_NAME = path.basename(process.cwd());

// Configuration and state
const FORCE_REINIT = true; // Always reinitialize for reliability
const INITIALIZED_KEY = "systemInitialized";

// Ensure there's a global space for system information
if (!globalThis.SYSTEM) {
  globalThis.SYSTEM = {};
}

// Display banner in console
function displayInitBanner(message) {
  const banner = `
┌──────────────────────────────────────────────────┐
│ ${PROJECT_NAME.toUpperCase()} SYSTEM INIT                              │
│ ${message}                                       │
└──────────────────────────────────────────────────┘
  `;

  console.log(banner);
  return banner;
}

// Main initialization function
async function initialize(force = false) {
  // Already initialized check
  if (globalThis.SYSTEM[INITIALIZED_KEY] && !force && !FORCE_REINIT) {
    console.log("System already initialized, skipping...");
    return true;
  }

  displayInitBanner("INITIALIZING...");
  console.log(`Initializing ${PROJECT_NAME} system...`);

  try {
    // Reset initialization flags
    globalThis.SYSTEM[INITIALIZED_KEY] = false;

    // Add initialization timestamp
    globalThis.SYSTEM.lastInitTime = new Date().toISOString();

    // Determine relative paths
    const basePath = "./.cursor/communication";

    // Initialize core components
    console.log("Initializing core memory systems...");
    try {
      // Initialize memory subsystem
      const memoryModule = require(`${basePath}/systems/memory_system.js`);
      await memoryModule.initialize();
      globalThis.SYSTEM.memoryInitialized = true;
      console.log("✅ Memory system initialized");
    } catch (error) {
      console.error("Error initializing memory system:", error);
    }

    try {
      // Initialize agent system
      const agentModule = require(`${basePath}/systems/agent_system.js`);
      await agentModule.initialize();
      globalThis.SYSTEM.agentInitialized = true;
      console.log("✅ Agent system initialized");
    } catch (error) {
      console.error("Error initializing agent system:", error);
    }

    try {
      // Initialize scratchpad
      const scratchpadModule = require(`${basePath}/systems/scratchpad.js`);
      await scratchpadModule.initialize();
      globalThis.SYSTEM.scratchpadInitialized = true;
      console.log("✅ Scratchpad system initialized");
    } catch (error) {
      console.error("Error initializing scratchpad:", error);
    }

    try {
      // Initialize date system
      const dateModule = require(`${basePath}/systems/date_verification.js`);
      await dateModule.initialize();
      globalThis.SYSTEM.dateInitialized = true;
      console.log("✅ Date system initialized");
    } catch (error) {
      console.error("Error initializing date system:", error);
    }

    try {
      // Initialize MCP server integration
      const mcpModule = require(`${basePath}/systems/mcp_integration.js`);
      await mcpModule.initialize();
      globalThis.SYSTEM.mcpInitialized = true;
      console.log("✅ MCP server integration initialized");
    } catch (error) {
      console.error("Error initializing MCP integration:", error);
    }

    // Mark system as initialized
    globalThis.SYSTEM[INITIALIZED_KEY] = true;
    console.log(`✅ ${PROJECT_NAME} system initialization complete`);

    // Set banner for next response
    if (!globalThis.nextResponsePrepend) {
      globalThis.nextResponsePrepend = [];
    }

    // Add system info to response
    if (
      !globalThis.nextResponsePrepend.some((line) =>
        line.includes("Multi-Agent System")
      )
    ) {
      globalThis.nextResponsePrepend.push(
        `[🤖 ${PROJECT_NAME} Multi-Agent System Active]`
      );
    }

    displayInitBanner("INITIALIZED SUCCESSFULLY");
    return true;
  } catch (error) {
    console.error("Critical error during system initialization:", error);

    // Set error banner
    if (!globalThis.nextResponsePrepend) {
      globalThis.nextResponsePrepend = [];
    }

    globalThis.nextResponsePrepend.push(
      `[🚨 ${PROJECT_NAME} SYSTEM: INITIALIZATION FAILED]`
    );

    displayInitBanner("INITIALIZATION FAILED");
    return false;
  }
}

// Export functions
module.exports = {
  initialize,
  displayInitBanner,
};
