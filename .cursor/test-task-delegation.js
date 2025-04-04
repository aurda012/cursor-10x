/**
 * Task Management and Agent Delegation Integration Test
 *
 * This script tests the integration between the task management system
 * and the agent delegation system to ensure they work together properly.
 */

(function () {
  console.log("🧪 TASK-AGENT INTEGRATION TEST");
  console.log("================================");

  // Summary variables
  let passedTests = 0;
  let failedTests = 0;

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

  // Try to initialize systems if needed
  console.log("Initializing systems...");
  try {
    require("./centralized-init.js");
    console.log("✅ Loaded centralized initialization");
  } catch (err) {
    console.error(`Failed to load centralized-init.js: ${err.message}`);
  }

  // Try to ensure delegation specifically
  try {
    require("./ensure-delegation.js");
    console.log("✅ Loaded delegation system");
  } catch (err) {
    console.error(`Failed to load ensure-delegation.js: ${err.message}`);
  }

  // Load task management system
  let taskManager;
  let taskCommandHandler;
  try {
    taskManager = require("./agents/executive-architect/task-manager.js");
    console.log("✅ Loaded task manager");
  } catch (err) {
    console.error(`Failed to load task-manager.js: ${err.message}`);
  }

  try {
    taskCommandHandler = require("./agents/executive-architect/task-command-handler.js");
    console.log("✅ Loaded task command handler");
  } catch (err) {
    console.error(`Failed to load task-command-handler.js: ${err.message}`);
  }

  console.log("\n📋 RUNNING TESTS");
  console.log("================================");

  // Test 1: Verify systems are loaded
  const systemsLoaded =
    globalThis.MULTI_AGENT_SYSTEM &&
    globalThis.MULTI_AGENT_SYSTEM.initialized &&
    taskManager &&
    taskCommandHandler;

  testResult("Required Systems Loaded", systemsLoaded);

  if (!systemsLoaded) {
    console.error("Cannot continue tests without required systems");
    return;
  }

  // Test 2: Verify essential methods exist
  const essentialMethodsExist =
    typeof globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask === "function" &&
    typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent === "function" &&
    typeof taskManager.assignTaskToAgent === "function" &&
    typeof taskCommandHandler.processTaskCommand === "function";

  testResult("Essential Methods Exist", essentialMethodsExist);

  if (!essentialMethodsExist) {
    console.error("Cannot continue tests without essential methods");
    return;
  }

  // Test 3: Test capability extraction
  let capabilityExtractionWorks = false;

  try {
    if (typeof taskManager.determineRequiredCapabilities === "function") {
      const testTask = {
        file: "src/components/UserProfile.jsx",
        prompt:
          "Create a React component for user profiles with responsive design",
      };

      const capabilities = taskManager.determineRequiredCapabilities(testTask);

      capabilityExtractionWorks =
        Array.isArray(capabilities) &&
        capabilities.length > 0 &&
        capabilities.some(
          (cap) => cap === "react" || cap === "ui" || cap === "ux"
        );

      console.log(`Extracted capabilities: ${capabilities.join(", ")}`);
    }
  } catch (err) {
    console.error(`Error testing capability extraction: ${err.message}`);
  }

  testResult("Capability Extraction", capabilityExtractionWorks);

  // Test 4: Test agent matching for frontend task
  let frontendMatchWorks = false;

  try {
    const frontendTask = {
      file: "src/components/UserProfile.jsx",
      prompt:
        "Create a React component for user profiles with responsive design",
    };

    let capabilities = [];
    if (typeof taskManager.determineRequiredCapabilities === "function") {
      capabilities = taskManager.determineRequiredCapabilities(frontendTask);
    }

    const agent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
      frontendTask.prompt,
      capabilities
    );

    frontendMatchWorks = agent && agent.id === "frontend-developer";

    if (agent) {
      console.log(`Frontend task matched with: ${agent.name} (${agent.id})`);
    }
  } catch (err) {
    console.error(`Error testing frontend matching: ${err.message}`);
  }

  testResult("Frontend Task Matching", frontendMatchWorks);

  // Test 5: Test agent matching for backend task
  let backendMatchWorks = false;

  try {
    const backendTask = {
      file: "src/api/auth.js",
      prompt:
        "Implement the authentication API endpoint with JWT token support",
    };

    let capabilities = [];
    if (typeof taskManager.determineRequiredCapabilities === "function") {
      capabilities = taskManager.determineRequiredCapabilities(backendTask);
    }

    const agent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
      backendTask.prompt,
      capabilities
    );

    backendMatchWorks = agent && agent.id === "backend-developer";

    if (agent) {
      console.log(`Backend task matched with: ${agent.name} (${agent.id})`);
    }
  } catch (err) {
    console.error(`Error testing backend matching: ${err.message}`);
  }

  testResult("Backend Task Matching", backendMatchWorks);

  // Test 6: Test processing of start task command
  let startTaskWorks = false;

  try {
    // Create a mock task for this test
    const mockTask = {
      id: "999",
      title: "Test Task",
      file: "test/file.js",
      status: "pending",
      prompt: "This is a test task prompt for integration testing",
    };

    // Mock the getNextPendingTask and startNextTask methods
    const originalGetNextPendingTask = taskManager.getNextPendingTask;
    const originalStartNextTask = taskManager.startNextTask;

    taskManager.getNextPendingTask = function () {
      return mockTask;
    };

    taskManager.startNextTask = function () {
      mockTask.status = "in-progress";
      return mockTask;
    };

    // Process the command
    const result = taskCommandHandler.processTaskCommand("start task");

    // Restore original methods
    taskManager.getNextPendingTask = originalGetNextPendingTask;
    taskManager.startNextTask = originalStartNextTask;

    startTaskWorks =
      result &&
      result.commandType === "startTask" &&
      result.success === true &&
      result.response.includes("Started task #999");

    if (result) {
      console.log(`Start task result: ${result.response}`);
    }
  } catch (err) {
    console.error(`Error testing start task: ${err.message}`);
  }

  testResult("Start Task Command", startTaskWorks);

  // Test 7: Test task assignment
  let taskAssignmentWorks = false;

  try {
    // Create a mock task for this test
    const mockTask = {
      id: "999",
      title: "Test React Component",
      file: "src/components/TestComponent.jsx",
      status: "in-progress",
      prompt: "Create a React component with responsive design",
    };

    // Mock the getTaskDetails method
    const originalGetTaskDetails = taskManager.getTaskDetails;

    taskManager.getTaskDetails = function () {
      return mockTask;
    };

    // Process the assignment
    const result = taskManager.assignTaskToAgent("999");

    // Restore original method
    taskManager.getTaskDetails = originalGetTaskDetails;

    taskAssignmentWorks =
      result &&
      result.success === true &&
      result.agent &&
      result.agent.id === "frontend-developer";

    if (result && result.success) {
      console.log(
        `Task assigned to: ${result.agent.name} (${result.agent.id})`
      );
    }
  } catch (err) {
    console.error(`Error testing task assignment: ${err.message}`);
  }

  testResult("Task Assignment", taskAssignmentWorks);

  // Test 8: Test agent switching
  let agentSwitchingWorks = false;

  try {
    // Save original active agent
    const originalAgent = globalThis.MULTI_AGENT_SYSTEM.active_agent;

    // Try to switch to a different agent
    const targetAgent = "frontend-developer";
    const result = globalThis.MULTI_AGENT_SYSTEM.switchToAgent(targetAgent);

    // Check if it worked
    agentSwitchingWorks =
      result === true &&
      globalThis.MULTI_AGENT_SYSTEM.active_agent === targetAgent;

    // Switch back to original agent
    globalThis.MULTI_AGENT_SYSTEM.switchToAgent(originalAgent);

    console.log(`Agent switching result: ${result ? "success" : "failed"}`);
  } catch (err) {
    console.error(`Error testing agent switching: ${err.message}`);
  }

  testResult("Agent Switching", agentSwitchingWorks);

  // Summary
  console.log("\n📋 TEST SUMMARY");
  console.log("================================");
  console.log(`Tests passed: ${passedTests} / ${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log("✅ All task delegation integration tests passed!");
    console.log(
      "The task management and agent delegation systems are properly integrated."
    );
  } else {
    console.log(`⚠️ ${failedTests} tests failed.`);
    console.log("Please review the test output for details.");
  }

  console.log("\n🔄 TASK-AGENT WORKFLOW:");
  console.log("================================");
  console.log("1. User issues a task command: 'start task'");
  console.log("2. Task system retrieves the next pending task");
  console.log("3. Task is marked as in-progress");
  console.log("4. Required capabilities are extracted from task details");
  console.log("5. Best agent is found based on capabilities");
  console.log("6. System switches to the best agent");
  console.log("7. Agent works on the task");
  console.log(
    "8. When task is completed, system switches back to executive architect"
  );
  console.log("================================");
})();
