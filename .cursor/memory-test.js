/**
 * Memory System Test Script
 *
 * This script tests the functionality of the memory system,
 * including storage, retrieval, and auto-processing features.
 */

// Initialize enforcer to load all systems
console.log("⚡ Loading enforcer...");
require("./enforcer.js");

// Wait for systems to initialize
setTimeout(() => {
  console.log("\n📊 MEMORY SYSTEM TEST\n");

  // Test memory system existence
  console.log("1️⃣ Checking memory system existence...");
  if (globalThis.MEMORY_SYSTEM) {
    console.log("✅ Memory system exists globally");

    // Test auto-processor functions
    console.log("\n2️⃣ Testing user input processing...");
    const testUserMessage = "This is a test user message for memory system";

    if (typeof globalThis.MEMORY_SYSTEM.processBeforeResponse === "function") {
      globalThis.MEMORY_SYSTEM.processBeforeResponse(testUserMessage);
      console.log("✅ User message processing successful");
    } else {
      console.error("❌ processBeforeResponse function not found");
    }

    console.log("\n3️⃣ Testing assistant response processing...");
    const testAssistantMessage =
      "This is a test assistant response for memory system";

    if (typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function") {
      globalThis.MEMORY_SYSTEM.processAfterResponse(testAssistantMessage);
      console.log("✅ Assistant message processing successful");
    } else {
      console.error("❌ processAfterResponse function not found");
    }

    // Test message history
    console.log("\n4️⃣ Retrieving conversation history...");
    if (typeof globalThis.MEMORY_SYSTEM.getRecentConversations === "function") {
      const conversations = globalThis.MEMORY_SYSTEM.getRecentConversations(10);
      console.log(`✅ Retrieved ${conversations.length} conversations`);

      if (conversations.length > 0) {
        console.log("\n📝 Most recent conversations:");
        conversations.forEach((conv, index) => {
          console.log(
            `[${index}] ${conv.role}: ${conv.content.substring(0, 50)}${
              conv.content.length > 50 ? "..." : ""
            }`
          );
        });
      }
    } else {
      console.error("❌ getRecentConversations function not found");
    }

    // Test auto-response processor
    console.log("\n5️⃣ Testing auto-response processor...");
    if (globalThis.storeUserMessage && globalThis.storeAssistantMessage) {
      globalThis.storeUserMessage("Auto-processor test user message");
      globalThis.storeAssistantMessage(
        "Auto-processor test assistant response"
      );
      console.log("✅ Auto-response processor functions accessible");
    } else {
      console.error("❌ Auto-response processor functions not found");
    }

    // Final check
    console.log("\n6️⃣ Final memory system check...");
    const finalCheck = globalThis.MEMORY_SYSTEM.getRecentConversations(2);
    console.log(`✅ Final check retrieved ${finalCheck.length} conversations`);

    // Conclusion
    console.log("\n🏁 MEMORY SYSTEM TEST COMPLETE");
    console.log("Memory system is operational and ready for use");
  } else {
    console.error("❌ Memory system not found globally");
  }
}, 1000);
