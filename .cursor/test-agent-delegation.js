/**
 * Multi-Agent Delegation Test
 * This script tests if the multi-agent system can properly delegate tasks
 * to the appropriate specialized agents.
 */

console.log("🧪 TESTING MULTI-AGENT DELEGATION\n");

// Make sure systems are fixed and initialized
try {
  require("./fix-systems.js");
  console.log("✅ Systems initialized\n");
} catch (error) {
  console.error(`❌ Error initializing systems: ${error.message}`);
  process.exit(1);
}

// Verify the multi-agent system exists
if (!globalThis.MULTI_AGENT_SYSTEM) {
  console.error("❌ Multi-agent system not found!");
  process.exit(1);
}

// Verify the scratchpad system exists
if (!globalThis.SCRATCHPAD) {
  console.error("❌ Scratchpad system not found!");
  process.exit(1);
}

// Verify required methods exist
if (typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent !== "function") {
  console.error("❌ switchToAgent method not found!");
  process.exit(1);
}

if (typeof globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask !== "function") {
  console.error("❌ findBestAgentForTask method not found!");
  process.exit(1);
}

// Track test status
let passedTests = 0;
let failedTests = 0;

// Test agent switching
function testAgentSwitching() {
  console.log("Testing agent switching...");

  // Get current agent
  const initialAgent = globalThis.MULTI_AGENT_SYSTEM.active_agent;
  console.log(`Initial agent: ${initialAgent}`);

  // Switch to frontend developer
  const switched =
    globalThis.MULTI_AGENT_SYSTEM.switchToAgent("frontend-developer");

  if (
    switched &&
    globalThis.MULTI_AGENT_SYSTEM.active_agent === "frontend-developer"
  ) {
    console.log("✅ Successfully switched to frontend-developer");
    passedTests++;
  } else {
    console.error("❌ Failed to switch agent");
    failedTests++;
  }

  // Reset to initial agent
  globalThis.MULTI_AGENT_SYSTEM.switchToAgent(initialAgent);
  console.log(`Reset to ${initialAgent}\n`);
}

// Test task delegation with capabilities
function testTaskDelegation() {
  console.log("Testing task delegation...");

  // Front-end task
  const frontendTask = "Create a new React component for user profile";
  const frontendCapabilities = ["ui", "react", "frontend"];

  const frontendAgent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
    frontendTask,
    frontendCapabilities
  );

  if (frontendAgent && frontendAgent.id === "frontend-developer") {
    console.log(`✅ Frontend task delegated to: ${frontendAgent.name}`);
    passedTests++;
  } else {
    console.error(
      `❌ Frontend task incorrectly delegated to: ${
        frontendAgent ? frontendAgent.name : "none"
      }`
    );
    failedTests++;
  }

  // Backend task
  const backendTask = "Implement API endpoint for user authentication";
  const backendCapabilities = ["api", "server", "security"];

  const backendAgent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
    backendTask,
    backendCapabilities
  );

  if (backendAgent && backendAgent.id === "backend-developer") {
    console.log(`✅ Backend task delegated to: ${backendAgent.name}`);
    passedTests++;
  } else {
    console.error(
      `❌ Backend task incorrectly delegated to: ${
        backendAgent ? backendAgent.name : "none"
      }`
    );
    failedTests++;
  }

  // Test without capabilities (content-based)
  const documentationTask = "Create documentation for the API endpoints";

  const documentationAgent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
    documentationTask,
    []
  );

  if (documentationAgent && documentationAgent.id === "doc-specialist") {
    console.log(
      `✅ Documentation task delegated to: ${documentationAgent.name}`
    );
    passedTests++;
  } else {
    console.error(
      `❌ Documentation task incorrectly delegated to: ${
        documentationAgent ? documentationAgent.name : "none"
      }`
    );
    failedTests++;
  }

  console.log("");
}

// Test scratchpad communication
function testScratchpadCommunication() {
  console.log("Testing scratchpad communication...");

  // Clear existing messages
  if (Array.isArray(globalThis.SCRATCHPAD.messages)) {
    globalThis.SCRATCHPAD.messages = [];
  }

  // Send test message
  const messageId = globalThis.SCRATCHPAD.createMessage(
    "executive-architect",
    "frontend-developer",
    "Please implement the user profile component"
  );

  // Retrieve messages
  const messages = globalThis.SCRATCHPAD.getMessages
    ? globalThis.SCRATCHPAD.getMessages({ from: "executive-architect" })
    : globalThis.SCRATCHPAD.messages.filter(
        (m) => m.from === "executive-architect"
      );

  if (messages && messages.length > 0) {
    console.log(
      `✅ Successfully sent and retrieved ${messages.length} messages`
    );
    passedTests++;
  } else {
    console.error("❌ Failed to send or retrieve messages");
    failedTests++;
  }

  console.log("");
}

// Run tests
console.log("\n🧪 RUNNING TESTS\n");
testAgentSwitching();
testTaskDelegation();
testScratchpadCommunication();

// Report results
console.log(`\n🧪 TEST SUMMARY`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests === 0) {
  console.log("\n✅ MULTI-AGENT DELEGATION TEST PASSED");
  console.log(
    "The multi-agent system can properly delegate tasks to specialized agents."
  );
} else {
  console.log("\n❌ MULTI-AGENT DELEGATION TEST FAILED");
  console.log("Some issues were found with the multi-agent delegation system.");
}

// Demonstrate how to use the delegation system in a user project
console.log("\n📋 USAGE INSTRUCTIONS");
console.log("To properly delegate tasks in your project, make sure to:");
console.log("1. Initialize systems with require('.cursor/fix-systems.js')");
console.log("2. Analyze the user request to determine required capabilities");
console.log(
  "3. Find the best agent with findBestAgentForTask(request, capabilities)"
);
console.log("4. Switch to that agent with switchToAgent(agent.id)");
console.log("5. Have the specialized agent handle the request");
console.log("6. Use SCRATCHPAD to communicate between agents if needed");
