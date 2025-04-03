/**
 * Simple Memory System Test
 */

// Try to load memory fix directly
try {
  console.log("Loading memory fix...");
  const memoryFix = require("./memory-fix.js");

  if (memoryFix) {
    console.log("✅ Memory fix loaded successfully");

    // Test storing a conversation
    console.log("\nStoring test conversation...");
    memoryFix.storeConversation({
      role: "user",
      content: "This is a test message from simple test",
      timestamp: Date.now(),
    });

    // Test retrieving conversations
    console.log("\nRetrieving conversations...");
    const conversations = memoryFix.getRecentConversations(5);
    console.log(`Found ${conversations.length} conversations:`);

    conversations.forEach((conv, i) => {
      console.log(
        `[${i}] ${conv.role}: ${conv.content.substring(0, 50)}${
          conv.content.length > 50 ? "..." : ""
        }`
      );
    });

    // Test auto-processing functions
    if (typeof memoryFix.processBeforeResponse === "function") {
      console.log("\nTesting processBeforeResponse...");
      memoryFix.processBeforeResponse("Test user input for pre-processing");
      console.log("✅ Pre-processing test complete");
    }

    if (typeof memoryFix.processAfterResponse === "function") {
      console.log("\nTesting processAfterResponse...");
      memoryFix.processAfterResponse(
        "Test assistant response for post-processing"
      );
      console.log("✅ Post-processing test complete");
    }

    console.log("\n🏁 Simple Memory Test Complete");
  } else {
    console.error("❌ Memory fix loaded but undefined");
  }
} catch (error) {
  console.error("❌ Error loading memory fix:", error.message);
}
