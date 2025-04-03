/**
 * Update Custom Instructions
 *
 * This script updates the custom_instructions.json file with the latest system status
 */

console.log("🔄 Updating custom instructions with latest system status");

// Load required modules
const fs = require("fs");
const path = require("path");

// First, load the Scratchpad system to ensure it's initialized
console.log("\n📋 Step 1: Initializing Scratchpad system...");
try {
  const scratchpadPath = path.join(
    __dirname,
    "systems",
    "scratchpad-system.js"
  );
  const scratchpad = require(scratchpadPath);
  console.log("✅ Scratchpad system initialized");
} catch (error) {
  console.error(`❌ Error initializing Scratchpad system: ${error.message}`);
}

// Now run the custom instructions generator
console.log("\n📋 Step 2: Running custom instructions generator...");
try {
  const generatorPath = path.join(
    __dirname,
    "communication",
    "custom_instructions.js"
  );
  require(generatorPath);
  console.log("✅ Custom instructions updated");
} catch (error) {
  console.error(`❌ Error running instructions generator: ${error.message}`);
}

// Verify the custom_instructions.json file
console.log("\n📋 Step 3: Verifying custom_instructions.json...");
try {
  const instructionsPath = path.join(__dirname, "custom_instructions.json");

  if (fs.existsSync(instructionsPath)) {
    const instructionsData = fs.readFileSync(instructionsPath, "utf8");
    const instructions = JSON.parse(instructionsData);

    console.log("Custom instructions loaded successfully");

    if (
      instructions.banner_instructions &&
      instructions.banner_instructions.content
    ) {
      console.log("\nCurrent banner content in custom_instructions.json:");
      instructions.banner_instructions.content.forEach((line, i) => {
        console.log(`  ${i + 1}. ${line}`);
      });

      // Check for Scratchpad status
      const scratchpadBanner = instructions.banner_instructions.content.find(
        (banner) => banner.includes("SCRATCHPAD SYSTEM")
      );

      if (scratchpadBanner) {
        if (scratchpadBanner.includes("ACTIVE")) {
          console.log(
            "\n✅ SUCCESS: Scratchpad system is correctly set as ACTIVE in custom instructions"
          );
        } else {
          console.log(
            "\n❌ FAILURE: Scratchpad system is still set as INACTIVE in custom instructions"
          );
        }
      } else {
        console.log("\n❓ No Scratchpad banner found in custom instructions");
      }
    } else {
      console.log(
        "❌ Banner instructions not found in custom_instructions.json"
      );
    }
  } else {
    console.log("❌ custom_instructions.json file not found");
  }
} catch (error) {
  console.error(
    `❌ Error verifying custom_instructions.json: ${error.message}`
  );
}

console.log("\n✅ Update process complete");
