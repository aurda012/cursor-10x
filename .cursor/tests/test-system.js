/**
 * System Test Script
 *
 * This script tests if all essential systems are loading correctly
 * after configuration streamlining.
 */

console.log("🧪 Starting system test...");

// Test enforcer.js
console.log("\n📋 Testing enforcer.js...");
try {
  const enforcer = require("./enforcer.js");
  console.log("✅ enforcer.js loaded successfully");

  if (typeof enforcer.activateAllSystems === "function") {
    console.log("✅ enforcer.js has expected interface");
  } else {
    console.log("❌ enforcer.js is missing expected interface");
  }
} catch (error) {
  console.error("❌ Failed to load enforcer.js:", error.message);
}

// Test memory system
console.log("\n📋 Testing memory system...");
try {
  const memorySystem = require("./systems/memory-system.js");
  console.log("✅ memory-system.js loaded successfully");

  if (globalThis.MEMORY_SYSTEM && globalThis.MEMORY_SYSTEM.initialized) {
    console.log("✅ Memory system is initialized globally");

    // Test memory operations
    const testKey = `test_${Date.now()}`;
    const testValue = { value: `Test at ${Date.now()}` };

    globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
    const retrieved = globalThis.MEMORY_SYSTEM.getContext(testKey);

    if (retrieved && retrieved.value === testValue.value) {
      console.log("✅ Memory system operations working correctly");
    } else {
      console.log("❌ Memory system operations not working");
    }
  } else {
    console.log("❌ Memory system not initialized globally");
  }
} catch (error) {
  console.error("❌ Failed to load memory system:", error.message);
}

// Test scratchpad system
console.log("\n📋 Testing scratchpad system...");
try {
  const scratchpadSystem = require("./systems/scratchpad-system.js");
  console.log("✅ scratchpad-system.js loaded successfully");

  if (
    (globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD) &&
    (globalThis.SCRATCHPAD_SYSTEM?.initialized ||
      globalThis.SCRATCHPAD?.initialized)
  ) {
    console.log("✅ Scratchpad system is initialized globally");

    // Test scratchpad operations
    const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;
    const testMessage = scratchpad.createMessage(
      "system",
      "test",
      "Test message",
      null
    );

    if (testMessage) {
      console.log("✅ Scratchpad system operations working correctly");
    } else {
      console.log("❌ Scratchpad system operations not working");
    }
  } else {
    console.log("❌ Scratchpad system not initialized globally");
  }
} catch (error) {
  console.error("❌ Failed to load scratchpad system:", error.message);
}

// Test multi-agent system
console.log("\n📋 Testing multi-agent system...");
try {
  const multiAgentSystem = require("./systems/multi-agent-system.js");
  console.log("✅ multi-agent-system.js loaded successfully");

  if (
    globalThis.MULTI_AGENT_SYSTEM &&
    globalThis.MULTI_AGENT_SYSTEM.initialized
  ) {
    console.log("✅ Multi-agent system is initialized globally");

    // Test multi-agent operations
    const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();

    if (activeAgent && activeAgent.id) {
      console.log(
        `✅ Active agent is: ${activeAgent.name} (${activeAgent.id})`
      );
    } else {
      console.log("❌ Cannot identify active agent");
    }
  } else {
    console.log("❌ Multi-agent system not initialized globally");
  }
} catch (error) {
  console.error("❌ Failed to load multi-agent system:", error.message);
}

// Test banner system
console.log("\n📋 Testing banner system...");
try {
  if (globalThis.nextResponsePrepend) {
    console.log("✅ Banner system is initialized (nextResponsePrepend exists)");
    console.log("Current banners:", globalThis.nextResponsePrepend);
  } else {
    console.log("❌ Banner system not initialized");

    // Try to initialize banners
    console.log("Attempting to load direct-banner.js...");
    try {
      require("./communication/direct-banner.js");

      if (globalThis.nextResponsePrepend) {
        console.log(
          "✅ Banner system initialized after loading direct-banner.js"
        );
        console.log("Current banners:", globalThis.nextResponsePrepend);
      } else {
        console.log(
          "❌ Banner system still not initialized after loading direct-banner.js"
        );
      }
    } catch (error) {
      console.error("❌ Failed to load direct-banner.js:", error.message);
    }
  }
} catch (error) {
  console.error("❌ Error testing banner system:", error.message);
}

console.log("\n🧪 System test complete");

// Verify if all systems are active
const allSystemsActive =
  globalThis.MEMORY_SYSTEM &&
  globalThis.MEMORY_SYSTEM.initialized &&
  ((globalThis.SCRATCHPAD_SYSTEM && globalThis.SCRATCHPAD_SYSTEM.initialized) ||
    (globalThis.SCRATCHPAD && globalThis.SCRATCHPAD.initialized)) &&
  globalThis.MULTI_AGENT_SYSTEM &&
  globalThis.MULTI_AGENT_SYSTEM.initialized &&
  globalThis.nextResponsePrepend;

console.log(
  `\n${allSystemsActive ? "✅" : "❌"} All systems active: ${allSystemsActive}`
);

if (!allSystemsActive) {
  console.log(
    "\n⚠️ Some systems are not active. Consider restarting the application."
  );
} else {
  console.log("\n🎉 All systems are active and functioning correctly!");
}
