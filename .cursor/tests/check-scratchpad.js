/**
 * Check Scratchpad Contents
 *
 * This script checks what's currently stored in the scratchpad system
 */

console.log("🔍 Checking scratchpad system contents...\n");

// Load the scratchpad system
const path = require("path");
const scratchpadSystemPath = path.join(
  __dirname,
  "systems",
  "scratchpad-system.js"
);
require(scratchpadSystemPath);

// Check if scratchpad system is available
const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;
if (!scratchpad) {
  console.error("❌ Scratchpad system not found!");
  process.exit(1);
}

console.log("✅ Scratchpad system loaded successfully");

// Create test thread and message to verify functionality
try {
  const threadId = `test_thread_${Date.now()}`;
  const testThread = scratchpad.createThread(threadId, "Test Thread", "system");
  console.log(`✅ Successfully created test thread: ${threadId}`);

  const messageId = scratchpad.createMessage({
    thread_id: threadId,
    sender_id: "system",
    message_type: "test",
    content: `Test message created at ${new Date().toISOString()}`,
    timestamp: Date.now(),
  });

  console.log(`✅ Successfully created test message: ${messageId}`);
} catch (error) {
  console.error(`❌ Error creating test thread/message: ${error.message}`);
}

// Check for threads
console.log("\n--- AVAILABLE THREADS ---");
try {
  if (typeof scratchpad.getAllThreads === "function") {
    const threads = scratchpad.getAllThreads();
    console.log(`Found ${threads.length} threads:`);
    threads.forEach((thread, index) => {
      console.log(`${index + 1}. ${thread.title || thread.id} (${thread.id})`);
    });
  } else if (scratchpad.threads) {
    const threadIds = Object.keys(scratchpad.threads);
    console.log(`Found ${threadIds.length} threads:`);
    threadIds.forEach((threadId, index) => {
      const thread = scratchpad.threads[threadId];
      console.log(`${index + 1}. ${thread.title || threadId} (${threadId})`);
    });
  } else {
    console.log(
      "Unable to list threads - getAllThreads method or threads property not found"
    );
  }
} catch (error) {
  console.error(`❌ Error listing threads: ${error.message}`);
}

// Check for messages
console.log("\n--- RECENT MESSAGES ---");
try {
  if (typeof scratchpad.getAllMessages === "function") {
    const messages = scratchpad.getAllMessages();
    console.log(`Found ${messages.length} messages (showing up to 10):`);
    messages.slice(0, 10).forEach((message, index) => {
      console.log(
        `${index + 1}. [${message.sender_id}] ${message.content.substring(
          0,
          50
        )}${message.content.length > 50 ? "..." : ""}`
      );
    });
  } else if (scratchpad.messages) {
    const messages = scratchpad.messages;
    console.log(`Found ${messages.length} messages (showing up to 10):`);
    messages.slice(0, 10).forEach((message, index) => {
      console.log(
        `${index + 1}. [${message.sender_id}] ${message.content.substring(
          0,
          50
        )}${message.content.length > 50 ? "..." : ""}`
      );
    });
  } else if (typeof scratchpad.readThread === "function") {
    // Try to read the system initialization thread if it exists
    const systemThreads = scratchpad.threads
      ? Object.values(scratchpad.threads).filter(
          (t) => t.title && t.title.includes("System")
        )
      : [];

    if (systemThreads.length > 0) {
      const systemThread = systemThreads[0];
      console.log(
        `Reading messages from thread: ${systemThread.title} (${systemThread.id})`
      );
      const messages = scratchpad.readThread(systemThread.id);

      if (messages && messages.length > 0) {
        console.log(
          `Found ${messages.length} messages in thread (showing up to 10):`
        );
        messages.slice(0, 10).forEach((message, index) => {
          console.log(
            `${index + 1}. [${message.sender_id}] ${message.content.substring(
              0,
              50
            )}${message.content.length > 50 ? "..." : ""}`
          );
        });
      } else {
        console.log("No messages found in system thread");
      }
    } else {
      console.log("No system initialization thread found");
    }
  } else {
    console.log(
      "Unable to list messages - no methods available to retrieve messages"
    );
  }
} catch (error) {
  console.error(`❌ Error listing messages: ${error.message}`);
}

// Check for any variables or state
console.log("\n--- SCRATCHPAD VARIABLES ---");
try {
  if (typeof scratchpad.getVariable === "function") {
    const commonVars = [
      "current_task",
      "active_agent",
      "system_status",
      "last_user_query",
    ];

    for (const varName of commonVars) {
      const value = scratchpad.getVariable(varName);
      if (value) {
        console.log(`- ${varName}: ${JSON.stringify(value)}`);
      }
    }
  } else if (scratchpad.variables) {
    console.log("Variables found:");
    for (const [key, value] of Object.entries(scratchpad.variables)) {
      console.log(`- ${key}: ${JSON.stringify(value)}`);
    }
  } else {
    console.log("No variables found or method to access variables");
  }
} catch (error) {
  console.error(`❌ Error checking variables: ${error.message}`);
}

console.log("\n✅ Scratchpad check complete");
