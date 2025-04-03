/**
 * Simple Memory System Test
 *
 * This script loads the compatibility layer and memory database fix,
 * then tests if the memory system is working properly.
 */

console.log("🧪 Starting simple memory system test...");

// First load the compatibility layer
try {
  require("./system-compatibility.js");
  console.log("✅ Loaded system compatibility layer");
} catch (error) {
  console.error("❌ Failed to load compatibility layer:", error.message);
  process.exit(1);
}

// Create a minimal memory system if needed
if (!globalThis.MEMORY_SYSTEM) {
  globalThis.MEMORY_SYSTEM = {
    initialized: true,
    version: "1.0.0",
    shortTerm: {},
  };
  console.log("✅ Created minimal MEMORY_SYSTEM for testing");
}

// Load the memory database fix
try {
  const memoryDbFix = require("./fixes/fix-memory-db.js");
  console.log("✅ Loaded memory database fix module");

  // Apply the fix
  if (typeof memoryDbFix.fixMemorySystem === "function") {
    const result = memoryDbFix.fixMemorySystem();
    console.log(
      `Memory system fix result: ${result ? "✅ Success" : "❌ Failed"}`
    );
  } else {
    console.error("❌ fixMemorySystem function not found in memory fix module");
  }
} catch (error) {
  console.error(
    "❌ Error loading or applying memory database fix:",
    error.message
  );
}

// Test memory system functionality
console.log("\n🧪 Testing Memory System functionality...");

try {
  // Generate unique test key and values
  const testKey = `test_${Date.now()}`;
  const testObj = {
    message: "Test Object",
    timestamp: Date.now(),
    nested: {
      value: "Nested Value",
      array: [1, 2, 3],
    },
  };

  console.log(`Testing with key: "${testKey}" and complex object value`);

  // Test store function
  console.log("▶️ Testing storeContext...");

  if (typeof globalThis.MEMORY_SYSTEM.storeContext === "function") {
    const storeResult = globalThis.MEMORY_SYSTEM.storeContext(testKey, testObj);
    console.log(`Store result: ${storeResult ? "✅ Success" : "❌ Failed"}`);
  } else {
    console.error("❌ storeContext function not found on MEMORY_SYSTEM");
  }

  // Test retrieve function
  console.log("▶️ Testing getContext...");

  if (typeof globalThis.MEMORY_SYSTEM.getContext === "function") {
    const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);

    if (retrievedValue) {
      console.log("✅ Successfully retrieved value");

      // Verify all properties match
      const valuesMatch =
        retrievedValue.message === testObj.message &&
        retrievedValue.timestamp === testObj.timestamp &&
        retrievedValue.nested?.value === testObj.nested.value &&
        JSON.stringify(retrievedValue.nested?.array) ===
          JSON.stringify(testObj.nested.array);

      console.log(
        `Value validation: ${
          valuesMatch ? "✅ Values match" : "❌ Values do not match"
        }`
      );

      if (!valuesMatch) {
        console.log("Expected:", testObj);
        console.log("Received:", retrievedValue);
      }
    } else {
      console.error("❌ Failed to retrieve value (got null or undefined)");
    }
  } else {
    console.error("❌ getContext function not found on MEMORY_SYSTEM");
  }

  // Check storage mechanism details
  console.log("\n📊 Storage Mechanism Details:");

  if (globalThis.MEMORY_SYSTEM._storage) {
    console.log("- _storage object exists");

    if (typeof globalThis.MEMORY_SYSTEM._storage.size === "function") {
      const size = globalThis.MEMORY_SYSTEM._storage.size();
      console.log(`- Storage size: ${size} items`);
    }

    if (typeof globalThis.MEMORY_SYSTEM._storage.keys === "function") {
      const keys = globalThis.MEMORY_SYSTEM._storage.keys();
      console.log(`- Storage keys: ${keys.length} keys found`);
    }

    // Check storage implementation type
    const storageType =
      globalThis.MEMORY_SYSTEM.db_status === "active"
        ? "SQLite Database"
        : "In-Memory Storage";
    console.log(`- Storage type: ${storageType}`);
  } else {
    console.log("⚠️ No _storage object found on MEMORY_SYSTEM");
  }

  console.log("\n✅ Memory System Test completed");
} catch (error) {
  console.error("\n❌ Error during test:", error);
}
