/**
 * Memory Hooks Activation Script
 *
 * This script ensures the memory hooks are properly initialized
 * to process data at the beginning and end of every conversation.
 *
 * It should be included in custom instructions to run BEFORE EVERY CHAT
 */

console.log("🧠 Initializing Memory Hooks System...");

try {
  // Step 1: Make sure the memory system is loaded
  const path = require("path");
  const fs = require("fs");

  // Try to load the memory system activator
  const activatorPath = path.resolve(
    process.cwd(),
    ".cursor/scripts/activate-memory-system.js"
  );

  if (fs.existsSync(activatorPath)) {
    console.log("Loading memory system activator...");
    require(activatorPath);
    console.log("✅ Memory system activator loaded");
  } else {
    console.error(`❌ Memory system activator not found at: ${activatorPath}`);
    // Try to load pre-response hook directly
    const preHookPath = path.resolve(
      process.cwd(),
      ".cursor/core/pre-response-hook.js"
    );
    if (fs.existsSync(preHookPath)) {
      console.log("Loading pre-response hook directly...");
      require(preHookPath);
      console.log("✅ Pre-response hook loaded directly");
    }
  }

  // Step 2: Ensure direct access to basic memory functions
  if (
    !globalThis.storeContext &&
    globalThis.MEMORY_SYSTEM &&
    typeof globalThis.MEMORY_SYSTEM.storeContext === "function"
  ) {
    globalThis.storeContext = function (key, value) {
      return globalThis.MEMORY_SYSTEM.storeContext(key, value);
    };
    console.log("✅ Added global storeContext function");
  }

  if (
    !globalThis.getContext &&
    globalThis.MEMORY_SYSTEM &&
    typeof globalThis.MEMORY_SYSTEM.getContext === "function"
  ) {
    globalThis.getContext = function (key) {
      return globalThis.MEMORY_SYSTEM.getContext(key);
    };
    console.log("✅ Added global getContext function");
  }

  if (
    !globalThis.storeConversation &&
    globalThis.MEMORY_SYSTEM &&
    typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
  ) {
    globalThis.storeConversation = function (conversation) {
      return globalThis.MEMORY_SYSTEM.storeConversation(conversation);
    };
    console.log("✅ Added global storeConversation function");
  }

  // Step 3: Process the user's last message if we can find it
  if (
    globalThis.MEMORY_SYSTEM &&
    typeof globalThis.MEMORY_SYSTEM.processBeforeResponse === "function"
  ) {
    console.log("Looking for current user message...");
    const userMessage = "Activating memory system"; // This is just a placeholder

    globalThis.MEMORY_SYSTEM.processBeforeResponse(userMessage);
    console.log("✅ Processed startup message to ensure memory data loading");
  }

  // Step 4: Ensure we have banners for visual confirmation
  if (!globalThis.nextResponsePrepend) {
    globalThis.nextResponsePrepend = [];
  }

  let hasMemoryBanner = false;
  for (const banner of globalThis.nextResponsePrepend) {
    if (banner.includes("MEMORY SYSTEM")) {
      hasMemoryBanner = true;
      break;
    }
  }

  if (!hasMemoryBanner) {
    globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
    console.log("✅ Added memory system banner");
  }

  // Step 5: Add emergency re-activation function
  globalThis.reactivateMemory = function () {
    console.log("Emergency memory system reactivation triggered");

    if (typeof require === "function") {
      try {
        const path = require("path");
        const activationPath = path.resolve(
          process.cwd(),
          ".cursor/core/activate-memory-hooks.js"
        );
        require(activationPath);
        return "Memory system reactivated";
      } catch (error) {
        console.error("Failed to reactivate memory system:", error.message);
        return "Failed to reactivate memory system";
      }
    }

    return "Cannot reactivate memory system: require not available";
  };

  console.log("✅ Memory Hooks System successfully initialized");
} catch (error) {
  console.error("❌ Error initializing memory hooks system:", error.message);

  // Set emergency flag
  globalThis.MEMORY_SYSTEM_FAILED = true;

  // Add emergency banner
  if (!globalThis.nextResponsePrepend) {
    globalThis.nextResponsePrepend = [];
  }

  globalThis.nextResponsePrepend.push("⚠️ [MEMORY SYSTEM: ERROR]");
}

// Flag to indicate this script has run
globalThis.MEMORY_HOOKS_INITIALIZED = true;

// Export memory system if it exists
module.exports = globalThis.MEMORY_SYSTEM || { initialized: false };
