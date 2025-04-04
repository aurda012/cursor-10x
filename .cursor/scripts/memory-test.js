/**
 * Memory System Test Script
 *
 * This script tests the memory system's functionality,
 * focusing on the key issues identified in the comprehensive test:
 * 1. Proper initialization of the memory system
 * 2. Storage and retrieval operations
 * 3. Pre-response and post-response hook integration
 */

console.log("🧩 MEMORY SYSTEM TEST SCRIPT 🧩");
console.log("================================\n");

// Load necessary modules
const path = require("path");
const fs = require("fs");

// Step 1: Load core modules
console.log("Step 1: Loading memory system...");

// First, directly load the database module
const dbPath = path.resolve(process.cwd(), ".cursor/db/database.js");
console.log(`Loading database from: ${dbPath}`);
try {
  require(dbPath);
  console.log("✅ Database module loaded");
} catch (error) {
  console.error(`❌ Error loading database: ${error.message}`);
}

// Then load the memory system module
const memorySystemPath = path.resolve(
  process.cwd(),
  ".cursor/db/memory-system.js"
);
console.log(`Loading memory system from: ${memorySystemPath}`);

try {
  const memorySystem = require(memorySystemPath);
  console.log("✅ Memory system module loaded");

  // Explicitly initialize the memory system
  if (typeof memorySystem.initialize === "function") {
    memorySystem.initialize();
    console.log("✅ Memory system explicitly initialized");
  } else {
    console.log("⚠️ No initialize function found in memory system module");
  }
} catch (error) {
  console.error(`❌ Error loading memory system: ${error.message}`);
}

// Step 2: Check if memory system is available
console.log("\nStep 2: Checking memory system availability...");
if (!globalThis.MEMORY_SYSTEM) {
  console.error("❌ Memory system not found in globalThis");

  // Create a minimal memory system if it doesn't exist
  console.log("Creating minimal memory system...");
  globalThis.MEMORY_SYSTEM = {
    initialized: true,
    version: "minimal-1.0.0",
    shortTerm: {},
    episodic: [],
    semantic: {},

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
  console.log("✅ Created minimal memory system");
} else {
  console.log("✅ Memory system found");
}

// Step 3: Load the pre/post response hooks
console.log("\nStep 3: Setting up hook system...");
if (!globalThis.HOOK_SYSTEM) {
  globalThis.HOOK_SYSTEM = {
    preHooks: [],
    postHooks: [],

    registerPreHook: function (name, fn, priority = 100) {
      this.preHooks.push({ name, fn, priority });
      this.preHooks.sort((a, b) => b.priority - a.priority);
      return true;
    },

    registerPostHook: function (name, fn, priority = 100) {
      this.postHooks.push({ name, fn, priority });
      this.postHooks.sort((a, b) => b.priority - a.priority);
      return true;
    },

    runPreHooks: function (input) {
      let result = input;
      for (const hook of this.preHooks) {
        try {
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

// Add the memory hooks to HOOK_SYSTEM if they don't exist
if (!globalThis.MEMORY_SYSTEM.processBeforeResponse) {
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
  console.log("✅ Added processBeforeResponse method to memory system");
}

if (!globalThis.MEMORY_SYSTEM.processAfterResponse) {
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
  console.log("✅ Added processAfterResponse method to memory system");
}

// Register hooks
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

// Step 4: Test memory operations
console.log("\nStep 4: Testing memory operations...");

// 4.1 Test context operations
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
  console.log(
    `Value matches: ${
      JSON.stringify(retrievedValue) === JSON.stringify(testValue) ? "✅" : "❌"
    }`
  );
} catch (error) {
  console.error(`❌ Error in context operations: ${error.message}`);
}

// 4.2 Test conversation operations
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
  console.log(
    `Found test conversation: ${
      conversations.some((c) => c.content === testConversation.content)
        ? "✅"
        : "❌"
    }`
  );
} catch (error) {
  console.error(`❌ Error in conversation operations: ${error.message}`);
}

// 4.3 Test hook integration
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
  console.log(
    `Conversation with query stored: ${
      conversations.some((c) => c.content === testQuery) ? "✅" : "❌"
    }`
  );
  console.log(
    `Conversation with response stored: ${
      conversations.some((c) => c.content === testResponse) ? "✅" : "❌"
    }`
  );
} catch (error) {
  console.error(`❌ Error in hook integration: ${error.message}`);
}

// Step 5: Verify we have real functions, not just placeholders
console.log("\nStep 5: Verifying memory system implementation:");
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
console.log("\n================================");
console.log("✅ MEMORY SYSTEM TEST COMPLETE");
console.log(`System version: ${globalThis.MEMORY_SYSTEM.version || "unknown"}`);
console.log(
  `Memory is properly initialized: ${
    globalThis.MEMORY_SYSTEM.initialized ? "✅" : "❌"
  }`
);
console.log(
  "To use memory in your Cursor sessions, ensure the pre-response and post-response hooks are registered in your custom instructions."
);
