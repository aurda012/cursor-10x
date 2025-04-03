/**
 * Debug Memory Fix
 *
 * This script loads the memory database fix module and runs its debug function.
 */

console.log("🐛 Starting memory fix debug...");

// We're going to keep this as simple as possible
try {
  // Load the module
  const memoryFixModule = require("./fixes/fix-memory-db.js");
  console.log("✅ Loaded memory database fix module");

  // Run debug function
  if (typeof memoryFixModule.debugExport === "function") {
    console.log("🔍 Running debug export function...");
    const result = memoryFixModule.debugExport();
    console.log(`Debug result: ${result}`);
  } else {
    console.error("❌ debugExport function not found in module");
  }
} catch (error) {
  console.error("❌ Error loading fix module:", error);
}

console.log("🏁 Debug script completed");
