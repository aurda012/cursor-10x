/**
 * Check Multi-Agent System
 *
 * This script checks the current state of the multi-agent system
 */

console.log("🔍 Checking multi-agent system...\n");

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

console.log("✅ Multi-agent system loaded successfully");

// Check for active agent
try {
  const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
  console.log("\n--- ACTIVE AGENT ---");
  if (activeAgent) {
    console.log(`ID: ${activeAgent.id}`);
    console.log(`Name: ${activeAgent.name}`);
    console.log(`Emoji: ${activeAgent.emoji || "👤"}`);
    if (activeAgent.description) {
      console.log(`Description: ${activeAgent.description}`);
    }
    if (activeAgent.capabilities && activeAgent.capabilities.length > 0) {
      console.log(`Capabilities: ${activeAgent.capabilities.join(", ")}`);
    }
  } else {
    console.log("No active agent found");
  }
} catch (error) {
  console.error(`❌ Error getting active agent: ${error.message}`);
}

// List all available agents
try {
  console.log("\n--- ALL AGENTS ---");

  // Check if there's a method to get all agents
  if (typeof globalThis.MULTI_AGENT_SYSTEM.getAllAgents === "function") {
    const agents = globalThis.MULTI_AGENT_SYSTEM.getAllAgents();
    console.log(`Found ${agents.length} agents:`);
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.id})`);
    });
  }
  // Otherwise try to access agents property directly
  else if (globalThis.MULTI_AGENT_SYSTEM.agents) {
    const agentIds = Object.keys(globalThis.MULTI_AGENT_SYSTEM.agents);
    console.log(`Found ${agentIds.length} agents:`);
    agentIds.forEach((agentId, index) => {
      const agent = globalThis.MULTI_AGENT_SYSTEM.agents[agentId];
      console.log(`${index + 1}. ${agent.name || agentId} (${agentId})`);
    });
  } else {
    console.log("No method to list agents");
  }
} catch (error) {
  console.error(`❌ Error listing agents: ${error.message}`);
}

// Get conversation/agent history if available
try {
  console.log("\n--- AGENT HISTORY ---");

  // Try to get recent agent activity
  if (globalThis.MEMORY_SYSTEM) {
    // Check for agent activation history in memory system
    const agents = [
      "executive_architect",
      "frontend_developer",
      "backend_developer",
      "full_stack_integrator",
      "cms_specialist",
      "data_engineer",
      "doc_specialist",
    ];

    // Try to get last active timestamps for each agent
    let found = false;
    for (const agent of agents) {
      const lastActive = globalThis.MEMORY_SYSTEM.getContext(
        `${agent}_last_active`
      );
      if (lastActive) {
        found = true;
        const timestamp = new Date(parseInt(lastActive)).toISOString();
        console.log(`- ${agent}: last active at ${timestamp}`);
      }
    }

    if (!found) {
      console.log("No agent history found in memory system");
    }
  } else {
    console.log("Memory system not available to check agent history");
  }
} catch (error) {
  console.error(`❌ Error getting agent history: ${error.message}`);
}

// Check if there's a method to switch agents
console.log("\n--- AGENT SWITCHING ---");
if (typeof globalThis.MULTI_AGENT_SYSTEM.switchAgent === "function") {
  console.log("Agent switching supported via switchAgent() method");

  // Don't actually switch, just report capability
} else if (typeof globalThis.MULTI_AGENT_SYSTEM.activateAgent === "function") {
  console.log("Agent switching supported via activateAgent() method");
} else {
  console.log("No explicit agent switching method found");
}

console.log("\n✅ Multi-agent system check complete");
