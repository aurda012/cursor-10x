/**
 * System Compatibility Layer Test Script
 * Version 1.0.0 (2023)
 *
 * This script tests the system compatibility layer to ensure that
 * system global objects use consistent naming conventions.
 */

console.log("🧪 TESTING SYSTEM COMPATIBILITY LAYER");
console.log("====================================");

// Initialize results
const results = {
  scratchpad: {
    both_exist: false,
    are_identical: false,
    primary_marker: false,
  },
  multiAgent: {
    both_exist: false,
    are_identical: false,
    primary_marker: false,
  },
  consistency: null,
};

// Import required modules if running in Node
try {
  // Clear any existing objects to test fresh initialization
  if (globalThis.SCRATCHPAD) delete globalThis.SCRATCHPAD;
  if (globalThis.SCRATCHPAD_SYSTEM) delete globalThis.SCRATCHPAD_SYSTEM;
  if (globalThis.MULTI_AGENT_SYSTEM) delete globalThis.MULTI_AGENT_SYSTEM;
  if (globalThis.AGENT_SYSTEM) delete globalThis.AGENT_SYSTEM;

  // Load the compatibility layer
  console.log("📂 Loading compatibility layer...");

  try {
    require("./system-compatibility.js");
    console.log("✅ Compatibility layer loaded");
  } catch (error) {
    console.error("❌ Error loading compatibility layer:", error.message);
    console.error("Tests will continue with potentially inconsistent objects");
  }

  // Test Scratchpad System
  console.log("\n🧪 Testing Scratchpad System compatibility...");

  // Check if both objects exist
  results.scratchpad.both_exist =
    !!globalThis.SCRATCHPAD && !!globalThis.SCRATCHPAD_SYSTEM;
  console.log(
    `- Both objects exist: ${results.scratchpad.both_exist ? "✅" : "❌"}`
  );

  // Check if they are identical
  results.scratchpad.are_identical =
    globalThis.SCRATCHPAD === globalThis.SCRATCHPAD_SYSTEM;
  console.log(
    `- Objects are identical: ${results.scratchpad.are_identical ? "✅" : "❌"}`
  );

  // Check primary marker
  results.scratchpad.primary_marker =
    !!globalThis.SCRATCHPAD_SYSTEM?._isPrimary;
  console.log(
    `- Primary marker exists: ${
      results.scratchpad.primary_marker ? "✅" : "❌"
    }`
  );

  // Check if initialized property is set
  const scratchpadInitialized =
    typeof globalThis.SCRATCHPAD?.initialized !== "undefined" &&
    typeof globalThis.SCRATCHPAD_SYSTEM?.initialized !== "undefined";
  console.log(
    `- Initialized property set: ${scratchpadInitialized ? "✅" : "❌"}`
  );

  // Test Multi-Agent System
  console.log("\n🧪 Testing Multi-Agent System compatibility...");

  // Check if both objects exist
  results.multiAgent.both_exist =
    !!globalThis.MULTI_AGENT_SYSTEM && !!globalThis.AGENT_SYSTEM;
  console.log(
    `- Both objects exist: ${results.multiAgent.both_exist ? "✅" : "❌"}`
  );

  // Check if they are identical
  results.multiAgent.are_identical =
    globalThis.MULTI_AGENT_SYSTEM === globalThis.AGENT_SYSTEM;
  console.log(
    `- Objects are identical: ${results.multiAgent.are_identical ? "✅" : "❌"}`
  );

  // Check primary marker
  results.multiAgent.primary_marker =
    !!globalThis.MULTI_AGENT_SYSTEM?._isPrimary;
  console.log(
    `- Primary marker exists: ${
      results.multiAgent.primary_marker ? "✅" : "❌"
    }`
  );

  // Check if initialized property is set
  const multiAgentInitialized =
    typeof globalThis.MULTI_AGENT_SYSTEM?.initialized !== "undefined" &&
    typeof globalThis.AGENT_SYSTEM?.initialized !== "undefined";
  console.log(
    `- Initialized property set: ${multiAgentInitialized ? "✅" : "❌"}`
  );

  // Test system consistency validation
  console.log("\n🧪 Testing system consistency validation...");

  if (typeof globalThis.validateSystemConsistency === "function") {
    results.consistency = globalThis.validateSystemConsistency();

    console.log(`- Validation function exists: ✅`);
    console.log(
      `- System consistency: ${results.consistency.consistent ? "✅" : "❌"}`
    );

    if (!results.consistency.consistent) {
      console.log(`- Issues found: ${results.consistency.issues.length}`);
      results.consistency.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
  } else {
    console.log(`- Validation function exists: ❌`);
  }

  // Overall results
  const allTests =
    results.scratchpad.both_exist &&
    results.scratchpad.are_identical &&
    results.scratchpad.primary_marker &&
    results.multiAgent.both_exist &&
    results.multiAgent.are_identical &&
    results.multiAgent.primary_marker &&
    (results.consistency?.consistent ?? false);

  console.log("\n📊 TEST SUMMARY");
  console.log("==============");
  console.log(
    `Scratchpad System Compatibility: ${
      results.scratchpad.both_exist && results.scratchpad.are_identical
        ? "✅"
        : "❌"
    }`
  );
  console.log(
    `Multi-Agent System Compatibility: ${
      results.multiAgent.both_exist && results.multiAgent.are_identical
        ? "✅"
        : "❌"
    }`
  );
  console.log(
    `System Consistency: ${results.consistency?.consistent ? "✅" : "❌"}`
  );
  console.log(`\nOverall Result: ${allTests ? "✅ PASSED" : "❌ FAILED"}`);

  // Export results if running in Node
  if (typeof module !== "undefined") {
    module.exports = {
      results,
      allTests,
    };
  }
} catch (error) {
  console.error("❌ Error during compatibility testing:", error);

  // Export error if running in Node
  if (typeof module !== "undefined") {
    module.exports = { error: error.message };
  }
}
