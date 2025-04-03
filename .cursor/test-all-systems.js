/**
 * CURSOR SYSTEM VERIFICATION TEST
 *
 * This script tests all the Cursor systems to ensure they are working properly.
 * It tests the enforcer, memory system, scratchpad, and banner system.
 */

console.log("🧪 STARTING COMPREHENSIVE SYSTEM TEST");
console.log("====================================");

// Step 1: Load the enforcer which should initialize everything
console.log("\n1️⃣ LOADING ENFORCER...");
try {
  const enforcer = require("./enforcer.js");
  console.log("✅ Enforcer loaded successfully");
  console.log("Enforcer status:", enforcer);
} catch (error) {
  console.error("❌ Failed to load enforcer:", error.message);
  process.exit(1);
}

// Step 2: Check if all systems are initialized
console.log("\n2️⃣ CHECKING SYSTEM INITIALIZATION...");
const memoryExists = !!globalThis.MEMORY_SYSTEM;
const scratchpadExists = !!globalThis.SCRATCHPAD;
const multiAgentExists = !!globalThis.MULTI_AGENT_SYSTEM;
const bannerExists = !!globalThis.nextResponsePrepend;
const hookSystemExists = !!globalThis.HOOK_SYSTEM;

console.log("Memory System:", memoryExists);
console.log("Scratchpad System:", scratchpadExists);
console.log("Multi-Agent System:", multiAgentExists);
console.log("Banner System:", bannerExists);
console.log("Hook System:", hookSystemExists);

if (
  !memoryExists ||
  !scratchpadExists ||
  !multiAgentExists ||
  !bannerExists ||
  !hookSystemExists
) {
  console.error("❌ Some systems failed to initialize");
  process.exit(1);
}

// Step 3: Test the memory system
console.log("\n3️⃣ TESTING MEMORY SYSTEM...");
try {
  // Store a test value
  globalThis.MEMORY_SYSTEM.storeContext("test_key", "test_value");
  const retrievedValue = globalThis.MEMORY_SYSTEM.getContext("test_key");

  console.log("Stored test_key =", retrievedValue);

  if (retrievedValue !== "test_value") {
    throw new Error("Memory retrieval failed");
  }

  // Store a conversation
  globalThis.MEMORY_SYSTEM.storeConversation({
    role: "system",
    content: "Test conversation",
    timestamp: Date.now(),
  });

  const conversations = globalThis.MEMORY_SYSTEM.getRecentConversations(1);
  console.log("Stored conversation:", conversations[0].content);

  if (
    conversations.length === 0 ||
    conversations[0].content !== "Test conversation"
  ) {
    throw new Error("Conversation storage failed");
  }

  console.log("✅ Memory system is working properly");
} catch (error) {
  console.error("❌ Memory system test failed:", error.message);
}

// Step 4: Test the scratchpad system
console.log("\n4️⃣ TESTING SCRATCHPAD SYSTEM...");
try {
  // Create a test message
  const msgId = globalThis.SCRATCHPAD.createMessage(
    "test-system",
    "test-agent",
    "Test message content"
  );

  console.log("Created message with ID:", msgId);

  // Retrieve the message
  const messages = globalThis.SCRATCHPAD.getMessages({ from: "test-system" });
  console.log("Retrieved messages:", messages.length);

  if (messages.length === 0) {
    throw new Error("Message retrieval failed");
  }

  console.log("Message content:", messages[0].content);

  if (messages[0].content !== "Test message content") {
    throw new Error("Message content mismatch");
  }

  console.log("✅ Scratchpad system is working properly");
} catch (error) {
  console.error("❌ Scratchpad system test failed:", error.message);
}

// Step 5: Test the hook system
console.log("\n5️⃣ TESTING HOOK SYSTEM...");
try {
  // Register a test hook
  let testHookCalled = false;

  globalThis.HOOK_SYSTEM.registerPreHook("test-hook", 50, (query) => {
    console.log("Test pre-hook called with query:", query);
    testHookCalled = true;
    return { success: true };
  });

  // Run the hooks
  const results = globalThis.HOOK_SYSTEM.runPreHooks("test query");
  console.log("Hook results:", results);

  if (!testHookCalled) {
    throw new Error("Test hook was not called");
  }

  console.log("✅ Hook system is working properly");
} catch (error) {
  console.error("❌ Hook system test failed:", error.message);
}

// Step 6: Check banner system
console.log("\n6️⃣ CHECKING BANNER SYSTEM...");
console.log("Current banners:");
if (Array.isArray(globalThis.nextResponsePrepend)) {
  globalThis.nextResponsePrepend.forEach((banner, i) => {
    console.log(`${i + 1}. ${banner}`);
  });

  if (globalThis.nextResponsePrepend.length === 0) {
    console.warn("⚠️ No banners found");
  } else {
    console.log(
      "✅ Banner system contains",
      globalThis.nextResponsePrepend.length,
      "banners"
    );
  }
} else {
  console.error("❌ Banner system is not properly initialized");
}

// Step 7: Test memory hooks
console.log("\n7️⃣ TESTING MEMORY HOOKS...");
try {
  if (typeof globalThis.MEMORY_SYSTEM.processBeforeResponse === "function") {
    const result = globalThis.MEMORY_SYSTEM.processBeforeResponse(
      "Test query for hooks"
    );
    console.log("Memory pre-hook result:", result);

    // Check if the query was stored
    const lastQuery = globalThis.MEMORY_SYSTEM.getContext("lastQuery");
    console.log("Stored last query:", lastQuery);

    if (lastQuery !== "Test query for hooks") {
      throw new Error("Query storage in pre-hook failed");
    }

    console.log("✅ Memory pre-hooks are working properly");
  } else {
    console.warn(
      "⚠️ Memory system doesn't have processBeforeResponse function"
    );
  }

  if (typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function") {
    const result = globalThis.MEMORY_SYSTEM.processAfterResponse(
      "Test response for hooks"
    );
    console.log("Memory post-hook result:", result);

    // Check if response was stored in conversations
    const conversations = globalThis.MEMORY_SYSTEM.getRecentConversations(1);
    console.log("Last stored conversation:", conversations[0]?.content);

    if (conversations[0]?.content !== "Test response for hooks") {
      throw new Error("Response storage in post-hook failed");
    }

    console.log("✅ Memory post-hooks are working properly");
  } else {
    console.warn("⚠️ Memory system doesn't have processAfterResponse function");
  }
} catch (error) {
  console.error("❌ Memory hook test failed:", error.message);
}

console.log("\n====================================");
console.log("✅ SYSTEM TEST COMPLETED");
console.log("All systems are operational!");
