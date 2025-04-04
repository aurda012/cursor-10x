/**
 * Task Command Handler for Executive Architect
 * Handles task-related commands from users and integrates with the task manager.
 */

const taskManager = require("./task-manager");
const {
  formatTaskTable,
  formatTaskSummary,
  formatTaskDetails,
  formatTaskAssignment,
} = require("./task-formatter");

/**
 * Process a task command from the user
 * @param {string} command - The command to process
 * @returns {Object|null} Command result or null if not a task command
 */
function processTaskCommand(command) {
  if (!command || typeof command !== "string") return null;

  // Normalize the command
  const normalizedCommand = command.toLowerCase().trim();

  // Extract task ID if present
  const taskIdMatch = normalizedCommand.match(/task.*?(\d+)/);
  const taskId = taskIdMatch ? taskIdMatch[1] : null;

  // 1. List tasks
  if (normalizedCommand.includes("list task")) {
    const tasks = taskManager.getAllTasks();

    return {
      commandType: "listTasks",
      success: true,
      data: tasks,
      response: formatTaskTable(tasks),
    };
  }

  // 2. Task status
  if (normalizedCommand.includes("task status")) {
    const summary = taskManager.getTaskStatusSummary();

    return {
      commandType: "taskStatus",
      success: true,
      data: summary,
      response: formatTaskSummary(summary),
    };
  }

  // 3. Start task (next pending)
  if (normalizedCommand.includes("start task") && !taskId) {
    const startedTask = taskManager.startNextTask();

    if (!startedTask) {
      return {
        commandType: "startTask",
        success: false,
        response: "No pending tasks available to start.",
      };
    }

    // Automatically assign to best agent
    const assignResult = taskManager.assignTaskToAgent(startedTask.id);
    let assignMessage = "";

    if (assignResult.success) {
      assignMessage = `\n\n${formatTaskAssignment(assignResult)}`;
    }

    return {
      commandType: "startTask",
      success: true,
      data: startedTask,
      response: `Started task #${startedTask.id}: ${startedTask.title}${assignMessage}`,
    };
  }

  // 4. Start specific task
  if (normalizedCommand.includes("start task") && taskId) {
    const task = taskManager.getTaskById(taskId);

    if (!task) {
      return {
        commandType: "startTask",
        success: false,
        response: `Task #${taskId} not found.`,
      };
    }

    if (task.status === "in-progress") {
      return {
        commandType: "startTask",
        success: false,
        response: `Task #${taskId} is already in progress.`,
      };
    }

    if (task.status === "done") {
      return {
        commandType: "startTask",
        success: false,
        response: `Task #${taskId} is already completed.`,
      };
    }

    // There's already a task in progress
    const currentTask = taskManager.getCurrentTask();
    if (currentTask && currentTask.id !== taskId) {
      return {
        commandType: "startTask",
        success: false,
        response: `Cannot start task #${taskId}. Task #${currentTask.id} is already in progress.`,
      };
    }

    const success = taskManager.updateTaskStatus(taskId, "in-progress");

    if (!success) {
      return {
        commandType: "startTask",
        success: false,
        response: `Failed to start task #${taskId}.`,
      };
    }

    const startedTask = taskManager.getTaskDetails(taskId);

    // Automatically assign to best agent
    const assignResult = taskManager.assignTaskToAgent(startedTask.id);
    let assignMessage = "";

    if (assignResult.success) {
      assignMessage = `\n\n${formatTaskAssignment(assignResult)}`;
    }

    return {
      commandType: "startTask",
      success: true,
      data: startedTask,
      response: `Started task #${taskId}: ${startedTask.title}${assignMessage}`,
    };
  }

  // 5. Complete task
  if (normalizedCommand.includes("complete task")) {
    const currentTask = taskManager.getCurrentTask();

    if (!currentTask) {
      return {
        commandType: "completeTask",
        success: false,
        response: "No task is currently in progress.",
      };
    }

    const success = taskManager.completeCurrentTask();

    if (!success) {
      return {
        commandType: "completeTask",
        success: false,
        response: `Failed to complete task #${currentTask.id}.`,
      };
    }

    // Switch back to executive architect after task completion
    if (
      globalThis.MULTI_AGENT_SYSTEM &&
      typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent === "function"
    ) {
      globalThis.MULTI_AGENT_SYSTEM.switchToAgent("executive-architect");
    }

    // Check if there are more tasks
    const nextTask = taskManager.getNextPendingTask();
    let nextTaskMessage = "";

    if (nextTask) {
      nextTaskMessage = `\n\nNext pending task: #${nextTask.id} - ${nextTask.title}`;
    } else {
      nextTaskMessage = "\n\nNo more pending tasks.";
    }

    return {
      commandType: "completeTask",
      success: true,
      data: currentTask,
      response: `Completed task #${currentTask.id}: ${currentTask.title}${nextTaskMessage}`,
    };
  }

  // 6. Current/Next task
  if (normalizedCommand.includes("current task")) {
    const currentTask = taskManager.getCurrentTask();

    if (!currentTask) {
      return {
        commandType: "currentTask",
        success: false,
        response: "No task is currently in progress.",
      };
    }

    return {
      commandType: "currentTask",
      success: true,
      data: currentTask,
      response: formatTaskDetails(currentTask),
    };
  }

  if (normalizedCommand.includes("next task")) {
    const nextTask = taskManager.getNextPendingTask();

    if (!nextTask) {
      return {
        commandType: "nextTask",
        success: false,
        response: "No pending tasks available.",
      };
    }

    return {
      commandType: "nextTask",
      success: true,
      data: nextTask,
      response: formatTaskDetails(nextTask),
    };
  }

  // 7. Task details
  if (normalizedCommand.includes("task details") && taskId) {
    const taskDetails = taskManager.getTaskDetails(taskId);
    if (!taskDetails) {
      return {
        commandType: "taskDetails",
        success: false,
        response: `Task #${taskId} not found.`,
      };
    }

    return {
      commandType: "taskDetails",
      success: true,
      data: taskDetails,
      response: formatTaskDetails(taskDetails),
    };
  }

  // 8. Create task
  if (normalizedCommand.includes("create task")) {
    // Since creating a task requires more input, just return the command type
    // The actual task creation will be handled by the caller
    return {
      commandType: "createTask",
      success: true,
      response:
        "Please provide the task details: title, file path, and prompt.",
    };
  }

  // 9. Assign task
  if (
    (normalizedCommand.includes("assign task") ||
      normalizedCommand.includes("delegate task")) &&
    taskId
  ) {
    const result = taskManager.assignTaskToAgent(taskId);

    return {
      commandType: "assignTask",
      success: result.success,
      data: result,
      response: result.success ? formatTaskAssignment(result) : result.message,
    };
  }

  // 10. Assign current task (if no ID specified)
  if (
    (normalizedCommand.includes("assign task") ||
      normalizedCommand.includes("delegate task")) &&
    !taskId
  ) {
    const currentTask = taskManager.getCurrentTask();
    if (!currentTask) {
      return {
        commandType: "assignTask",
        success: false,
        response: "There is no task currently in progress to assign.",
      };
    }

    const result = taskManager.assignTaskToAgent(currentTask.id);

    return {
      commandType: "assignTask",
      success: result.success,
      data: result,
      response: result.success ? formatTaskAssignment(result) : result.message,
    };
  }

  // Not a task command
  return null;
}

/**
 * Formats a list of tasks for display
 * @param {Array} tasks Array of task objects
 * @returns {string} Formatted task list
 */
function formatTaskList(tasks) {
  if (!tasks || tasks.length === 0) {
    return "No tasks found.";
  }

  // Sort tasks by ID
  tasks.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  // Create a table-like format
  let result = "# Task List\n\n";
  result += "| ID | Status | File | Title |\n";
  result += "|-----|---------------|------------|-------|\n";

  for (const task of tasks) {
    // Format status with emoji
    let statusEmoji = "⏳";
    if (task.status === "in-progress") statusEmoji = "🔄";
    if (task.status === "done") statusEmoji = "✅";

    result += `| ${task.id} | ${statusEmoji} ${task.status} | ${
      task.file || "N/A"
    } | ${task.title} |\n`;
  }

  return result;
}

/**
 * Formats task status summary for display
 * @param {Object} status The status summary object
 * @returns {string} Formatted task status
 */
function formatTaskStatus(status) {
  return `# Task Status Summary
  
- Total Tasks: ${status.total}
- Pending: ${status.pending}
- In Progress: ${status.inProgress}
- Completed: ${status.done}
- Completion: ${status.percentComplete}%

${generateProgressBar(status.percentComplete)}`;
}

/**
 * Formats a task for display when starting
 * @param {Object} task The task object
 * @returns {string} Formatted task start message
 */
function formatTaskStart(task) {
  return `# Starting Task #${task.id}: ${task.title}

## Target File
\`${task.file || "N/A"}\`

## Prompt
${task.prompt}

I'll coordinate the team to work on this task now.`;
}

/**
 * Generates a progress bar
 * @param {number} percent The percentage complete
 * @returns {string} ASCII progress bar
 */
function generateProgressBar(percent) {
  const width = 20;
  const filled = Math.round(width * (percent / 100));
  const empty = width - filled;

  const filledBar = "█".repeat(filled);
  const emptyBar = "░".repeat(empty);

  return `[${filledBar}${emptyBar}] ${percent}%`;
}

/**
 * Creates a new task
 * @param {Object} taskData The task data
 * @returns {Object} The response object
 */
function createNewTask(taskData) {
  if (!taskData || !taskData.title || !taskData.prompt) {
    return {
      commandType: "createTask",
      success: false,
      response: "Task creation failed. Title and prompt are required.",
    };
  }

  const newTask = taskManager.createTask(taskData);

  return {
    commandType: "createTask",
    success: true,
    data: newTask,
    response: `Task #${newTask.id}: "${newTask.title}" has been created.`,
  };
}

module.exports = {
  processTaskCommand,
  createNewTask,
};
