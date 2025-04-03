/**
 * Task Command Handler for Executive Architect
 * Handles task-related commands from users and integrates with the task manager.
 */

const taskManager = require("./task-manager");

/**
 * Processes task-related commands
 * @param {string} command The user command
 * @returns {Object|null} Response data or null if not a task command
 */
function processTaskCommand(command) {
  if (!command || typeof command !== "string") return null;

  // Normalize command by converting to lowercase and trimming
  const normalizedCommand = command.toLowerCase().trim();

  // Extract task ID if present (e.g., "task details 001")
  const taskIdMatch = normalizedCommand.match(/\b(\d{3})\b/);
  const taskId = taskIdMatch ? taskIdMatch[1] : null;

  // Handle different command types

  // 1. List tasks
  if (
    normalizedCommand.includes("list tasks") ||
    normalizedCommand.includes("show tasks")
  ) {
    const tasks = taskManager.getAllTasks();
    return {
      commandType: "listTasks",
      data: tasks,
      response: formatTaskList(tasks),
    };
  }

  // 2. Task status
  if (normalizedCommand.includes("task status")) {
    const status = taskManager.getTaskStatusSummary();
    return {
      commandType: "taskStatus",
      data: status,
      response: formatTaskStatus(status),
    };
  }

  // 3. Start task
  if (
    normalizedCommand.includes("start task") ||
    normalizedCommand.includes("begin task")
  ) {
    const task = taskManager.startNextTask();
    if (!task) {
      return {
        commandType: "startTask",
        success: false,
        response: "There are no pending tasks to start.",
      };
    }

    return {
      commandType: "startTask",
      success: true,
      data: task,
      response: formatTaskStart(task),
    };
  }

  // 4. Complete task
  if (
    normalizedCommand.includes("complete task") ||
    normalizedCommand.includes("finish task")
  ) {
    const currentTask = taskManager.getCurrentTask();
    if (!currentTask) {
      return {
        commandType: "completeTask",
        success: false,
        response: "There is no task currently in progress.",
      };
    }

    const success = taskManager.completeCurrentTask();
    return {
      commandType: "completeTask",
      success: success,
      data: currentTask,
      response: success
        ? `Task #${currentTask.id}: "${currentTask.title}" has been completed.`
        : `Failed to complete task #${currentTask.id}. Please try again.`,
    };
  }

  // 5. Current task
  if (normalizedCommand.includes("current task")) {
    const currentTask = taskManager.getCurrentTask();
    if (!currentTask) {
      return {
        commandType: "currentTask",
        success: false,
        response: "There is no task currently in progress.",
      };
    }

    const taskDetails = taskManager.getTaskDetails(currentTask.id);
    return {
      commandType: "currentTask",
      success: true,
      data: taskDetails,
      response: formatTaskDetails(taskDetails),
    };
  }

  // 6. Next task
  if (normalizedCommand.includes("next task")) {
    const nextTask = taskManager.getNextPendingTask();
    if (!nextTask) {
      return {
        commandType: "nextTask",
        success: false,
        response: "There are no pending tasks remaining.",
      };
    }

    const taskDetails = taskManager.getTaskDetails(nextTask.id);
    return {
      commandType: "nextTask",
      success: true,
      data: taskDetails,
      response: `The next task is #${nextTask.id}: "${
        nextTask.title
      }"\n\n${formatTaskDetails(taskDetails)}`,
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
        "Please provide the task details: title, file path, description, and prompt.",
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

## Description
${task.description}

## Prompt
${task.prompt}

I'll coordinate the team to work on this task now.`;
}

/**
 * Formats task details for display
 * @param {Object} task The task details
 * @returns {string} Formatted task details
 */
function formatTaskDetails(task) {
  // Format status with emoji
  let statusEmoji = "⏳";
  if (task.status === "in-progress") statusEmoji = "🔄";
  if (task.status === "done") statusEmoji = "✅";

  return `# Task #${task.id}: ${task.title}

- Status: ${statusEmoji} ${task.status}
- Target File: \`${task.file || "N/A"}\`

## Description
${task.description}

## Prompt
${task.prompt}`;
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
  if (
    !taskData ||
    !taskData.title ||
    !taskData.description ||
    !taskData.prompt
  ) {
    return {
      commandType: "createTask",
      success: false,
      response:
        "Task creation failed. Title, description, and prompt are required.",
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

/**
 * Formats the task assignment result for display
 * @param {Object} assignmentResult The assignment result object
 * @returns {string} Formatted assignment message
 */
function formatTaskAssignment(assignmentResult) {
  const { agent, task } = assignmentResult;

  // Format status with emoji
  let statusEmoji = "⏳";
  if (task.status === "in-progress") statusEmoji = "🔄";
  if (task.status === "done") statusEmoji = "✅";

  // Extract agent capabilities that matched the task
  const capabilities = agent.capabilities || [];

  return `# Task Assignment

Task #${task.id}: "${task.title}" has been assigned to the ${agent.name}.

## Task Details
- Status: ${statusEmoji} ${task.status}
- Target File: \`${task.file || "N/A"}\`

## Assigned Agent
- Name: ${agent.name}
- Role: ${agent.emoji} ${agent.description || "Specialized agent"}
- Capabilities: ${capabilities.join(", ")}

## Agent Instructions
The ${agent.name} will now work on this task with the following instructions:

${task.prompt}

The agent will focus on the file: \`${task.file || "N/A"}\`
`;
}

module.exports = {
  processTaskCommand,
  createNewTask,
};
