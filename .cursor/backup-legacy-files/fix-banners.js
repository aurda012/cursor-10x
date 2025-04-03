/**
 * Fix Banner Status
 *
 * This script properly loads all systems and ensures the banners reflect their actual status
 */

console.log("🔧 Banner Status Fix - Loading and testing all systems...");

// Load path module
const path = require("path");
const fs = require("fs");

// Track system statuses
const systemStatus = {
  memory: false,
  scratchpad: false,
  multiAgent: false,
};

// Step 1: Load Memory System
console.log("\n📋 Step 1: Loading Memory System...");
try {
  // Load the memory system
  const memorySystemPath = path.join(__dirname, "systems", "memory-system.js");
  require(memorySystemPath);

  // Test if it's functional
  if (
    globalThis.MEMORY_SYSTEM &&
    typeof globalThis.MEMORY_SYSTEM.storeContext === "function" &&
    typeof globalThis.MEMORY_SYSTEM.getContext === "function"
  ) {
    // Test basic functionality
    const testKey = `test_${Date.now()}`;
    const testValue = { value: `Test at ${new Date().toISOString()}` };

    globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
    const retrieved = globalThis.MEMORY_SYSTEM.getContext(testKey);

    if (retrieved && retrieved.value === testValue.value) {
      console.log("✅ Memory System loaded and verified functional");
      systemStatus.memory = true;
    } else {
      console.log("❌ Memory System failed function test");
    }
  } else {
    console.log("❌ Memory System missing required functions");
  }
} catch (error) {
  console.error(`❌ Error loading Memory System: ${error.message}`);
}

// Step 2: Load Scratchpad System
console.log("\n📋 Step 2: Loading Scratchpad System...");
try {
  // Load the scratchpad system
  const scratchpadSystemPath = path.join(
    __dirname,
    "systems",
    "scratchpad-system.js"
  );
  require(scratchpadSystemPath);

  // Get the scratchpad (support both naming conventions)
  const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

  // Test if it's functional
  if (scratchpad && typeof scratchpad.createMessage === "function") {
    console.log("✅ Scratchpad System loaded and has createMessage function");
    systemStatus.scratchpad = true;
  } else {
    console.log("❌ Scratchpad System missing required functions");
  }
} catch (error) {
  console.error(`❌ Error loading Scratchpad System: ${error.message}`);
}

// Step 3: Load Multi-Agent System
console.log("\n📋 Step 3: Loading Multi-Agent System...");
try {
  // Load the multi-agent system
  const multiAgentSystemPath = path.join(
    __dirname,
    "systems",
    "multi-agent-system.js"
  );
  require(multiAgentSystemPath);

  // Test if it's functional
  if (
    globalThis.MULTI_AGENT_SYSTEM &&
    typeof globalThis.MULTI_AGENT_SYSTEM.getActiveAgent === "function"
  ) {
    const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();

    if (activeAgent && activeAgent.name) {
      console.log(
        `✅ Multi-Agent System loaded with active agent: ${activeAgent.name}`
      );
      systemStatus.multiAgent = true;
    } else {
      console.log("❌ Multi-Agent System has no active agent");
    }
  } else {
    console.log("❌ Multi-Agent System missing required functions");
  }
} catch (error) {
  console.error(`❌ Error loading Multi-Agent System: ${error.message}`);
}

// Step 4: Load and update the Direct Banner System
console.log("\n📋 Step 4: Updating the Banner System...");
try {
  // Clear any existing banners
  globalThis.nextResponsePrepend = [];

  // Add accurate banners based on test results
  globalThis.nextResponsePrepend.push(
    `🧠 [MEMORY SYSTEM: ${systemStatus.memory ? "ACTIVE" : "INACTIVE"}]`
  );
  globalThis.nextResponsePrepend.push(
    `💬 [SCRATCHPAD SYSTEM: ${systemStatus.scratchpad ? "ACTIVE" : "INACTIVE"}]`
  );

  // Get active agent (or default to Executive Architect)
  let agentName = "EXECUTIVE ARCHITECT";
  let agentEmoji = "👑";

  if (systemStatus.multiAgent && globalThis.MULTI_AGENT_SYSTEM.getActiveAgent) {
    const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
    if (activeAgent) {
      agentName = activeAgent.name.toUpperCase();
      agentEmoji = activeAgent.emoji || "👑";
    }
  }

  globalThis.nextResponsePrepend.push(`${agentEmoji} [AGENT: ${agentName}]`);
  globalThis.nextResponsePrepend.push(
    `🤖 [MULTI-AGENT SYSTEM: ${
      systemStatus.multiAgent ? "ACTIVE" : "INACTIVE"
    }]`
  );

  console.log("✅ Banners updated to reflect actual system status:");
  globalThis.nextResponsePrepend.forEach((banner, i) =>
    console.log(`  ${i + 1}. ${banner}`)
  );

  // Update custom_instructions.json with current system statuses
  console.log("\n📋 Step 5: Updating custom_instructions.json...");

  // Load the current custom instructions
  const customInstructionsPath = path.join(
    __dirname,
    "custom_instructions.json"
  );
  if (fs.existsSync(customInstructionsPath)) {
    try {
      const instructionsData = fs.readFileSync(customInstructionsPath, "utf8");
      const instructions = JSON.parse(instructionsData);

      // Update banner content if it exists
      if (
        instructions.banner_instructions &&
        instructions.banner_instructions.content
      ) {
        instructions.banner_instructions.content = [
          ...globalThis.nextResponsePrepend,
        ];

        // Save the updated file
        fs.writeFileSync(
          customInstructionsPath,
          JSON.stringify(instructions, null, 2),
          "utf8"
        );
        console.log(
          "✅ Updated custom_instructions.json with current system status"
        );
      } else if (instructions.systems) {
        // Update systems section if it exists
        if (instructions.systems.memory) {
          instructions.systems.memory.enabled = systemStatus.memory;
        }
        if (instructions.systems.scratchpad) {
          instructions.systems.scratchpad.enabled = systemStatus.scratchpad;
        }
        if (instructions.systems.multiAgent) {
          instructions.systems.multiAgent.enabled = systemStatus.multiAgent;
        }

        // Save the updated file
        fs.writeFileSync(
          customInstructionsPath,
          JSON.stringify(instructions, null, 2),
          "utf8"
        );
        console.log("✅ Updated systems section in custom_instructions.json");
      } else {
        console.log(
          "❌ No banner_instructions or systems sections found in custom_instructions.json"
        );
      }
    } catch (error) {
      console.error(
        `❌ Error updating custom_instructions.json: ${error.message}`
      );
    }
  } else {
    console.log("❌ custom_instructions.json file not found");
  }

  // Load the direct banner system to force immediate update
  try {
    const directBannerPath = path.join(
      __dirname,
      "communication",
      "direct-banner.js"
    );
    if (fs.existsSync(directBannerPath)) {
      require(directBannerPath);
      console.log("✅ Loaded direct banner system to force immediate update");
    }
  } catch (error) {
    console.error(`❌ Error loading direct banner system: ${error.message}`);
  }
} catch (error) {
  console.error(`❌ Error updating banners: ${error.message}`);
}

// Final status report
console.log("\n📊 Final System Status:");
console.log(
  `  Memory System: ${systemStatus.memory ? "ACTIVE ✅" : "INACTIVE ❌"}`
);
console.log(
  `  Scratchpad System: ${
    systemStatus.scratchpad ? "ACTIVE ✅" : "INACTIVE ❌"
  }`
);
console.log(
  `  Multi-Agent System: ${
    systemStatus.multiAgent ? "ACTIVE ✅" : "INACTIVE ❌"
  }`
);

console.log("\n✅ Banner status fix complete");
