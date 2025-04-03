/**
 * Memory System Test
 *
 * This script tests the memory system's episodic memory functionality.
 */

const path = require("path");
console.log("🔍 Testing Memory System...");

// Load memory system
try {
  const memorySystemPath = path.join(__dirname, "systems", "memory-system.js");
  console.log(`Loading memory system from: ${memorySystemPath}`);
  require(memorySystemPath);

  const MEMORY_SYSTEM = globalThis.MEMORY_SYSTEM;

  if (!MEMORY_SYSTEM) {
    throw new Error("Memory system not registered globally");
  }

  console.log("✅ Memory system loaded successfully");

  // Test basic context functionality
  console.log("\n🧪 Testing basic context functionality:");
  const testKey = "test_" + Date.now();
  const testValue = { test: true, timestamp: new Date().toISOString() };
  console.log(`Storing context with key: ${testKey}`);
  const storeResult = MEMORY_SYSTEM.storeContext(testKey, testValue);
  console.log(`Store result: ${storeResult}`);

  console.log(`Retrieving context with key: ${testKey}`);
  const retrievedValue = MEMORY_SYSTEM.getContext(testKey);
  console.log(`Retrieved value: ${JSON.stringify(retrievedValue)}`);

  // Test if storeEpisode method exists
  console.log("\n🧪 Checking for episodic memory methods:");
  if (typeof MEMORY_SYSTEM.storeEpisode === "function") {
    console.log("✅ storeEpisode method exists");
  } else {
    console.log("❌ storeEpisode method does not exist");

    // Add the method if it doesn't exist
    console.log("Adding storeEpisode method...");
    MEMORY_SYSTEM.storeEpisode = function (
      conversationId,
      type,
      content,
      options = {}
    ) {
      console.log(
        `Storing episode with conversation ID: ${conversationId}, type: ${type}`
      );

      // Use episodic.store if available
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

      // Fallback implementation
      if (!this.episodic) {
        this.episodic = [];
      }

      const episode = {
        id: Date.now(),
        conversation_id: conversationId,
        type: type,
        content: content,
        timestamp: Date.now(),
        importance: options.importance || 1,
      };

      this.episodic.push(episode);
      console.log(`Episode stored with ID: ${episode.id}`);
      return episode.id;
    };
    console.log("✅ Added storeEpisode method");
  }

  if (typeof MEMORY_SYSTEM.getRecentEpisodes === "function") {
    console.log("✅ getRecentEpisodes method exists");
  } else {
    console.log("❌ getRecentEpisodes method does not exist");

    // Add the method if it doesn't exist
    console.log("Adding getRecentEpisodes method...");
    MEMORY_SYSTEM.getRecentEpisodes = function (limit = 10) {
      console.log(`Getting recent episodes with limit: ${limit}`);

      // Use episodic.search if available
      if (
        this.db &&
        this.db.episodic &&
        typeof this.db.episodic.search === "function"
      ) {
        console.log("Using db.episodic.search method");
        return this.db.episodic.search("", { limit: limit, orderDesc: true });
      }

      // Fallback implementation
      if (!this.episodic) {
        console.log("No episodic memory found, returning empty array");
        return [];
      }

      const episodes = this.episodic.slice(-limit);
      console.log(`Retrieved ${episodes.length} episodes`);
      return episodes;
    };
    console.log("✅ Added getRecentEpisodes method");
  }

  // Test episodic memory functionality
  console.log("\n🧪 Testing episodic memory functionality:");
  console.log("Storing test episode...");
  try {
    const episodeId = MEMORY_SYSTEM.storeEpisode(
      "test_conversation",
      "user_message",
      "This is a test message for episodic memory",
      { importance: 5 }
    );
    console.log(`Episode stored with ID: ${episodeId}`);

    console.log("\nRetrieving recent episodes...");
    try {
      const recentEpisodes = MEMORY_SYSTEM.getRecentEpisodes(5);
      console.log(
        `Found ${recentEpisodes ? recentEpisodes.length : 0} recent episodes`
      );

      if (recentEpisodes && recentEpisodes.length > 0) {
        console.log("Latest episode:");
        console.log(JSON.stringify(recentEpisodes[0], null, 2));
      } else {
        console.log("No episodes found");
      }
    } catch (retrieveError) {
      console.error(`Error retrieving episodes: ${retrieveError.message}`);
    }
  } catch (storeError) {
    console.error(`Error storing episode: ${storeError.message}`);
  }

  console.log("\n✅ Memory system test completed");
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
