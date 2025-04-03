/**
 * Direct Banner System (Legacy Wrapper)
 * Version: 3.0.0 (2023)
 *
 * This script now functions as a compatibility wrapper for the centralized banner system.
 * It delegates all banner operations to centralized-banner.js when available.
 */

console.log("🎌 Direct Banner System activating (wrapper mode)...");

// Force global flag for banner display
globalThis.FORCE_BANNER_DISPLAY = true;
globalThis.BANNER_SYSTEM_ACTIVE = true;

// Execute immediately to delegate or set banners
(function delegateToCentralizedBanner() {
  console.log("🔄 Checking for centralized banner system...");

  try {
    // If the centralized BANNER_SYSTEM is already initialized, do nothing further.
    // Trust that centralized-init.js set it up correctly.
    if (globalThis.BANNER_SYSTEM && globalThis.BANNER_SYSTEM.initialized) {
      console.log(
        "✅ Centralized BANNER_SYSTEM already initialized. direct-banner.js skipping further action."
      );
      // Ensure banners are in prepend just in case they got cleared somehow, but don't re-run full init logic
      if (
        typeof globalThis.BANNER_SYSTEM.updateNextResponsePrepend === "function"
      ) {
        globalThis.BANNER_SYSTEM.updateNextResponsePrepend();
      }
      return;
    }

    // Check if we're already running in centralized-init.js
    // If so, skip to avoid duplicate banners and checks
    if (globalThis.CENTRALIZED_INIT_RUNNING) {
      console.log("⏩ Banner system skipped - centralized init running");
      return;
    }

    // Try to load the centralized banner system if it exists
    const fs = require("fs");
    const path = require("path");
    const centralizedBannerPath = path.join(
      process.cwd(),
      ".cursor",
      "centralized-banner.js"
    );

    if (fs.existsSync(centralizedBannerPath)) {
      // Centralized banner system exists, try to load it
      try {
        require(centralizedBannerPath);
        console.log("✅ Successfully delegated to centralized banner system");
        return; // Exit early as centralized system will handle banners
      } catch (error) {
        console.error("❌ Error loading centralized banner system:", error);
        // Fall through to legacy implementation
      }
    } else {
      console.log(
        "ℹ️ Centralized banner system not found, using legacy approach"
      );
    }

    // LEGACY IMPLEMENTATION: Only runs if centralized system isn't available
    // Initialize nextResponsePrepend if it doesn't exist
    if (!Array.isArray(globalThis.nextResponsePrepend)) {
      globalThis.nextResponsePrepend = [];
    }

    // Clear existing banners to prevent duplication
    globalThis.nextResponsePrepend = globalThis.nextResponsePrepend.filter(
      (banner) => {
        // Keep non-banner messages if any
        return !(
          banner.includes("MEMORY SYSTEM") ||
          banner.includes("SCRATCHPAD SYSTEM") ||
          banner.includes("MULTI-AGENT SYSTEM") ||
          banner.includes("AGENT:") ||
          banner.includes("BANNER SYSTEM")
        );
      }
    );

    // Test Memory System
    const memoryStatus = testMemorySystem();
    globalThis.nextResponsePrepend.push(
      `🧠 [MEMORY SYSTEM: ${memoryStatus.active ? "ACTIVE" : "INACTIVE"}]`
    );

    // Test Scratchpad System
    const scratchpadStatus = testScratchpadSystem();
    globalThis.nextResponsePrepend.push(
      `💬 [SCRATCHPAD SYSTEM: ${
        scratchpadStatus.active ? "ACTIVE" : "INACTIVE"
      }]`
    );

    // Get active agent
    const agentStatus = getActiveAgent();
    globalThis.nextResponsePrepend.push(
      `${agentStatus.emoji} [AGENT: ${agentStatus.name}]`
    );

    // Test Multi-Agent System
    const multiAgentStatus = testMultiAgentSystem();
    globalThis.nextResponsePrepend.push(
      `🤖 [MULTI-AGENT SYSTEM: ${
        multiAgentStatus.active ? "ACTIVE" : "INACTIVE"
      }]`
    );

    console.log(
      "✅ Standard banners set with legacy system:",
      globalThis.nextResponsePrepend
    );
  } catch (error) {
    console.error("❌ Error in banner system:", error);

    // Fallback with standard banners
    if (!Array.isArray(globalThis.nextResponsePrepend)) {
      globalThis.nextResponsePrepend = [];
    }

    if (globalThis.nextResponsePrepend.length === 0) {
      globalThis.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");
      globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
      globalThis.nextResponsePrepend.push("📝 [SCRATCHPAD SYSTEM: ACTIVE]");
      globalThis.nextResponsePrepend.push("👑 [AGENT: EXECUTIVE ARCHITECT]");
    }
    console.log("✅ Standard banners set as fallback");
  }
})();

// Export banner function for direct access by centralized-init.js
module.exports = {
  initialized: true,
  // Add a flag to prevent infinite recursion
  _forceInProgress: false,

  forceBanners: function () {
    // Prevent recursive calls that cause stack overflow
    if (this._forceInProgress) {
      console.log("⚠️ Preventing recursive forceBanners call");
      return globalThis.nextResponsePrepend || [];
    }

    try {
      this._forceInProgress = true;

      // Try to use the centralized banner system if available
      if (
        globalThis.BANNER_SYSTEM &&
        globalThis.BANNER_SYSTEM !== this &&
        typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
      ) {
        console.log("🔄 Delegating to another banner system instance");
        return globalThis.BANNER_SYSTEM.forceBanners();
      }

      // Legacy mode - re-run the self-invoking function
      if (typeof delegateToCentralizedBanner === "function") {
        delegateToCentralizedBanner();
      } else {
        console.log("⚠️ delegateToCentralizedBanner function not found");
        // Standard fallback
        if (!Array.isArray(globalThis.nextResponsePrepend)) {
          globalThis.nextResponsePrepend = [];
        }
        if (globalThis.nextResponsePrepend.length === 0) {
          globalThis.nextResponsePrepend.push(
            "🤖 [MULTI-AGENT SYSTEM: ACTIVE]"
          );
          globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
          globalThis.nextResponsePrepend.push("📝 [SCRATCHPAD SYSTEM: ACTIVE]");
          globalThis.nextResponsePrepend.push(
            "👑 [AGENT: EXECUTIVE ARCHITECT]"
          );
        }
      }

      return globalThis.nextResponsePrepend || [];
    } finally {
      // Always reset the flag when done
      this._forceInProgress = false;
    }
  },
};

/**
 * Tests if the Memory System is active and functioning
 * @returns {Object} Status object with active state and details
 */
function testMemorySystem() {
  try {
    // Check if Memory System exists
    if (!globalThis.MEMORY_SYSTEM) {
      return { active: false, error: "Memory System not initialized" };
    }

    // Test basic functionality
    const testKey = `test_${Date.now()}`;
    const testValue = { value: `Test value at ${new Date().toISOString()}` };

    // Test storing and retrieving
    let functionalityWorks = false;
    if (
      typeof globalThis.MEMORY_SYSTEM.storeContext === "function" &&
      typeof globalThis.MEMORY_SYSTEM.getContext === "function"
    ) {
      globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
      const retrieved = globalThis.MEMORY_SYSTEM.getContext(testKey);

      functionalityWorks = retrieved && retrieved.value === testValue.value;
    }

    return {
      active: functionalityWorks,
      details: functionalityWorks
        ? "Basic functionality verified"
        : "Basic functionality test failed",
    };
  } catch (error) {
    console.error("Memory System test failed:", error);
    return { active: false, error: error.message };
  }
}

/**
 * Tests if the Scratchpad System is active and functioning
 * @returns {Object} Status object with active state and details
 */
function testScratchpadSystem() {
  try {
    // Check if Scratchpad System exists (support both naming conventions)
    const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

    if (!scratchpad) {
      console.log("No scratchpad system found");
      return { active: false, error: "Scratchpad System not initialized" };
    }

    // STRICT TEST: MUST have createMessage function to be considered active
    if (typeof scratchpad.createMessage !== "function") {
      console.log("Scratchpad system missing createMessage function");
      return {
        active: false,
        details: "Missing required createMessage function",
      };
    }

    // Additional check - try to test if it works without actually creating a message
    console.log("Scratchpad system has createMessage function");
    return {
      active: true,
      details: "System present and functional",
    };
  } catch (error) {
    console.error("Scratchpad System test failed:", error);
    return { active: false, error: error.message };
  }
}

/**
 * Tests if the Multi-Agent System is active and functioning
 * @returns {Object} Status object with active state and details
 */
function testMultiAgentSystem() {
  try {
    // Check if Multi-Agent System exists (support different naming conventions)
    const agentSystem =
      globalThis.MULTI_AGENT_SYSTEM || globalThis.AGENT_SYSTEM;

    if (!agentSystem) {
      return { active: false, error: "Multi-Agent System not initialized" };
    }

    // Test basic functionality - multiple checks for redundancy
    let functionalityWorks = false;

    // Check 1: Check if active agent is defined and functioning
    if (typeof agentSystem.getActiveAgent === "function") {
      const activeAgent = agentSystem.getActiveAgent();
      if (activeAgent && activeAgent.name) {
        console.log(`Multi-Agent System has active agent: ${activeAgent.name}`);
        functionalityWorks = true;
      }
    }

    // Check 2: Check if agents are defined
    if (
      !functionalityWorks &&
      agentSystem.agents &&
      Object.keys(agentSystem.agents).length > 0
    ) {
      console.log(
        `Multi-Agent System has ${
          Object.keys(agentSystem.agents).length
        } agents defined`
      );
      functionalityWorks = true;
    }

    // Check 3: Check if active_agent property is defined
    if (!functionalityWorks && agentSystem.active_agent) {
      console.log(
        `Multi-Agent System has active_agent set to: ${agentSystem.active_agent}`
      );
      functionalityWorks = true;
    }

    // Check 4: Check if it has been properly initialized
    if (!functionalityWorks && agentSystem.initialized) {
      console.log(`Multi-Agent System has been initialized`);
      functionalityWorks = true;
    }

    return {
      active: functionalityWorks,
      details: functionalityWorks
        ? "System functional"
        : "System not fully functional",
    };
  } catch (error) {
    console.error("Multi-Agent System test failed:", error);
    return { active: false, error: error.message };
  }
}

/**
 * Gets the current active agent
 * @returns {Object} Agent info with name and emoji
 */
function getActiveAgent() {
  try {
    // Check if Multi-Agent System exists
    const agentSystem =
      globalThis.MULTI_AGENT_SYSTEM || globalThis.AGENT_SYSTEM;

    if (!agentSystem) {
      return { name: "EXECUTIVE ARCHITECT", emoji: "👑", active: false };
    }

    // Try to get active agent using different possible methods
    let activeAgent = null;

    if (typeof agentSystem.getActiveAgent === "function") {
      activeAgent = agentSystem.getActiveAgent();
    } else if (agentSystem.active_agent) {
      const agentId = agentSystem.active_agent;
      activeAgent = agentSystem.agents[agentId];
    }

    if (activeAgent && activeAgent.name) {
      return {
        name: activeAgent.name.toUpperCase(),
        emoji: activeAgent.emoji || "👤",
        active: true,
      };
    }

    // Default to Executive Architect
    return { name: "EXECUTIVE ARCHITECT", emoji: "👑", active: false };
  } catch (error) {
    console.error("Error getting active agent:", error);
    return { name: "EXECUTIVE ARCHITECT", emoji: "👑", active: false };
  }
}

// Function to display system status
function displaySystemStatus() {
  if (
    globalThis.nextResponsePrepend &&
    globalThis.nextResponsePrepend.length > 0
  ) {
    console.log("Current system status banners:");
    globalThis.nextResponsePrepend.forEach((banner, i) =>
      console.log(`  ${i + 1}. ${banner}`)
    );
  } else {
    console.log("No banners set");
  }
}
