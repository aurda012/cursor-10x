/**
 * Reset Active Agent
 *
 * This script resets the active agent to the Executive Architect (default)
 */

console.log("🔄 Resetting active agent to Executive Architect...");

// Load path module
const path = require("path");

// Step 1: Load the multi-agent system
console.log("\n📋 Step 1: Loading multi-agent system...");

try {
  // First try the systems bridge
  const systemsPath = path.join(__dirname, "systems", "multi-agent-system.js");
  console.log(`Attempting to load from: ${systemsPath}`);

  try {
    const multiAgentSystem = require(systemsPath);
    console.log("Multi-agent system loaded via systems bridge");
  } catch (error) {
    console.log(`Could not load via systems bridge: ${error.message}`);

    // Try direct load from agents directory
    const agentsPath = path.join(__dirname, "agents", "multi-agent-system.js");
    console.log(`Attempting to load from: ${agentsPath}`);
    const multiAgentSystem = require(agentsPath);
    console.log("Multi-agent system loaded directly from agents directory");
  }

  // Step
  console.log("\n📋 Step 2: Checking current active agent...");

  if (globalThis.MULTI_AGENT_SYSTEM) {
    // Get current active agent
    const currentAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();

    if (currentAgent) {
      console.log(
        `Current active agent: ${currentAgent.name} (${currentAgent.id})`
      );
    } else {
      console.log("No active agent found");
    }

    // Switch to executive architect
    console.log("\n📋 Step 3: Switching to Executive Architect...");

    if (typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent === "function") {
      const result = globalThis.MULTI_AGENT_SYSTEM.switchToAgent(
        "executive-architect"
      );

      if (result) {
        console.log("✅ Successfully switched to Executive Architect");
      } else {
        console.log("❌ Failed to switch to Executive Architect");
      }
    } else {
      console.log(
        "❌ switchToAgent function not available, setting active_agent directly"
      );

      // Direct modification as fallback
      globalThis.MULTI_AGENT_SYSTEM.active_agent = "executive-architect";
      console.log("✅ Set active_agent to executive-architect directly");
    }

    // Verify the change
    console.log("\n📋 Step 4: Verifying the agent switch...");

    const newAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();

    if (newAgent) {
      console.log(`New active agent: ${newAgent.name} (${newAgent.id})`);

      if (newAgent.id === "executive-architect") {
        console.log("✅ Confirmed Executive Architect is now the active agent");
      } else {
        console.log(
          `❌ Active agent is still ${newAgent.id}, not executive-architect`
        );
      }
    } else {
      console.log("❌ No active agent found after switch attempt");
    }
  } else {
    console.log("❌ MULTI_AGENT_SYSTEM not found in global scope");

    // Create minimal implementation if not found
    console.log("\n📋 Creating minimal multi-agent system...");

    globalThis.MULTI_AGENT_SYSTEM = {
      initialized: true,
      active_agent: "executive-architect",
      agents: {
        "executive-architect": {
          id: "executive-architect",
          name: "Executive Architect",
          emoji: "👑",
          status: "active",
        },
      },
      getActiveAgent: function () {
        return this.agents[this.active_agent];
      },
    };

    console.log(
      "✅ Created minimal multi-agent system with Executive Architect as active agent"
    );
  }

  // Update custom instructions to reflect the change
  console.log("\n📋 Step 5: Updating custom instructions...");

  try {
    const updatePath = path.join(__dirname, "update-instructions.js");
    require(updatePath);
    console.log("✅ Updated custom instructions");
  } catch (error) {
    console.error(`❌ Error updating custom instructions: ${error.message}`);
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}

console.log("\n✅ Reset process complete");
