/**
 * Memory Database Fix Test Script
 * Version: 1.0.0
 *
 * This script tests the memory database fix to ensure it works correctly.
 */

console.log("🧪 Testing Memory Database Fix...");

// Load required modules
const path = require("path");
const fs = require("fs");

// Define paths
const rootDir = __dirname;
const dbPath = path.join(rootDir, "db", "memory-system.db");
const memoryDbFixPath = path.join(rootDir, "fixes", "fix-memory-db.js");

// Check if database file exists
try {
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(
      `✅ Database file exists (${(stats.size / 1024).toFixed(2)} KB)`
    );
  } else {
    console.log(
      "⚠️ Database file does not exist - will be created during test"
    );
  }
} catch (error) {
  console.error("❌ Error checking database file:", error.message);
}

// Reset global objects for clean testing
if (globalThis.MEMORY_SYSTEM) delete globalThis.MEMORY_SYSTEM;

// First, load the compatibility layer
try {
  require("./system-compatibility.js");
  console.log("✅ Loaded system compatibility layer");
} catch (error) {
  console.error("❌ Failed to load compatibility layer:", error);
}

// Load the memory database fix module
try {
  if (fs.existsSync(memoryDbFixPath)) {
    const memoryDbFix = require(memoryDbFixPath);
    console.log("✅ Loaded memory database fix module");
  } else {
    console.error(
      "❌ Memory database fix module not found at:",
      memoryDbFixPath
    );
  }
} catch (error) {
  console.error("❌ Error loading memory database fix:", error);
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

// Apply the memory database fix
try {
  const memoryDbFix = require(memoryDbFixPath);
  console.log("▶️ Applying memory database fix...");

  if (typeof memoryDbFix.fixMemorySystem === "function") {
    const result = memoryDbFix.fixMemorySystem();
    console.log(
      `Memory system fix result: ${result ? "✅ Success" : "❌ Failed"}`
    );
  } else {
    console.error("❌ fixMemorySystem function not found in memory fix module");
  }
} catch (error) {
  console.error("❌ Error applying memory database fix:", error);
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

  // Test additional functions if available
  console.log("\n▶️ Testing additional memory functions...");

  if (typeof globalThis.MEMORY_SYSTEM.getAllContext === "function") {
    console.log("Testing getAllContext...");
    const allContext = globalThis.MEMORY_SYSTEM.getAllContext();
    console.log(`getAllContext found ${Object.keys(allContext).length} items`);
  }

  if (typeof globalThis.MEMORY_SYSTEM.removeContext === "function") {
    console.log("Testing removeContext...");
    const removeResult = globalThis.MEMORY_SYSTEM.removeContext(testKey);
    console.log(
      `removeContext result: ${removeResult ? "✅ Success" : "❌ Failed"}`
    );

    // Verify removal
    if (typeof globalThis.MEMORY_SYSTEM.getContext === "function") {
      const checkRemoved = globalThis.MEMORY_SYSTEM.getContext(testKey);
      console.log(
        `Value removal verification: ${
          checkRemoved === null || checkRemoved === undefined
            ? "✅ Removed successfully"
            : "❌ Still exists"
        }`
      );
    }
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
      if (keys.length > 0 && keys.length <= 10) {
        console.log(`  Key examples: ${keys.join(", ")}`);
      } else if (keys.length > 10) {
        console.log(`  Key examples: ${keys.slice(0, 10).join(", ")}...`);
      }
    }
  } else {
    console.log("⚠️ No _storage object found on MEMORY_SYSTEM");
  }

  // Display overall status
  console.log("\n📝 Memory System Status:");
  console.log(
    `- Initialized: ${
      globalThis.MEMORY_SYSTEM.initialized ? "✅ Yes" : "❌ No"
    }`
  );
  console.log(`- Version: ${globalThis.MEMORY_SYSTEM.version || "Unknown"}`);
  console.log(
    `- DB Status: ${globalThis.MEMORY_SYSTEM.db_status || "Unknown"}`
  );
  console.log(
    `- Store/Get Functions: ${
      typeof globalThis.MEMORY_SYSTEM.storeContext === "function" &&
      typeof globalThis.MEMORY_SYSTEM.getContext === "function"
        ? "✅ Working"
        : "❌ Missing"
    }`
  );
} catch (error) {
  console.error("❌ Error testing memory system:", error);
}

console.log("\n✅ Memory Database Fix Test completed");
