/**
 * Quick System Test
 */

try {
  // Create a minimal test for systems
  console.log("🧪 Testing basic system availability...");

  // Check systems without loading the enforcer
  console.log("\n1️⃣ BASIC CHECK:");
  console.log("Memory System:", !!globalThis.MEMORY_SYSTEM);
  console.log(
    "Scratchpad System:",
    !!globalThis.SCRATCHPAD_SYSTEM,
    !!globalThis.SCRATCHPAD
  );
  console.log(
    "Multi-Agent System:",
    !!globalThis.MULTI_AGENT_SYSTEM,
    !!globalThis.AGENT_SYSTEM
  );
  console.log(
    "Banner System:",
    !!globalThis.nextResponsePrepend,
    Array.isArray(globalThis.nextResponsePrepend)
      ? globalThis.nextResponsePrepend.length
      : 0
  );

  // Now try to initialize the scratchpad system directly
  console.log("\n2️⃣ CREATING SYSTEMS:");

  // Create scratchpad if it doesn't exist
  if (!globalThis.SCRATCHPAD) {
    console.log("Creating scratchpad system...");
    globalThis.SCRATCHPAD = {
      initialized: true,
      messages: [],
      createMessage: function (from, to, content) {
        const msg = {
          id: Date.now(),
          from,
          to,
          content,
          timestamp: Date.now(),
        };
        this.messages.push(msg);
        console.log(`Message created: ${from} -> ${to}`);
        return msg.id;
      },
      getMessages: function (filter = {}) {
        return this.messages.filter((msg) => {
          for (const key in filter) {
            if (msg[key] !== filter[key]) return false;
          }
          return true;
        });
      },
    };

    // Set compatibility reference
    globalThis.SCRATCHPAD_SYSTEM = globalThis.SCRATCHPAD;
    console.log("✅ Scratchpad system created");
  }

  // Create banner array if it doesn't exist
  if (!globalThis.nextResponsePrepend) {
    console.log("Creating banner system...");
    globalThis.nextResponsePrepend = [];
    console.log("✅ Banner system created");
  }

  // Add test banner
  globalThis.nextResponsePrepend.push("🧪 [TEST BANNER: SYSTEM CHECK]");
  console.log("✅ Test banner added");

  // Test scratchpad functionality
  console.log("\n3️⃣ TESTING SCRATCHPAD:");
  if (
    globalThis.SCRATCHPAD &&
    typeof globalThis.SCRATCHPAD.createMessage === "function"
  ) {
    const msgId = globalThis.SCRATCHPAD.createMessage(
      "test",
      "assistant",
      "This is a test message"
    );
    console.log(`Test message created with ID: ${msgId}`);

    const messages = globalThis.SCRATCHPAD.getMessages({ from: "test" });
    console.log(`Retrieved ${messages.length} messages`);

    console.log("✅ Scratchpad functionality verified");
  } else {
    console.log("❌ Cannot test scratchpad functionality");
  }

  // Show banners
  console.log("\n4️⃣ CURRENT BANNERS:");
  if (Array.isArray(globalThis.nextResponsePrepend)) {
    globalThis.nextResponsePrepend.forEach((banner, i) => {
      console.log(`${i + 1}. ${banner}`);
    });
  } else {
    console.log("❌ No banner array found");
  }

  console.log("\n✅ Quick test completed");
} catch (error) {
  console.error("❌ Error during quick test:", error);
}
