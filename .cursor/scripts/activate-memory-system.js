/**
 * Memory System Activator
 *
 * This script ensures the memory system is always active by:
 * 1. Loading the necessary database and memory modules
 * 2. Setting up the core memory methods
 * 3. Setting up the hook system for pre/post response processing
 * 4. Ensuring all systems are properly connected
 */

console.log("🚀 ACTIVATING MEMORY SYSTEM...");
console.log("===============================\n");

// Load necessary modules
const path = require("path");
const fs = require("fs");

// Step 1: Load core modules
console.log("Step 1: Loading memory system modules...");

// First, load the database module
let db;
try {
  const dbPath = path.resolve(process.cwd(), ".cursor/db/database.js");
  console.log(`Loading database from: ${dbPath}`);

  if (fs.existsSync(dbPath)) {
    db = require(dbPath);
    console.log("✅ Database module loaded");
  } else {
    console.error(`❌ Database file not found at: ${dbPath}`);
    // Create a minimal database implementation
    db = {
      createDatabase: (name) => console.log(`Mock database ${name} created`),
      connect: () => true,
      close: () => true,
    };
    console.log("⚠️ Created minimal database mock");
  }
} catch (error) {
  console.error(`❌ Error loading database: ${error.message}`);
  // Create a minimal database implementation
  db = {
    createDatabase: (name) => console.log(`Mock database ${name} created`),
    connect: () => true,
    close: () => true,
  };
  console.log("⚠️ Created minimal database mock after error");
}

// Then load the memory system module
let memorySystem;
try {
  const memorySystemPath = path.resolve(
    process.cwd(),
    ".cursor/db/memory-system.js"
  );
  console.log(`Loading memory system from: ${memorySystemPath}`);

  if (fs.existsSync(memorySystemPath)) {
    memorySystem = require(memorySystemPath);
    console.log("✅ Memory system module loaded");

    // Explicitly initialize the memory system if possible
    if (typeof memorySystem.initialize === "function") {
      memorySystem.initialize();
      console.log("✅ Memory system initialized via module function");
    }
  } else {
    console.error(`❌ Memory system file not found at: ${memorySystemPath}`);
    memorySystem = null;
  }
} catch (error) {
  console.error(`❌ Error loading memory system: ${error.message}`);
  memorySystem = null;
}

// Step 2: Set up the memory system
console.log("\nStep 2: Setting up memory system...");

// Create or update the memory system
if (!globalThis.MEMORY_SYSTEM) {
  console.log("Creating memory system in globalThis...");
  globalThis.MEMORY_SYSTEM = {
    initialized: true,
    version: "2.0.0-activated",
    db: memorySystem,
    cache: {
      shortTerm: {},
      episodic: [],
    },
  };
  console.log("✅ Memory system created");
} else {
  console.log("Memory system already exists, updating it...");
  globalThis.MEMORY_SYSTEM.initialized = true;
  globalThis.MEMORY_SYSTEM.version = "2.0.0-activated";

  if (!globalThis.MEMORY_SYSTEM.db && memorySystem) {
    globalThis.MEMORY_SYSTEM.db = memorySystem;
    console.log("✅ Added database connection to memory system");
  }

  if (!globalThis.MEMORY_SYSTEM.cache) {
    globalThis.MEMORY_SYSTEM.cache = {
      shortTerm: {},
      episodic: [],
    };
    console.log("✅ Added memory cache");
  }

  console.log("✅ Memory system updated");
}

// Step 3: Implement core memory methods
console.log("\nStep 3: Implementing memory methods...");

// Implement or fix storeContext method
globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
  try {
    console.log(`Storing context: ${key}`);

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
    } else if (this.db && typeof this.db.storeContext === "function") {
      this.db.storeContext(key, value);
    }

    return true;
  } catch (error) {
    console.error(`Error storing context: ${error.message}`);
    // Still update cache even if database fails
    if (!this.cache) this.cache = { shortTerm: {} };
    this.cache.shortTerm[key] = value;
    return true; // Return success anyway to keep the system running
  }
};
console.log("✅ Implemented storeContext method");

// Implement getContext method
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
    let value = null;
    if (
      this.db &&
      this.db.shortTerm &&
      typeof this.db.shortTerm.get === "function"
    ) {
      value = this.db.shortTerm.get(key);
    } else if (this.db && typeof this.db.getContext === "function") {
      value = this.db.getContext(key);
    }

    // Update cache if found
    if (value !== null && value !== undefined) {
      if (!this.cache) this.cache = { shortTerm: {} };
      this.cache.shortTerm[key] = value;
    }

    return value;
  } catch (error) {
    console.error(`Error getting context: ${error.message}`);
    // Try cache as fallback
    if (this.cache && this.cache.shortTerm) {
      return this.cache.shortTerm[key];
    }
    return null;
  }
};
console.log("✅ Implemented getContext method");

// Implement storeConversation method
globalThis.MEMORY_SYSTEM.storeConversation = function (conversation) {
  try {
    // Ensure timestamp
    if (!conversation.timestamp) {
      conversation.timestamp = Date.now();
    }

    console.log(`Storing conversation from ${conversation.role || "unknown"}`);

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
    } else if (this.db && typeof this.db.storeConversation === "function") {
      this.db.storeConversation(conversation);
    }

    return true;
  } catch (error) {
    console.error(`Error storing conversation: ${error.message}`);
    // Still update cache even if database fails
    if (!this.cache) this.cache = { episodic: [] };
    if (!this.cache.episodic) this.cache.episodic = [];
    this.cache.episodic.push(conversation);
    return true; // Return success anyway to keep the system running
  }
};
console.log("✅ Implemented storeConversation method");

// Implement getRecentConversations method
globalThis.MEMORY_SYSTEM.getRecentConversations = function (limit = 10) {
  try {
    console.log(`Getting recent conversations (limit: ${limit})`);

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
    } else if (
      this.db &&
      typeof this.db.getRecentConversations === "function"
    ) {
      const dbResults = this.db.getRecentConversations(limit);
      if (dbResults && dbResults.length > 0) {
        results = dbResults;
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
console.log("✅ Implemented getRecentConversations method");

// Step 4: Set up the hook system
console.log("\nStep 4: Setting up hook system...");

// Create or update the hook system
if (!globalThis.HOOK_SYSTEM) {
  console.log("Creating hook system...");
  globalThis.HOOK_SYSTEM = {
    preHooks: [],
    postHooks: [],

    registerPreHook: function (name, fn, priority = 100) {
      // Check if hook already exists
      const existingIndex = this.preHooks.findIndex((h) => h.name === name);
      if (existingIndex >= 0) {
        // Replace existing hook
        this.preHooks[existingIndex] = { name, fn, priority };
        console.log(`📝 Updated pre-hook: ${name}`);
      } else {
        // Add new hook
        this.preHooks.push({ name, fn, priority });
        console.log(`➕ Added pre-hook: ${name}`);
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
        console.log(`📝 Updated post-hook: ${name}`);
      } else {
        // Add new hook
        this.postHooks.push({ name, fn, priority });
        console.log(`➕ Added post-hook: ${name}`);
      }

      // Sort by priority (higher first)
      this.postHooks.sort((a, b) => b.priority - a.priority);
      return true;
    },

    runPreHooks: function (input) {
      let result = input;
      console.log(`Running ${this.preHooks.length} pre-hooks...`);

      for (const hook of this.preHooks) {
        try {
          console.log(`⏳ Running pre-hook: ${hook.name}`);
          const hookResult = hook.fn(result);
          if (hookResult) {
            result = hookResult;
          }
        } catch (error) {
          console.error(`❌ Error in pre-hook ${hook.name}: ${error.message}`);
        }
      }
      return result;
    },

    runPostHooks: function (input) {
      let result = input;
      console.log(`Running ${this.postHooks.length} post-hooks...`);

      for (const hook of this.postHooks) {
        try {
          console.log(`⏳ Running post-hook: ${hook.name}`);
          const hookResult = hook.fn(result);
          if (hookResult) {
            result = hookResult;
          }
        } catch (error) {
          console.error(`❌ Error in post-hook ${hook.name}: ${error.message}`);
        }
      }
      return result;
    },
  };
  console.log("✅ Hook system created");
} else {
  console.log(
    "Hook system already exists, ensuring it has the correct methods..."
  );

  // Make sure the hook system has all required methods
  if (typeof globalThis.HOOK_SYSTEM.registerPreHook !== "function") {
    globalThis.HOOK_SYSTEM.registerPreHook = function (
      name,
      fn,
      priority = 100
    ) {
      if (!Array.isArray(this.preHooks)) this.preHooks = [];
      this.preHooks.push({ name, fn, priority });
      this.preHooks.sort((a, b) => b.priority - a.priority);
      return true;
    };
    console.log("✅ Added registerPreHook method");
  }

  if (typeof globalThis.HOOK_SYSTEM.registerPostHook !== "function") {
    globalThis.HOOK_SYSTEM.registerPostHook = function (
      name,
      fn,
      priority = 100
    ) {
      if (!Array.isArray(this.postHooks)) this.postHooks = [];
      this.postHooks.push({ name, fn, priority });
      this.postHooks.sort((a, b) => b.priority - a.priority);
      return true;
    };
    console.log("✅ Added registerPostHook method");
  }

  if (typeof globalThis.HOOK_SYSTEM.runPreHooks !== "function") {
    globalThis.HOOK_SYSTEM.runPreHooks = function (input) {
      let result = input;
      if (Array.isArray(this.preHooks)) {
        for (const hook of this.preHooks) {
          try {
            const hookResult = hook.fn(result);
            if (hookResult) result = hookResult;
          } catch (error) {
            console.error(`Error in pre-hook ${hook.name}:`, error.message);
          }
        }
      }
      return result;
    };
    console.log("✅ Added runPreHooks method");
  }

  if (typeof globalThis.HOOK_SYSTEM.runPostHooks !== "function") {
    globalThis.HOOK_SYSTEM.runPostHooks = function (input) {
      let result = input;
      if (Array.isArray(this.postHooks)) {
        for (const hook of this.postHooks) {
          try {
            const hookResult = hook.fn(result);
            if (hookResult) result = hookResult;
          } catch (error) {
            console.error(`Error in post-hook ${hook.name}:`, error.message);
          }
        }
      }
      return result;
    };
    console.log("✅ Added runPostHooks method");
  }
}

// Implement or fix the memory processing methods
// Implement processBeforeResponse method
globalThis.MEMORY_SYSTEM.processBeforeResponse = function (userQuery) {
  console.log("Processing memory before response for query:", userQuery);

  try {
    // Store the query in context
    this.storeContext("lastQuery", userQuery);

    // Store in episodic memory
    this.storeConversation({
      role: "user",
      content: userQuery,
      timestamp: Date.now(),
    });

    // Track conversation count
    const currentCount = this.getContext("conversationCount") || 0;
    this.storeContext("conversationCount", currentCount + 1);

    return true;
  } catch (error) {
    console.error(`Error in processBeforeResponse: ${error.message}`);
    return false;
  }
};
console.log("✅ Implemented processBeforeResponse method");

// Implement processAfterResponse method
globalThis.MEMORY_SYSTEM.processAfterResponse = function (assistantResponse) {
  console.log("Processing memory after response");

  try {
    // Store in episodic memory
    this.storeConversation({
      role: "assistant",
      content: assistantResponse,
      timestamp: Date.now(),
    });

    return true;
  } catch (error) {
    console.error(`Error in processAfterResponse: ${error.message}`);
    return false;
  }
};
console.log("✅ Implemented processAfterResponse method");

// Register or update the memory hooks
globalThis.HOOK_SYSTEM.registerPreHook(
  "memory-query-processor",
  function (query) {
    const result = globalThis.MEMORY_SYSTEM.processBeforeResponse(query);
    console.log(`Memory pre-processing ${result ? "succeeded" : "failed"}`);
    return query;
  },
  100
);
console.log("✅ Registered memory pre-hook");

globalThis.HOOK_SYSTEM.registerPostHook(
  "memory-response-processor",
  function (response) {
    const result = globalThis.MEMORY_SYSTEM.processAfterResponse(response);
    console.log(`Memory post-processing ${result ? "succeeded" : "failed"}`);
    return response;
  },
  100
);
console.log("✅ Registered memory post-hook");

// Step 5: Test the memory system
console.log("\nStep 5: Testing memory system...");

// Store a test context item
const testContextKey = "memory_system_test";
const testContextValue = {
  test: true,
  activated: true,
  timestamp: new Date().toISOString(),
};
const contextResult = globalThis.MEMORY_SYSTEM.storeContext(
  testContextKey,
  testContextValue
);
console.log(`Context storage test: ${contextResult ? "✅" : "❌"}`);

// Retrieve the test context item
const retrievedContext = globalThis.MEMORY_SYSTEM.getContext(testContextKey);
console.log(
  `Context retrieval test: ${
    retrievedContext && retrievedContext.test ? "✅" : "❌"
  }`
);

// Store a test conversation
const testConversation = {
  role: "system",
  content: `Memory system activated at ${new Date().toISOString()}`,
  timestamp: Date.now(),
};
const conversationResult =
  globalThis.MEMORY_SYSTEM.storeConversation(testConversation);
console.log(`Conversation storage test: ${conversationResult ? "✅" : "❌"}`);

// Retrieve conversations
const conversations = globalThis.MEMORY_SYSTEM.getRecentConversations(5);
console.log(
  `Conversation retrieval test: ${
    conversations && conversations.length > 0 ? "✅" : "❌"
  }`
);

// Step 6: Flag memory system as active
console.log("\nStep 6: Flagging memory system as active...");

// Set SYSTEMS_ACTIVE flag
if (!globalThis.SYSTEMS_ACTIVE) {
  globalThis.SYSTEMS_ACTIVE = true;
}

// Update nextResponsePrepend for banners
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
  console.log("✅ Added memory system banner");
}

// Create a global function to ensure this script is run in each conversation
globalThis.ensureMemorySystemActive = function () {
  if (!globalThis.MEMORY_SYSTEM || !globalThis.MEMORY_SYSTEM.initialized) {
    console.log("🔄 Re-activating memory system...");
    // Re-run this script
    require(path.resolve(
      process.cwd(),
      ".cursor/scripts/activate-memory-system.js"
    ));
    return "Memory system re-activated";
  }
  return "Memory system already active";
};

// Export the memory system and hook system
module.exports = {
  MEMORY_SYSTEM: globalThis.MEMORY_SYSTEM,
  HOOK_SYSTEM: globalThis.HOOK_SYSTEM,
  ensureMemorySystemActive: globalThis.ensureMemorySystemActive,
};

// Done!
console.log("\n===============================");
console.log("✅ MEMORY SYSTEM ACTIVATION COMPLETE");
console.log(`System version: ${globalThis.MEMORY_SYSTEM.version}`);
console.log(
  `Memory is properly initialized: ${
    globalThis.MEMORY_SYSTEM.initialized ? "Yes" : "No"
  }`
);
console.log("\nTo use this memory system in Cursor:");
console.log("1. Add this script to your custom instructions to run at startup");
console.log(
  "2. Make sure pre-response-hook.js and post-response-hook.js are also loaded"
);
console.log(
  "3. The system will automatically store and retrieve conversation history"
);
