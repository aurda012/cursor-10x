/**
 * Test Script for Centralized Initialization System
 * Version 1.0.0 (2023)
 *
 * This script tests the centralized initialization system to verify
 * that all core systems are properly initialized.
 */

// Set up dummy console for logging
const originalConsole = console;
const testLogs = [];

console = {
  ...originalConsole,
  log: function (message) {
    testLogs.push({ type: "log", message });
    originalConsole.log(message);
  },
  error: function (message) {
    testLogs.push({ type: "error", message });
    originalConsole.error(message);
  },
  warn: function (message) {
    testLogs.push({ type: "warn", message });
    originalConsole.warn(message);
  },
};

// Reset globals for testing
if (globalThis.MEMORY_SYSTEM) delete globalThis.MEMORY_SYSTEM;
if (globalThis.SCRATCHPAD) delete globalThis.SCRATCHPAD;
if (globalThis.SCRATCHPAD_SYSTEM) delete globalThis.SCRATCHPAD_SYSTEM;
if (globalThis.MULTI_AGENT_SYSTEM) delete globalThis.MULTI_AGENT_SYSTEM;
if (globalThis.AGENT_SYSTEM) delete globalThis.AGENT_SYSTEM;
if (globalThis.nextResponsePrepend) globalThis.nextResponsePrepend = [];

// Begin test
console.log("🧪 STARTING CENTRALIZED INITIALIZATION TEST");
console.log("===========================================");

// Load the centralized initialization system
try {
  console.log("📂 Loading centralized-init.js...");
  require("./centralized-init.js");
  console.log("✅ Centralized initialization script loaded successfully");
} catch (error) {
  console.error("❌ Failed to load centralized initialization script:", error);
  process.exit(1);
}

// Verify systems were initialized
console.log("\n📋 VERIFICATION RESULTS");
console.log("=====================");

// Test memory system
let memoryActive = false;
try {
  memoryActive =
    globalThis.MEMORY_SYSTEM &&
    typeof globalThis.MEMORY_SYSTEM.storeContext === "function" &&
    typeof globalThis.MEMORY_SYSTEM.getContext === "function";

  if (memoryActive) {
    // Test basic functionality
    globalThis.MEMORY_SYSTEM.storeContext("test_key", "test_value");
    const value = globalThis.MEMORY_SYSTEM.getContext("test_key");
    memoryActive = value === "test_value";

    if (memoryActive) {
      console.log("✅ Memory System: ACTIVE and functioning correctly");
    } else {
      console.error("❌ Memory System: Found but not functioning correctly");
    }
  } else {
    console.error("❌ Memory System: NOT ACTIVE");
  }
} catch (error) {
  console.error("❌ Memory System: Error during testing:", error);
  memoryActive = false;
}

// Test scratchpad system
let scratchpadActive = false;
try {
  const scratchpad = globalThis.SCRATCHPAD || globalThis.SCRATCHPAD_SYSTEM;
  scratchpadActive =
    scratchpad && typeof scratchpad.createMessage === "function";

  if (scratchpadActive) {
    console.log("✅ Scratchpad System: ACTIVE");
  } else {
    console.error("❌ Scratchpad System: NOT ACTIVE");
  }
} catch (error) {
  console.error("❌ Scratchpad System: Error during testing:", error);
  scratchpadActive = false;
}

// Test multi-agent system
let agentSystemActive = false;
try {
  const agentSystem = globalThis.MULTI_AGENT_SYSTEM || globalThis.AGENT_SYSTEM;
  agentSystemActive =
    agentSystem && typeof agentSystem.getActiveAgent === "function";

  if (agentSystemActive) {
    console.log("✅ Multi-Agent System: ACTIVE");
  } else {
    console.error("❌ Multi-Agent System: NOT ACTIVE");
  }
} catch (error) {
  console.error("❌ Multi-Agent System: Error during testing:", error);
  agentSystemActive = false;
}

// Test banner system
let bannersActive = false;
try {
  bannersActive =
    Array.isArray(globalThis.nextResponsePrepend) &&
    globalThis.nextResponsePrepend.length > 0;

  if (bannersActive) {
    console.log(
      "✅ Banner System: ACTIVE with " +
        globalThis.nextResponsePrepend.length +
        " banners"
    );
    console.log("   Banners: " + globalThis.nextResponsePrepend.join(", "));
  } else {
    console.error("❌ Banner System: NOT ACTIVE");
  }
} catch (error) {
  console.error("❌ Banner System: Error during testing:", error);
  bannersActive = false;
}

// Overall test result
console.log("\n🏁 TEST SUMMARY");
console.log("=============");

const allActive =
  memoryActive && scratchpadActive && agentSystemActive && bannersActive;
if (allActive) {
  console.log("✅ ALL SYSTEMS ACTIVE - Centralized initialization successful");
} else {
  console.error("❌ TEST FAILED - Some systems not active");
  console.log("   Memory System: " + (memoryActive ? "Active" : "Inactive"));
  console.log(
    "   Scratchpad System: " + (scratchpadActive ? "Active" : "Inactive")
  );
  console.log(
    "   Multi-Agent System: " + (agentSystemActive ? "Active" : "Inactive")
  );
  console.log("   Banner System: " + (bannersActive ? "Active" : "Inactive"));
}

// Restore original console
console = originalConsole;

// Return test results if running in Node
if (typeof module !== "undefined") {
  module.exports = {
    success: allActive,
    results: {
      memoryActive,
      scratchpadActive,
      agentSystemActive,
      bannersActive,
    },
    logs: testLogs,
  };
}
