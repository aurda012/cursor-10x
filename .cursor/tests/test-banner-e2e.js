/**
 * End-to-End Banner System Test
 * Version 1.0.0
 *
 * A simpler test that verifies the banner system works in actual usage.
 */

console.log("🧪 Starting End-to-End Banner System Test...");

// Clean slate for testing
delete globalThis.BANNER_SYSTEM;
delete globalThis.BANNER_SYSTEM_INITIALIZED;
delete globalThis.CLAUDE_BANNER_HOOK;
delete globalThis.MEMORY_SYSTEM;
delete globalThis.SCRATCHPAD;
delete globalThis.SCRATCHPAD_SYSTEM;
delete globalThis.AGENT_SYSTEM;
delete globalThis.MULTI_AGENT_SYSTEM;
globalThis.nextResponsePrepend = [];

// Test status
let success = false;

// Test function
async function runTest() {
  try {
    console.log("🔧 Setting up test environment...");

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
      createMessage: (from, to, content) => {
        console.log(`Message from ${from} to ${to}: ${content}`);
        return "msg-" + Date.now();
      },
    };

    globalThis.AGENT_SYSTEM = {
      getActiveAgent: () => ({
        name: "Executive Architect",
        id: "executive-architect",
        emoji: "👑",
      }),
    };

    // Test some basic system functionality
    globalThis.MEMORY_SYSTEM.storeContext("test-key", "test-value");
    console.log(
      `Memory test: ${globalThis.MEMORY_SYSTEM.getContext("test-key")}`
    );

    const msgId = globalThis.SCRATCHPAD.createMessage(
      "test",
      "system",
      "Test message"
    );
    console.log(`Created message with ID: ${msgId}`);

    const agent = globalThis.AGENT_SYSTEM.getActiveAgent();
    console.log(`Active agent: ${agent.name} (${agent.emoji})`);

    // Load system compatibility layer
    console.log("\n📦 Loading system compatibility layer...");
    try {
      require("../system-compatibility.js");
      console.log("✅ Compatibility layer loaded successfully");
    } catch (error) {
      console.log(
        "⚠️ Compatibility layer not available, continuing without it"
      );
    }

    // Load Claude banner hook
    console.log("\n📦 Loading Claude banner hook...");
    require("../claude-banner-hook.js");
    console.log("✅ Claude hook loaded successfully");

    // Load centralized banner system
    console.log("\n📦 Loading centralized banner system...");
    require("../centralized-banner.js");
    console.log("✅ Banner system loaded successfully");

    // Check if banners were created automatically
    console.log("\n🔍 Checking banners...");
    if (
      !Array.isArray(globalThis.nextResponsePrepend) ||
      globalThis.nextResponsePrepend.length === 0
    ) {
      console.log(
        "⚠️ No banners were automatically created, manually triggering banner creation"
      );

      // Manually call banner creation if needed
      if (globalThis.BANNER_SYSTEM) {
        if (typeof globalThis.BANNER_SYSTEM.setBanners === "function") {
          globalThis.BANNER_SYSTEM.setBanners();
          console.log("✅ Manually called setBanners()");
        } else if (
          typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
        ) {
          globalThis.BANNER_SYSTEM.forceBanners();
          console.log("✅ Manually called forceBanners()");
        }
      } else {
        console.error("❌ Banner system not available");
        return false;
      }
    }

    // Now check banners after potential manual creation
    if (
      !Array.isArray(globalThis.nextResponsePrepend) ||
      globalThis.nextResponsePrepend.length === 0
    ) {
      console.error("❌ Failed to create any banners");
      return false;
    }

    // Report the banners
    console.log(`\n📊 Found ${globalThis.nextResponsePrepend.length} banners:`);
    globalThis.nextResponsePrepend.forEach((banner, i) => {
      console.log(`${i + 1}. ${banner}`);
    });

    // Verify Claude hook integration
    console.log("\n🔍 Testing Claude hook integration...");
    if (
      globalThis.CLAUDE_BANNER_HOOK &&
      typeof globalThis.CLAUDE_BANNER_HOOK.displayBanners === "function"
    ) {
      const display = globalThis.CLAUDE_BANNER_HOOK.displayBanners();
      console.log("Claude would display the following:\n```");
      console.log(display);
      console.log("```");

      if (
        display &&
        display.includes("[MEMORY SYSTEM:") &&
        display.includes("[BANNER SYSTEM:")
      ) {
        console.log("✅ Claude hook integration successful");
      } else {
        console.error("❌ Claude hook not returning proper banner display");
        return false;
      }
    } else {
      console.error(
        "❌ Claude hook not available or missing displayBanners method"
      );
      return false;
    }

    // Test banner refreshing
    console.log("\n🔄 Testing banner refresh...");
    if (
      globalThis.BANNER_SYSTEM &&
      typeof globalThis.BANNER_SYSTEM.setBanners === "function"
    ) {
      // Clear banners first
      globalThis.nextResponsePrepend = [];

      // Refresh banners
      globalThis.BANNER_SYSTEM.setBanners();

      // Check if banners were recreated
      if (
        Array.isArray(globalThis.nextResponsePrepend) &&
        globalThis.nextResponsePrepend.length > 0
      ) {
        console.log(
          `✅ Banner refresh successful, recreated ${globalThis.nextResponsePrepend.length} banners`
        );
      } else {
        console.error("❌ Banner refresh failed, no banners were created");
        return false;
      }
    } else {
      console.error(
        "❌ Banner system not available or missing setBanners method"
      );
      return false;
    }

    // Final verification
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
      console.log("\n✅ ALL TESTS PASSED: Banner system is working correctly");
      return true;
    } else {
      console.error("\n❌ TEST FAILED: Some required banners are missing");
      return false;
    }
  } catch (error) {
    console.error("❌ Unexpected error during test:", error);
    return false;
  }
}

// Run the test
(async function main() {
  try {
    success = await runTest();

    console.log("\n=== END-TO-END TEST RESULT ===");
    console.log(
      success
        ? "✅ PASSED: Banner system working correctly"
        : "❌ FAILED: Banner system not working correctly"
    );

    // Provide final banner display
    if (
      globalThis.CLAUDE_BANNER_HOOK &&
      typeof globalThis.CLAUDE_BANNER_HOOK.displayBanners === "function"
    ) {
      const finalDisplay = globalThis.CLAUDE_BANNER_HOOK.displayBanners();

      if (finalDisplay) {
        console.log("\nFinal banner display for Claude:");
        console.log("```");
        console.log(finalDisplay);
        console.log("```");
      }
    }
  } catch (error) {
    console.error("❌ Fatal error during test execution:", error);
    success = false;
  }
})();

// Export the result for external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = { success };
}
