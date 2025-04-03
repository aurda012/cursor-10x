/**
 * Compatibility Layer with Centralized Init Test
 * Version 1.0.0 (2023)
 *
 * This script tests that the compatibility layer works correctly
 * when loaded through the centralized initialization process.
 */

// Ensure we're testing a fresh state
if (globalThis.CENTRALIZED_INIT_RUNNING)
  delete globalThis.CENTRALIZED_INIT_RUNNING;
if (globalThis.CENTRALIZED_INIT_COMPLETE)
  delete globalThis.CENTRALIZED_INIT_COMPLETE;

// Import required modules
const path = require("path");
const fs = require("fs");

console.log("🧪 TESTING COMPATIBILITY WITHIN CENTRALIZED INITIALIZATION");
console.log("========================================================");

// Track test results
const results = {
  centralized_init: false,
  memory_system: false,
  scratchpad_system: false,
  multi_agent_system: false,
  banner_system: false,
  compatibility: false,
  system_objects: {
    scratchpad: {
      both_exist: false,
      are_identical: false,
    },
    multi_agent: {
      both_exist: false,
      are_identical: false,
    },
  },
};

try {
  // Run the centralized initialization
  console.log("🚀 Running centralized initialization...");

  // Load the centralized initialization module
  const centralizedInitPath = path.join(__dirname, "..", "centralized-init.js");

  if (!fs.existsSync(centralizedInitPath)) {
    throw new Error(
      `Centralized initialization file not found at ${centralizedInitPath}`
    );
  }

  // Execute the centralized initialization
  require(centralizedInitPath);

  // Check if centralized initialization completed
  results.centralized_init = !!globalThis.CENTRALIZED_INIT_COMPLETE;
  console.log(
    `- Centralized Init Complete: ${results.centralized_init ? "✅" : "❌"}`
  );

  // Check individual systems
  console.log("\n🧪 Testing individual systems...");

  // Check Memory System
  results.memory_system = !!globalThis.MEMORY_SYSTEM?.initialized;
  console.log(
    `- Memory System Initialized: ${results.memory_system ? "✅" : "❌"}`
  );

  // Check Scratchpad System
  results.scratchpad_system = !!globalThis.SCRATCHPAD_SYSTEM?.initialized;
  console.log(
    `- Scratchpad System Initialized: ${
      results.scratchpad_system ? "✅" : "❌"
    }`
  );

  // Check Multi-Agent System
  results.multi_agent_system = !!globalThis.MULTI_AGENT_SYSTEM?.initialized;
  console.log(
    `- Multi-Agent System Initialized: ${
      results.multi_agent_system ? "✅" : "❌"
    }`
  );

  // Check Banner System
  results.banner_system = Array.isArray(globalThis.nextResponsePrepend);
  console.log(`- Banner System Ready: ${results.banner_system ? "✅" : "❌"}`);

  // Check Compatibility Layer
  results.compatibility =
    typeof globalThis.validateSystemConsistency === "function";
  console.log(
    `- Compatibility Layer Active: ${results.compatibility ? "✅" : "❌"}`
  );

  // Test system compatibility objects
  console.log("\n🧪 Testing system compatibility objects...");

  // Check Scratchpad System Compatibility
  results.system_objects.scratchpad.both_exist =
    !!globalThis.SCRATCHPAD && !!globalThis.SCRATCHPAD_SYSTEM;

  results.system_objects.scratchpad.are_identical =
    globalThis.SCRATCHPAD === globalThis.SCRATCHPAD_SYSTEM;

  console.log(
    `- Scratchpad Objects Exist: ${
      results.system_objects.scratchpad.both_exist ? "✅" : "❌"
    }`
  );
  console.log(
    `- Scratchpad Objects Identical: ${
      results.system_objects.scratchpad.are_identical ? "✅" : "❌"
    }`
  );

  // Check Multi-Agent System Compatibility
  results.system_objects.multi_agent.both_exist =
    !!globalThis.MULTI_AGENT_SYSTEM && !!globalThis.AGENT_SYSTEM;

  results.system_objects.multi_agent.are_identical =
    globalThis.MULTI_AGENT_SYSTEM === globalThis.AGENT_SYSTEM;

  console.log(
    `- Multi-Agent Objects Exist: ${
      results.system_objects.multi_agent.both_exist ? "✅" : "❌"
    }`
  );
  console.log(
    `- Multi-Agent Objects Identical: ${
      results.system_objects.multi_agent.are_identical ? "✅" : "❌"
    }`
  );

  // Check system consistency
  console.log("\n🧪 Testing system consistency...");

  if (typeof globalThis.validateSystemConsistency === "function") {
    const consistencyResult = globalThis.validateSystemConsistency();

    console.log(
      `- System Consistency: ${consistencyResult.consistent ? "✅" : "❌"}`
    );

    if (!consistencyResult.consistent) {
      console.log(`- Issues found: ${consistencyResult.issues.length}`);
      consistencyResult.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
  } else {
    console.log(`- System Consistency Check: ❌ (Function not available)`);
  }

  // Overall result
  const allTests =
    results.centralized_init &&
    results.memory_system &&
    results.scratchpad_system &&
    results.multi_agent_system &&
    results.banner_system &&
    results.compatibility &&
    results.system_objects.scratchpad.both_exist &&
    results.system_objects.scratchpad.are_identical &&
    results.system_objects.multi_agent.both_exist &&
    results.system_objects.multi_agent.are_identical;

  console.log("\n📊 TEST SUMMARY");
  console.log("==============");
  console.log(
    `Centralized Init Complete: ${results.centralized_init ? "✅" : "❌"}`
  );
  console.log(
    `All Core Systems Active: ${
      results.memory_system &&
      results.scratchpad_system &&
      results.multi_agent_system &&
      results.banner_system
        ? "✅"
        : "❌"
    }`
  );
  console.log(
    `Compatibility Layer Active: ${results.compatibility ? "✅" : "❌"}`
  );
  console.log(
    `System Objects Compatible: ${
      results.system_objects.scratchpad.are_identical &&
      results.system_objects.multi_agent.are_identical
        ? "✅"
        : "❌"
    }`
  );

  console.log(`\nOverall Result: ${allTests ? "✅ PASSED" : "❌ FAILED"}`);

  // Export results
  module.exports = {
    results,
    allTests,
  };
} catch (error) {
  console.error("❌ Error during compatibility testing:", error);
  console.error(error.stack);

  // Export error
  module.exports = { error: error.message };
}
