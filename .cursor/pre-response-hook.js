/**
 * PRE-RESPONSE HOOK SYSTEM
 *
 * This system runs hooks before and after each response.
 * It ensures memory operations are properly executed.
 */

console.log("🔄 Initializing Pre-Response Hook System...");

// Create hook system if it doesn't exist
if (!globalThis.HOOK_SYSTEM) {
  globalThis.HOOK_SYSTEM = {
    preHooks: [],
    postHooks: [],

    registerPreHook: function (name, fn, priority = 100) {
      // Check if hook already exists
      const existingIndex = this.preHooks.findIndex((h) => h.name === name);
      if (existingIndex >= 0) {
        // Replace existing hook
        this.preHooks[existingIndex] = { name, fn, priority };
      } else {
        // Add new hook
        this.preHooks.push({ name, fn, priority });
      }

      // Sort by priority (higher first)
      this.preHooks.sort((a, b) => b.priority - a.priority);
      console.log(
        `✅ Registered pre-response hook: ${name} (priority: ${priority})`
      );
      return true;
    },

    registerPostHook: function (name, fn, priority = 100) {
      // Check if hook already exists
      const existingIndex = this.postHooks.findIndex((h) => h.name === name);
      if (existingIndex >= 0) {
        // Replace existing hook
        this.postHooks[existingIndex] = { name, fn, priority };
      } else {
        // Add new hook
        this.postHooks.push({ name, fn, priority });
      }

      // Sort by priority (higher first)
      this.postHooks.sort((a, b) => b.priority - a.priority);
      console.log(
        `✅ Registered post-response hook: ${name} (priority: ${priority})`
      );
      return true;
    },

    runPreHooks: function (input) {
      let result = input;
      for (const hook of this.preHooks) {
        try {
          console.log(`Running pre-hook: ${hook.name}`);
          const hookResult = hook.fn(result);
          if (hookResult) {
            result = hookResult;
          }
        } catch (error) {
          console.error(`Error in pre-hook ${hook.name}: ${error.message}`);
        }
      }
      return result;
    },

    runPostHooks: function (input) {
      let result = input;
      for (const hook of this.postHooks) {
        try {
          console.log(`Running post-hook: ${hook.name}`);
          const hookResult = hook.fn(result);
          if (hookResult) {
            result = hookResult;
          }
        } catch (error) {
          console.error(`Error in post-hook ${hook.name}: ${error.message}`);
        }
      }
      return result;
    },
  };

  console.log("✅ Hook system initialized");
}

// Register memory hooks
if (globalThis.MEMORY_SYSTEM) {
  // Add memory operations to MEMORY_SYSTEM if not present
  if (!globalThis.MEMORY_SYSTEM.processBeforeResponse) {
    globalThis.MEMORY_SYSTEM.processBeforeResponse = function (query) {
      console.log("Processing memory before response for query:", query);

      // Store the query in memory
      this.storeContext("lastQuery", query);

      // Store the query in episodic memory
      this.storeConversation({
        role: "user",
        content: query,
        timestamp: Date.now(),
      });

      // Retrieve recent conversations
      const recentConversations = this.getRecentConversations(10);

      // Store them for easy access
      this.storeContext("recentConversations", recentConversations);

      console.log(
        `✅ Memory pre-processing completed. Stored ${recentConversations.length} recent conversations.`
      );
      return true;
    };

    console.log("✅ Added processBeforeResponse function to memory system");
  }

  if (!globalThis.MEMORY_SYSTEM.processAfterResponse) {
    globalThis.MEMORY_SYSTEM.processAfterResponse = function (response) {
      console.log("Processing memory after response");

      // Store the response in episodic memory
      this.storeConversation({
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      });

      // Update conversation count
      const count = this.getContext("conversationCount") || 0;
      this.storeContext("conversationCount", count + 1);

      console.log("✅ Memory post-processing completed");
      return true;
    };

    console.log("✅ Added processAfterResponse function to memory system");
  }

  // Register the memory hooks
  globalThis.HOOK_SYSTEM.registerPreHook(
    "memory-query-processor",
    function (query) {
      globalThis.MEMORY_SYSTEM.processBeforeResponse(query);
      return query;
    },
    100
  );

  globalThis.HOOK_SYSTEM.registerPostHook(
    "memory-response-processor",
    function (response) {
      globalThis.MEMORY_SYSTEM.processAfterResponse(response);
      return response;
    },
    100
  );
} else {
  console.warn("⚠️ Memory system not available for hook registration");
}

// Load and register banner hook
try {
  console.log("Loading banner hook system...");
  const path = require("path");
  const fs = require("fs");
  const bannerHookPath = path.resolve(
    process.cwd(),
    ".cursor/communication/banner-hook.js"
  );

  if (fs.existsSync(bannerHookPath)) {
    require(bannerHookPath);
    console.log("✅ Banner hook system loaded successfully");
  } else {
    console.warn("⚠️ Banner hook file not found:", bannerHookPath);

    // Ensure banners exist even if hook file is missing
    if (
      !globalThis.nextResponsePrepend ||
      globalThis.nextResponsePrepend.length === 0
    ) {
      console.log("Adding minimal banners as fallback...");
      globalThis.nextResponsePrepend = [
        "🤖 [MULTI-AGENT SYSTEM: ACTIVE]",
        "🧠 [MEMORY SYSTEM: ACTIVE]",
        "👑 [AGENT: EXECUTIVE ARCHITECT]",
      ];
    }
  }
} catch (error) {
  console.error("❌ Error loading banner hook:", error.message);

  // Ensure banners exist even if hook fails
  if (
    !globalThis.nextResponsePrepend ||
    globalThis.nextResponsePrepend.length === 0
  ) {
    console.log("Adding emergency banners after hook failure...");
    globalThis.nextResponsePrepend = ["🚨 [EMERGENCY: SYSTEMS ACTIVE]"];
  }
}

// Try to get the last query from memory and run pre-hooks
try {
  if (globalThis.MEMORY_SYSTEM) {
    const recentConversations =
      globalThis.MEMORY_SYSTEM.getRecentConversations(1);
    if (recentConversations && recentConversations.length > 0) {
      const lastConvo = recentConversations[recentConversations.length - 1];
      if (lastConvo.role === "user") {
        console.log(
          "Auto-running pre-hooks with last user query:",
          lastConvo.content
        );
        globalThis.HOOK_SYSTEM.runPreHooks(lastConvo.content);
      }
    }
  }
} catch (error) {
  console.error("❌ Error auto-running pre-hooks:", error.message);
}

// Export the hook system
module.exports = globalThis.HOOK_SYSTEM;

console.log("✅ Pre-Response Hook System initialization completed");
