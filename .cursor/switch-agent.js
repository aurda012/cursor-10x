/**
 * Switch Agent Test
 *
 * This script tests switching between different agents in the multi-agent system
 */

// Get agent ID from command line or default to backend-developer
const targetAgentId = process.argv[2] || "backend-developer";

console.log(`🔄 Testing agent switch to ${targetAgentId}...\n`);

// Load necessary systems
const path = require("path");

// 1. Load memory system first (may be needed by other systems)
console.log("📋 Step 1: Loading Memory System...");
try {
  const memorySystemPath = path.join(__dirname, "systems", "memory-system.js");
  require(memorySystemPath);
  console.log("✅ Memory System loaded");
} catch (error) {
  console.error(`❌ Error loading Memory System: ${error.message}`);
}

// 2. Load scratchpad system (may be used for agent communication)
console.log("\n📋 Step 2: Loading Scratchpad System...");
try {
  const scratchpadSystemPath = path.join(
    __dirname,
    "systems",
    "scratchpad-system.js"
  );
  require(scratchpadSystemPath);
  console.log("✅ Scratchpad System loaded");
} catch (error) {
  console.error(`❌ Error loading Scratchpad System: ${error.message}`);
}

// 3. Load multi-agent system
console.log("\n📋 Step 3: Loading Multi-Agent System...");
try {
  const multiAgentSystemPath = path.join(
    __dirname,
    "systems",
    "multi-agent-system.js"
  );
  require(multiAgentSystemPath);

  if (!globalThis.MULTI_AGENT_SYSTEM) {
    throw new Error("Multi-agent system not found after loading!");
  }

  console.log("✅ Multi-Agent System loaded");
} catch (error) {
  console.error(`❌ Error loading Multi-Agent System: ${error.message}`);
  process.exit(1);
}

// 4. Check current active agent
console.log("\n📋 Step 4: Checking current active agent...");
let currentAgentId = null;
try {
  const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
  if (activeAgent) {
    currentAgentId = activeAgent.id;
    console.log(
      `Current active agent: ${activeAgent.name} (${activeAgent.id})`
    );
  } else {
    console.log("No active agent found");
  }
} catch (error) {
  console.error(`❌ Error checking active agent: ${error.message}`);
}

// 5. Check if target agent exists
console.log("\n📋 Step 5: Verifying target agent exists...");
let targetAgent = null;
try {
  // Check if the target agent exists
  if (
    globalThis.MULTI_AGENT_SYSTEM.agents &&
    globalThis.MULTI_AGENT_SYSTEM.agents[targetAgentId]
  ) {
    targetAgent = globalThis.MULTI_AGENT_SYSTEM.agents[targetAgentId];
    console.log(`Target agent found: ${targetAgent.name} (${targetAgent.id})`);
  } else {
    console.log(`Agent with ID ${targetAgentId} not found!`);

    // List available agents
    console.log("\nAvailable agents:");
    for (const [id, agent] of Object.entries(
      globalThis.MULTI_AGENT_SYSTEM.agents
    )) {
      console.log(`- ${agent.name} (${id})`);
    }
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error verifying target agent: ${error.message}`);
  process.exit(1);
}

// 6. Attempt to switch to target agent
console.log("\n📋 Step 6: Attempting to switch to target agent...");
try {
  // Try different methods of switching agents
  let switched = false;

  // Method 1: Using switchAgent method
  if (typeof globalThis.MULTI_AGENT_SYSTEM.switchAgent === "function") {
    console.log("Using switchAgent() method...");
    globalThis.MULTI_AGENT_SYSTEM.switchAgent(targetAgentId);
    switched = true;
  }
  // Method 2: Using activateAgent method
  else if (typeof globalThis.MULTI_AGENT_SYSTEM.activateAgent === "function") {
    console.log("Using activateAgent() method...");
    globalThis.MULTI_AGENT_SYSTEM.activateAgent(targetAgentId);
    switched = true;
  }
  // Method 3: Directly setting active_agent property
  else if (globalThis.MULTI_AGENT_SYSTEM.hasOwnProperty("active_agent")) {
    console.log("Directly setting active_agent property...");
    const previousAgent = globalThis.MULTI_AGENT_SYSTEM.active_agent;
    globalThis.MULTI_AGENT_SYSTEM.active_agent = targetAgentId;

    // If there's a method to call after switching, call it
    if (typeof globalThis.MULTI_AGENT_SYSTEM.onAgentSwitch === "function") {
      globalThis.MULTI_AGENT_SYSTEM.onAgentSwitch(previousAgent, targetAgentId);
    }

    switched = true;
  } else {
    console.log("❌ No method found to switch agents!");
  }

  if (switched) {
    console.log(`✅ Attempted to switch to agent: ${targetAgentId}`);
  }
} catch (error) {
  console.error(`❌ Error switching agent: ${error.message}`);
}

// 7. Verify the switch was successful
console.log("\n📋 Step 7: Verifying agent switch...");
try {
  const newActiveAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
  if (newActiveAgent && newActiveAgent.id === targetAgentId) {
    console.log(
      `✅ Successfully switched to ${newActiveAgent.name} (${newActiveAgent.id})`
    );
  } else if (newActiveAgent) {
    console.log(
      `❌ Agent switch failed. Current agent is still: ${newActiveAgent.name} (${newActiveAgent.id})`
    );
  } else {
    console.log("❌ No active agent found after switch attempt");
  }
} catch (error) {
  console.error(`❌ Error verifying agent switch: ${error.message}`);
}

// 8. Update the banner system to reflect the change
console.log("\n📋 Step 8: Updating the banner system...");
try {
  // Check if direct-banner.js exists
  const bannerPath = path.join(__dirname, "communication", "direct-banner.js");
  const fs = require("fs");

  if (fs.existsSync(bannerPath)) {
    console.log("Loading banner system...");
    const bannerSystem = require(bannerPath);

    // If there's a method to force banner update, call it
    if (bannerSystem && typeof bannerSystem.forceBanners === "function") {
      bannerSystem.forceBanners();
      console.log("✅ Banner system updated");
    } else {
      console.log("✅ Banner system loaded, but no method to force update");
    }
  } else {
    console.log("❌ Banner system not found");
  }
} catch (error) {
  console.error(`❌ Error updating banner system: ${error.message}`);
}

// 9. Update custom_instructions.json with new agent
console.log("\n📋 Step 9: Updating custom instructions...");
try {
  // Check if the file exists
  const fs = require("fs");
  const customInstructionsPath = path.join(
    __dirname,
    "custom_instructions.json"
  );

  if (fs.existsSync(customInstructionsPath)) {
    console.log("Reading custom_instructions.json...");
    const data = fs.readFileSync(customInstructionsPath, "utf8");
    const instructions = JSON.parse(data);

    let updated = false;

    // Update banner_instructions if they exist
    if (
      instructions.banner_instructions &&
      instructions.banner_instructions.content
    ) {
      instructions.banner_instructions.content =
        instructions.banner_instructions.content.map((line) => {
          if (line.includes("[AGENT:")) {
            const newActiveAgent =
              globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
            if (newActiveAgent) {
              return `${
                newActiveAgent.emoji || "👤"
              } [AGENT: ${newActiveAgent.name.toUpperCase()}]`;
            }
          }
          return line;
        });
      updated = true;
    }

    // Update systems.multiAgent.defaultAgent if it exists
    if (instructions.systems && instructions.systems.multiAgent) {
      instructions.systems.multiAgent.defaultAgent = targetAgentId;
      updated = true;
    }

    if (updated) {
      // Save the updated file
      fs.writeFileSync(
        customInstructionsPath,
        JSON.stringify(instructions, null, 2),
        "utf8"
      );
      console.log("✅ Updated custom_instructions.json");
    } else {
      console.log("❌ No relevant sections found in custom_instructions.json");
    }
  } else {
    console.log("❌ custom_instructions.json not found");
  }
} catch (error) {
  console.error(`❌ Error updating custom_instructions.json: ${error.message}`);
}

console.log("\n✅ Agent switch test complete");
