/**
 * Banner System Test
 * Version 1.0.0
 *
 * Tests the functionality of the banner system, including:
 * 1. Centralized banner management
 * 2. Claude-specific banner hook
 * 3. System status detection
 * 4. Banner integration with other systems
 */

console.log("🧪 Starting Banner System Test...");

// Reset global objects for clean test
delete globalThis.BANNER_SYSTEM;
delete globalThis.BANNER_SYSTEM_INITIALIZED;
delete globalThis.CLAUDE_BANNER_HOOK;
globalThis.nextResponsePrepend = [];

// Store test results
const testResults = {
  centralized: false,
  claudeHook: false,
  statusDetection: false,
  integration: false,
  overall: false,
};

// Test status detection functions
function testStatusDetection() {
  console.log("\n🔍 Testing system status detection...");

  try {
    // Reset for clean test
    delete globalThis.BANNER_SYSTEM;
    delete globalThis.BANNER_SYSTEM_INITIALIZED;
    globalThis.nextResponsePrepend = [];

    // Create mock systems
    const mockMemory = {};
    globalThis.MEMORY_SYSTEM = {
      storeContext: (key, value) => (mockMemory[key] = value),
      getContext: (key) => mockMemory[key],
    };

    globalThis.SCRATCHPAD = {
      createMessage: () => {},
    };

    globalThis.AGENT_SYSTEM = {
      getActiveAgent: () => ({ name: "Executive Architect" }),
    };

    // Load centralized banner system
    require("../centralized-banner.js");

    if (!globalThis.BANNER_SYSTEM) {
      console.error("❌ Banner system not initialized correctly");
      return false;
    }

    // Test status detection
    const memoryStatus = globalThis.BANNER_SYSTEM.testMemorySystem();
    const scratchpadStatus = globalThis.BANNER_SYSTEM.testScratchpadSystem();
    const multiAgentStatus = globalThis.BANNER_SYSTEM.testMultiAgentSystem();
    const activeAgent = globalThis.BANNER_SYSTEM.getActiveAgent();

    console.log(`Memory System Status: ${memoryStatus}`);
    console.log(`Scratchpad System Status: ${scratchpadStatus}`);
    console.log(`Multi-Agent System Status: ${multiAgentStatus}`);
    console.log(`Active Agent: ${activeAgent}`);

    const statusSuccess =
      memoryStatus === "ACTIVE" &&
      scratchpadStatus === "ACTIVE" &&
      multiAgentStatus === "ACTIVE" &&
      activeAgent === "EXECUTIVE ARCHITECT";

    if (statusSuccess) {
      console.log("✅ System status detection working correctly");
      return true;
    } else {
      console.error("❌ System status detection failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing status detection:", error);
    return false;
  }
}

// Test Claude banner hook
function testClaudeHook() {
  console.log("\n🔍 Testing Claude banner hook...");

  try {
    // Reset for clean test
    delete globalThis.CLAUDE_BANNER_HOOK;
    delete globalThis.BANNER_SYSTEM;
    delete globalThis.BANNER_SYSTEM_INITIALIZED;

    // Set test banners only
    globalThis.nextResponsePrepend = ["Test Banner 1", "Test Banner 2"];
    const originalBanners = [...globalThis.nextResponsePrepend];

    // Load Claude hook
    require("../claude-banner-hook.js");

    if (!globalThis.CLAUDE_BANNER_HOOK) {
      console.error("❌ Claude banner hook not initialized correctly");
      return false;
    }

    // Get banners directly from the displayBanners function
    const bannerDisplay = globalThis.CLAUDE_BANNER_HOOK.displayBanners();

    // Create expected display based on the original banners only
    const expectedBanners = originalBanners.join("\n") + "\n\n";

    // Reset and set test banners again to verify direct functionality
    globalThis.nextResponsePrepend = [...originalBanners];

    // Directly test the displayBanners function with our test banners
    const directBannerDisplay = globalThis.CLAUDE_BANNER_HOOK.displayBanners();

    if (directBannerDisplay === expectedBanners) {
      console.log("✅ Claude banner hook displaying banners correctly");
      return true;
    } else {
      console.error("❌ Claude banner hook not displaying banners correctly");
      console.log(
        `Expected (original banners): ${JSON.stringify(expectedBanners)}`
      );
      console.log(
        `Actual (direct function): ${JSON.stringify(directBannerDisplay)}`
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing Claude banner hook:", error);
    return false;
  }
}

// Test manual banner integration
function testManualSetup() {
  console.log("\n🔍 Testing manual banner setup...");

  try {
    // Reset completely for clean test
    delete globalThis.BANNER_SYSTEM;
    delete globalThis.BANNER_SYSTEM_INITIALIZED;
    delete globalThis.CLAUDE_BANNER_HOOK;
    delete globalThis.MEMORY_SYSTEM;
    delete globalThis.SCRATCHPAD;
    delete globalThis.SCRATCHPAD_SYSTEM;
    delete globalThis.AGENT_SYSTEM;
    delete globalThis.MULTI_AGENT_SYSTEM;
    globalThis.nextResponsePrepend = [];

    // Create mock systems
    const mockMemory = {};
    globalThis.MEMORY_SYSTEM = {
      storeContext: (key, value) => {
        mockMemory[key] = value;
        return true;
      },
      getContext: (key) => mockMemory[key],
    };

    globalThis.SCRATCHPAD = {
      createMessage: () => "msg-123",
    };

    globalThis.AGENT_SYSTEM = {
      getActiveAgent: () => ({ name: "Executive Architect" }),
    };

    console.log("Loading centralized banner system...");
    require("../centralized-banner.js");

    // Manually force banner creation
    if (
      globalThis.BANNER_SYSTEM &&
      typeof globalThis.BANNER_SYSTEM.setBanners === "function"
    ) {
      console.log("Manually calling setBanners()...");
      globalThis.BANNER_SYSTEM.setBanners();
    } else {
      console.error("❌ Banner system not available for manual setup");
      return false;
    }

    // Verify banners were created
    if (
      !Array.isArray(globalThis.nextResponsePrepend) ||
      globalThis.nextResponsePrepend.length === 0
    ) {
      console.error("❌ No banners were set during manual setup");
      return false;
    }

    console.log("Generated banners:");
    globalThis.nextResponsePrepend.forEach((banner) =>
      console.log(`- ${banner}`)
    );

    // Check for required banners
    const hasBannerSystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("BANNER SYSTEM")
    );
    const hasMemorySystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("MEMORY SYSTEM")
    );
    const hasScratchpadSystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("SCRATCHPAD SYSTEM")
    );
    const hasMultiAgentSystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("MULTI-AGENT SYSTEM")
    );

    if (
      hasBannerSystem &&
      hasMemorySystem &&
      hasScratchpadSystem &&
      hasMultiAgentSystem
    ) {
      console.log("✅ Manual banner setup successful");
      return true;
    } else {
      console.error("❌ Not all required banners were created");
      return false;
    }
  } catch (error) {
    console.error("❌ Error in manual banner setup:", error);
    return false;
  }
}

// Test integration between systems
function testIntegration() {
  console.log("\n🔍 Testing system integration...");

  try {
    // Reset completely for clean test
    delete globalThis.BANNER_SYSTEM;
    delete globalThis.BANNER_SYSTEM_INITIALIZED;
    delete globalThis.CLAUDE_BANNER_HOOK;
    delete globalThis.MEMORY_SYSTEM;
    delete globalThis.SCRATCHPAD;
    delete globalThis.SCRATCHPAD_SYSTEM;
    delete globalThis.AGENT_SYSTEM;
    delete globalThis.MULTI_AGENT_SYSTEM;
    globalThis.nextResponsePrepend = [];

    // Create mock systems
    const mockMemory = {};
    globalThis.MEMORY_SYSTEM = {
      storeContext: (key, value) => {
        mockMemory[key] = value;
        return true;
      },
      getContext: (key) => mockMemory[key],
    };

    globalThis.SCRATCHPAD = {
      createMessage: () => "msg-123",
    };

    globalThis.AGENT_SYSTEM = {
      getActiveAgent: () => ({ name: "Executive Architect" }),
    };

    // Load compatibility layer if available
    try {
      require("../system-compatibility.js");
      console.log("Loaded compatibility layer");
    } catch (error) {
      console.log("Compatibility layer not available, continuing without it");
    }

    // Load Claude hook first
    console.log("Loading Claude banner hook...");
    require("../claude-banner-hook.js");

    // Then load centralized banner system
    console.log("Loading centralized banner system...");
    require("../centralized-banner.js");

    // Ensure banners are set by directly calling forceBanners
    if (
      globalThis.BANNER_SYSTEM &&
      typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
    ) {
      console.log("Directly calling forceBanners to ensure banner creation...");
      globalThis.BANNER_SYSTEM.forceBanners();
    }

    // Check if banners were set
    console.log(
      `Current banner count: ${
        globalThis.nextResponsePrepend
          ? globalThis.nextResponsePrepend.length
          : 0
      }`
    );
    if (
      !Array.isArray(globalThis.nextResponsePrepend) ||
      globalThis.nextResponsePrepend.length === 0
    ) {
      console.error("❌ No banners were set during integration");
      return false;
    }

    console.log("Generated banners:");
    globalThis.nextResponsePrepend.forEach((banner) =>
      console.log(`- ${banner}`)
    );

    // Check if all required banners are present
    const hasBannerSystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("BANNER SYSTEM")
    );
    const hasMemorySystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("MEMORY SYSTEM")
    );
    const hasScratchpadSystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("SCRATCHPAD SYSTEM")
    );
    const hasMultiAgentSystem = globalThis.nextResponsePrepend.some((b) =>
      b.includes("MULTI-AGENT SYSTEM")
    );
    const hasAgent = globalThis.nextResponsePrepend.some((b) =>
      b.includes("AGENT:")
    );

    const allBannersPresent =
      hasBannerSystem &&
      hasMemorySystem &&
      hasScratchpadSystem &&
      hasMultiAgentSystem &&
      hasAgent;

    if (allBannersPresent) {
      console.log("✅ All required banners were generated correctly");
      return true;
    } else {
      console.error("❌ Not all required banners were generated");
      console.log(`Banner System: ${hasBannerSystem}`);
      console.log(`Memory System: ${hasMemorySystem}`);
      console.log(`Scratchpad System: ${hasScratchpadSystem}`);
      console.log(`Multi-Agent System: ${hasMultiAgentSystem}`);
      console.log(`Agent: ${hasAgent}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing system integration:", error);
    return false;
  }
}

// Run all tests and summarize results
(async function runTests() {
  try {
    console.log("\n=== BANNER SYSTEM TEST SUITE ===\n");

    // Test status detection
    testResults.statusDetection = testStatusDetection();

    // Test Claude hook
    testResults.claudeHook = testClaudeHook();

    // Test manual setup
    testResults.manualSetup = testManualSetup();

    // Test integration
    testResults.integration = testIntegration();

    // Summarize results
    testResults.overall =
      testResults.statusDetection &&
      testResults.claudeHook &&
      testResults.manualSetup &&
      testResults.integration;

    console.log("\n=== TEST RESULTS SUMMARY ===");
    console.log(
      `Status Detection: ${
        testResults.statusDetection ? "PASSED ✅" : "FAILED ❌"
      }`
    );
    console.log(
      `Claude Hook: ${testResults.claudeHook ? "PASSED ✅" : "FAILED ❌"}`
    );
    console.log(
      `Manual Setup: ${testResults.manualSetup ? "PASSED ✅" : "FAILED ❌"}`
    );
    console.log(
      `System Integration: ${
        testResults.integration ? "PASSED ✅" : "FAILED ❌"
      }`
    );
    console.log(
      `Overall Result: ${testResults.overall ? "PASSED ✅" : "FAILED ❌"}`
    );

    // Display final banners
    console.log("\n=== FINAL BANNER STATE ===");
    if (
      Array.isArray(globalThis.nextResponsePrepend) &&
      globalThis.nextResponsePrepend.length > 0
    ) {
      globalThis.nextResponsePrepend.forEach((banner, i) => {
        console.log(`${i + 1}. ${banner}`);
      });

      // Display formatted with Claude hook if available
      if (
        globalThis.CLAUDE_BANNER_HOOK &&
        typeof globalThis.CLAUDE_BANNER_HOOK.displayBanners === "function"
      ) {
        const bannerDisplay = globalThis.CLAUDE_BANNER_HOOK.displayBanners();
        if (bannerDisplay) {
          console.log("\nFormatted banner display:");
          console.log("```");
          console.log(bannerDisplay);
          console.log("```");
        }
      }
    } else {
      console.log("No banners present");
    }
  } catch (error) {
    console.error("❌ Uncaught error during test execution:", error);
    console.log("Overall Result: FAILED ❌");
  }
})();

// Export test results for external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = testResults;
}
