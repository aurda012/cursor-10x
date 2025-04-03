/**
 * List All Agents
 *
 * This script lists all available agents in the multi-agent system
 */

console.log("🔍 Listing all available agents...\n");

// Load the multi-agent system
const path = require("path");
const multiAgentSystemPath = path.join(
  __dirname,
  "systems",
  "multi-agent-system.js"
);
require(multiAgentSystemPath);

// Check if multi-agent system is available
if (!globalThis.MULTI_AGENT_SYSTEM) {
  console.error("❌ Multi-agent system not found!");
  process.exit(1);
}

// Display top-level properties of MULTI_AGENT_SYSTEM
console.log("MULTI_AGENT_SYSTEM Properties:");
for (const key in globalThis.MULTI_AGENT_SYSTEM) {
  const valueType = typeof globalThis.MULTI_AGENT_SYSTEM[key];
  console.log(`- ${key} (${valueType})`);
}

// Get active agent
try {
  const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
  console.log("\nACTIVE AGENT:");
  if (activeAgent) {
    console.log(`Name: ${activeAgent.name}`);
    console.log(`ID: ${activeAgent.id}`);
    console.log(`Emoji: ${activeAgent.emoji || "none"}`);
    if (activeAgent.description) {
      console.log(`Description: ${activeAgent.description}`);
    }
  } else {
    console.log("No active agent found");
  }
} catch (error) {
  console.error(`Error getting active agent: ${error.message}`);
}

// Try looking at active_agent property directly
try {
  if (globalThis.MULTI_AGENT_SYSTEM.active_agent) {
    console.log(
      `\nDirect active_agent property: ${globalThis.MULTI_AGENT_SYSTEM.active_agent}`
    );
  }
} catch (error) {
  console.error(`Error accessing active_agent property: ${error.message}`);
}

// Try to print out agents object
console.log("\nAGENTS OBJECT:");
try {
  if (globalThis.MULTI_AGENT_SYSTEM.agents) {
    const agentIds = Object.keys(globalThis.MULTI_AGENT_SYSTEM.agents);
    console.log(`Found ${agentIds.length} agents:`);
    agentIds.forEach((agentId, index) => {
      const agent = globalThis.MULTI_AGENT_SYSTEM.agents[agentId];
      console.log(
        `${index + 1}. ID: ${agentId}, Name: ${agent.name || "Unknown"}`
      );
    });
  } else {
    console.log("agents property not found or empty");

    // Try to access agent data through other methods
    if (typeof globalThis.MULTI_AGENT_SYSTEM.getAllAgents === "function") {
      const allAgents = globalThis.MULTI_AGENT_SYSTEM.getAllAgents();
      console.log(`\nFound ${allAgents.length} agents via getAllAgents():`);
      allAgents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name} (${agent.id})`);
      });
    }
  }
} catch (error) {
  console.error(`Error listing agents: ${error.message}`);
}
