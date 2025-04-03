/**
 * Switch Agent Test (Fixed)
 *
 * This script switches to a specific agent in the multi-agent system
 */

// Get agent ID from command line or default to backend-developer
const targetAgentId = process.argv[2] || "backend-developer";

console.log(`🔄 Switching to ${targetAgentId} agent...\n`);

// Load path module
const path = require("path");

// Load the multi-agent system
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

// Get current active agent
const currentAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
console.log(`Current active agent: ${currentAgent.name} (${currentAgent.id})`);

// Verify target agent exists
const allAgents = globalThis.MULTI_AGENT_SYSTEM.getAllAgents();
const targetAgent = allAgents.find((agent) => agent.id === targetAgentId);

if (!targetAgent) {
  console.error(`❌ Agent with ID ${targetAgentId} not found!`);
  console.log("\nAvailable agents:");
  allAgents.forEach((agent) => {
    console.log(`- ${agent.name} (${agent.id})`);
  });
  process.exit(1);
}

console.log(`Target agent found: ${targetAgent.name} (${targetAgent.id})`);

// Call the switchToAgent method if available
if (typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent === "function") {
  console.log("\nSwitching agent using switchToAgent() method...");
  globalThis.MULTI_AGENT_SYSTEM.switchToAgent(targetAgentId);
}
// Try the switchAgent method as fallback
else if (typeof globalThis.MULTI_AGENT_SYSTEM.switchAgent === "function") {
  console.log("\nSwitching agent using switchAgent() method...");
  globalThis.MULTI_AGENT_SYSTEM.switchAgent(targetAgentId);
}
// Try setting activeAgent properties directly as last resort
else if (globalThis.MULTI_AGENT_SYSTEM.activeAgent) {
  console.log("\nSetting activeAgent property directly...");
  globalThis.MULTI_AGENT_SYSTEM.activeAgent = targetAgent;
} else {
  console.error("❌ No method found to switch agents!");
  process.exit(1);
}

// Verify the switch
const newActiveAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
if (newActiveAgent.id === targetAgentId) {
  console.log(
    `\n✅ Successfully switched to ${newActiveAgent.name} (${newActiveAgent.id})`
  );
} else {
  console.log(
    `\n❌ Switch failed! Current agent is still: ${newActiveAgent.name} (${newActiveAgent.id})`
  );
}

// Update the memory system if available
if (
  globalThis.MEMORY_SYSTEM &&
  typeof globalThis.MEMORY_SYSTEM.storeContext === "function"
) {
  globalThis.MEMORY_SYSTEM.storeContext("active_agent", targetAgentId);
  console.log("✅ Updated active_agent in memory system");
}

// Force banners to update if module available
try {
  const bannerPath = path.join(__dirname, "communication", "direct-banner.js");
  const fs = require("fs");

  if (fs.existsSync(bannerPath)) {
    const bannerSystem = require(bannerPath);
    if (bannerSystem && typeof bannerSystem.forceBanners === "function") {
      bannerSystem.forceBanners();
      console.log("✅ Updated system banners");
    }
  }
} catch (error) {
  console.error(`❌ Error updating banners: ${error.message}`);
}

console.log("\n✅ Agent switch complete");
