/**
 * Memory and Scratchpad Verification Script
 *
 * Tests the memory and scratchpad systems to determine why they show PARTIAL status
 */

console.log("🧪 Starting Memory and Scratchpad Verification...");

// Load the compatibility layer first
try {
  require("./system-compatibility.js");
  console.log("✅ Loaded system compatibility layer");
} catch (error) {
  console.error("❌ Failed to load compatibility layer:", error);
}

// Test Memory System
console.log("\n🧠 Testing Memory System:");
try {
  if (!globalThis.MEMORY_SYSTEM) {
    console.log("❌ Memory System does not exist");
  } else {
    console.log("✓ Memory System exists");

    // Test required methods
    console.log("\nRequired Methods:");
    const hasStoreContext =
      typeof globalThis.MEMORY_SYSTEM.storeContext === "function";
    console.log(
      `- storeContext: ${hasStoreContext ? "✓ Present" : "❌ Missing"}`
    );

    const hasGetContext =
      typeof globalThis.MEMORY_SYSTEM.getContext === "function";
    console.log(`- getContext: ${hasGetContext ? "✓ Present" : "❌ Missing"}`);

    // Test functionality if methods exist
    if (hasStoreContext && hasGetContext) {
      console.log("\nFunctionality Test:");
      const testKey = `test_${Date.now()}`;
      const testValue = `test_value_${Date.now()}`;

      try {
        globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
        const retrieved = globalThis.MEMORY_SYSTEM.getContext(testKey);

        if (retrieved === testValue) {
          console.log(
            "✅ Basic functionality WORKS - successfully stored and retrieved value"
          );
        } else {
          console.log(
            `❌ Functionality FAILED - retrieved: ${retrieved}, expected: ${testValue}`
          );
        }
      } catch (error) {
        console.error("❌ Error during functionality test:", error);
      }
    }

    // Print all available methods and properties
    console.log("\nAll available properties and methods:");
    Object.keys(globalThis.MEMORY_SYSTEM).forEach((key) => {
      const type = typeof globalThis.MEMORY_SYSTEM[key];
      console.log(`- ${key}: ${type}`);
    });
  }
} catch (error) {
  console.error("❌ Error testing Memory System:", error);
}

// Test Scratchpad System
console.log("\n📝 Testing Scratchpad System:");
try {
  const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

  if (!scratchpad) {
    console.log(
      "❌ Scratchpad System does not exist (neither SCRATCHPAD nor SCRATCHPAD_SYSTEM found)"
    );
  } else {
    console.log("✓ Scratchpad System exists");

    // Check if both references exist and are the same
    if (globalThis.SCRATCHPAD && globalThis.SCRATCHPAD_SYSTEM) {
      if (globalThis.SCRATCHPAD === globalThis.SCRATCHPAD_SYSTEM) {
        console.log(
          "✓ SCRATCHPAD and SCRATCHPAD_SYSTEM reference the same object"
        );
      } else {
        console.log(
          "❌ SCRATCHPAD and SCRATCHPAD_SYSTEM reference different objects!"
        );
      }
    }

    // Test required methods
    console.log("\nRequired Methods:");
    const hasCreateMessage = typeof scratchpad.createMessage === "function";
    console.log(
      `- createMessage: ${hasCreateMessage ? "✓ Present" : "❌ Missing"}`
    );

    // Print all available methods and properties
    console.log("\nAll available properties and methods:");
    Object.keys(scratchpad).forEach((key) => {
      const type = typeof scratchpad[key];
      console.log(`- ${key}: ${type}`);
    });
  }
} catch (error) {
  console.error("❌ Error testing Scratchpad System:", error);
}

// Summary
console.log("\n📊 Verification Summary:");
try {
  const memoryStatus = !globalThis.MEMORY_SYSTEM
    ? "INACTIVE"
    : typeof globalThis.MEMORY_SYSTEM.storeContext !== "function" ||
      typeof globalThis.MEMORY_SYSTEM.getContext !== "function"
    ? "PARTIAL"
    : "ACTIVE";

  const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;
  const scratchpadStatus = !scratchpad
    ? "INACTIVE"
    : typeof scratchpad.createMessage !== "function"
    ? "PARTIAL"
    : "ACTIVE";

  console.log(`Memory System: ${memoryStatus}`);
  console.log(`Scratchpad System: ${scratchpadStatus}`);

  console.log("\nRecommendations:");
  if (memoryStatus !== "ACTIVE") {
    console.log(
      "- Memory System needs storeContext and getContext functions that work properly"
    );
  }

  if (scratchpadStatus !== "ACTIVE") {
    console.log("- Scratchpad System needs createMessage function");
  }
} catch (error) {
  console.error("❌ Error generating summary:", error);
}
