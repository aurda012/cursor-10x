const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

console.log("🧪 Running Memory System Integration Test");
console.log("========================================");

// 1. Check initial database state
console.log("\n📊 Checking initial database state...");
const initialEpisodicCount = parseInt(
  execSync(
    'sqlite3 .cursor/db/memory-system.db "SELECT COUNT(*) FROM episodic_memory;"'
  )
    .toString()
    .trim()
);
const initialShortTermCount = parseInt(
  execSync(
    'sqlite3 .cursor/db/memory-system.db "SELECT COUNT(*) FROM short_term_memory;"'
  )
    .toString()
    .trim()
);

console.log(`Initial episodic memory entries: ${initialEpisodicCount}`);
console.log(`Initial short-term memory entries: ${initialShortTermCount}`);

// 2. Activate memory system
console.log("\n🚀 Activating memory system...");
try {
  require("../core/activate-memory-hooks.js");
  console.log("✅ Memory system activated via hooks");
} catch (error) {
  console.error("❌ Failed to activate memory hooks:", error.message);
  console.log("Falling back to direct memory system activation...");

  try {
    require("../scripts/activate-memory-system.js");
    console.log("✅ Memory system activated directly");
  } catch (err) {
    console.error("❌ Failed to activate memory system:", err.message);
    process.exit(1);
  }
}

// 3. Simulate user message processing
console.log("\n📝 Simulating user message processing...");
const userMessage = "This is a test message for the memory system";

// Check if memory system functions exist
if (typeof global.storeContext !== "function") {
  console.error("❌ storeContext function not found in global scope");
  process.exit(1);
}

if (typeof global.storeConversation !== "function") {
  console.error("❌ storeConversation function not found in global scope");
  process.exit(1);
}

// Store the test message
try {
  global.storeContext("testMessage", userMessage);
  console.log("✅ Stored test message in context");

  global.storeConversation(null, "user", userMessage, 1.0, null, {
    role: "user",
    test: true,
  });
  console.log("✅ Stored test conversation");
} catch (error) {
  console.error("❌ Failed to store test data:", error.message);
  process.exit(1);
}

// 4. Simulate response processing
console.log("\n📤 Simulating assistant response processing...");
const assistantResponse = "This is a test response from the memory system";

// Simulate post-response hook
try {
  if (typeof global.MEMORY_SYSTEM.processAfterResponse === "function") {
    global.MEMORY_SYSTEM.processAfterResponse({
      userMessage,
      assistantResponse,
      conversationId: null,
    });
    console.log("✅ Processed response with memory system");
  } else {
    // Fallback to direct storage
    global.storeConversation(null, "assistant", assistantResponse, 1.0, null, {
      role: "assistant",
      test: true,
    });
    console.log("✅ Stored response directly");
  }
} catch (error) {
  console.error("❌ Failed to process response:", error.message);
  process.exit(1);
}

// 5. Check final database state
console.log("\n📊 Checking final database state...");
const finalEpisodicCount = parseInt(
  execSync(
    'sqlite3 .cursor/db/memory-system.db "SELECT COUNT(*) FROM episodic_memory;"'
  )
    .toString()
    .trim()
);
const finalShortTermCount = parseInt(
  execSync(
    'sqlite3 .cursor/db/memory-system.db "SELECT COUNT(*) FROM short_term_memory;"'
  )
    .toString()
    .trim()
);

console.log(`Final episodic memory entries: ${finalEpisodicCount}`);
console.log(`Final short-term memory entries: ${finalShortTermCount}`);

// 6. Verify results
console.log("\n🔍 Verifying results...");
console.log(
  `Episodic memory entries added: ${finalEpisodicCount - initialEpisodicCount}`
);
console.log(
  `Short-term memory entries added: ${
    finalShortTermCount - initialShortTermCount
  }`
);

if (finalEpisodicCount > initialEpisodicCount) {
  console.log("✅ Episodic memory was successfully updated");
} else {
  console.log("❌ No new episodic memory entries were added");
}

if (finalShortTermCount > initialShortTermCount) {
  console.log("✅ Short-term memory was successfully updated");
} else {
  console.log("❌ No new short-term memory entries were added");
}

// 7. Verify data retrieval
console.log("\n🔄 Testing data retrieval...");
try {
  const retrievedMessage = global.getContext("testMessage");
  console.log(`Retrieved message from context: "${retrievedMessage}"`);

  if (retrievedMessage === userMessage) {
    console.log("✅ Context retrieval test passed");
  } else {
    console.log("❌ Context retrieval test failed");
  }

  const recentConversations = global.MEMORY_SYSTEM.getRecentConversations(3);
  console.log(`Retrieved ${recentConversations.length} recent conversations`);

  if (recentConversations.length > 0) {
    console.log("✅ Conversation retrieval test passed");
    console.log("Sample conversation:");
    console.log(JSON.stringify(recentConversations[0], null, 2));
  } else {
    console.log("❌ Conversation retrieval test failed");
  }
} catch (error) {
  console.error("❌ Failed to retrieve data:", error.message);
}

console.log("\n========================================");
console.log("🧪 Memory System Integration Test Complete");
