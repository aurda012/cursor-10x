/**
 * Check Memory Contents
 *
 * This script checks what's currently stored in the memory system
 */

console.log("🔍 Checking memory system contents...\n");

// Load the memory system
const path = require("path");
const memorySystemPath = path.join(__dirname, "systems", "memory-system.js");
require(memorySystemPath);

// Check if memory system is available
if (!globalThis.MEMORY_SYSTEM) {
  console.error("❌ Memory system not found!");
  process.exit(1);
}

console.log("✅ Memory system loaded successfully");

// Store a test value to confirm storage works
const testKey = `memory_test_${Date.now()}`;
const testValue = {
  value: `Test value created at ${new Date().toISOString()}`,
  purpose: "Memory system functionality test",
};

try {
  globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
  console.log(`✅ Successfully stored test value with key: ${testKey}`);
} catch (error) {
  console.error(`❌ Error storing test value: ${error.message}`);
}

// Retrieve the test value
try {
  const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);
  console.log("\n--- TEST VALUE RETRIEVAL ---");
  console.log(
    retrievedValue ? JSON.stringify(retrievedValue, null, 2) : "Not found"
  );
} catch (error) {
  console.error(`❌ Error retrieving test value: ${error.message}`);
}

// Check for active agent
try {
  const activeAgent = globalThis.MEMORY_SYSTEM.getContext("active_agent");
  console.log("\n--- ACTIVE AGENT ---");
  console.log(activeAgent ? JSON.stringify(activeAgent, null, 2) : "Not found");
} catch (error) {
  console.error(`❌ Error retrieving active agent: ${error.message}`);
}

// Check for conversation history
try {
  console.log("\n--- AVAILABLE CONTEXT KEYS ---");
  // If there's a method to list all keys, use it
  if (typeof globalThis.MEMORY_SYSTEM.listKeys === "function") {
    const keys = globalThis.MEMORY_SYSTEM.listKeys();
    console.log(keys);
  }
  // Otherwise try to access the database directly if possible
  else if (globalThis.MEMORY_SYSTEM.db) {
    console.log("Attempting to access database directly...");
    // This depends on the specific implementation
  }
  // If direct access isn't possible, check some common keys
  else {
    console.log("Checking common keys...");
    const commonKeys = [
      "active_agent",
      "current_task",
      "user_preferences",
      "system_configuration",
      "conversation_history",
      "executive_architect_last_active",
      "backend_developer_last_active",
      "frontend_developer_last_active",
    ];

    for (const key of commonKeys) {
      const value = globalThis.MEMORY_SYSTEM.getContext(key);
      console.log(`- ${key}: ${value ? "FOUND" : "NOT FOUND"}`);
      if (value) {
        console.log(`  Value: ${JSON.stringify(value)}`);
      }
    }
  }
} catch (error) {
  console.error(`❌ Error listing context keys: ${error.message}`);
}

// Check for episodic memory if the function exists
if (typeof globalThis.MEMORY_SYSTEM.searchEpisodes === "function") {
  try {
    console.log("\n--- RECENT EPISODES ---");
    const episodes = globalThis.MEMORY_SYSTEM.searchEpisodes({}, 5);
    console.log(
      episodes ? JSON.stringify(episodes, null, 2) : "No episodes found"
    );
  } catch (error) {
    console.error(`❌ Error retrieving episodes: ${error.message}`);
  }
}

// Check for semantic knowledge if the function exists
if (typeof globalThis.MEMORY_SYSTEM.searchKnowledge === "function") {
  try {
    console.log("\n--- SEMANTIC KNOWLEDGE ---");
    const knowledge = globalThis.MEMORY_SYSTEM.searchKnowledge({}, 5);
    console.log(
      knowledge ? JSON.stringify(knowledge, null, 2) : "No knowledge found"
    );
  } catch (error) {
    console.error(`❌ Error retrieving knowledge: ${error.message}`);
  }
}

console.log("\n✅ Memory check complete");
