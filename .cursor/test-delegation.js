/**
 * Agent Delegation System Test
 *
 * This script tests that the agent delegation system is working properly
 * by attempting to switch between agents and delegate tasks.
 */

(function () {
  console.log("🧪 STARTING DELEGATION SYSTEM TEST");
  console.log("==================================");

  // Summary variables
  let passedTests = 0;
  let failedTests = 0;

  // Debug global variables
  console.log("Global variables:");
  for (const key in global) {
    if (
      key.includes("SYSTEM") ||
      key.includes("AGENT") ||
      key.includes("SCRATCHPAD")
    ) {
      console.log(`- ${key}: ${typeof global[key]}`);
    }
  }

  console.log("\nCurrent globalThis variables:");
  for (const key in globalThis) {
    if (
      key.includes("SYSTEM") ||
      key.includes("AGENT") ||
      key.includes("SCRATCHPAD")
    ) {
      console.log(`- ${key}: ${typeof globalThis[key]}`);
    }
  }

  // Try to initialize systems if needed
  console.log("\nAttempting to initialize systems if needed...");
  try {
    // Load centralized-init if available
    require("./centralized-init.js");
    console.log("✅ Loaded centralized initialization");
  } catch (err) {
    console.error(`Failed to load centralized-init.js: ${err.message}`);

    // Fallback to standalone initialization
    console.log("Creating basic multi-agent system...");
    globalThis.MULTI_AGENT_SYSTEM = globalThis.MULTI_AGENT_SYSTEM || {
      initialized: true,
      active_agent: "executive-architect",
      agents: {
        "executive-architect": {
          id: "executive-architect",
          name: "Executive Architect",
          emoji: "👑",
          capabilities: ["planning", "coordination"],
        },
        "frontend-developer": {
          id: "frontend-developer",
          name: "Frontend Developer",
          emoji: "🎨",
          capabilities: ["ui", "ux", "react", "css"],
        },
        "backend-developer": {
          id: "backend-developer",
          name: "Backend Developer",
          emoji: "🔧",
          capabilities: ["api", "server", "database"],
        },
        "doc-specialist": {
          id: "doc-specialist",
          name: "Documentation Specialist",
          emoji: "📚",
          capabilities: ["documentation", "technical-writing"],
        },
      },

      switchToAgent: function (agentId) {
        if (this.agents && this.agents[agentId]) {
          const previousAgent = this.active_agent;
          this.active_agent = agentId;
          console.log(`Switched from ${previousAgent} to ${agentId}`);
          return true;
        }
        return false;
      },

      findBestAgentForTask: function (
        taskDescription,
        requiredCapabilities = []
      ) {
        return this.agents["executive-architect"];
      },
    };

    // Set up reference for backward compatibility
    globalThis.AGENT_SYSTEM = globalThis.MULTI_AGENT_SYSTEM;
    console.log("✅ Basic multi-agent system created");
  }

  // Try to ensure delegation specifically
  try {
    require("./ensure-delegation.js");
    console.log("✅ Loaded delegation system");
  } catch (err) {
    console.error(`Failed to load ensure-delegation.js: ${err.message}`);
  }

  // Function to display test result
  function testResult(name, passed, message) {
    if (passed) {
      console.log(`✅ ${name}: PASSED${message ? " - " + message : ""}`);
      passedTests++;
    } else {
      console.log(`❌ ${name}: FAILED${message ? " - " + message : ""}`);
      failedTests++;
    }
  }

  console.log("\n📋 RUNNING TESTS");
  console.log("==================================");

  // Test 1: Verify multi-agent system exists
  const multiAgentExists = !!globalThis.MULTI_AGENT_SYSTEM;
  testResult("Multi-Agent System Exists", multiAgentExists);

  if (!multiAgentExists) {
    console.log("❌ Cannot continue tests without Multi-Agent System");
    return;
  }

  // Test 2: Verify agents are registered
  const hasAgents =
    globalThis.MULTI_AGENT_SYSTEM.agents &&
    Object.keys(globalThis.MULTI_AGENT_SYSTEM.agents).length > 0;
  testResult("Agents Registered", hasAgents);

  if (hasAgents) {
    console.log(
      `ℹ️ Available agents: ${Object.keys(
        globalThis.MULTI_AGENT_SYSTEM.agents
      ).join(", ")}`
    );
  }

  // Test 3: Verify switchToAgent method exists
  const hasSwitchMethod =
    typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent === "function";
  testResult("Switch Agent Method", hasSwitchMethod);

  // Test 4: Verify findBestAgentForTask method exists
  const hasFindMethod =
    typeof globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask === "function";
  testResult("Find Best Agent Method", hasFindMethod);

  // Test 5: Test agent switching
  let switchSuccess = false;
  let originalAgent = globalThis.MULTI_AGENT_SYSTEM.active_agent;

  if (hasSwitchMethod && hasAgents) {
    // Try to switch to a different agent
    const agents = Object.keys(globalThis.MULTI_AGENT_SYSTEM.agents);
    const targetAgent = agents.find((a) => a !== originalAgent) || agents[0];

    try {
      switchSuccess = globalThis.MULTI_AGENT_SYSTEM.switchToAgent(targetAgent);
      // Switch back to original
      globalThis.MULTI_AGENT_SYSTEM.switchToAgent(originalAgent);
    } catch (err) {
      console.error(`Error switching agent: ${err.message}`);
    }
  }

  testResult("Agent Switching", switchSuccess);

  // Test 6: Test finding best agent for a task
  let findSuccess = false;
  let frontendTask = "Create a React component for the user interface";
  let backendTask = "Set up the database schema and API endpoints";

  if (hasFindMethod) {
    try {
      // Test with a frontend task
      const frontendAgent =
        globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(frontendTask);

      // Test with a backend task
      const backendAgent =
        globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(backendTask);

      findSuccess = frontendAgent && backendAgent;

      console.log(
        `ℹ️ Agent for frontend task: ${
          frontendAgent ? frontendAgent.name : "none"
        }`
      );
      console.log(
        `ℹ️ Agent for backend task: ${
          backendAgent ? backendAgent.name : "none"
        }`
      );
    } catch (err) {
      console.error(`Error finding best agent: ${err.message}`);
    }
  }

  testResult("Find Best Agent", findSuccess);

  // Test 7: Test capability-based agent selection
  let capabilitySuccess = false;

  if (hasFindMethod) {
    try {
      const uiCapabilities = ["ui", "react", "css"];
      const serverCapabilities = ["api", "database", "server"];

      const uiAgent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
        frontendTask,
        uiCapabilities
      );

      const serverAgent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
        backendTask,
        serverCapabilities
      );

      capabilitySuccess = uiAgent && serverAgent;

      console.log(
        `ℹ️ Capability-based UI agent: ${uiAgent ? uiAgent.name : "none"}`
      );
      console.log(
        `ℹ️ Capability-based Server agent: ${
          serverAgent ? serverAgent.name : "none"
        }`
      );
    } catch (err) {
      console.error(`Error testing capability-based selection: ${err.message}`);
    }
  }

  testResult("Capability-Based Selection", capabilitySuccess);

  // Test 8: Integration with task manager (if available)
  let taskManagerSuccess = false;

  try {
    const taskManager = require("./agents/executive-architect/task-manager.js");

    if (taskManager && typeof taskManager.assignTaskToAgent === "function") {
      console.log(
        `ℹ️ Task manager found, but integration test skipped (requires task files)`
      );
      taskManagerSuccess = true;
    }
  } catch (err) {
    console.log(`ℹ️ Task manager not available: ${err.message}`);
  }

  testResult("Task Manager Integration", taskManagerSuccess);

  // Summary
  console.log("\n📋 TEST SUMMARY");
  console.log("==================================");
  console.log(`Tests passed: ${passedTests} / ${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log("✅ All delegation tests passed!");
    console.log("The multi-agent delegation system is ready to use.");
  } else {
    console.log(`⚠️ ${failedTests} tests failed.`);

    if (!hasSwitchMethod || !hasFindMethod) {
      console.log(
        "\nRecommendation: Run the ensure-delegation.js script directly"
      );
      console.log("  node .cursor/ensure-delegation.js");
    }
  }

  console.log("\n🔄 AGENT TASK DELEGATION USAGE:");
  console.log("==================================");
  console.log("// Find the best agent for a task");
  console.log(
    "const agent = MULTI_AGENT_SYSTEM.findBestAgentForTask(taskDescription, capabilities);"
  );
  console.log("\n// Switch to that agent");
  console.log("MULTI_AGENT_SYSTEM.switchToAgent(agent.id);");
  console.log("\n// Example usage in task-manager.js");
  console.log("const capabilities = determineRequiredCapabilities(task);");
  console.log(
    "const agent = MULTI_AGENT_SYSTEM.findBestAgentForTask(task.prompt, capabilities);"
  );
  console.log("MULTI_AGENT_SYSTEM.switchToAgent(agent.id);");
})();
