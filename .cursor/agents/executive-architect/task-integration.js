/**
 * Task Integration Module for Executive Architect
 * Initializes the task system and integrates it with the agent's workflow.
 */

const fs = require("fs");
const path = require("path");
const taskManager = require("./task-manager");
const taskCommandHandler = require("./task-command-handler");

/**
 * Initializes the task system
 */
function initializeTaskSystem(options = {}) {
  console.log("🔄 Initializing Task Management System for Executive Architect");

  try {
    // Ensure task structure exists
    taskManager.ensureTasksStructure();

    // Register task system with the global agent system if available
    if (
      globalThis.MULTI_AGENT_SYSTEM &&
      globalThis.MULTI_AGENT_SYSTEM.agents &&
      globalThis.MULTI_AGENT_SYSTEM.agents["executive-architect"]
    ) {
      // Add task manager capabilities to the Executive Architect
      globalThis.MULTI_AGENT_SYSTEM.agents["executive-architect"].taskManager =
        taskManager;
      globalThis.MULTI_AGENT_SYSTEM.agents[
        "executive-architect"
      ].taskCommandHandler = taskCommandHandler;

      console.log("✅ Task system registered with Executive Architect agent");
    } else {
      console.log(
        "⚠️ Multi-agent system not available, continuing with standalone task system"
      );
    }

    // Create a global task manager for direct access
    globalThis.TASK_MANAGER = taskManager;
    globalThis.TASK_COMMAND_HANDLER = taskCommandHandler;

    // Create memory system integration if available
    if (options.memory) {
      try {
        console.log("✅ Task system integrated with memory system");
        const taskStatus = taskManager.getTaskStatusSummary();
        options.memory.set("taskStatus", taskStatus);

        const currentTask = taskManager.getCurrentTask();
        if (currentTask) {
          options.memory.set("currentTask", currentTask);
        }

        const nextTask = taskManager.getNextPendingTask();
        if (nextTask) {
          options.memory.set("nextTask", nextTask);
        }
      } catch (memErr) {
        console.error("❌ Failed to store in memory:", memErr);
      }
    }

    // Register with system registry if available
    if (options.registry) {
      try {
        console.log("✅ Task system registered with system registry");
        options.registry.register("taskManager", taskManager);
        options.registry.register("taskCommandHandler", taskCommandHandler);
      } catch (regErr) {
        console.error("❌ Failed to register with system registry:", regErr);
      }
    }

    // Create banner notification to confirm system is active
    if (Array.isArray(globalThis.nextResponsePrepend)) {
      globalThis.nextResponsePrepend.push("📋 [TASK MANAGEMENT: ACTIVE]");
    }

    return {
      success: true,
      message: "Task Management System initialized successfully",
    };
  } catch (error) {
    console.error("❌ Error initializing task system:", error);
    return {
      success: false,
      message: `Task Management System initialization failed: ${error.message}`,
    };
  }
}

/**
 * Processes an incoming message for task-related commands
 * @param {string} message The user message
 * @param {Object} context Context info
 * @returns {Object|null} Response data or null if not a task command
 */
function processMessage(message, context = {}) {
  if (!taskCommandHandler) {
    try {
      taskCommandHandler = require("./task-command-handler");
    } catch (err) {
      console.error("❌ Failed to load command handler:", err);
      return null;
    }
  }

  const result = taskCommandHandler.processTaskCommand(message);

  // If the command is to start a task, automatically assign it to the best agent
  if (result && result.commandType === "startTask" && result.success) {
    try {
      // Get the started task
      const taskId = result.data.id;

      // Assign to the best agent
      const assignmentResult = taskManager.assignTaskToAgent(taskId);

      // If assignment succeeded, enhance the response
      if (assignmentResult.success) {
        // Add assignment information to the response
        result.response += "\n\n" + "## Agent Assignment\n";
        result.response += `This task has been automatically assigned to the ${assignmentResult.agent.name} (${assignmentResult.agent.emoji}).`;
        result.response += `\nThe agent will now take over the implementation according to the task prompt.`;

        // Add agent-specific capabilities that matched
        if (
          assignmentResult.agent.capabilities &&
          assignmentResult.agent.capabilities.length > 0
        ) {
          result.response += `\nThis agent specializes in: ${assignmentResult.agent.capabilities.join(
            ", "
          )}`;
        }

        // Store the assignment in the result for later use
        result.agentAssignment = assignmentResult;
      }
    } catch (err) {
      console.error("❌ Error during automatic task assignment:", err);
      // Don't fail the entire operation if assignment fails
    }
  }

  return result;
}

/**
 * Creates a new task
 * @param {Object} taskData Task data (title, description, prompt)
 * @returns {Object} Response object
 */
function createTask(taskData) {
  if (!taskCommandHandler) {
    try {
      taskCommandHandler = require("./task-command-handler");
    } catch (err) {
      console.error("❌ Failed to load command handler:", err);
      return {
        success: false,
        response: "Failed to load task command handler.",
      };
    }
  }

  return taskCommandHandler.createNewTask(taskData);
}

/**
 * Updates the task metadata in memory system
 */
function updateTaskMetadata(memory) {
  if (!memory || !taskManager) return false;

  try {
    // Update task status summary
    const taskStatus = taskManager.getTaskStatusSummary();
    memory.set("taskStatus", taskStatus);

    // Update current task
    const currentTask = taskManager.getCurrentTask();
    memory.set("currentTask", currentTask || null);

    // Update next task
    const nextTask = taskManager.getNextPendingTask();
    memory.set("nextTask", nextTask || null);

    return true;
  } catch (err) {
    console.error("❌ Failed to update task metadata:", err);
    return false;
  }
}

// Initialize when this module is loaded
const initResult = initializeTaskSystem();
console.log(initResult.message);

module.exports = {
  initializeTaskSystem,
  processMessage,
  createTask,
  updateTaskMetadata,
  taskManager,
  taskCommandHandler,
};
