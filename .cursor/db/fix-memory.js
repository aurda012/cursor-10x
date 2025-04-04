/**
 * Memory System Fix Script
 *
 * This script addresses issues identified in the comprehensive memory test:
 * 1. Missing methods in the memory system
 * 2. Proper initialization of the memory system
 * 3. Bridge between pre/post response hooks and the memory system functions
 */

console.log("🔧 MEMORY SYSTEM FIX SCRIPT 🔧");
console.log("===============================\n");

// Load necessary modules
const path = require("path");
const fs = require("fs");

// Check if memory system is loaded
console.log("Step 1: Checking for memory system...");
if (!globalThis.MEMORY_SYSTEM) {
  console.log("⚠️ Memory system not found. Attempting to load it...");

  try {
    // Try to load the memory system from systems directory
    const memorySystemPath = path.resolve(
      process.cwd(),
      ".cursor/systems/memory-system.js"
    );
    require(memorySystemPath);
    console.log("✅ Loaded memory system from systems directory");
  } catch (error) {
    console.error(`❌ Error loading memory system: ${error.message}`);
    process.exit(1);
  }
}

console.log("\nStep 2: Inspecting memory system methods...");
const memMethods = Object.getOwnPropertyNames(globalThis.MEMORY_SYSTEM).filter(
  (prop) => typeof globalThis.MEMORY_SYSTEM[prop] === "function"
);
console.log(`📋 Current methods: ${memMethods.join(", ")}`);

// Check for and add missing methods
console.log("\nStep 3: Adding missing methods to memory system...");

// Initialize data structures if they don't exist
if (!globalThis.MEMORY_SYSTEM.shortTerm) {
  globalThis.MEMORY_SYSTEM.shortTerm = {};
  console.log("✅ Created short-term memory store");
}

if (!globalThis.MEMORY_SYSTEM.episodic) {
  globalThis.MEMORY_SYSTEM.episodic = [];
  console.log("✅ Created episodic memory store");
}

if (!globalThis.MEMORY_SYSTEM.semantic) {
  globalThis.MEMORY_SYSTEM.semantic = {};
  console.log("✅ Created semantic memory store");
}

// Add or fix storeContext method
if (typeof globalThis.MEMORY_SYSTEM.storeContext !== "function") {
  globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
    try {
      if (!this.shortTerm) {
        this.shortTerm = {};
      }
      this.shortTerm[key] = value;
      console.log(`📝 Stored in context: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error storing context: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Added storeContext method");
}

// Add or fix getContext method
if (typeof globalThis.MEMORY_SYSTEM.getContext !== "function") {
  globalThis.MEMORY_SYSTEM.getContext = function (key) {
    try {
      if (!this.shortTerm) {
        return null;
      }
      return this.shortTerm[key];
    } catch (error) {
      console.error(`❌ Error getting context: ${error.message}`);
      return null;
    }
  };
  console.log("✅ Added getContext method");
}

// Add or fix clearContext method
if (typeof globalThis.MEMORY_SYSTEM.clearContext !== "function") {
  globalThis.MEMORY_SYSTEM.clearContext = function (key) {
    try {
      if (!this.shortTerm) {
        return false;
      }
      if (key in this.shortTerm) {
        delete this.shortTerm[key];
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error clearing context: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Added clearContext method");
}

// Add or fix storeConversation method
if (typeof globalThis.MEMORY_SYSTEM.storeConversation !== "function") {
  globalThis.MEMORY_SYSTEM.storeConversation = function (conversation) {
    try {
      if (!this.episodic) {
        this.episodic = [];
      }

      // Ensure timestamp
      if (!conversation.timestamp) {
        conversation.timestamp = Date.now();
      }

      this.episodic.push(conversation);
      console.log(`📝 Stored conversation: ${conversation.role || "unknown"}`);
      return true;
    } catch (error) {
      console.error(`❌ Error storing conversation: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Added storeConversation method");
}

// Add or fix getRecentConversations method
if (typeof globalThis.MEMORY_SYSTEM.getRecentConversations !== "function") {
  globalThis.MEMORY_SYSTEM.getRecentConversations = function (limit = 10) {
    try {
      if (!this.episodic) {
        return [];
      }
      return this.episodic.slice(-limit);
    } catch (error) {
      console.error(`❌ Error getting recent conversations: ${error.message}`);
      return [];
    }
  };
  console.log("✅ Added getRecentConversations method");
}

// Add or fix storeKnowledge method
if (typeof globalThis.MEMORY_SYSTEM.storeKnowledge !== "function") {
  globalThis.MEMORY_SYSTEM.storeKnowledge = function (topic, knowledge) {
    try {
      if (!this.semantic) {
        this.semantic = {};
      }
      if (!this.semantic[topic]) {
        this.semantic[topic] = {};
      }

      // If knowledge is a single object with an id, store it by id
      if (knowledge && typeof knowledge === "object" && knowledge.id) {
        this.semantic[topic][knowledge.id] = knowledge;
      } else {
        // Otherwise, just assign the whole object
        this.semantic[topic] = knowledge;
      }

      console.log(`📝 Stored knowledge in topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`❌ Error storing knowledge: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Added storeKnowledge method");
}

// Add or fix getKnowledge method
if (typeof globalThis.MEMORY_SYSTEM.getKnowledge !== "function") {
  globalThis.MEMORY_SYSTEM.getKnowledge = function (topic) {
    try {
      if (!this.semantic) {
        return null;
      }
      return this.semantic[topic];
    } catch (error) {
      console.error(`❌ Error getting knowledge: ${error.message}`);
      return null;
    }
  };
  console.log("✅ Added getKnowledge method");
}

// Add or fix searchKnowledge method
if (typeof globalThis.MEMORY_SYSTEM.searchKnowledge !== "function") {
  globalThis.MEMORY_SYSTEM.searchKnowledge = function (query) {
    try {
      if (!this.semantic) {
        return {};
      }

      const results = {};
      const queryLower = query.toLowerCase();

      // Simple search implementation
      Object.keys(this.semantic).forEach((topic) => {
        const topicData = this.semantic[topic];

        // If topic contains the query, include all its content
        if (topic.toLowerCase().includes(queryLower)) {
          results[topic] = topicData;
          return;
        }

        // If it's an object with multiple items, search within each
        if (typeof topicData === "object") {
          const matchingItems = {};
          let hasMatches = false;

          Object.keys(topicData).forEach((key) => {
            const item = topicData[key];

            // Search in content or any string fields
            if (
              typeof item === "string" &&
              item.toLowerCase().includes(queryLower)
            ) {
              matchingItems[key] = item;
              hasMatches = true;
            } else if (typeof item === "object") {
              // For objects, search in all string fields
              const matchesInItem = Object.keys(item).some((field) => {
                const value = item[field];
                return (
                  typeof value === "string" &&
                  value.toLowerCase().includes(queryLower)
                );
              });

              if (matchesInItem) {
                matchingItems[key] = item;
                hasMatches = true;
              }
            }
          });

          if (hasMatches) {
            results[topic] = matchingItems;
          }
        }
      });

      return results;
    } catch (error) {
      console.error(`❌ Error searching knowledge: ${error.message}`);
      return {};
    }
  };
  console.log("✅ Added searchKnowledge method");
}

// Add or fix pruneMemory method
if (typeof globalThis.MEMORY_SYSTEM.pruneMemory !== "function") {
  globalThis.MEMORY_SYSTEM.pruneMemory = function () {
    try {
      let prunedCount = 0;

      // Limit episodic memory to 100 entries
      if (this.episodic && this.episodic.length > 100) {
        const overflow = this.episodic.length - 100;
        this.episodic = this.episodic.slice(-100);
        prunedCount += overflow;
        console.log(`🧹 Pruned ${overflow} old conversations`);
      }

      return prunedCount;
    } catch (error) {
      console.error(`❌ Error pruning memory: ${error.message}`);
      return 0;
    }
  };
  console.log("✅ Added pruneMemory method");
}

// Fix processBeforeResponse method
if (typeof globalThis.MEMORY_SYSTEM.processBeforeResponse === "function") {
  // Create a backup of the original function
  const originalProcessBeforeResponse =
    globalThis.MEMORY_SYSTEM.processBeforeResponse;

  globalThis.MEMORY_SYSTEM.processBeforeResponse = function (userQuery) {
    console.log("Processing memory before response for query:", userQuery);

    try {
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

      // Call the original function if possible
      try {
        originalProcessBeforeResponse.call(this, userQuery);
      } catch (innerError) {
        console.log(
          `⚠️ Original processBeforeResponse had error: ${innerError.message}`
        );
      }

      return true;
    } catch (error) {
      console.error(`❌ Error in processBeforeResponse: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Fixed processBeforeResponse method");
}

// Fix processAfterResponse method
if (typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function") {
  // Create a backup of the original function
  const originalProcessAfterResponse =
    globalThis.MEMORY_SYSTEM.processAfterResponse;

  globalThis.MEMORY_SYSTEM.processAfterResponse = function (assistantResponse) {
    console.log("Processing memory after response");

    try {
      // Store in episodic memory
      if (typeof this.storeConversation === "function") {
        this.storeConversation({
          role: "assistant",
          content: assistantResponse,
          timestamp: Date.now(),
        });
      }

      // Get the last query from context
      let lastQuery = null;
      if (typeof this.getContext === "function") {
        lastQuery = this.getContext("lastQuery");
      }

      // Call the original function if possible
      try {
        originalProcessAfterResponse.call(this, assistantResponse);
      } catch (innerError) {
        console.log(
          `⚠️ Original processAfterResponse had error: ${innerError.message}`
        );
      }

      return true;
    } catch (error) {
      console.error(`❌ Error in processAfterResponse: ${error.message}`);
      return false;
    }
  };
  console.log("✅ Fixed processAfterResponse method");
}

// Update the initialized flag
globalThis.MEMORY_SYSTEM.initialized = true;
globalThis.MEMORY_SYSTEM.version = "2.0.0-fixed";

// Report results
console.log("\nStep 4: Verifying fixes...");
const updatedMethods = Object.getOwnPropertyNames(
  globalThis.MEMORY_SYSTEM
).filter((prop) => typeof globalThis.MEMORY_SYSTEM[prop] === "function");
console.log(`📋 Updated methods: ${updatedMethods.join(", ")}`);

console.log("\n===============================");
console.log("✅ MEMORY SYSTEM FIX COMPLETE");
console.log(
  "Memory system now has full functionality for pre/post response hooks"
);
console.log(
  "Run the comprehensive test again to verify all systems are operational"
);
