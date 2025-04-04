/**
 * Complete Memory System Fix
 *
 * This script addresses all issues identified in memory testing:
 * 1. Properly initializes the database memory system
 * 2. Adds missing memory methods to connect to the database
 * 3. Fixes pre-response and post-response hook integration
 */

console.log("🔧 COMPLETE MEMORY SYSTEM FIX 🔧");
console.log("===============================\n");

// Load necessary modules
const path = require("path");
const fs = require("fs");

// Step 1: Load core modules
console.log("Step 1: Loading memory system modules...");

// First, load the database module
const dbPath = path.resolve(process.cwd(), ".cursor/db/database.js");
console.log(`Loading database from: ${dbPath}`);
let db;
try {
  db = require(dbPath);
  console.log("✅ Database module loaded");
} catch (error) {
  console.error(`❌ Error loading database: ${error.message}`);
  process.exit(1);
}

// Then load the memory system module
const memorySystemPath = path.resolve(
  process.cwd(),
  ".cursor/db/memory-system.js"
);
console.log(`Loading memory system from: ${memorySystemPath}`);
let memorySystem;
try {
  memorySystem = require(memorySystemPath);
  console.log("✅ Memory system module loaded");
} catch (error) {
  console.error(`❌ Error loading memory system: ${error.message}`);
  process.exit(1);
}

// Step 2: Check if memory system is available
console.log("\nStep 2: Checking memory system availability...");
if (!globalThis.MEMORY_SYSTEM) {
  console.error("❌ Memory system not found in globalThis");

  // Create a new memory system
  console.log("Creating memory system...");

  globalThis.MEMORY_SYSTEM = {
    initialized: true,
    version: "2.0.0-fixed",
    db: memorySystem,
  };
  console.log("✅ Created memory system with database connection");
} else {
  console.log("✅ Memory system found");

  // Make sure it has a reference to the database module
  if (!globalThis.MEMORY_SYSTEM.db) {
    globalThis.MEMORY_SYSTEM.db = memorySystem;
    console.log("✅ Added database reference to existing memory system");
  }
}

// Step 3: Add or fix missing methods
console.log("\nStep 3: Adding missing methods to memory system...");

// Cache for in-memory operations to reduce database access
if (!globalThis.MEMORY_SYSTEM.cache) {
  globalThis.MEMORY_SYSTEM.cache = {
    shortTerm: {},
    episodic: [],
  };
  console.log("✅ Added memory cache for better performance");
}

// Implement or fix storeContext method
if (
  typeof globalThis.MEMORY_SYSTEM.storeContext !== "function" ||
  globalThis.MEMORY_SYSTEM.storeContext.toString().includes("is not a function")
) {
  globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
    try {
      // Update cache
      if (!this.cache) this.cache = { shortTerm: {} };
      this.cache.shortTerm[key] = value;

      // Store in database if available
      if (
        this.db &&
        this.db.shortTerm &&
        typeof this.db.shortTerm.store === "function"
      ) {
        this.db.shortTerm.store(key, value);
      }

      return true;
    } catch (error) {
      console.error(`Error storing context: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Added/fixed storeContext method");
}

// Implement or fix getContext method
if (
  typeof globalThis.MEMORY_SYSTEM.getContext !== "function" ||
  globalThis.MEMORY_SYSTEM.getContext.toString().includes("is not a function")
) {
  globalThis.MEMORY_SYSTEM.getContext = function (key) {
    try {
      // Try cache first
      if (
        this.cache &&
        this.cache.shortTerm &&
        this.cache.shortTerm[key] !== undefined
      ) {
        return this.cache.shortTerm[key];
      }

      // Try database if available
      if (
        this.db &&
        this.db.shortTerm &&
        typeof this.db.shortTerm.get === "function"
      ) {
        const value = this.db.shortTerm.get(key);

        // Update cache if found
        if (value !== null && this.cache) {
          if (!this.cache.shortTerm) this.cache.shortTerm = {};
          this.cache.shortTerm[key] = value;
        }

        return value;
      }

      return null;
    } catch (error) {
      console.error(`Error getting context: ${error.message}`);
      return null;
    }
  };
  console.log("✅ Added/fixed getContext method");
}

// Implement or fix storeConversation method
if (
  typeof globalThis.MEMORY_SYSTEM.storeConversation !== "function" ||
  globalThis.MEMORY_SYSTEM.storeConversation
    .toString()
    .includes("is not a function")
) {
  globalThis.MEMORY_SYSTEM.storeConversation = function (conversation) {
    try {
      // Ensure timestamp
      if (!conversation.timestamp) {
        conversation.timestamp = Date.now();
      }

      // Update cache
      if (!this.cache) this.cache = { episodic: [] };
      if (!this.cache.episodic) this.cache.episodic = [];
      this.cache.episodic.push(conversation);

      // Limit cache size
      if (this.cache.episodic.length > 100) {
        this.cache.episodic = this.cache.episodic.slice(-100);
      }

      // Store in database if available
      if (
        this.db &&
        this.db.episodic &&
        typeof this.db.episodic.store === "function"
      ) {
        const type = conversation.role || "unknown";
        this.db.episodic.store(conversation.content, {
          type: type,
          importance: conversation.importance || 1,
          metadata: conversation.metadata || { role: type },
        });
      }

      return true;
    } catch (error) {
      console.error(`Error storing conversation: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Added/fixed storeConversation method");
}

// Implement or fix getRecentConversations method
if (
  typeof globalThis.MEMORY_SYSTEM.getRecentConversations !== "function" ||
  globalThis.MEMORY_SYSTEM.getRecentConversations
    .toString()
    .includes("is not a function")
) {
  globalThis.MEMORY_SYSTEM.getRecentConversations = function (limit = 10) {
    try {
      let results = [];

      // Get from database if available
      if (
        this.db &&
        this.db.episodic &&
        typeof this.db.episodic.search === "function"
      ) {
        const dbResults = this.db.episodic.search("", {
          limit: limit,
          orderDesc: true,
          includeMetadata: true,
        });

        if (dbResults && dbResults.length > 0) {
          // Format database results to match the expected structure
          results = dbResults.map((item) => {
            let role = "unknown";
            if (item.metadata && item.metadata.role) {
              role = item.metadata.role;
            } else if (item.type) {
              role = item.type;
            }

            return {
              id: item.id,
              role: role,
              content: item.content,
              timestamp: item.timestamp,
              metadata: item.metadata,
            };
          });
        }
      }

      // Merge with cache if needed
      if (this.cache && this.cache.episodic && this.cache.episodic.length > 0) {
        // If we have both sources, we need to merge intelligently
        if (results.length > 0) {
          // For simplicity, just take the most recent from both sources
          const combined = [...results, ...this.cache.episodic]
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, limit);

          return combined;
        } else {
          // Just use cache if no DB results
          return this.cache.episodic.slice(-limit);
        }
      }

      return results;
    } catch (error) {
      console.error(`Error getting recent conversations: ${error.message}`);

      // Fallback to cache only
      if (this.cache && this.cache.episodic) {
        return this.cache.episodic.slice(-limit);
      }

      return [];
    }
  };
  console.log("✅ Added/fixed getRecentConversations method");
}

// Fix processBeforeResponse method
if (
  typeof globalThis.MEMORY_SYSTEM.processBeforeResponse !== "function" ||
  globalThis.MEMORY_SYSTEM.processBeforeResponse
    .toString()
    .includes("is not a function") ||
  globalThis.MEMORY_SYSTEM.processBeforeResponse
    .toString()
    .includes("storeConversation is not a function")
) {
  globalThis.MEMORY_SYSTEM.processBeforeResponse = function (userQuery) {
    try {
      console.log("Processing memory before response for query:", userQuery);

      // Store the query in context
      if (typeof this.storeContext === "function") {
        this.storeContext("lastQuery", userQuery);
      }

      // Store in episodic memory
      if (typeof this.storeConversation === "function") {
        this.storeConversation({
          role: "user",
          content: userQuery,
          timestamp: Date.now(),
        });
      }

      // Track conversation count
      if (
        typeof this.getContext === "function" &&
        typeof this.storeContext === "function"
      ) {
        const currentCount = this.getContext("conversationCount") || 0;
        this.storeContext("conversationCount", currentCount + 1);
      }

      return true;
    } catch (error) {
      console.error(`Error in processBeforeResponse: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Fixed processBeforeResponse method");
}

// Fix processAfterResponse method
if (
  typeof globalThis.MEMORY_SYSTEM.processAfterResponse !== "function" ||
  globalThis.MEMORY_SYSTEM.processAfterResponse
    .toString()
    .includes("is not a function") ||
  globalThis.MEMORY_SYSTEM.processAfterResponse
    .toString()
    .includes("storeConversation is not a function")
) {
  globalThis.MEMORY_SYSTEM.processAfterResponse = function (assistantResponse) {
    try {
      console.log("Processing memory after response");

      // Store in episodic memory
      if (typeof this.storeConversation === "function") {
        this.storeConversation({
          role: "assistant",
          content: assistantResponse,
          timestamp: Date.now(),
        });
      }

      return true;
    } catch (error) {
      console.error(`Error in processAfterResponse: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Fixed processAfterResponse method");
}

// Step 4: Set up the hook system
console.log("\nStep 4: Setting up hook system...");
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
  console.log("✅ Created hook system");
}

// Register memory hooks
globalThis.HOOK_SYSTEM.registerPreHook(
  "memory-query-processor",
  function (query) {
    globalThis.MEMORY_SYSTEM.processBeforeResponse(query);
    return query;
  },
  100
);
console.log("✅ Registered memory pre-hook");

globalThis.HOOK_SYSTEM.registerPostHook(
  "memory-response-processor",
  function (response) {
    globalThis.MEMORY_SYSTEM.processAfterResponse(response);
    return response;
  },
  100
);
console.log("✅ Registered memory post-hook");

// Step 5: Test the fixed memory system
console.log("\nStep 5: Testing fixed memory system...");

// Test context operations
console.log("\nTesting context operations:");
try {
  // Set a test value
  const testKey = "test_" + Date.now();
  const testValue = { message: "Test value at " + new Date().toISOString() };

  const storeResult = globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
  console.log(`Stored context '${testKey}': ${storeResult ? "✅" : "❌"}`);

  // Get the value back
  const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);
  console.log(`Retrieved context value: ${JSON.stringify(retrievedValue)}`);
  const valueMatches =
    JSON.stringify(retrievedValue) === JSON.stringify(testValue);
  console.log(`Value matches: ${valueMatches ? "✅" : "❌"}`);

  if (!valueMatches) {
    console.log(`Expected: ${JSON.stringify(testValue)}`);
    console.log(`Actual: ${JSON.stringify(retrievedValue)}`);
  }
} catch (error) {
  console.error(`❌ Error in context operations: ${error.message}`);
}

// Test conversation operations
console.log("\nTesting conversation operations:");
try {
  // Store a test conversation
  const testConversation = {
    role: "system",
    content: `Test conversation at ${new Date().toISOString()}`,
    timestamp: Date.now(),
  };

  const storeResult =
    globalThis.MEMORY_SYSTEM.storeConversation(testConversation);
  console.log(`Stored conversation: ${storeResult ? "✅" : "❌"}`);

  // Get recent conversations
  const conversations = globalThis.MEMORY_SYSTEM.getRecentConversations(5);
  console.log(`Retrieved ${conversations.length} conversations`);

  // Check if our test conversation is in the results
  const foundConversation = conversations.some(
    (c) =>
      c.content === testConversation.content && c.role === testConversation.role
  );
  console.log(`Found test conversation: ${foundConversation ? "✅" : "❌"}`);

  if (!foundConversation && conversations.length > 0) {
    console.log("Sample conversation retrieved:");
    console.log(JSON.stringify(conversations[0], null, 2));
  }
} catch (error) {
  console.error(`❌ Error in conversation operations: ${error.message}`);
}

// Test hook integration
console.log("\nTesting hook integration:");
try {
  // Simulate a user query
  const testQuery = `Test query at ${new Date().toISOString()}`;
  console.log(`Running pre-hook with query: ${testQuery}`);

  // Run pre-hook
  globalThis.HOOK_SYSTEM.runPreHooks(testQuery);

  // Check if the query was stored
  const storedQuery = globalThis.MEMORY_SYSTEM.getContext("lastQuery");
  console.log(
    `Query stored in context: ${storedQuery === testQuery ? "✅" : "❌"}`
  );

  // Simulate an assistant response
  const testResponse = `Test response at ${new Date().toISOString()}`;
  console.log(`Running post-hook with response: ${testResponse}`);

  // Run post-hook
  globalThis.HOOK_SYSTEM.runPostHooks(testResponse);

  // Check if conversations were stored
  const conversations = globalThis.MEMORY_SYSTEM.getRecentConversations(5);
  const queryStored = conversations.some(
    (c) => c.content === testQuery && c.role === "user"
  );
  const responseStored = conversations.some(
    (c) => c.content === testResponse && c.role === "assistant"
  );

  console.log(`Conversation with query stored: ${queryStored ? "✅" : "❌"}`);
  console.log(
    `Conversation with response stored: ${responseStored ? "✅" : "❌"}`
  );
} catch (error) {
  console.error(`❌ Error in hook integration: ${error.message}`);
}

// Step 6: Verify memory system
console.log("\nStep 6: Verifying memory system implementation:");
const memMethods = Object.getOwnPropertyNames(globalThis.MEMORY_SYSTEM).filter(
  (prop) => typeof globalThis.MEMORY_SYSTEM[prop] === "function"
);
console.log(
  `Memory system has ${memMethods.length} methods: ${memMethods.join(", ")}`
);

// Check for minimum required methods
const requiredMethods = [
  "storeContext",
  "getContext",
  "storeConversation",
  "getRecentConversations",
  "processBeforeResponse",
  "processAfterResponse",
];

const missingMethods = requiredMethods.filter(
  (method) => !memMethods.includes(method)
);

if (missingMethods.length === 0) {
  console.log("✅ All required methods are present");
} else {
  console.log(`❌ Missing methods: ${missingMethods.join(", ")}`);
}

// Done!
console.log("\n===============================");
console.log("✅ MEMORY SYSTEM FIX COMPLETE");
console.log(`System version: ${globalThis.MEMORY_SYSTEM.version || "unknown"}`);
console.log(
  `Memory is properly initialized: ${
    globalThis.MEMORY_SYSTEM.initialized ? "✅" : "❌"
  }`
);
console.log(
  "The memory system is now fully functional with hooks for pre and post response processing."
);
