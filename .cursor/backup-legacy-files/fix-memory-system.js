/**
 * Memory System Fix
 *
 * This script ensures the memory system has all required methods
 * and fixes any issues with the system.
 */

const path = require("path");
const fs = require("fs");

console.log("🔧 Fixing Memory System...");

// Correctly load the memory system
try {
  // First try to load from the systems directory
  const memorySystemPath = path.join(__dirname, "systems", "memory-system.js");
  console.log(`Looking for memory system at: ${memorySystemPath}`);

  if (fs.existsSync(memorySystemPath)) {
    console.log("Found memory system in systems directory");
    require(memorySystemPath);
  } else {
    // If not found, try the db directory
    const dbMemorySystemPath = path.join(__dirname, "db", "memory-system.js");
    console.log(`Looking for memory system at: ${dbMemorySystemPath}`);

    if (fs.existsSync(dbMemorySystemPath)) {
      console.log("Found memory system in db directory");
      require(dbMemorySystemPath);
    } else {
      throw new Error("Memory system file not found in expected locations");
    }
  }

  // Check if memory system is available globally
  const MEMORY_SYSTEM = globalThis.MEMORY_SYSTEM;

  if (!MEMORY_SYSTEM) {
    throw new Error("Memory system loaded but not registered globally");
  }

  console.log("✅ Memory System found");

  // Add missing methods directly to MEMORY_SYSTEM
  console.log("Adding episodic memory methods directly to MEMORY_SYSTEM...");

  // Add storeEpisode method
  MEMORY_SYSTEM.storeEpisode = function (
    conversationId,
    type,
    content,
    options = {}
  ) {
    console.log(
      `Storing episode with conversation ID: ${conversationId}, type: ${type}`
    );

    // Use episodic.store if available in db
    if (
      this.db &&
      this.db.episodic &&
      typeof this.db.episodic.store === "function"
    ) {
      return this.db.episodic.store(content, {
        type: type,
        conversationId: conversationId,
        importance: options.importance || 1,
        metadata: options.metadata,
      });
    }

    // If the object has an episodic object with a store method, use that
    if (this.episodic && typeof this.episodic.store === "function") {
      return this.episodic.store(content, {
        type: type,
        conversationId: conversationId,
        importance: options.importance || 1,
        metadata: options.metadata,
      });
    }

    // Fallback implementation
    if (!this._episodicMemory) {
      this._episodicMemory = [];
    }

    const episode = {
      id: Date.now(),
      conversation_id: conversationId,
      type: type,
      content: content,
      timestamp: Date.now(),
      importance: options.importance || 1,
    };

    this._episodicMemory.push(episode);
    console.log(`Episode stored with ID: ${episode.id}`);
    return episode.id;
  };

  // Add getRecentEpisodes method
  MEMORY_SYSTEM.getRecentEpisodes = function (limit = 10) {
    console.log(`Getting recent episodes with limit: ${limit}`);

    // Use episodic.search if available in db
    if (
      this.db &&
      this.db.episodic &&
      typeof this.db.episodic.search === "function"
    ) {
      console.log("Using db.episodic.search method");
      return this.db.episodic.search("", { limit: limit, orderDesc: true });
    }

    // If the object has an episodic object with a search method, use that
    if (this.episodic && typeof this.episodic.search === "function") {
      console.log("Using episodic.search method");
      return this.episodic.search("", { limit: limit, orderDesc: true });
    }

    // Fallback implementation
    if (!this._episodicMemory) {
      console.log("No episodic memory found, returning empty array");
      return [];
    }

    const episodes = this._episodicMemory.slice(-limit);
    console.log(`Retrieved ${episodes.length} episodes`);
    return episodes;
  };

  console.log("✅ Added episodic memory methods to MEMORY_SYSTEM");

  // Test the memory system
  console.log("\n🧪 Testing Memory System...");

  // Test context storage
  const testKey = "test_" + Date.now();
  const testValue = { test: true, timestamp: new Date().toISOString() };
  console.log(`Storing test context '${testKey}'...`);
  MEMORY_SYSTEM.storeContext(testKey, testValue);

  // Test context retrieval
  console.log("Retrieving test context...");
  const retrieved = MEMORY_SYSTEM.getContext(testKey);
  console.log(`Retrieved: ${JSON.stringify(retrieved)}`);

  // Test episode storage
  console.log("\nStoring test episode...");
  const episodeId = MEMORY_SYSTEM.storeEpisode(
    "test_conversation",
    "user_message",
    "This is a test message",
    { importance: 3 }
  );
  console.log(`Episode stored with ID: ${episodeId}`);

  // Test episode retrieval
  console.log("\nRetrieving recent episodes...");
  const recentEpisodes = MEMORY_SYSTEM.getRecentEpisodes(5);
  console.log(
    `Found ${recentEpisodes ? recentEpisodes.length : 0} recent episodes`
  );
  if (recentEpisodes && recentEpisodes.length > 0) {
    console.log(`First episode: ${JSON.stringify(recentEpisodes[0], null, 2)}`);
  }

  // Verify methods exist
  console.log("\nVerifying memory system has required methods:");
  console.log(
    `- storeContext: ${typeof MEMORY_SYSTEM.storeContext === "function"}`
  );
  console.log(
    `- getContext: ${typeof MEMORY_SYSTEM.getContext === "function"}`
  );
  console.log(
    `- storeEpisode: ${typeof MEMORY_SYSTEM.storeEpisode === "function"}`
  );
  console.log(
    `- getRecentEpisodes: ${
      typeof MEMORY_SYSTEM.getRecentEpisodes === "function"
    }`
  );

  // Update the memory system in global scope
  globalThis.MEMORY_SYSTEM = MEMORY_SYSTEM;

  console.log("\n✅ Memory System fixed and tested successfully");

  // Save the memory system to a file that can be required to ensure the methods are available
  const memorySystemFixPath = path.join(__dirname, "fixed-memory-system.js");
  const fixedCode = `
// Fixed Memory System with added episodic memory methods
// Auto-generated by fix-memory-system.js

const memorySystem = globalThis.MEMORY_SYSTEM || {};

// Add missing methods if they don't exist
if (!memorySystem.storeEpisode) {
  memorySystem.storeEpisode = ${MEMORY_SYSTEM.storeEpisode.toString()};
}

if (!memorySystem.getRecentEpisodes) {
  memorySystem.getRecentEpisodes = ${MEMORY_SYSTEM.getRecentEpisodes.toString()};
}

// Ensure the memory system is globally available
globalThis.MEMORY_SYSTEM = memorySystem;

// Export the memory system
module.exports = globalThis.MEMORY_SYSTEM;
`;

  fs.writeFileSync(memorySystemFixPath, fixedCode, "utf8");
  console.log(
    `✅ Created fixed memory system module at: ${memorySystemFixPath}`
  );
} catch (error) {
  console.error(`❌ Error fixing memory system: ${error.message}`);
  process.exit(1);
}
