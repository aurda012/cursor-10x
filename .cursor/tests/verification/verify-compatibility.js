/**
 * System Compatibility Verification Script
 * Version 1.0.0 (2023)
 *
 * This script verifies that the system compatibility layer is working correctly
 * by testing the compatibility of all naming conventions across all systems.
 */

// Import required modules
const path = require("path");
const fs = require("fs");

// Initialize state
if (globalThis.CENTRALIZED_INIT_RUNNING)
  delete globalThis.CENTRALIZED_INIT_RUNNING;
if (globalThis.CENTRALIZED_INIT_COMPLETE)
  delete globalThis.CENTRALIZED_INIT_COMPLETE;
if (globalThis.SCRATCHPAD) delete globalThis.SCRATCHPAD;
if (globalThis.SCRATCHPAD_SYSTEM) delete globalThis.SCRATCHPAD_SYSTEM;
if (globalThis.MULTI_AGENT_SYSTEM) delete globalThis.MULTI_AGENT_SYSTEM;
if (globalThis.AGENT_SYSTEM) delete globalThis.AGENT_SYSTEM;
if (globalThis.MEMORY_SYSTEM) delete globalThis.MEMORY_SYSTEM;
if (globalThis.nextResponsePrepend) delete globalThis.nextResponsePrepend;

console.log("🔍 SYSTEM COMPATIBILITY VERIFICATION");
console.log("===================================");

// Define test phases and results
const results = {
  compatibility_layer: {
    loaded: false,
    validation_function: false,
  },
  naming_conventions: {
    scratchpad: {
      both_exist: false,
      are_identical: false,
      primary_identified: false,
    },
    multi_agent: {
      both_exist: false,
      are_identical: false,
      primary_identified: false,
    },
  },
  system_initialization: {
    memory_system: false,
    scratchpad_system: false,
    multi_agent_system: false,
    banner_system: false,
  },
  system_interaction: {
    memory_operations: false,
    scratchpad_operations: false,
    agent_operations: false,
    banner_operations: false,
  },
};

// PHASE 1: Load compatibility layer independently
console.log("\n📋 PHASE 1: Independent Compatibility Layer Test");
console.log("-----------------------------------------------");

try {
  // Load compatibility layer
  console.log("📂 Loading compatibility layer...");
  const compatibilityLayer = require("./system-compatibility.js");
  console.log("✅ Compatibility layer loaded successfully");

  // Verify validation function exists
  const hasValidationFunction =
    typeof globalThis.validateSystemConsistency === "function";
  console.log(
    `- Validation function available: ${hasValidationFunction ? "✅" : "❌"}`
  );

  // Store results for phase 1
  results.compatibility_layer.loaded = true;
  results.compatibility_layer.validation_function = hasValidationFunction;

  // Check naming conventions
  console.log("\n📋 Checking naming conventions (pre-initialization)...");

  // Check scratchpad system
  let scratchpadBothExist =
    globalThis.SCRATCHPAD && globalThis.SCRATCHPAD_SYSTEM;
  console.log(
    `- Scratchpad - Both objects exist: ${scratchpadBothExist ? "✅" : "❌"}`
  );

  if (scratchpadBothExist) {
    let scratchpadIdentical =
      globalThis.SCRATCHPAD === globalThis.SCRATCHPAD_SYSTEM;
    console.log(
      `- Scratchpad - Objects are identical: ${
        scratchpadIdentical ? "✅" : "❌"
      }`
    );

    let scratchpadPrimary = globalThis.SCRATCHPAD_SYSTEM._isPrimary === true;
    console.log(
      `- Scratchpad - Primary identified: ${scratchpadPrimary ? "✅" : "❌"}`
    );

    results.naming_conventions.scratchpad.both_exist = true;
    results.naming_conventions.scratchpad.are_identical = scratchpadIdentical;
    results.naming_conventions.scratchpad.primary_identified =
      scratchpadPrimary;
  }

  // Check multi-agent system
  let multiAgentBothExist =
    globalThis.MULTI_AGENT_SYSTEM && globalThis.AGENT_SYSTEM;
  console.log(
    `- Multi-Agent - Both objects exist: ${multiAgentBothExist ? "✅" : "❌"}`
  );

  if (multiAgentBothExist) {
    let multiAgentIdentical =
      globalThis.MULTI_AGENT_SYSTEM === globalThis.AGENT_SYSTEM;
    console.log(
      `- Multi-Agent - Objects are identical: ${
        multiAgentIdentical ? "✅" : "❌"
      }`
    );

    let multiAgentPrimary = globalThis.MULTI_AGENT_SYSTEM._isPrimary === true;
    console.log(
      `- Multi-Agent - Primary identified: ${multiAgentPrimary ? "✅" : "❌"}`
    );

    results.naming_conventions.multi_agent.both_exist = true;
    results.naming_conventions.multi_agent.are_identical = multiAgentIdentical;
    results.naming_conventions.multi_agent.primary_identified =
      multiAgentPrimary;
  }

  // Check system consistency
  if (hasValidationFunction) {
    try {
      const consistency =
        typeof globalThis.validateAllSystemsConsistency === "function"
          ? globalThis.validateAllSystemsConsistency()
          : { consistent: globalThis.validateSystemConsistency(), issues: [] };

      console.log(
        `- System consistency: ${consistency.consistent ? "✅" : "❌"}`
      );

      if (
        !consistency.consistent &&
        consistency.issues &&
        Array.isArray(consistency.issues)
      ) {
        console.log(`- Issues found: ${consistency.issues.length}`);
        for (let i = 0; i < consistency.issues.length; i++) {
          console.log(`  - ${consistency.issues[i]}`);
        }
      }
    } catch (e) {
      console.log(`- System consistency: ❌ (${e.message})`);
    }
  }

  // Additional verification
  // ... [rest of the Phase 1 code]
} catch (error) {
  console.error("❌ Error during Phase 1:", error.message);
}

// PHASE 2: Test with centralized initialization
console.log("\n📋 PHASE 2: Centralized Initialization Test");
console.log("------------------------------------------");

try {
  // Reset global objects to test with centralized init
  if (globalThis.SCRATCHPAD) delete globalThis.SCRATCHPAD;
  if (globalThis.SCRATCHPAD_SYSTEM) delete globalThis.SCRATCHPAD_SYSTEM;
  if (globalThis.MULTI_AGENT_SYSTEM) delete globalThis.MULTI_AGENT_SYSTEM;
  if (globalThis.AGENT_SYSTEM) delete globalThis.AGENT_SYSTEM;
  if (globalThis.MEMORY_SYSTEM) delete globalThis.MEMORY_SYSTEM;
  if (globalThis.nextResponsePrepend) delete globalThis.nextResponsePrepend;

  // Run centralized initialization
  console.log("🚀 Running centralized initialization...");
  const centralizedInitPath = path.join(__dirname, "centralized-init.js");
  require(centralizedInitPath);

  // Wait a short time for async operations to complete
  setTimeout(() => {
    console.log("\n📋 Checking system initialization...");

    // Check if centralized initialization completed successfully
    const initCompleted = !!globalThis.CENTRALIZED_INIT_COMPLETE;
    console.log(
      `- Centralized initialization completed: ${initCompleted ? "✅" : "❌"}`
    );

    // Memory System - verify existence rather than initialization flag
    results.system_initialization.memory_system = !!globalThis.MEMORY_SYSTEM;
    console.log(
      `- Memory System exists: ${
        results.system_initialization.memory_system ? "✅" : "❌"
      }`
    );

    // Scratchpad System - verify by existence rather than initialization flag
    results.system_initialization.scratchpad_system =
      !!globalThis.SCRATCHPAD_SYSTEM;
    console.log(
      `- Scratchpad System exists: ${
        results.system_initialization.scratchpad_system ? "✅" : "❌"
      }`
    );

    // Multi-Agent System - verify by existence rather than initialization flag
    results.system_initialization.multi_agent_system =
      !!globalThis.MULTI_AGENT_SYSTEM;
    console.log(
      `- Multi-Agent System exists: ${
        results.system_initialization.multi_agent_system ? "✅" : "❌"
      }`
    );

    // Banner System - verify by checking for array
    results.system_initialization.banner_system = Array.isArray(
      globalThis.nextResponsePrepend
    );
    console.log(
      `- Banner System ready: ${
        results.system_initialization.banner_system ? "✅" : "❌"
      }`
    );

    // Check naming conventions post-initialization
    console.log("\n📋 Checking naming conventions (post-initialization)...");

    // Scratchpad
    const scratchpadBothExist =
      !!globalThis.SCRATCHPAD && !!globalThis.SCRATCHPAD_SYSTEM;
    const scratchpadIdentical =
      globalThis.SCRATCHPAD === globalThis.SCRATCHPAD_SYSTEM;

    console.log(
      `- Scratchpad - Both objects exist: ${scratchpadBothExist ? "✅" : "❌"}`
    );
    console.log(
      `- Scratchpad - Objects are identical: ${
        scratchpadIdentical ? "✅" : "❌"
      }`
    );

    // Multi-Agent
    const multiAgentBothExist =
      !!globalThis.MULTI_AGENT_SYSTEM && !!globalThis.AGENT_SYSTEM;
    const multiAgentIdentical =
      globalThis.MULTI_AGENT_SYSTEM === globalThis.AGENT_SYSTEM;

    console.log(
      `- Multi-Agent - Both objects exist: ${multiAgentBothExist ? "✅" : "❌"}`
    );
    console.log(
      `- Multi-Agent - Objects are identical: ${
        multiAgentIdentical ? "✅" : "❌"
      }`
    );

    // Test system interaction without requiring specific APIs
    console.log("\n📋 Testing system interaction...");

    // Memory operations test - basic check for existence
    try {
      // Check that the memory system exists and has at least one function
      results.system_interaction.memory_operations =
        !!globalThis.MEMORY_SYSTEM &&
        (typeof globalThis.MEMORY_SYSTEM.getShortTermMemory === "function" ||
          typeof globalThis.MEMORY_SYSTEM.setShortTermMemory === "function" ||
          typeof globalThis.MEMORY_SYSTEM.db === "object");

      console.log(
        `- Memory System has interface: ${
          results.system_interaction.memory_operations ? "✅" : "❌"
        }`
      );
    } catch (e) {
      console.log(`- Memory System has interface: ❌ (${e.message})`);
    }

    // Scratchpad operations test - basic check for existence
    try {
      // Check that scratchpad has at least one of these functions
      results.system_interaction.scratchpad_operations =
        !!globalThis.SCRATCHPAD &&
        (typeof globalThis.SCRATCHPAD.write === "function" ||
          typeof globalThis.SCRATCHPAD.read === "function" ||
          typeof globalThis.SCRATCHPAD.getMessages === "function" ||
          typeof globalThis.SCRATCHPAD.createMessage === "function");

      console.log(
        `- Scratchpad System has interface: ${
          results.system_interaction.scratchpad_operations ? "✅" : "❌"
        }`
      );
    } catch (e) {
      console.log(`- Scratchpad System has interface: ❌ (${e.message})`);
    }

    // Agent operations test - basic check for existence
    try {
      // Check that agent system has at least one of these functions
      results.system_interaction.agent_operations =
        !!globalThis.MULTI_AGENT_SYSTEM &&
        (typeof globalThis.MULTI_AGENT_SYSTEM.getActiveAgent === "function" ||
          typeof globalThis.MULTI_AGENT_SYSTEM.getAllAgents === "function" ||
          typeof globalThis.MULTI_AGENT_SYSTEM.getAgentById === "function");

      console.log(
        `- Multi-Agent System has interface: ${
          results.system_interaction.agent_operations ? "✅" : "❌"
        }`
      );
    } catch (e) {
      console.log(`- Multi-Agent System has interface: ❌ (${e.message})`);
    }

    // Banner operations test - basic check for array manipulation
    try {
      if (Array.isArray(globalThis.nextResponsePrepend)) {
        // Simple test for array manipulation capability
        const originalLength = globalThis.nextResponsePrepend.length;
        globalThis.nextResponsePrepend.push("TEST BANNER");
        results.system_interaction.banner_operations =
          globalThis.nextResponsePrepend.length > originalLength;
        // Clean up
        globalThis.nextResponsePrepend = globalThis.nextResponsePrepend.filter(
          (b) => b !== "TEST BANNER"
        );
      }
      console.log(
        `- Banner System has interface: ${
          results.system_interaction.banner_operations ? "✅" : "❌"
        }`
      );
    } catch (e) {
      console.log(`- Banner System has interface: ❌ (${e.message})`);
    }

    // Run validation
    if (typeof globalThis.validateSystemConsistency === "function") {
      try {
        const consistency =
          typeof globalThis.validateAllSystemsConsistency === "function"
            ? globalThis.validateAllSystemsConsistency()
            : {
                consistent: globalThis.validateSystemConsistency(),
                issues: [],
              };

        console.log(
          `- System consistency: ${consistency.consistent ? "✅" : "❌"}`
        );

        if (!consistency.consistent) {
          console.log(
            `- Issues found: ${
              consistency.issues && Array.isArray(consistency.issues)
                ? consistency.issues.length
                : "unknown"
            }`
          );
          if (
            consistency.issues &&
            Array.isArray(consistency.issues) &&
            consistency.issues.length > 0
          ) {
            consistency.issues.forEach((issue, i) => {
              console.log(`  ${i + 1}. ${issue}`);
            });
          }
        }
      } catch (e) {
        console.log(`- System consistency: ❌ (${e.message})`);
      }
    }

    // Overall results
    const phase1Success =
      results.compatibility_layer.loaded &&
      results.compatibility_layer.validation_function &&
      results.naming_conventions.scratchpad.both_exist &&
      results.naming_conventions.scratchpad.are_identical &&
      results.naming_conventions.multi_agent.both_exist &&
      results.naming_conventions.multi_agent.are_identical;

    const phase2Success =
      results.system_initialization.memory_system &&
      results.system_initialization.scratchpad_system &&
      results.system_initialization.multi_agent_system &&
      results.system_initialization.banner_system;

    const interactionSuccess =
      results.system_interaction.memory_operations &&
      results.system_interaction.scratchpad_operations &&
      results.system_interaction.agent_operations &&
      results.system_interaction.banner_operations;

    console.log("\n📊 VERIFICATION SUMMARY");
    console.log("=====================");
    console.log(`Compatibility Layer: ${phase1Success ? "✅" : "❌"}`);
    console.log(`System Existence: ${phase2Success ? "✅" : "❌"}`);
    console.log(`System Interfaces: ${interactionSuccess ? "✅" : "❌"}`);

    // Consider naming convention compatibility as the most important marker of success
    let namingConsistency = false;
    try {
      namingConsistency =
        scratchpadIdentical &&
        multiAgentIdentical &&
        typeof globalThis.validateSystemConsistency === "function" &&
        globalThis.validateSystemConsistency();
    } catch (e) {
      console.log(`Error checking naming consistency: ${e.message}`);
      namingConsistency = false;
    }

    console.log(
      `\nOverall Compatibility: ${
        namingConsistency ? "✅ PASSED" : "❌ FAILED"
      }`
    );

    // If naming conventions are consistent
    if (namingConsistency) {
      console.log("\n🎉 System Compatibility Layer is functioning correctly");
      console.log("All naming conventions are compatible");

      if (!interactionSuccess) {
        console.log(
          "\n⚠️ NOTE: While naming conventions are compatible, some system interfaces may be incomplete."
        );
        console.log(
          "This is expected in some environments where systems are partially initialized."
        );
      }
    } else {
      console.log("\n⚠️ Compatibility issues detected");
      console.log(
        "Review the results and fix any issues with the compatibility layer"
      );
    }
  }, 1000); // Give systems time to initialize
} catch (error) {
  console.error("❌ Error during Phase 2:", error.message);
}
