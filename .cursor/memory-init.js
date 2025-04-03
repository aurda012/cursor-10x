/**
 * Memory System Initializer
 *
 * This file ensures the memory system is properly initialized at the start of each conversation.
 * It loads the memory fix which implements proper conversation storage and retrieval.
 */

(function () {
  console.log("🧠 Initializing Memory System...");

  try {
    // Load the memory fix
    const path = require("path");
    const fs = require("fs");

    const basePath = process.cwd();
    const memoryFixPath = path.join(basePath, ".cursor/memory-fix.js");

    if (fs.existsSync(memoryFixPath)) {
      console.log(`Loading memory fix from: ${memoryFixPath}`);

      // Clear require cache to ensure we get the latest version
      if (require.cache[memoryFixPath]) {
        delete require.cache[memoryFixPath];
      }

      // Load the memory fix
      const memoryFix = require(memoryFixPath);
      console.log(`Memory fix loaded: ${memoryFix.status}`);

      // Verify the memory system is working
      const convCount = memoryFix.conversations?.length || 0;
      console.log(`Loaded ${convCount} conversations from memory`);
    } else {
      console.error(`Memory fix not found at: ${memoryFixPath}`);

      // Create a basic memory system as fallback
      if (!globalThis.MEMORY_SYSTEM) {
        console.log("Creating fallback memory system...");

        globalThis.MEMORY_SYSTEM = {
          initialized: true,
          shortTerm: {},
          episodic: [],

          storeContext: function (key, value) {
            this.shortTerm[key] = value;
            return true;
          },

          getContext: function (key) {
            return this.shortTerm[key];
          },

          storeConversation: function (conversation) {
            if (!this.episodic) this.episodic = [];
            this.episodic.push(conversation);
            return true;
          },

          getRecentConversations: function (limit = 10) {
            if (!this.episodic) return [];
            return this.episodic.slice(-limit);
          },
        };
      }

      // Add a warning banner
      if (!globalThis.nextResponsePrepend) {
        globalThis.nextResponsePrepend = [];
      }

      globalThis.nextResponsePrepend.push("⚠️ [MEMORY SYSTEM: FALLBACK MODE]");
    }

    // Store this message in memory to make sure it's working
    if (
      globalThis.MEMORY_SYSTEM &&
      typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
    ) {
      globalThis.MEMORY_SYSTEM.storeConversation({
        role: "system",
        content: "Memory system initialization completed",
        timestamp: Date.now(),
      });
    }

    console.log("✅ Memory System initialization completed");
  } catch (error) {
    console.error(`❌ Error initializing memory system: ${error.message}`);

    // Add an error banner
    if (!globalThis.nextResponsePrepend) {
      globalThis.nextResponsePrepend = [];
    }

    globalThis.nextResponsePrepend.push("❌ [MEMORY SYSTEM: ERROR]");
  }
})();
