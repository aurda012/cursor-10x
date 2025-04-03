/**
 * Automatic Memory System Activation Script
 * Version: 1.0.0
 *
 * This script activates the automatic memory system upon startup,
 * loading all necessary memory hook modules.
 */

// Check if we're in a Node.js environment (for compatibility)
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;

// Define the module and its dependencies
const path = isNode ? require("path") : null;
const fs = isNode ? require("fs") : null;

console.log("🧠 Activating automatic memory system...");

// Load necessary modules
const MEMORY_SYSTEM = global.MEMORY_SYSTEM;

// Path to memory hook modules
const memorySysPath = isNode
  ? path.resolve(__dirname, "systems", "memory-system.js")
  : ".cursor/systems/memory-system.js";

const autoMemoryPath = isNode
  ? path.resolve(__dirname, "memory-hooks", "auto-memory-system.js")
  : ".cursor/memory-hooks/auto-memory-system.js";

/**
 * Load the core memory system if not already loaded
 * @returns {Object|null} The memory system module
 */
function loadMemorySystem() {
  try {
    // Check if memory system is already loaded
    if (MEMORY_SYSTEM && typeof MEMORY_SYSTEM.storeEpisode === "function") {
      console.log("✅ Memory system already loaded");
      return MEMORY_SYSTEM;
    }

    // Attempt to load the memory system
    if (isNode && fs.existsSync(memorySysPath)) {
      const memorySystem = require(memorySysPath);

      // Check if it was loaded correctly
      if (memorySystem && typeof memorySystem.initialize === "function") {
        memorySystem.initialize();
        console.log("✅ Loaded memory system from module");
        return memorySystem;
      }
    }

    console.warn("⚠️ Could not load memory system module");
    return null;
  } catch (error) {
    console.error("❌ Error loading memory system:", error);
    return null;
  }
}

/**
 * Load the automatic memory system
 * @returns {Object|null} The automatic memory system module
 */
function loadAutoMemory() {
  try {
    // Attempt to load the auto memory system
    if (isNode && fs.existsSync(autoMemoryPath)) {
      const autoMemory = require(autoMemoryPath);

      // Check if it was loaded correctly and initialize it
      if (autoMemory && typeof autoMemory.initialize === "function") {
        const success = autoMemory.initialize();
        if (success) {
          console.log("✅ Loaded and initialized automatic memory system");

          // Register message hooks
          if (typeof autoMemory.registerMessageHooks === "function") {
            autoMemory.registerMessageHooks();
            console.log("✅ Registered automatic memory hooks");
          }

          return autoMemory;
        }
      }
    }

    console.warn("⚠️ Could not load automatic memory system module");
    return null;
  } catch (error) {
    console.error("❌ Error loading automatic memory system:", error);
    return null;
  }
}

/**
 * Update the memory system banner
 */
function updateMemoryBanner() {
  try {
    // Get the banner system if available
    const bannerSystem = global.BANNER_SYSTEM || {};

    // Update the memory system banner
    if (bannerSystem && typeof bannerSystem.updateSystemStatus === "function") {
      bannerSystem.updateSystemStatus("memory", "ACTIVE - AUTO MODE");
      console.log("✅ Updated memory system banner");
    } else {
      // Alternative approach if banner system isn't available
      if (
        global.nextResponsePrepend &&
        Array.isArray(global.nextResponsePrepend)
      ) {
        // Check if memory banner exists
        let memoryBannerExists = false;
        for (let i = 0; i < global.nextResponsePrepend.length; i++) {
          if (global.nextResponsePrepend[i].includes("[MEMORY SYSTEM:")) {
            // Update existing banner
            global.nextResponsePrepend[i] =
              "🧠 [MEMORY SYSTEM: ACTIVE - AUTO MODE]";
            memoryBannerExists = true;
            break;
          }
        }

        // Add banner if it doesn't exist
        if (!memoryBannerExists) {
          global.nextResponsePrepend.push(
            "🧠 [MEMORY SYSTEM: ACTIVE - AUTO MODE]"
          );
        }
        console.log("✅ Updated memory banner in response prepend");
      }
    }
  } catch (error) {
    console.error("❌ Error updating memory banner:", error);
  }
}

/**
 * Integrate with existing systems
 */
function integrateWithSystems() {
  try {
    // Register with scratchpad system if available
    const scratchpadSystem = global.SCRATCHPAD_SYSTEM || global.SCRATCHPAD;
    if (
      scratchpadSystem &&
      typeof scratchpadSystem.createMessage === "function"
    ) {
      scratchpadSystem.createMessage(
        "system",
        "system_event",
        `Automatic Memory System activated successfully. All conversation data will now be automatically stored and retrieved.`
      );
      console.log("✅ Integrated with scratchpad system");
    }

    // Register with multi-agent system if available
    const multiAgentSystem = global.MULTI_AGENT_SYSTEM;
    if (
      multiAgentSystem &&
      typeof multiAgentSystem.registerSystem === "function"
    ) {
      multiAgentSystem.registerSystem("auto_memory", {
        name: "Automatic Memory System",
        description:
          "Provides automatic memory capture and retrieval for all agents",
        capabilities: [
          "conversation_capture",
          "context_retrieval",
          "knowledge_access",
        ],
      });
      console.log("✅ Integrated with multi-agent system");
    }
  } catch (error) {
    console.error("❌ Error integrating with systems:", error);
  }
}

// Main activation process
function activate() {
  // Step 1: Load the core memory system
  const memorySystem = loadMemorySystem();

  // Step 2: Load the automatic memory system
  const autoMemory = loadAutoMemory();

  // Step 3: Update the memory banner
  updateMemoryBanner();

  // Step 4: Integrate with existing systems
  integrateWithSystems();

  // Return activation status
  return {
    success: Boolean(memorySystem && autoMemory),
    memorySystem: Boolean(memorySystem),
    autoMemory: Boolean(autoMemory),
  };
}

// Activate the system
const activationResult = activate();
console.log(
  `🧠 Automatic memory system activation ${
    activationResult.success ? "complete" : "failed"
  }`
);

// Export the activation result
module.exports = {
  activationResult,
  isActive: () => activationResult.success,
};

// If this module is loaded directly (not required), log the result
if (isNode && require.main === module) {
  console.log("Activation status:", JSON.stringify(activationResult, null, 2));
}
