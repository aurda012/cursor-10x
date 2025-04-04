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

// Define memory preprocessing function
function processUserQuery(query) {
  console.log("Processing user query:", query);

  try {
    // Try to access SQLite database directly for more reliable storage
    const fs = require("fs");
    const path = require("path");
    let Database;

    try {
      Database = require("better-sqlite3");
    } catch (e) {
      console.log(
        "better-sqlite3 not available, falling back to standard options"
      );
      Database = null;
    }

    // If we have direct DB access, use it
    if (Database) {
      try {
        const dbPath = path.resolve(
          process.cwd(),
          ".cursor/db/memory-system.db"
        );

        // Check if DB exists
        if (fs.existsSync(dbPath)) {
          console.log(`Direct DB access: connecting to ${dbPath}`);
          const db = new Database(dbPath);

          // Store in episodic_memory
          const stmt = db.prepare(`
            INSERT INTO episodic_memory (conversation_id, type, content, timestamp, importance, metadata) 
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          const result = stmt.run(
            null,
            "user",
            query,
            Date.now(),
            1,
            JSON.stringify({ role: "user" })
          );

          console.log(
            `✅ User query stored directly in database, ID: ${result.lastInsertRowid}`
          );

          // Also store in short-term memory
          const stmtContext = db.prepare(`
            INSERT INTO short_term_memory (key, value, timestamp) 
            VALUES (?, ?, ?)
          `);

          stmtContext.run("lastQuery", query, Date.now());

          db.close();
          return true;
        } else {
          console.log(
            `Database file not found at ${dbPath}, using memory system instead`
          );
        }
      } catch (dbError) {
        console.error(`Error accessing database directly: ${dbError.message}`);
        console.error(dbError.stack);
      }
    }

    // Fallback to memory system API
    if (globalThis.MEMORY_SYSTEM) {
      // Store the query in memory
      if (typeof globalThis.MEMORY_SYSTEM.storeContext === "function") {
        globalThis.MEMORY_SYSTEM.storeContext("lastQuery", query);
      }

      // Store the query in episodic memory
      if (typeof globalThis.MEMORY_SYSTEM.storeConversation === "function") {
        globalThis.MEMORY_SYSTEM.storeConversation({
          role: "user",
          content: query,
          timestamp: Date.now(),
        });
      }

      // Retrieve recent conversations
      let recentConversations = [];
      if (
        typeof globalThis.MEMORY_SYSTEM.getRecentConversations === "function"
      ) {
        recentConversations =
          globalThis.MEMORY_SYSTEM.getRecentConversations(10);

        // Store them for easy access
        if (typeof globalThis.MEMORY_SYSTEM.storeContext === "function") {
          globalThis.MEMORY_SYSTEM.storeContext(
            "recentConversations",
            recentConversations
          );
        }
      }

      console.log(
        `✅ Memory pre-processing completed. Retrieved ${recentConversations.length} recent conversations.`
      );
    } else {
      console.warn("⚠️ Memory system not available for query processing");
    }
  } catch (error) {
    console.error(`❌ Error processing user query: ${error.message}`);
    console.error(error.stack);
  }

  return query;
}

// Register memory hooks
if (globalThis.MEMORY_SYSTEM) {
  // Add memory operations to MEMORY_SYSTEM if not present
  if (!globalThis.MEMORY_SYSTEM.processBeforeResponse) {
    globalThis.MEMORY_SYSTEM.processBeforeResponse = function (query) {
      return processUserQuery(query);
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
    processUserQuery,
    100
  );

  globalThis.HOOK_SYSTEM.registerPostHook(
    "memory-response-processor",
    function (response) {
      if (typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function") {
        globalThis.MEMORY_SYSTEM.processAfterResponse(response);
      }
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

// Create a function to directly process a user query and force run hooks
globalThis.forceProcessUserQuery = function (query) {
  console.log("Force processing user query:", query);
  return processUserQuery(query);
};

// Try to process this user query as a test
try {
  console.log("Processing current user query as a test...");
  processUserQuery(
    "It's supposed to be retreiving/querying the database at the beginning of every interaction"
  );
} catch (error) {
  console.error("❌ Error in test query processing:", error.message);
}

// Export the hook system
module.exports = globalThis.HOOK_SYSTEM;

console.log("✅ Pre-Response Hook System initialization completed");
