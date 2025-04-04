/**
 * MEMORY HOOKS ENFORCER
 *
 * This file ensures memory hooks always execute for every query and response,
 * even if the normal hook system fails.
 *
 * It provides direct hooks for the Claude API to store context and conversation data.
 */

console.log("⚙️ INITIALIZING MEMORY HOOKS ENFORCER...");

// Import required modules
const fs = require("fs");
const path = require("path");
let Database;

// Try to load better-sqlite3
try {
  Database = require("better-sqlite3");
} catch (e) {
  console.log("better-sqlite3 not available, will use alternate methods");
  Database = null;
}

// Initialize database
let db = null;
const dbPath = path.resolve(process.cwd(), ".cursor/db/memory-system.db");

// Check if database exists
if (Database && fs.existsSync(dbPath)) {
  try {
    db = new Database(dbPath);
    console.log(`✅ Connected to memory database at ${dbPath}`);
  } catch (error) {
    console.error(`❌ Error connecting to database: ${error.message}`);
  }
}

// Create essential tables if they don't exist
if (db) {
  try {
    // Create episodic_memory table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS episodic_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        importance INTEGER DEFAULT 1,
        related_ids TEXT,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_em_timestamp ON episodic_memory(timestamp);
      CREATE INDEX IF NOT EXISTS idx_em_conversation ON episodic_memory(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_em_type ON episodic_memory(type);
    `);

    // Create short_term_memory table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS short_term_memory (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        expiry_time INTEGER,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_stm_timestamp ON short_term_memory(timestamp);
    `);

    console.log("✅ Memory tables verified/created");
  } catch (error) {
    console.error(`❌ Error creating memory tables: ${error.message}`);
  }
}

// Functions for direct database access
const directMemoryStore = {
  storeUserQuery: function (query) {
    if (!db) return false;

    try {
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
        `✅ Direct DB: User query stored, ID: ${result.lastInsertRowid}`
      );

      // Also store in short_term_memory
      const stmtContext = db.prepare(`
        INSERT OR REPLACE INTO short_term_memory (key, value, timestamp) 
        VALUES (?, ?, ?)
      `);

      stmtContext.run("lastQuery", query, Date.now());
      return true;
    } catch (error) {
      console.error(`❌ Error storing user query: ${error.message}`);
      return false;
    }
  },

  storeAssistantResponse: function (response, userQuery = null) {
    if (!db) return false;

    try {
      // Get the last user query if not provided
      if (!userQuery) {
        try {
          const stmtGetQuery = db.prepare(`
            SELECT value FROM short_term_memory 
            WHERE key = 'lastQuery' 
            ORDER BY timestamp DESC LIMIT 1
          `);

          const result = stmtGetQuery.get();
          if (result) {
            userQuery = result.value;
          }
        } catch (e) {
          console.error(`Error getting last query: ${e.message}`);
          userQuery = "Unknown user message";
        }
      }

      // Store in episodic_memory
      const stmt = db.prepare(`
        INSERT INTO episodic_memory (conversation_id, type, content, timestamp, importance, metadata) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        null,
        "assistant",
        JSON.stringify({
          userMessage: userQuery,
          assistantResponse: response,
          conversationId: null,
        }),
        Date.now(),
        1,
        JSON.stringify({ role: "assistant" })
      );

      console.log(
        `✅ Direct DB: Assistant response stored, ID: ${result.lastInsertRowid}`
      );

      // Also store in short_term_memory
      const stmtContext = db.prepare(`
        INSERT OR REPLACE INTO short_term_memory (key, value, timestamp) 
        VALUES (?, ?, ?)
      `);

      stmtContext.run("lastResponse", response, Date.now());

      // Update conversation count
      try {
        const stmtGetCount = db.prepare(`
          SELECT value FROM short_term_memory 
          WHERE key = 'conversationCount' 
          ORDER BY timestamp DESC LIMIT 1
        `);

        const countResult = stmtGetCount.get();
        let count = 1;
        if (countResult) {
          try {
            count = parseInt(countResult.value) + 1;
          } catch (e) {
            count = 1;
          }
        }

        stmtContext.run("conversationCount", count.toString(), Date.now());
      } catch (e) {
        console.error(`Error updating conversation count: ${e.message}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error storing assistant response: ${error.message}`);
      return false;
    }
  },
};

// Wrap hook system to enforce memory operations
function wrapHookSystem() {
  // Check if we already have a hook system
  if (globalThis.HOOK_SYSTEM && globalThis.HOOK_SYSTEM.runPreHooks) {
    console.log("Enhancing existing hook system with memory enforcer...");

    // Save original functions
    const originalRunPreHooks = globalThis.HOOK_SYSTEM.runPreHooks;
    const originalRunPostHooks = globalThis.HOOK_SYSTEM.runPostHooks;

    // Override pre-hooks
    globalThis.HOOK_SYSTEM.runPreHooks = function (input) {
      // Always store the query directly
      directMemoryStore.storeUserQuery(input);

      // Then run original hooks
      return originalRunPreHooks.call(this, input);
    };

    // Override post-hooks
    globalThis.HOOK_SYSTEM.runPostHooks = function (input) {
      // Always store the response directly
      directMemoryStore.storeAssistantResponse(input);

      // Then run original hooks
      return originalRunPostHooks.call(this, input);
    };

    console.log("✅ Hook system enhanced with memory enforcer");
  } else {
    console.log("Creating minimal hook system with memory enforcer...");

    // Create minimal hook system
    globalThis.HOOK_SYSTEM = {
      preHooks: [],
      postHooks: [],

      registerPreHook: function (name, fn, priority = 100) {
        this.preHooks.push({ name, fn, priority });
        this.preHooks.sort((a, b) => b.priority - a.priority);
        console.log(`Registered pre-hook: ${name}`);
        return true;
      },

      registerPostHook: function (name, fn, priority = 100) {
        this.postHooks.push({ name, fn, priority });
        this.postHooks.sort((a, b) => b.priority - a.priority);
        console.log(`Registered post-hook: ${name}`);
        return true;
      },

      runPreHooks: function (input) {
        // Always store the query directly
        directMemoryStore.storeUserQuery(input);

        // Then run hooks
        let result = input;
        for (const hook of this.preHooks) {
          try {
            console.log(`Running pre-hook: ${hook.name}`);
            const hookResult = hook.fn(result);
            if (hookResult) result = hookResult;
          } catch (error) {
            console.error(`Error in pre-hook ${hook.name}: ${error.message}`);
          }
        }
        return result;
      },

      runPostHooks: function (input) {
        // Always store the response directly
        directMemoryStore.storeAssistantResponse(input);

        // Then run hooks
        let result = input;
        for (const hook of this.postHooks) {
          try {
            console.log(`Running post-hook: ${hook.name}`);
            const hookResult = hook.fn(result);
            if (hookResult) result = hookResult;
          } catch (error) {
            console.error(`Error in post-hook ${hook.name}: ${error.message}`);
          }
        }
        return result;
      },
    };

    console.log("✅ Minimal hook system created with memory enforcer");
  }
}

// Create global memory system if it doesn't exist
if (!globalThis.MEMORY_SYSTEM) {
  console.log("Creating memory system...");

  globalThis.MEMORY_SYSTEM = {
    initialized: true,
    version: "1.0-enforcer",

    storeContext: function (key, value) {
      if (db) {
        try {
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO short_term_memory (key, value, timestamp) 
            VALUES (?, ?, ?)
          `);

          const valueStr =
            typeof value === "object" ? JSON.stringify(value) : String(value);
          stmt.run(key, valueStr, Date.now());
          return true;
        } catch (error) {
          console.error(`Error storing context: ${error.message}`);
        }
      }

      // Fallback to in-memory storage
      if (!this.shortTerm) this.shortTerm = {};
      this.shortTerm[key] = value;
      return true;
    },

    getContext: function (key) {
      if (db) {
        try {
          const stmt = db.prepare(`
            SELECT value FROM short_term_memory 
            WHERE key = ? 
            ORDER BY timestamp DESC LIMIT 1
          `);

          const result = stmt.get(key);
          if (result) {
            try {
              return JSON.parse(result.value);
            } catch (e) {
              return result.value;
            }
          }
        } catch (error) {
          console.error(`Error getting context: ${error.message}`);
        }
      }

      // Fallback to in-memory storage
      if (!this.shortTerm) return null;
      return this.shortTerm[key];
    },

    storeConversation: function (conversation) {
      if (db) {
        try {
          const stmt = db.prepare(`
            INSERT INTO episodic_memory (conversation_id, type, content, timestamp, importance, metadata) 
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          const contentStr =
            typeof conversation.content === "object"
              ? JSON.stringify(conversation.content)
              : String(conversation.content);

          stmt.run(
            null,
            conversation.role,
            contentStr,
            conversation.timestamp || Date.now(),
            1,
            JSON.stringify({ role: conversation.role })
          );
          return true;
        } catch (error) {
          console.error(`Error storing conversation: ${error.message}`);
        }
      }

      // Fallback to in-memory storage
      if (!this.episodic) this.episodic = [];
      this.episodic.push(conversation);
      return true;
    },

    getRecentConversations: function (limit = 10) {
      if (db) {
        try {
          const stmt = db.prepare(`
            SELECT id, conversation_id, type, content, timestamp, importance, metadata
            FROM episodic_memory
            ORDER BY timestamp DESC
            LIMIT ?
          `);

          const results = stmt.all(limit);
          return results.map((row) => {
            try {
              if (row.type === "assistant") {
                const parsed = JSON.parse(row.content);
                return {
                  id: row.id,
                  role: row.type,
                  content: parsed.assistantResponse,
                  timestamp: row.timestamp,
                };
              } else {
                return {
                  id: row.id,
                  role: row.type,
                  content: row.content,
                  timestamp: row.timestamp,
                };
              }
            } catch (e) {
              return {
                id: row.id,
                role: row.type,
                content: row.content,
                timestamp: row.timestamp,
              };
            }
          });
        } catch (error) {
          console.error(`Error getting recent conversations: ${error.message}`);
        }
      }

      // Fallback to in-memory storage
      if (!this.episodic) return [];
      return this.episodic.slice(-limit);
    },
  };

  console.log("✅ Memory system created");
}

// Process the current user query as a test
try {
  const userQuery = "Testing memory hooks enforcer";
  directMemoryStore.storeUserQuery(userQuery);
  console.log("Stored test user query");

  const assistantResponse =
    "This is a test response from the memory hooks enforcer";
  directMemoryStore.storeAssistantResponse(assistantResponse, userQuery);
  console.log("Stored test assistant response");
} catch (error) {
  console.error(`Error running test: ${error.message}`);
}

// Initialize banner if needed
if (!globalThis.nextResponsePrepend) {
  globalThis.nextResponsePrepend = [];
}

// Add memory system banner if not present
let hasMemoryBanner = false;
for (const banner of globalThis.nextResponsePrepend) {
  if (banner.includes("MEMORY SYSTEM")) {
    hasMemoryBanner = true;
    break;
  }
}

if (!hasMemoryBanner) {
  globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
}

// Wrap hook system
wrapHookSystem();

// Close database when process exits
process.on("exit", () => {
  if (db) {
    try {
      db.close();
      console.log("Memory database closed");
    } catch (error) {
      console.error(`Error closing database: ${error.message}`);
    }
  }
});

// Export memory store and hook system
module.exports = {
  directMemoryStore,
  HOOK_SYSTEM: globalThis.HOOK_SYSTEM,
  MEMORY_SYSTEM: globalThis.MEMORY_SYSTEM,
};

console.log("✅ MEMORY HOOKS ENFORCER INITIALIZED");

// Test memory retrieval
if (db) {
  try {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM episodic_memory
    `);

    const result = stmt.get();
    console.log(`Current episodic memory entries: ${result.count}`);
  } catch (error) {
    console.error(`Error counting memory entries: ${error.message}`);
  }
}
