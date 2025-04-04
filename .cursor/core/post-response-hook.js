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

  try {
    // Get the last user query from memory system
    let userMessage = "Unknown user message";
    if (
      globalThis.MEMORY_SYSTEM &&
      typeof globalThis.MEMORY_SYSTEM.getContext === "function"
    ) {
      userMessage =
        globalThis.MEMORY_SYSTEM.getContext("lastQuery") || userMessage;
    }

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
            "assistant",
            JSON.stringify({
              userMessage: userMessage,
              assistantResponse: response,
              conversationId: null,
            }),
            Date.now(),
            1,
            JSON.stringify({ role: "assistant" })
          );

          console.log(
            `✅ Response stored directly in database, ID: ${result.lastInsertRowid}`
          );

          // Also store in short-term memory
          const stmtContext = db.prepare(`
            INSERT INTO short_term_memory (key, value, timestamp) 
            VALUES (?, ?, ?)
          `);

          stmtContext.run("lastResponse", response, Date.now());

          db.close();
          return true;
        } else {
          console.log(
            `Database file not found at ${dbPath}, using memory system instead`
          );
        }
      } catch (dbError) {
        console.error(`Error accessing database directly: ${dbError.message}`);
      }
    }

    // Fallback to using memory system APIs
    if (globalThis.MEMORY_SYSTEM) {
      if (typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function") {
        console.log(
          "Storing response in memory system using processAfterResponse..."
        );
        return globalThis.MEMORY_SYSTEM.processAfterResponse(response);
      } else {
        console.log(
          "Adding response to conversations using storeConversation..."
        );
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
  } catch (error) {
    console.error(`❌ Error processing response: ${error.message}`);
    console.error(error.stack);
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
