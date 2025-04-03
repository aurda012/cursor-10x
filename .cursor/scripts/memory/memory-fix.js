/**
 * Memory Fix Module
 *
 * This module implements memory storage and retrieval functions.
 */

console.log("🔧 Initializing Memory System Fix...");

// Initialize memory storage
let conversations = [];
let contextData = {};
let shortTermMemory = {};

// Store a conversation entry
function storeConversation(entry) {
  console.log(
    `Storing conversation from ${entry.role}: ${entry.content.substring(
      0,
      30
    )}...`
  );
  conversations.push(entry);
  console.log(
    `✅ Stored conversation, total in memory: ${conversations.length}`
  );
  return true;
}

// Retrieve recent conversations
function getRecentConversations(count = 10) {
  console.log(`Retrieving ${count} recent conversations...`);
  const recent = conversations.slice(-count);
  console.log(`✅ Retrieved ${recent.length} conversations`);
  return recent;
}

// Store context data
function storeContext(key, value) {
  console.log(`Storing context: ${key}`);
  contextData[key] = value;
  return true;
}

// Retrieve context data
function getContext(key) {
  return contextData[key];
}

// Process before response
function processBeforeResponse(userInput) {
  console.log("🧠 Processing before response: storing user input");
  try {
    // Store the user's query in episodic memory
    storeConversation({
      role: "user",
      content: userInput,
      timestamp: Date.now(),
    });

    // Get recent conversations for context
    const recentConversations = getRecentConversations(5);

    // Store them in short-term memory for easy access
    shortTermMemory.lastQueryContext = recentConversations;

    console.log(
      `✅ Successfully processed user input: "${userInput.substring(0, 30)}${
        userInput.length > 30 ? "..." : ""
      }"`
    );
    return true;
  } catch (error) {
    console.error("❌ Error in processBeforeResponse:", error.message);
    return false;
  }
}

// Process after response
function processAfterResponse(assistantResponse) {
  console.log("🧠 Processing after response: storing assistant output");
  try {
    // Store the assistant's response in episodic memory
    storeConversation({
      role: "assistant",
      content: assistantResponse,
      timestamp: Date.now(),
    });

    // Update the conversation count
    if (shortTermMemory.conversationCount !== undefined) {
      shortTermMemory.conversationCount++;
    } else {
      shortTermMemory.conversationCount = 1;
    }

    console.log(
      `✅ Successfully processed assistant response: "${assistantResponse.substring(
        0,
        30
      )}${assistantResponse.length > 30 ? "..." : ""}"`
    );
    return true;
  } catch (error) {
    console.error("❌ Error in processAfterResponse:", error.message);
    return false;
  }
}

// Example conversation storage to populate initial memory
console.log("Creating new memory system...");

// Store some context
storeContext("session_id", `session_${Date.now()}`);

// Get recent conversations for testing
const recentConversations = getRecentConversations();
console.log(`Retrieved ${recentConversations.length} recent conversations`);

console.log("✅ Memory System Fix completed!\n");

// Export all functions and data
module.exports = {
  storeConversation,
  getRecentConversations,
  storeContext,
  getContext,
  processBeforeResponse,
  processAfterResponse,
  conversations,
  contextData,
  shortTermMemory,
};

// Expose the memory system globally
if (typeof globalThis !== "undefined") {
  globalThis.MEMORY_SYSTEM = module.exports;
}
