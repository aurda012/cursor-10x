/**
 * Enhanced Compatibility Layer Test
 * Version 1.0.0
 *
 * This script tests the enhanced compatibility layer and its ability to fix
 * partial system states and ensure ACTIVE status in banners.
 */

console.log("🧪 STARTING ENHANCED COMPATIBILITY TEST\n");

// First, access the original centralized initialization
let centralizedInitPath;
try {
  const path = require("path");
  const fs = require("fs");

  // Try to find the centralized-init.js file
  const possiblePaths = [
    path.join(__dirname, "centralized-init.js"),
    path.join(__dirname, "..", ".cursor", "centralized-init.js"),
    path.join(process.cwd(), ".cursor", "centralized-init.js"),
  ];

  centralizedInitPath = possiblePaths.find((p) => fs.existsSync(p));

  if (!centralizedInitPath) {
    console.error("❌ Could not find centralized-init.js");
    process.exit(1);
  }

  console.log(`📂 Found centralized initialization at: ${centralizedInitPath}`);
} catch (error) {
  console.error("❌ Error finding centralized initialization:", error);
  process.exit(1);
}

// Test phases and results
const results = {
  standardInit: {
    memoryStatus: "NOT TESTED",
    scratchpadStatus: "NOT TESTED",
    enhancedCompatibilityAvailable: false,
  },
  withEnhancedCompat: {
    memoryStatus: "NOT TESTED",
    scratchpadStatus: "NOT TESTED",
    systemCount: 0,
  },
};

// Phase 1: Run the standard centralized initialization
console.log("\n🔍 PHASE 1: Testing standard centralized initialization");

try {
  // First clear globals to ensure a clean test
  if (globalThis.MEMORY_SYSTEM) delete globalThis.MEMORY_SYSTEM;
  if (globalThis.SCRATCHPAD) delete globalThis.SCRATCHPAD;
  if (globalThis.SCRATCHPAD_SYSTEM) delete globalThis.SCRATCHPAD_SYSTEM;
  if (globalThis.MULTI_AGENT_SYSTEM) delete globalThis.MULTI_AGENT_SYSTEM;
  if (globalThis.AGENT_SYSTEM) delete globalThis.AGENT_SYSTEM;
  if (globalThis.nextResponsePrepend) delete globalThis.nextResponsePrepend;
  if (globalThis.BANNER_SYSTEM) delete globalThis.BANNER_SYSTEM;

  console.log("🧹 Cleared globals for clean test");

  // Load the centralized initialization
  require(centralizedInitPath);

  console.log("\n📊 Checking system status after standard initialization:");

  // Check banner system for system status
  if (
    globalThis.BANNER_SYSTEM &&
    typeof globalThis.BANNER_SYSTEM.testMemorySystem === "function"
  ) {
    results.standardInit.memoryStatus =
      globalThis.BANNER_SYSTEM.testMemorySystem();
    console.log(`- Memory System Status: ${results.standardInit.memoryStatus}`);
  } else {
    console.log(
      "❌ Banner System not available or missing testMemorySystem function"
    );
  }

  if (
    globalThis.BANNER_SYSTEM &&
    typeof globalThis.BANNER_SYSTEM.testScratchpadSystem === "function"
  ) {
    results.standardInit.scratchpadStatus =
      globalThis.BANNER_SYSTEM.testScratchpadSystem();
    console.log(
      `- Scratchpad System Status: ${results.standardInit.scratchpadStatus}`
    );
  }

  // Check if enhanced compatibility is available
  results.standardInit.enhancedCompatibilityAvailable =
    typeof globalThis.enhanceCompatibilityLayer === "function";
  console.log(
    `- Enhanced Compatibility Available: ${results.standardInit.enhancedCompatibilityAvailable}`
  );

  // Check banner output
  if (Array.isArray(globalThis.nextResponsePrepend)) {
    console.log("\n📢 Current Banners:");
    globalThis.nextResponsePrepend.forEach((banner) => {
      console.log(`  ${banner}`);
    });
  }
} catch (error) {
  console.error("❌ Error during standard initialization test:", error);
}

// Phase 2: Run with enhanced compatibility
console.log("\n🔍 PHASE 2: Testing with enhanced compatibility layer");

try {
  // Clean up from previous test
  delete require.cache[require.resolve(centralizedInitPath)];

  // Clear globals
  if (globalThis.MEMORY_SYSTEM) delete globalThis.MEMORY_SYSTEM;
  if (globalThis.SCRATCHPAD) delete globalThis.SCRATCHPAD;
  if (globalThis.SCRATCHPAD_SYSTEM) delete globalThis.SCRATCHPAD_SYSTEM;
  if (globalThis.MULTI_AGENT_SYSTEM) delete globalThis.MULTI_AGENT_SYSTEM;
  if (globalThis.AGENT_SYSTEM) delete globalThis.AGENT_SYSTEM;
  if (globalThis.nextResponsePrepend) delete globalThis.nextResponsePrepend;
  if (globalThis.BANNER_SYSTEM) delete globalThis.BANNER_SYSTEM;

  // Path to enhanced compatibility module
  const path = require("path");
  const fixesPath = path.join(__dirname, "fixes", "enhance-compatibility.js");

  console.log(`📂 Loading enhanced compatibility from: ${fixesPath}`);

  try {
    require(fixesPath);
    console.log("✅ Enhanced compatibility layer loaded");
  } catch (error) {
    console.error("❌ Error loading enhanced compatibility layer:", error);
  }

  // Now load the centralized initialization
  require(centralizedInitPath);

  console.log("\n📊 Checking system status after enhanced initialization:");

  // Check banner system for system status
  if (
    globalThis.BANNER_SYSTEM &&
    typeof globalThis.BANNER_SYSTEM.testMemorySystem === "function"
  ) {
    results.withEnhancedCompat.memoryStatus =
      globalThis.BANNER_SYSTEM.testMemorySystem();
    console.log(
      `- Memory System Status: ${results.withEnhancedCompat.memoryStatus}`
    );
  } else {
    console.log(
      "❌ Banner System not available or missing testMemorySystem function"
    );
  }

  if (
    globalThis.BANNER_SYSTEM &&
    typeof globalThis.BANNER_SYSTEM.testScratchpadSystem === "function"
  ) {
    results.withEnhancedCompat.scratchpadStatus =
      globalThis.BANNER_SYSTEM.testScratchpadSystem();
    console.log(
      `- Scratchpad System Status: ${results.withEnhancedCompat.scratchpadStatus}`
    );
  }

  // Count active systems from banners
  if (Array.isArray(globalThis.nextResponsePrepend)) {
    console.log("\n📢 Current Banners with Enhanced Compatibility:");
    globalThis.nextResponsePrepend.forEach((banner) => {
      console.log(`  ${banner}`);

      // Count active systems
      if (banner.includes("ACTIVE SYSTEMS:")) {
        const match = banner.match(/ACTIVE SYSTEMS: (\d+)\/\d+/);
        if (match && match[1]) {
          results.withEnhancedCompat.systemCount = parseInt(match[1], 10);
        }
      }
    });
  }
} catch (error) {
  console.error("❌ Error during enhanced compatibility test:", error);
}

// Final results
console.log("\n📋 TEST RESULTS SUMMARY:");
console.log("Phase 1 (Standard Initialization):");
console.log(`- Memory System: ${results.standardInit.memoryStatus}`);
console.log(`- Scratchpad System: ${results.standardInit.scratchpadStatus}`);
console.log(
  `- Enhanced Compatibility Available: ${results.standardInit.enhancedCompatibilityAvailable}`
);

console.log("\nPhase 2 (With Enhanced Compatibility):");
console.log(`- Memory System: ${results.withEnhancedCompat.memoryStatus}`);
console.log(
  `- Scratchpad System: ${results.withEnhancedCompat.scratchpadStatus}`
);
console.log(
  `- Active Systems Count: ${results.withEnhancedCompat.systemCount}/4`
);

// Overall test result
const improvement =
  (results.withEnhancedCompat.memoryStatus === "ACTIVE" &&
    results.standardInit.memoryStatus !== "ACTIVE") ||
  (results.withEnhancedCompat.scratchpadStatus === "ACTIVE" &&
    results.standardInit.scratchpadStatus !== "ACTIVE");

console.log("\n🏁 OVERALL TEST RESULT:");
if (improvement) {
  console.log(
    "✅ PASSED - Enhanced compatibility layer improved system status"
  );
} else if (
  results.withEnhancedCompat.memoryStatus === "ACTIVE" &&
  results.withEnhancedCompat.scratchpadStatus === "ACTIVE"
) {
  console.log("✅ PASSED - All systems already at ACTIVE status");
} else {
  console.log(
    "❌ FAILED - Enhanced compatibility did not improve system status"
  );
}

// Export results for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    standardInit: results.standardInit,
    withEnhancedCompat: results.withEnhancedCompat,
    improvement,
  };
}
