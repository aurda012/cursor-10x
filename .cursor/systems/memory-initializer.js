/**
 * Memory System Initializer with Auto-Memory Integration
 * Version: 1.0.0
 *
 * This script initializes the core memory system and
 * integrates automatic memory functionality.
 */

// Check if we're in a Node.js environment (for compatibility)
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;

// Define the module and its dependencies
const path = isNode ? require("path") : null;
const fs = isNode ? require("fs") : null;

console.log("🧠 Initializing memory system with automatic capabilities...");

// Define path constants
const BASE_DIR = isNode ? path.resolve(__dirname, "..") : ".cursor";
const MEMORY_SYSTEM_PATH = isNode
  ? path.join(BASE_DIR, "db", "memory-system.js")
  : `${BASE_DIR}/db/memory-system.js`;
const AUTO_MEMORY_ROOT = isNode
  ? path.join(BASE_DIR, "memory-hooks")
  : `${BASE_DIR}/memory-hooks`;
const AUTO_MEMORY_PATHS = {
  capture: isNode
    ? path.join(AUTO_MEMORY_ROOT, "conversation-capture.js")
    : `${AUTO_MEMORY_ROOT}/conversation-capture.js`,
  retrieval: isNode
    ? path.join(AUTO_MEMORY_ROOT, "context-retrieval.js")
    : `${AUTO_MEMORY_ROOT}/context-retrieval.js`,
  system: isNode
    ? path.join(AUTO_MEMORY_ROOT, "auto-memory-system.js")
    : `${AUTO_MEMORY_ROOT}/auto-memory-system.js`,
};

// Track initialization status
let isInitialized = false;
let memory = null;
let autoMemory = null;

/**
 * Check if memory system is already initialized
 * @returns {boolean} Whether memory is already initialized
 */
function isMemoryInitialized() {
  return (
    global.MEMORY_SYSTEM &&
    typeof global.MEMORY_SYSTEM.storeEpisode === "function" &&
    typeof global.MEMORY_SYSTEM.getRecentEpisodes === "function"
  );
}

/**
 * Load and initialize the core memory system
 * @returns {Object|null} The initialized memory system
 */
function initializeMemorySystem() {
  try {
    // Check if memory system is already initialized
    if (isMemoryInitialized()) {
      console.log("✅ Memory system already initialized");
      return global.MEMORY_SYSTEM;
    }

    // Load memory system module
    if (isNode && fs.existsSync(MEMORY_SYSTEM_PATH)) {
      const memorySystem = require(MEMORY_SYSTEM_PATH);

      // Initialize the memory system if needed
      if (typeof memorySystem.initialize === "function") {
        memorySystem.initialize();
      } else if (typeof memorySystem.init === "function") {
        memorySystem.init();
      }

      // Set the global reference if not already set
      if (!global.MEMORY_SYSTEM) {
        global.MEMORY_SYSTEM = memorySystem;
      }

      console.log("✅ Core memory system initialized");
      return memorySystem;
    }

    console.error("❌ Memory system module not found at:", MEMORY_SYSTEM_PATH);
    return null;
  } catch (error) {
    console.error("❌ Error initializing memory system:", error);
    return null;
  }
}

/**
 * Create the memory hooks directory if it doesn't exist
 * @returns {boolean} Success status
 */
function ensureDirectoriesExist() {
  try {
    if (isNode && !fs.existsSync(AUTO_MEMORY_ROOT)) {
      fs.mkdirSync(AUTO_MEMORY_ROOT, { recursive: true });
      console.log("✅ Created memory hooks directory");
    }
    return true;
  } catch (error) {
    console.error("❌ Error creating directories:", error);
    return false;
  }
}

/**
 * Load and initialize the automatic memory system
 * @returns {Object|null} The initialized automatic memory system
 */
function initializeAutoMemory() {
  try {
    // Ensure directories exist
    ensureDirectoriesExist();

    // Load auto memory system
    if (isNode && fs.existsSync(AUTO_MEMORY_PATHS.system)) {
      console.log("Loading auto memory system module...");
      const autoMemorySystem = require(AUTO_MEMORY_PATHS.system);

      if (
        autoMemorySystem &&
        typeof autoMemorySystem.initialize === "function"
      ) {
        // Initialize the auto memory system
        const success = autoMemorySystem.initialize();
        if (success) {
          // Register message hooks
          if (typeof autoMemorySystem.registerMessageHooks === "function") {
            autoMemorySystem.registerMessageHooks();
          }

          // Set global reference
          global.AUTO_MEMORY_SYSTEM = autoMemorySystem;

          console.log("✅ Automatic memory system initialized");
          return autoMemorySystem;
        }
      }
    } else {
      console.log("Loading individual memory hook components...");

      // Try to load and initialize individual components
      let componentsLoaded = 0;

      // Load capture system
      if (isNode && fs.existsSync(AUTO_MEMORY_PATHS.capture)) {
        const captureSystem = require(AUTO_MEMORY_PATHS.capture);
        if (captureSystem && typeof captureSystem.initialize === "function") {
          captureSystem.initialize();
          componentsLoaded++;
          console.log("✅ Loaded conversation capture module");
        }
      }

      // Load retrieval system
      if (isNode && fs.existsSync(AUTO_MEMORY_PATHS.retrieval)) {
        const retrievalSystem = require(AUTO_MEMORY_PATHS.retrieval);
        if (
          retrievalSystem &&
          typeof retrievalSystem.initialize === "function"
        ) {
          retrievalSystem.initialize();
          componentsLoaded++;
          console.log("✅ Loaded context retrieval module");
        }
      }

      if (componentsLoaded > 0) {
        console.log(`✅ Loaded ${componentsLoaded} memory component(s)`);
        return { componentsLoaded };
      }
    }

    console.warn(
      "⚠️ Automatic memory system not found or initialization failed"
    );
    return null;
  } catch (error) {
    console.error("❌ Error initializing automatic memory:", error);
    return null;
  }
}

/**
 * Update the memory system banner
 */
function updateMemoryBanner() {
  try {
    // Try to use banner system if available
    const bannerSystem = global.BANNER_SYSTEM;

    if (bannerSystem && typeof bannerSystem.updateSystemStatus === "function") {
      const mode = autoMemory ? "ACTIVE - AUTO" : "ACTIVE";
      bannerSystem.updateSystemStatus("memory", mode);
      console.log("✅ Updated memory banner through banner system");
      return;
    }

    // Fallback to manual banner update
    if (!global.nextResponsePrepend) {
      global.nextResponsePrepend = [];
    }

    // Update existing memory banner or add new one
    let memoryBannerFound = false;
    for (let i = 0; i < global.nextResponsePrepend.length; i++) {
      if (
        typeof global.nextResponsePrepend[i] === "string" &&
        global.nextResponsePrepend[i].includes("[MEMORY SYSTEM:")
      ) {
        const mode = autoMemory ? "ACTIVE - AUTO MODE" : "ACTIVE";
        global.nextResponsePrepend[i] = `🧠 [MEMORY SYSTEM: ${mode}]`;
        memoryBannerFound = true;
        break;
      }
    }

    if (!memoryBannerFound) {
      const mode = autoMemory ? "ACTIVE - AUTO MODE" : "ACTIVE";
      global.nextResponsePrepend.push(`🧠 [MEMORY SYSTEM: ${mode}]`);
    }

    console.log("✅ Updated memory banner through response prepend");
  } catch (error) {
    console.error("❌ Error updating memory banner:", error);
  }
}

/**
 * Register with other system frameworks
 */
function registerWithSystems() {
  try {
    // Register with multi-agent system if available
    const multiAgentSystem = global.MULTI_AGENT_SYSTEM;
    if (
      multiAgentSystem &&
      typeof multiAgentSystem.registerSystem === "function"
    ) {
      multiAgentSystem.registerSystem("memory", {
        name: "Memory System",
        description:
          "Persistent memory storage with automatic capture and retrieval",
        capabilities: ["storage", "retrieval", "automatic_capture"],
        autoMode: Boolean(autoMemory),
      });
      console.log("✅ Registered with multi-agent system");
    }

    // Register with system registry if available
    const systemRegistry = global.SYSTEM_REGISTRY;
    if (systemRegistry && typeof systemRegistry.register === "function") {
      systemRegistry.register("memory", {
        name: "Memory System",
        version: "1.0.0",
        status: "active",
        autoMode: Boolean(autoMemory),
        initialized: new Date().toISOString(),
      });
      console.log("✅ Registered with system registry");
    }

    // Notify scratchpad
    const scratchpadSystem = global.SCRATCHPAD_SYSTEM || global.SCRATCHPAD;
    if (
      scratchpadSystem &&
      typeof scratchpadSystem.createMessage === "function"
    ) {
      const mode = autoMemory
        ? "with automatic capabilities"
        : "in standard mode";
      scratchpadSystem.createMessage(
        "system",
        "system_event",
        `Memory system initialized ${mode}. DB tables created successfully.`
      );
      console.log("✅ Notified scratchpad system");
    }
  } catch (error) {
    console.error("❌ Error registering with systems:", error);
  }
}

/**
 * Initialize everything in the correct order
 * @returns {boolean} Success status
 */
function initialize() {
  if (isInitialized) return true;

  try {
    // Step 1: Initialize core memory system
    memory = initializeMemorySystem();
    if (!memory) {
      console.error("❌ Failed to initialize core memory system");
      return false;
    }

    // Step 2: Initialize automatic memory capabilities
    autoMemory = initializeAutoMemory();

    // Step 3: Update memory banner
    updateMemoryBanner();

    // Step 4: Register with other systems
    registerWithSystems();

    // Mark as initialized
    isInitialized = true;
    console.log(
      "✅ Memory system initialization complete" +
        (autoMemory ? " with automatic capabilities" : "")
    );

    return true;
  } catch (error) {
    console.error("❌ Error during memory system initialization:", error);
    return false;
  }
}

// Initialize the memory system
const success = initialize();

// Export the module
module.exports = {
  initialize,
  isInitialized: () => isInitialized,
  hasAutoMemory: () => Boolean(autoMemory),
  success,
};

// If this module is loaded directly (not required), log the result
if (isNode && require.main === module) {
  console.log("Memory system initialized:", success);
}
