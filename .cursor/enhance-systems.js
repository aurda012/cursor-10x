/**
 * System Enhancement Script
 * Version: 1.0.0
 *
 * This script loads and applies the enhanced compatibility layer,
 * ensuring all systems have the required methods and showing
 * before/after status of each system.
 */

console.log("🚀 SYSTEM ENHANCEMENT SCRIPT\n");

// First capture the initial system state
const initialState = {
  memory: "UNKNOWN",
  scratchpad: "UNKNOWN",
  multiAgent: "UNKNOWN",
  banner: "UNKNOWN",
};

// Define test functions
const testMemorySystem = () => {
  try {
    if (!globalThis.MEMORY_SYSTEM) {
      return "INACTIVE";
    }

    const hasStoreContext =
      typeof globalThis.MEMORY_SYSTEM.storeContext === "function";
    const hasGetContext =
      typeof globalThis.MEMORY_SYSTEM.getContext === "function";

    if (!hasStoreContext || !hasGetContext) {
      return "PARTIAL";
    }

    // Try storing and retrieving a value
    const testKey = `test_${Date.now()}`;
    const testValue = `value_${Date.now()}`;
    globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
    const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);

    return retrievedValue === testValue ? "ACTIVE" : "PARTIAL";
  } catch (error) {
    return "ERROR";
  }
};

const testScratchpadSystem = () => {
  try {
    const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

    if (!scratchpad) {
      return "INACTIVE";
    }

    if (typeof scratchpad.createMessage !== "function") {
      return "PARTIAL";
    }

    // Test the function
    const messageId = scratchpad.createMessage(
      "system",
      "test",
      "Test message"
    );

    return messageId && typeof messageId === "string" ? "ACTIVE" : "PARTIAL";
  } catch (error) {
    return "ERROR";
  }
};

const testMultiAgentSystem = () => {
  try {
    const agentSystem =
      globalThis.MULTI_AGENT_SYSTEM || globalThis.AGENT_SYSTEM;

    if (!agentSystem) {
      return "INACTIVE";
    }

    const hasGetActiveAgent = typeof agentSystem.getActiveAgent === "function";
    const hasAgents =
      agentSystem.agents && typeof agentSystem.agents === "object";

    if (!hasGetActiveAgent || !hasAgents) {
      return "PARTIAL";
    }

    return "ACTIVE";
  } catch (error) {
    return "ERROR";
  }
};

const testBannerSystem = () => {
  try {
    if (!globalThis.BANNER_SYSTEM) {
      return "INACTIVE";
    }

    const hasForceBanners =
      typeof globalThis.BANNER_SYSTEM.forceBanners === "function";
    const hasSetBanner =
      typeof globalThis.BANNER_SYSTEM.setBanner === "function";

    if (!hasForceBanners || !hasSetBanner) {
      return "PARTIAL";
    }

    return Array.isArray(globalThis.nextResponsePrepend) ? "ACTIVE" : "PARTIAL";
  } catch (error) {
    return "ERROR";
  }
};

// First, capture initial state
console.log("📊 Capturing initial system state...");
initialState.memory = testMemorySystem();
initialState.scratchpad = testScratchpadSystem();
initialState.multiAgent = testMultiAgentSystem();
initialState.banner = testBannerSystem();

console.log("\nInitial System Status:");
console.log(`- Memory System:     ${initialState.memory}`);
console.log(`- Scratchpad System: ${initialState.scratchpad}`);
console.log(`- Multi-Agent System: ${initialState.multiAgent}`);
console.log(`- Banner System:     ${initialState.banner}`);

// Now try to load and apply the enhanced compatibility layer
console.log("\n🔧 Loading enhanced compatibility layer...");

try {
  // First, try to load the system compatibility layer for standardized naming
  try {
    const path = require("path");
    const compatPath = path.join(__dirname, "system-compatibility.js");
    require(compatPath);
    console.log("✅ Base compatibility layer loaded");
  } catch (error) {
    console.log("⚠️ Base compatibility layer not loaded:", error.message);
  }

  // Now load the enhanced compatibility layer
  const path = require("path");
  const enhancedCompatPath = path.join(
    __dirname,
    "fixes",
    "enhance-compatibility.js"
  );

  try {
    require(enhancedCompatPath);
    console.log("✅ Enhanced compatibility layer loaded");
  } catch (error) {
    console.error("❌ Error loading enhanced compatibility layer:", error);
    console.log("\n⚠️ Will try to implement minimal fixes manually...");

    // Implement minimal compatibility fixes

    // 1. Memory System fixes
    if (globalThis.MEMORY_SYSTEM) {
      if (typeof globalThis.MEMORY_SYSTEM.storeContext !== "function") {
        const storage = {};

        globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
          storage[key] = value;
          return true;
        };

        globalThis.MEMORY_SYSTEM.getContext = function (key) {
          return storage[key];
        };

        console.log("✅ Added minimal Memory System methods");
      }
    }

    // 2. Scratchpad System fixes
    const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;
    if (scratchpad) {
      if (typeof scratchpad.createMessage !== "function") {
        scratchpad._messages = [];

        scratchpad.createMessage = function (
          from,
          to,
          content,
          threadId = null
        ) {
          const messageId = `msg_${Date.now()}_${Math.floor(
            Math.random() * 10000
          )}`;
          this._messages.push({
            id: messageId,
            from: from || "system",
            to: to || "all",
            content: content || "",
            timestamp: Date.now(),
            thread_id: threadId || `default_thread`,
          });
          return messageId;
        };

        console.log("✅ Added minimal Scratchpad methods");
      }
    }
  }

  // When enhanced compatibility has the enhanceCompatibilityLayer function,
  // call it to make sure all fixes are applied
  if (typeof globalThis.enhanceCompatibilityLayer === "function") {
    globalThis.enhanceCompatibilityLayer();
    console.log("✅ Applied enhanced compatibility fixes");
  }

  // Try to refresh banners
  if (
    globalThis.BANNER_SYSTEM &&
    typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
  ) {
    globalThis.BANNER_SYSTEM.forceBanners();
    console.log("✅ Refreshed system banners");
  }
} catch (error) {
  console.error("❌ Error applying enhanced compatibility:", error);
}

// Capture final state after enhancements
const finalState = {
  memory: testMemorySystem(),
  scratchpad: testScratchpadSystem(),
  multiAgent: testMultiAgentSystem(),
  banner: testBannerSystem(),
};

console.log("\n📊 Final System Status:");
console.log(
  `- Memory System:      ${finalState.memory}${
    finalState.memory !== initialState.memory ? " (improved)" : ""
  }`
);
console.log(
  `- Scratchpad System:  ${finalState.scratchpad}${
    finalState.scratchpad !== initialState.scratchpad ? " (improved)" : ""
  }`
);
console.log(
  `- Multi-Agent System: ${finalState.multiAgent}${
    finalState.multiAgent !== initialState.multiAgent ? " (improved)" : ""
  }`
);
console.log(
  `- Banner System:      ${finalState.banner}${
    finalState.banner !== initialState.banner ? " (improved)" : ""
  }`
);

// Check if any systems were improved
const improvements =
  (finalState.memory !== initialState.memory &&
    finalState.memory === "ACTIVE") ||
  (finalState.scratchpad !== initialState.scratchpad &&
    finalState.scratchpad === "ACTIVE") ||
  (finalState.multiAgent !== initialState.multiAgent &&
    finalState.multiAgent === "ACTIVE") ||
  (finalState.banner !== initialState.banner && finalState.banner === "ACTIVE");

// Show current banners
if (
  Array.isArray(globalThis.nextResponsePrepend) &&
  globalThis.nextResponsePrepend.length > 0
) {
  console.log("\n📢 Current System Banners:");
  globalThis.nextResponsePrepend.forEach((banner) => {
    console.log(`  ${banner}`);
  });
}

console.log("\n🏁 Enhancement Process Complete");
if (improvements) {
  console.log("✅ SUCCESS: System enhancements were applied successfully!");
} else if (
  finalState.memory === "ACTIVE" &&
  finalState.scratchpad === "ACTIVE" &&
  finalState.banner === "ACTIVE"
) {
  console.log("✅ SUCCESS: All systems were already in ACTIVE state!");
} else {
  console.log("⚠️ PARTIAL SUCCESS: Some systems could not be fully enhanced.");

  // Advice for potential issues
  if (finalState.memory !== "ACTIVE") {
    console.log(
      "- Memory System issues: Try running 'node .cursor/centralized-init.js' first"
    );
  }

  if (finalState.scratchpad !== "ACTIVE") {
    console.log(
      "- Scratchpad System issues: Ensure the system has been properly initialized"
    );
  }

  if (finalState.banner !== "ACTIVE") {
    console.log(
      "- Banner System issues: Try running 'node .cursor/centralized-banner.js'"
    );
  }
}

// Export the results for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initialState,
    finalState,
    improvements,
  };
}
