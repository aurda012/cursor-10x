/**
 * Test Fixed Scratchpad System
 *
 * Verifies that the fixed Scratchpad system is correctly detected as ACTIVE by the banner system
 */

console.log("🧪 Testing Fixed Scratchpad System");

// Load path module once at the top
const path = require("path");

// Step 1: Load the proper Scratchpad system
console.log("\n📋 Step 1: Loading the Scratchpad system...");

try {
  const scratchpadPath = path.join(
    __dirname,
    "systems",
    "scratchpad-system.js"
  );

  const scratchpad = require(scratchpadPath);
  console.log("Scratchpad system loaded successfully");

  // Verify it has the required createMessage function
  if (typeof scratchpad.createMessage === "function") {
    console.log("✅ Scratchpad has createMessage function");
  } else {
    console.log("❌ Scratchpad missing createMessage function");
  }

  // Test a message creation
  const testId = scratchpad.createMessage(
    "test-script",
    "banner-system",
    "Testing scratchpad functionality"
  );

  console.log(`✅ Created test message with ID: ${testId}`);
} catch (error) {
  console.error(`❌ Error loading Scratchpad system: ${error.message}`);
}

// Step 2: Load the banner system to check if it detects Scratchpad as active
console.log(
  "\n📋 Step 2: Loading banner system to verify Scratchpad detection..."
);

// Clear any existing banners
globalThis.nextResponsePrepend = [];

try {
  const bannerPath = path.join(__dirname, "communication", "direct-banner.js");
  const bannerSystem = require(bannerPath);

  console.log("Banner system loaded successfully");

  // Display banners to see if Scratchpad is detected as active
  console.log("\nCurrent system status according to banners:");
  if (
    globalThis.nextResponsePrepend &&
    globalThis.nextResponsePrepend.length > 0
  ) {
    globalThis.nextResponsePrepend.forEach((banner, i) =>
      console.log(`  ${i + 1}. ${banner}`)
    );

    // Specifically check for Scratchpad status
    const scratchpadBanner = globalThis.nextResponsePrepend.find((banner) =>
      banner.includes("SCRATCHPAD SYSTEM")
    );

    if (scratchpadBanner) {
      if (scratchpadBanner.includes("ACTIVE")) {
        console.log(
          "\n✅ SUCCESS: Scratchpad system is correctly detected as ACTIVE"
        );
      } else {
        console.log(
          "\n❌ FAILURE: Scratchpad system is still detected as INACTIVE"
        );
      }
    } else {
      console.log("\n❓ No Scratchpad banner found");
    }
  } else {
    console.log("  No banners set");
  }
} catch (error) {
  console.error(`❌ Error loading banner system: ${error.message}`);
}

console.log("\n✅ Test complete");
console.log("The Scratchpad system should now be properly detected as ACTIVE");
