console.log("--- init.js executing ---");

/**
 * Simplified Initialization Script
 * Version: 2.0.0 (2023)
 *
 * This script now delegates all initialization to the centralized-init.js file.
 */

console.log("🔄 CURSOR INIT: Starting...");

try {
  // Import required modules
  const path = require("path");
  const fs = require("fs");

  // Load the centralized initialization script
  const centralizedInitPath = path.join(__dirname, "centralized-init.js");

  if (fs.existsSync(centralizedInitPath)) {
    console.log(
      "🔍 CURSOR INIT: Found centralized initialization script, loading..."
    );

    // Clear require cache to ensure fresh load
    if (require.cache[require.resolve(centralizedInitPath)]) {
      delete require.cache[require.resolve(centralizedInitPath)];
    }

    // Load the centralized initialization script
    require(centralizedInitPath);
    console.log(
      "✅ CURSOR INIT: Centralized initialization loaded successfully"
    );
  } else {
    console.warn(
      "⚠️ CURSOR INIT: Centralized initialization script not found, using enforcer.js"
    );

    // Try to load enforcer as fallback
    try {
      // Load the enforcer script
      const enforcerPath = path.join(__dirname, "enforcer.js");
      require(enforcerPath);
      console.log("✅ CURSOR INIT: Fallback to enforcer.js successful");
    } catch (enforcerError) {
      console.error(
        "❌ CURSOR INIT: Enforcer fallback failed:",
        enforcerError.message
      );

      // Last resort emergency banner
      globalThis.nextResponsePrepend = globalThis.nextResponsePrepend || [];
      globalThis.nextResponsePrepend.push(
        "🚨 [EMERGENCY ACTIVATION: INIT FALLBACK]"
      );
    }
  }
} catch (error) {
  console.error("❌ CURSOR INIT: Error during initialization:", error);

  // Emergency fallback
  try {
    globalThis.nextResponsePrepend = globalThis.nextResponsePrepend || [];
    globalThis.nextResponsePrepend.push(
      "🚨 [EMERGENCY ACTIVATION: INIT ERROR]"
    );
  } catch (e) {
    // Nothing more we can do
  }
}

console.log("🏁 CURSOR INIT: Process complete");
