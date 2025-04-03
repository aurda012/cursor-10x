/**
 * Check Active Agent
 *
 * This script checks which agent is currently active and displays its information
 */

console.log("🔍 Checking which agent is currently active...");

// Try to load the multi-agent system
try {
  // Load path module
  const path = require("path");

  // Load the multi-agent system bridge
  const systemsPath = path.join(__dirname, "systems", "multi-agent-system.js");
  require(systemsPath);

  // Check if multi-agent system is initialized
  if (globalThis.MULTI_AGENT_SYSTEM) {
    console.log("✅ Multi-agent system found");

    // Get active agent
    const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent
      ? globalThis.MULTI_AGENT_SYSTEM.getActiveAgent()
      : null;

    if (activeAgent) {
      console.log("\nActive Agent Information:");
      console.log(`  ID: ${activeAgent.id}`);
      console.log(`  Name: ${activeAgent.name}`);
      console.log(`  Emoji: ${activeAgent.emoji}`);

      if (activeAgent.description) {
        console.log(`  Description: ${activeAgent.description}`);
      }

      if (activeAgent.capabilities && activeAgent.capabilities.length > 0) {
        console.log(`  Capabilities: ${activeAgent.capabilities.join(", ")}`);
      }
    } else {
      console.log("\n❌ No active agent found");

      // Check for active_agent property
      if (globalThis.MULTI_AGENT_SYSTEM.active_agent) {
        console.log(
          `  Active agent ID: ${globalThis.MULTI_AGENT_SYSTEM.active_agent}`
        );

        // Check if agent exists in the agents collection
        if (
          globalThis.MULTI_AGENT_SYSTEM.agents &&
          globalThis.MULTI_AGENT_SYSTEM.agents[
            globalThis.MULTI_AGENT_SYSTEM.active_agent
          ]
        ) {
          const agent =
            globalThis.MULTI_AGENT_SYSTEM.agents[
              globalThis.MULTI_AGENT_SYSTEM.active_agent
            ];
          console.log(`  Agent found: ${agent.name}`);
        } else {
          console.log("  Agent not found in agents collection");
        }
      } else {
        console.log("  No active_agent property found");
      }
    }

    // Check all available agents
    console.log("\nAll Available Agents:");
    if (globalThis.MULTI_AGENT_SYSTEM.getAllAgents) {
      const allAgents = globalThis.MULTI_AGENT_SYSTEM.getAllAgents();
      allAgents.forEach((agent, index) => {
        console.log(`  ${index + 1}. ${agent.name} (${agent.id})`);
      });
    } else if (globalThis.MULTI_AGENT_SYSTEM.agents) {
      Object.keys(globalThis.MULTI_AGENT_SYSTEM.agents).forEach(
        (agentId, index) => {
          const agent = globalThis.MULTI_AGENT_SYSTEM.agents[agentId];
          console.log(`  ${index + 1}. ${agent.name || agentId} (${agentId})`);
        }
      );
    } else {
      console.log("  No agents found");
    }

    // Check custom instructions
    console.log("\nChecking Custom Instructions:");
    try {
      const fs = require("fs");
      const instructionsPath = path.join(__dirname, "custom_instructions.json");

      if (fs.existsSync(instructionsPath)) {
        const instructionsData = fs.readFileSync(instructionsPath, "utf8");
        const instructions = JSON.parse(instructionsData);

        if (
          instructions.banner_instructions &&
          instructions.banner_instructions.content
        ) {
          const agentBanner = instructions.banner_instructions.content.find(
            (banner) => banner.includes("[AGENT:")
          );

          if (agentBanner) {
            console.log(`  Agent in custom instructions: ${agentBanner}`);
          } else {
            console.log("  No agent banner found in custom instructions");
          }
        } else {
          console.log(
            "  No banner instructions found in custom_instructions.json"
          );
        }
      } else {
        console.log("  custom_instructions.json file not found");
      }
    } catch (error) {
      console.error(`  Error checking custom instructions: ${error.message}`);
    }
  } else {
    console.log("❌ Multi-agent system not found");
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}
