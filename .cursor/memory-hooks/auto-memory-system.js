/**
 * Automatic Memory System Integration
 * Version: 1.0.0
 *
 * Connects the conversation capture and context retrieval systems
 * for automatic memory handling during conversations.
 */

// Check if we're in a Node.js environment (for compatibility)
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;

// Define the module and its dependencies
const path = isNode ? require("path") : null;
const fs = isNode ? require("fs") : null;

// Get the base directory for memory hooks
const baseDir = isNode ? path.resolve(__dirname) : "./memory-hooks";

// Track loaded modules
let captureSystem = null;
let retrievalSystem = null;
let isInitialized = false;

/**
 * Load a module dynamically
 * @param {string} modulePath Path to the module
 * @returns {Object|null} The loaded module or null if failed
 */
function loadModule(modulePath) {
  try {
    // Use require in Node.js environment
    if (isNode) {
      return require(modulePath);
    }

    // In browser or other environments, check if it's already globally available
    const moduleNameMatch = modulePath.match(/\/([^\/]+)\.js$/);
    const moduleName = moduleNameMatch
      ? moduleNameMatch[1].replace(/-/g, "_")
      : null;

    if (moduleName && global[moduleName]) {
      return global[moduleName];
    }

    console.warn(`Module ${modulePath} cannot be loaded in this environment`);
    return null;
  } catch (error) {
    console.error(`Failed to load module ${modulePath}:`, error);
    return null;
  }
}

/**
 * Initialize the automatic memory system
 * @returns {boolean} Success status
 */
function initialize() {
  if (isInitialized) return true;

  try {
    console.log("Initializing automatic memory system...");

    // Load the conversation capture system
    const capturePath = isNode
      ? path.join(baseDir, "conversation-capture.js")
      : "./memory-hooks/conversation-capture.js";
    captureSystem = loadModule(capturePath);

    if (!captureSystem) {
      console.error("Failed to load conversation capture system");
      return false;
    }

    // Load the context retrieval system
    const retrievalPath = isNode
      ? path.join(baseDir, "context-retrieval.js")
      : "./memory-hooks/context-retrieval.js";
    retrievalSystem = loadModule(retrievalPath);

    if (!retrievalSystem) {
      console.error("Failed to load context retrieval system");
      return false;
    }

    // Initialize both systems
    const captureInitialized =
      typeof captureSystem.initialize === "function"
        ? captureSystem.initialize()
        : true;

    const retrievalInitialized =
      typeof retrievalSystem.initialize === "function"
        ? retrievalSystem.initialize()
        : true;

    isInitialized = captureInitialized && retrievalInitialized;

    if (isInitialized) {
      console.log("Automatic memory system initialized successfully");
    } else {
      console.error("Failed to initialize one or more memory subsystems");
    }

    return isInitialized;
  } catch (error) {
    console.error("Error initializing automatic memory system:", error);
    return false;
  }
}

/**
 * Register hooks for user messages and assistant responses
 * @returns {boolean} Success status
 */
function registerMessageHooks() {
  try {
    if (!initialize()) return false;

    // Hook into global conversation system if available
    const conversationSystem = global.CONVERSATION_SYSTEM || {};

    if (
      conversationSystem &&
      typeof conversationSystem.registerHook === "function"
    ) {
      // Register hook for user messages
      conversationSystem.registerHook("userMessage", (message) => {
        captureSystem.captureUserMessage(message);
      });

      // Register hook for assistant responses
      conversationSystem.registerHook("assistantResponse", (response) => {
        captureSystem.captureAssistantResponse(response);
      });

      console.log("Registered memory hooks with conversation system");
      return true;
    }

    // If no conversation system, return success but warn
    console.warn(
      "No conversation hook system found, auto-memory will use direct calls"
    );
    return true;
  } catch (error) {
    console.error("Failed to register message hooks:", error);
    return false;
  }
}

/**
 * Process a user message (for direct integration)
 * @param {Object|string} message User message
 * @returns {boolean} Success status
 */
function processUserMessage(message) {
  try {
    if (!initialize()) return false;
    return captureSystem.captureUserMessage(message);
  } catch (error) {
    console.error("Failed to process user message:", error);
    return false;
  }
}

/**
 * Process an assistant response (for direct integration)
 * @param {Object|string} response Assistant response
 * @returns {boolean} Success status
 */
function processAssistantResponse(response) {
  try {
    if (!initialize()) return false;
    return captureSystem.captureAssistantResponse(response);
  } catch (error) {
    console.error("Failed to process assistant response:", error);
    return false;
  }
}

/**
 * Get context for the next response
 * @returns {Object} Memory context
 */
function getResponseContext() {
  try {
    if (!initialize()) return {};
    return retrievalSystem.getMemoryContext();
  } catch (error) {
    console.error("Failed to get response context:", error);
    return {};
  }
}

/**
 * Get the current conversation ID
 * @returns {string|null} Current conversation ID
 */
function getCurrentConversationId() {
  try {
    if (
      !initialize() ||
      !captureSystem ||
      !captureSystem.getCurrentConversationId
    ) {
      return null;
    }

    return captureSystem.getCurrentConversationId();
  } catch (error) {
    console.error("Failed to get current conversation ID:", error);
    return null;
  }
}

// Define the integrated module API
const autoMemorySystem = {
  initialize,
  registerMessageHooks,
  processUserMessage,
  processAssistantResponse,
  getResponseContext,
  getCurrentConversationId,
  isInitialized: () => isInitialized,
};

// Set global reference if in a compatible environment
if (typeof global !== "undefined") {
  global.AUTO_MEMORY_SYSTEM = autoMemorySystem;
}

// Export the system
module.exports = autoMemorySystem;

// If this module is loaded directly (not required), initialize immediately
if (isNode && require.main === module) {
  console.log("Auto memory system loaded");
  initialize();
  registerMessageHooks();
}
