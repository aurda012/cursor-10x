/**
 * Multi-Agent System Test
 *
 * Tests agent switching and rule loading
 */
console.log("🧪 Testing Multi-Agent System...");

// Load the multi-agent system
const multiAgentSystem = require("./agents/multi-agent-system.js");
console.log("✅ Multi-agent system loaded");

// Test active agent
const activeAgent = multiAgentSystem.getActiveAgent();
console.log(`Active agent: ${activeAgent.name} (${activeAgent.id})`);

// Test agent switching
console.log("\n🔄 Testing agent switching...");
const agents = [
  "frontend-developer",
  "backend-developer",
  "data-engineer",
  "doc-specialist",
  "cms-specialist",
  "full-stack-integrator",
  "executive-architect",
];

for (const agentId of agents) {
  console.log(`Switching to ${agentId}...`);
  const success = multiAgentSystem.switchToAgent(agentId);
  const newActiveAgent = multiAgentSystem.getActiveAgent();

  console.log(`  Switch result: ${success ? "✅ Success" : "❌ Failed"}`);
  console.log(`  New active agent: ${newActiveAgent.name}`);

  // Test rule access
  if (newActiveAgent.module) {
    console.log(
      `  Rule loaded: ${newActiveAgent.module.rule ? "✅ Yes" : "❌ No"}`
    );
    if (newActiveAgent.module.rule) {
      console.log(
        `  Rule length: ${newActiveAgent.module.rule.length} characters`
      );
    }
    console.log(`  Rule path: ${newActiveAgent.module.rulePath || "Not set"}`);

    // Test referenced files
    const refFiles = newActiveAgent.module.referencedFiles;
    if (refFiles) {
      const fileCount = Object.keys(refFiles).length;
      console.log(`  Referenced files: ${fileCount}`);
    } else {
      console.log("  Referenced files: Not set");
    }
  } else {
    console.log("  Agent module not loaded");
  }

  console.log("");
}

console.log("🧪 Multi-agent system test complete");
