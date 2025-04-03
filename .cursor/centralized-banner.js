/**
 * Centralized Banner System
 * Version: 1.2.0
 *
 * This file provides a centralized banner system for displaying system status
 * banners at the top of each chat response.
 *
 * Changes in 1.2.0:
 * - Added support for enhanced compatibility layer
 * - Improved system status detection logic
 * - Better handling of partial system states
 */

console.log("🚩 Initializing Centralized Banner System...");

// Create the banner system if it doesn't exist
if (!globalThis.BANNER_SYSTEM) {
  globalThis.BANNER_SYSTEM = {
    initialized: true,
    banners: [],
    lastBannerUpdate: 0,
  };
}

// Clear any existing banners to prevent duplication
if (Array.isArray(globalThis.nextResponsePrepend)) {
  globalThis.nextResponsePrepend = [];
} else {
  globalThis.nextResponsePrepend = [];
}

/**
 * Set a system banner
 * @param {string} id - Unique identifier for the banner
 * @param {string} text - Banner text to display
 */
globalThis.BANNER_SYSTEM.setBanner = function (id, text) {
  // Find banner if it exists
  const existingIndex = this.banners.findIndex((b) => b.id === id);

  // Replace or add the banner
  if (existingIndex >= 0) {
    this.banners[existingIndex] = { id, text };
  } else {
    this.banners.push({ id, text });
  }

  this.lastBannerUpdate = Date.now();
  this.updateNextResponsePrepend();
};

/**
 * Remove a system banner
 * @param {string} id - Identifier of the banner to remove
 */
globalThis.BANNER_SYSTEM.clearBanner = function (id) {
  this.banners = this.banners.filter((b) => b.id !== id);
  this.lastBannerUpdate = Date.now();
  this.updateNextResponsePrepend();
};

/**
 * Clear all banners
 */
globalThis.BANNER_SYSTEM.clearAllBanners = function () {
  this.banners = [];
  this.lastBannerUpdate = Date.now();
  this.updateNextResponsePrepend();
};

/**
 * Update the nextResponsePrepend array with current banners
 */
globalThis.BANNER_SYSTEM.updateNextResponsePrepend = function () {
  // Ensure nextResponsePrepend is an array
  if (!Array.isArray(globalThis.nextResponsePrepend)) {
    globalThis.nextResponsePrepend = [];
  } else {
    // Clear existing banners but keep non-banner prepends
    globalThis.nextResponsePrepend = globalThis.nextResponsePrepend.filter(
      (text) => !text.includes("[") || !text.includes("]")
    );
  }

  // Add all current banners
  this.banners.forEach((banner) => {
    globalThis.nextResponsePrepend.push(banner.text);
  });
};

/**
 * Force banners to be shown (call after initialization)
 */
globalThis.BANNER_SYSTEM.forceBanners = function () {
  // Set banners for core systems
  this.setCoreBanners();

  // Also update nextResponsePrepend directly
  this.updateNextResponsePrepend();
};

/**
 * Test the Memory System
 * @returns {Object} Status details of the Memory System
 */
globalThis.BANNER_SYSTEM.testMemorySystem = function () {
  try {
    if (!globalThis.MEMORY_SYSTEM) {
      return { status: "INACTIVE", dbStatus: "none" };
    }

    // Check for enhanced compatibility layer
    const hasEnhancedCompat =
      typeof globalThis.enhanceCompatibilityLayer === "function";

    // Check direct database status indicator
    const hasDbStatus = !!globalThis.MEMORY_SYSTEM.db_status;

    // Check for direct database storage
    const hasDirectDbStorage =
      typeof globalThis.MEMORY_SYSTEM._storage === "object" &&
      typeof globalThis.MEMORY_SYSTEM._storage.set === "function" &&
      typeof globalThis.MEMORY_SYSTEM._storage.get === "function";

    // Check if required functions exist
    const hasStoreContext =
      typeof globalThis.MEMORY_SYSTEM.storeContext === "function";
    const hasGetContext =
      typeof globalThis.MEMORY_SYSTEM.getContext === "function";

    // First check if functions are missing
    if (!hasStoreContext || !hasGetContext) {
      if (hasEnhancedCompat) {
        // Try to enhance memory system
        globalThis.enhanceCompatibilityLayer();

        // Check again
        const hasStoreContextNow =
          typeof globalThis.MEMORY_SYSTEM.storeContext === "function";
        const hasGetContextNow =
          typeof globalThis.MEMORY_SYSTEM.getContext === "function";

        if (!hasStoreContextNow || !hasGetContextNow) {
          return { status: "PARTIAL", dbStatus: "missing" };
        }
      } else {
        return { status: "PARTIAL", dbStatus: "missing" };
      }
    }

    // Test the functions
    try {
      const testKey = `test_${Date.now()}`;
      const testValue = `value_${Date.now()}`;

      // Try storing and retrieving a value
      globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
      const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);

      // Check if database functions work properly
      if (retrievedValue === testValue) {
        // Check which storage mechanism is being used
        let dbStatus = "in-memory";

        if (hasDbStatus && globalThis.MEMORY_SYSTEM.db_status === "active") {
          dbStatus = "active";
        } else if (hasDirectDbStorage) {
          dbStatus = "active";
        }

        return { status: "ACTIVE", dbStatus: dbStatus };
      } else {
        if (hasEnhancedCompat) {
          // Try enhancing and testing again
          globalThis.enhanceCompatibilityLayer();

          globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
          const retryValue = globalThis.MEMORY_SYSTEM.getContext(testKey);

          return retryValue === testValue
            ? { status: "ACTIVE", dbStatus: "fallback" }
            : { status: "PARTIAL", dbStatus: "error" };
        }
        return { status: "PARTIAL", dbStatus: "error" };
      }
    } catch (error) {
      return { status: "ERROR", dbStatus: "error", error: error.message };
    }
  } catch (error) {
    console.error("Error testing Memory System:", error);
    return { status: "ERROR", dbStatus: "error", error: error.message };
  }
};

/**
 * Test the Scratchpad System
 * @returns {string} Status of the Scratchpad System
 */
globalThis.BANNER_SYSTEM.testScratchpadSystem = function () {
  try {
    // Check if either naming convention exists
    const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

    if (!scratchpad) {
      return "INACTIVE";
    }

    // Check for enhanced compatibility layer
    const hasEnhancedCompat =
      typeof globalThis.enhanceCompatibilityLayer === "function";

    // Check if required function exists
    if (typeof scratchpad.createMessage !== "function") {
      if (hasEnhancedCompat) {
        // Try to enhance scratchpad
        globalThis.enhanceCompatibilityLayer();

        // Check again
        if (typeof scratchpad.createMessage !== "function") {
          return "PARTIAL";
        }
      } else {
        return "PARTIAL";
      }
    }

    // Test the function
    try {
      const messageId = scratchpad.createMessage(
        "system",
        "test",
        "Test message"
      );

      if (messageId && typeof messageId === "string") {
        return "ACTIVE";
      } else {
        if (hasEnhancedCompat) {
          // Try enhancing and testing again
          globalThis.enhanceCompatibilityLayer();

          const retryMessageId = scratchpad.createMessage(
            "system",
            "test",
            "Retry test message"
          );
          return retryMessageId && typeof retryMessageId === "string"
            ? "ACTIVE"
            : "PARTIAL";
        }
        return "PARTIAL";
      }
    } catch (error) {
      return "ERROR";
    }
  } catch (error) {
    console.error("Error testing Scratchpad System:", error);
    return "ERROR";
  }
};

/**
 * Test the Multi-Agent System
 * @returns {string} Status of the Multi-Agent System
 */
globalThis.BANNER_SYSTEM.testMultiAgentSystem = function () {
  try {
    // Check if either naming convention exists
    const agentSystem =
      globalThis.MULTI_AGENT_SYSTEM || globalThis.AGENT_SYSTEM;

    if (!agentSystem) {
      return "INACTIVE";
    }

    // Check if required functions/properties exist
    const hasGetActiveAgent = typeof agentSystem.getActiveAgent === "function";
    const hasAgents =
      agentSystem.agents && typeof agentSystem.agents === "object";

    if (!hasGetActiveAgent || !hasAgents) {
      return "PARTIAL";
    }

    // Get active agent
    try {
      const activeAgent = agentSystem.getActiveAgent();

      if (activeAgent) {
        return "ACTIVE";
      } else {
        return "PARTIAL";
      }
    } catch (error) {
      return "ERROR";
    }
  } catch (error) {
    console.error("Error testing Multi-Agent System:", error);
    return "ERROR";
  }
};

/**
 * Set the default system banners based on system status
 */
globalThis.BANNER_SYSTEM.setCoreBanners = function () {
  // Clear existing banners first to prevent duplication
  this.clearAllBanners();

  // Test enhanced compatibility
  const hasEnhancedCompat =
    typeof globalThis.enhanceCompatibilityLayer === "function";

  // Test Memory System
  const memoryResult = this.testMemorySystem();
  const memoryStatus = memoryResult.status;
  const memoryDbStatus = memoryResult.dbStatus;

  // Choose appropriate emoji
  const memoryEmoji =
    memoryStatus === "ACTIVE"
      ? "🧠"
      : memoryStatus === "PARTIAL"
      ? "⚠️"
      : memoryStatus === "ERROR"
      ? "❌"
      : "💤";

  // Create banner with database information
  let memoryBanner = `${memoryEmoji} [MEMORY SYSTEM: ${memoryStatus}]`;

  // Add database status details if active
  if (memoryStatus === "ACTIVE") {
    if (memoryDbStatus === "active") {
      memoryBanner += " Database connected";
    } else if (memoryDbStatus === "fallback") {
      memoryBanner += " Using fallback storage";
    } else if (memoryDbStatus === "in-memory") {
      memoryBanner += " Using in-memory storage";
    }
  }

  this.setBanner("memory", memoryBanner);

  // Test Scratchpad System
  const scratchpadStatus = this.testScratchpadSystem();
  const scratchpadEmoji =
    scratchpadStatus === "ACTIVE"
      ? "📝"
      : scratchpadStatus === "PARTIAL"
      ? "⚠️"
      : scratchpadStatus === "ERROR"
      ? "❌"
      : "💤";
  this.setBanner(
    "scratchpad",
    `${scratchpadEmoji} [SCRATCHPAD SYSTEM: ${scratchpadStatus}]`
  );

  // Test Multi-Agent System
  const agentSystemStatus = this.testMultiAgentSystem();
  const agentSystemEmoji =
    agentSystemStatus === "ACTIVE"
      ? "🤖"
      : agentSystemStatus === "PARTIAL"
      ? "⚠️"
      : agentSystemStatus === "ERROR"
      ? "❌"
      : "💤";
  this.setBanner(
    "agent-system",
    `${agentSystemEmoji} [MULTI-AGENT SYSTEM: ${agentSystemStatus}]`
  );

  // Add active agent banner if available
  const agentSystem = globalThis.MULTI_AGENT_SYSTEM || globalThis.AGENT_SYSTEM;
  if (agentSystem && typeof agentSystem.getActiveAgent === "function") {
    try {
      const activeAgent = agentSystem.getActiveAgent();
      if (activeAgent) {
        let agentName, agentEmoji;

        if (typeof activeAgent === "string") {
          agentName = activeAgent.toUpperCase();
          agentEmoji = "👤";
        } else {
          agentName = activeAgent.name
            ? activeAgent.name.toUpperCase()
            : activeAgent.id
            ? activeAgent.id.toUpperCase()
            : "UNKNOWN";
          agentEmoji = activeAgent.emoji || "👤";
        }

        this.setBanner("active-agent", `${agentEmoji} [AGENT: ${agentName}]`);
      }
    } catch (error) {
      console.error("Error getting active agent:", error);
    }
  }

  // Add enhanced compatibility banner if available
  if (hasEnhancedCompat) {
    this.setBanner("enhanced-compat", "✅ [ENHANCED COMPATIBILITY ACTIVE]");
  }

  // Add Banner System banner
  this.setBanner("banner-system", "🚩 [BANNER SYSTEM: ACTIVE]");

  // Count how many systems are active
  const activeSystems = [
    memoryStatus === "ACTIVE" ? 1 : 0,
    scratchpadStatus === "ACTIVE" ? 1 : 0,
    agentSystemStatus === "ACTIVE" ? 1 : 0,
    hasEnhancedCompat ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  this.setBanner("system-count", `⚙️ [ACTIVE SYSTEMS: ${activeSystems}/4]`);
};

// Set the initial banners
globalThis.BANNER_SYSTEM.setCoreBanners();

// Export for Node.js modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = globalThis.BANNER_SYSTEM;
}

console.log("✅ Centralized Banner System initialized successfully");
