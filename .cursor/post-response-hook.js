/**
 * POST-RESPONSE HOOK SYSTEM
 *
 * This system runs hooks after each response is generated.
 * It ensures that responses are properly stored in memory.
 */

console.log("🔄 Initializing Post-Response Hook System...");

// Check if hook system exists, use it if it does
if (!globalThis.HOOK_SYSTEM) {
  // Create a minimal hook system if it doesn't exist
  globalThis.HOOK_SYSTEM = {
    preHooks: [],
    postHooks: [],

    registerPreHook: function (name, priority, callback) {
      this.preHooks.push({ name, priority, callback });
      // Sort by priority (higher first)
      this.preHooks.sort((a, b) => b.priority - a.priority);
      console.log(
        `✅ Registered pre-response hook: ${name} (priority: ${priority})`
      );
      return true;
    },

    registerPostHook: function (name, priority, callback) {
      this.postHooks.push({ name, priority, callback });
      // Sort by priority (higher first)
      this.postHooks.sort((a, b) => b.priority - a.priority);
      console.log(
        `✅ Registered post-response hook: ${name} (priority: ${priority})`
      );
      return true;
    },

    runPostHooks: function (response) {
      const results = [];
      console.log(`Running ${this.postHooks.length} post-response hooks...`);

      for (const hook of this.postHooks) {
        try {
          const result = hook.callback(response);
          results.push({ name: hook.name, success: true, result });
        } catch (error) {
          console.error(`❌ Error in post-hook ${hook.name}:`, error.message);
          results.push({
            name: hook.name,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    },
  };

  console.log("✅ Minimal hook system created for post-response");
}

// Define a function to process and store responses in memory
function processResponse(response) {
  console.log("Processing assistant response...");

  // Store the response in memory if memory system exists
  if (globalThis.MEMORY_SYSTEM) {
    if (typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function") {
      console.log("Storing response in memory system...");
      return globalThis.MEMORY_SYSTEM.processAfterResponse(response);
    } else {
      console.log("Adding response to conversations...");
      // Fallback direct storage
      globalThis.MEMORY_SYSTEM.storeConversation({
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      });
      return true;
    }
  } else {
    console.warn("⚠️ Memory system not available for response storage");
    return false;
  }
}

// Register the processResponse function as a post-hook
globalThis.HOOK_SYSTEM.registerPostHook(
  "memory-response-processor",
  100, // High priority
  processResponse
);

// Expose a function to directly store the last response
globalThis.storeLastResponse = function (response) {
  return processResponse(response);
};

// Export the hook system
module.exports = {
  HOOK_SYSTEM: globalThis.HOOK_SYSTEM,
  storeResponse: processResponse,
};

console.log("✅ Post-Response Hook System initialization completed");
