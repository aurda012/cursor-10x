/**
 * Basic System Test
 */

// Test memory system bridge
console.log("Testing memory system bridge...");
try {
  require("./systems/memory-system.js");
  console.log("✅ Memory system bridge loaded");
} catch (error) {
  console.error("❌ Memory system bridge failed:", error.message);
}

// Test scratchpad system bridge
console.log("\nTesting scratchpad system bridge...");
try {
  require("./systems/scratchpad-system.js");
  console.log("✅ Scratchpad system bridge loaded");
} catch (error) {
  console.error("❌ Scratchpad system bridge failed:", error.message);
}

// Test multi-agent system bridge
console.log("\nTesting multi-agent system bridge...");
try {
  require("./systems/multi-agent-system.js");
  console.log("✅ Multi-agent system bridge loaded");
} catch (error) {
  console.error("❌ Multi-agent system bridge failed:", error.message);
}

// Check global objects
console.log("\nChecking global objects:");
console.log("- MEMORY_SYSTEM exists:", !!globalThis.MEMORY_SYSTEM);
console.log("- SCRATCHPAD exists:", !!globalThis.SCRATCHPAD);
console.log("- MULTI_AGENT_SYSTEM exists:", !!globalThis.MULTI_AGENT_SYSTEM);
console.log("- nextResponsePrepend exists:", !!globalThis.nextResponsePrepend);

if (globalThis.nextResponsePrepend) {
  console.log("\nCurrent banners:");
  globalThis.nextResponsePrepend.forEach((banner, index) => {
    console.log(`  ${index + 1}. ${banner}`);
  });
}
