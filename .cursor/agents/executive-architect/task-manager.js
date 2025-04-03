/**
 * Task Manager Utility for Executive Architect
 * This module provides functions for managing tasks in the project.
 */

const fs = require("fs");
const path = require("path");

// Path constants
const TASKS_DIR = path.join(process.cwd(), "tasks");
const TASKS_JSON_PATH = path.join(TASKS_DIR, "tasks.json");

/**
 * Ensures the tasks directory and tasks.json file exist
 */
function ensureTasksStructure() {
  // Create tasks directory if it doesn't exist
  if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
    console.log("Created tasks directory");
  }

  // Create tasks.json if it doesn't exist
  if (!fs.existsSync(TASKS_JSON_PATH)) {
    const initialTasksJson = {
      tasks: [],
      metadata: {
        last_updated: new Date().toISOString(),
        pending_count: 0,
        in_progress_count: 0,
        done_count: 0,
      },
    };
    fs.writeFileSync(
      TASKS_JSON_PATH,
      JSON.stringify(initialTasksJson, null, 2)
    );
    console.log("Created tasks.json file");
  }
}

/**
 * Reads the tasks.json file
 * @returns {Object} The parsed tasks data
 */
function getTasksData() {
  ensureTasksStructure();
  const tasksData = JSON.parse(fs.readFileSync(TASKS_JSON_PATH, "utf8"));
  return tasksData;
}

/**
 * Writes data to the tasks.json file
 * @param {Object} tasksData The data to write
 */
function saveTasksData(tasksData) {
  // Update metadata
  tasksData.metadata.last_updated = new Date().toISOString();

  // Update counts
  tasksData.metadata.pending_count = tasksData.tasks.filter(
    (t) => t.status === "pending"
  ).length;
  tasksData.metadata.in_progress_count = tasksData.tasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  tasksData.metadata.done_count = tasksData.tasks.filter(
    (t) => t.status === "done"
  ).length;

  // Save file
  fs.writeFileSync(TASKS_JSON_PATH, JSON.stringify(tasksData, null, 2));
}

/**
 * Gets all tasks
 * @returns {Array} Array of task objects
 */
function getAllTasks() {
  const tasksData = getTasksData();
  return tasksData.tasks;
}

/**
 * Gets a task by ID
 * @param {string} id The task ID
 * @returns {Object|null} The task object or null if not found
 */
function getTaskById(id) {
  const tasksData = getTasksData();
  return tasksData.tasks.find((task) => task.id === id) || null;
}

/**
 * Gets the full task details from its file
 * @param {string} id The task ID
 * @returns {Object|null} The full task details or null if not found
 */
function getTaskDetails(id) {
  const task = getTaskById(id);
  if (!task) return null;

  const taskFilePath = path.join(TASKS_DIR, task.filename);
  if (!fs.existsSync(taskFilePath)) return null;

  const content = fs.readFileSync(taskFilePath, "utf8");
  const lines = content.split("\n");

  const details = {
    id: id,
    title: "",
    file: "",
    description: "",
    prompt: "",
    status: task.status,
  };

  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith("ID:")) {
      // Skip ID as we already have it
    } else if (line.startsWith("TITLE:")) {
      details.title = line.substring("TITLE:".length).trim();
      currentSection = null;
    } else if (line.startsWith("FILE:")) {
      details.file = line.substring("FILE:".length).trim();
      currentSection = null;
    } else if (line.startsWith("DESCRIPTION:")) {
      details.description = line.substring("DESCRIPTION:".length).trim();
      currentSection = "description";
    } else if (line.startsWith("PROMPT:")) {
      details.prompt = line.substring("PROMPT:".length).trim();
      currentSection = "prompt";
    } else if (currentSection === "description") {
      // Append to description for multi-line descriptions
      details.description += "\n" + line;
    } else if (currentSection === "prompt") {
      // Append to prompt for multi-line prompts
      details.prompt += "\n" + line;
    }
  }

  return details;
}

/**
 * Creates a new task
 * @param {Object} taskData The task data (title, file, description, prompt)
 * @returns {Object} The created task
 */
function createTask(taskData) {
  const tasksData = getTasksData();

  // Determine next ID
  let nextId = "001";
  if (tasksData.tasks.length > 0) {
    // Find the highest ID and increment
    const highestId = Math.max(
      ...tasksData.tasks.map((t) => parseInt(t.id, 10))
    );
    nextId = (highestId + 1).toString().padStart(3, "0");
  }

  // Create task file
  const filename = `task_${nextId}.txt`;
  const filePath = path.join(TASKS_DIR, filename);

  const fileContent = `ID: ${nextId}
TITLE: ${taskData.title}
FILE: ${taskData.file || "N/A"}
DESCRIPTION: ${taskData.description}
PROMPT: ${taskData.prompt}`;

  fs.writeFileSync(filePath, fileContent);

  // Add to tasks.json
  const newTask = {
    id: nextId,
    filename: filename,
    title: taskData.title,
    file: taskData.file || "N/A",
    status: "pending",
  };

  tasksData.tasks.push(newTask);
  saveTasksData(tasksData);

  return newTask;
}

/**
 * Updates a task's status
 * @param {string} id The task ID
 * @param {string} status The new status
 * @returns {boolean} Success flag
 */
function updateTaskStatus(id, status) {
  // Validate status
  if (!["pending", "in-progress", "done"].includes(status)) {
    console.error(`Invalid status: ${status}`);
    return false;
  }

  // Update in tasks.json
  const tasksData = getTasksData();
  const taskIndex = tasksData.tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    console.error(`Task not found: ${id}`);
    return false;
  }

  tasksData.tasks[taskIndex].status = status;
  saveTasksData(tasksData);

  return true;
}

/**
 * Gets the next pending task
 * @returns {Object|null} The next pending task or null if none
 */
function getNextPendingTask() {
  const tasks = getAllTasks();

  // Sort by ID
  tasks.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  // Find the first pending task
  return tasks.find((task) => task.status === "pending") || null;
}

/**
 * Gets the current in-progress task
 * @returns {Object|null} The in-progress task or null if none
 */
function getCurrentTask() {
  const tasks = getAllTasks();
  return tasks.find((task) => task.status === "in-progress") || null;
}

/**
 * Gets a task status summary
 * @returns {Object} The status summary
 */
function getTaskStatusSummary() {
  const tasksData = getTasksData();

  return {
    total: tasksData.tasks.length,
    pending: tasksData.metadata.pending_count,
    inProgress: tasksData.metadata.in_progress_count,
    done: tasksData.metadata.done_count,
    percentComplete:
      tasksData.tasks.length > 0
        ? Math.round(
            (tasksData.metadata.done_count / tasksData.tasks.length) * 100
          )
        : 0,
  };
}

/**
 * Starts the next pending task
 * @returns {Object|null} The started task or null if none available
 */
function startNextTask() {
  const nextTask = getNextPendingTask();
  if (!nextTask) return null;

  updateTaskStatus(nextTask.id, "in-progress");
  return getTaskDetails(nextTask.id);
}

/**
 * Completes the current in-progress task
 * @returns {boolean} Success flag
 */
function completeCurrentTask() {
  const currentTask = getCurrentTask();
  if (!currentTask) return false;

  return updateTaskStatus(currentTask.id, "done");
}

/**
 * Assigns a task to the most suitable agent
 * @param {string} id The task ID
 * @returns {Object} Object containing the assigned agent and task details
 */
function assignTaskToAgent(id) {
  console.log(`[TASK MANAGER] Assigning task ${id} to suitable agent...`);

  try {
    // Get the task details
    const task = getTaskDetails(id);
    if (!task) {
      console.error(`[TASK MANAGER] Task ${id} not found`);
      return {
        success: false,
        message: `Task ${id} not found`,
      };
    }

    // Make sure the multi-agent system is available
    if (!globalThis.MULTI_AGENT_SYSTEM) {
      console.error(`[TASK MANAGER] Multi-agent system not available`);
      return {
        success: false,
        message: "Multi-agent system not available",
        task,
      };
    }

    // Extract capabilities needed based on task prompt and file path
    const capabilities = determineRequiredCapabilities(task);

    // Find the best agent for this task
    const agent = globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask(
      task.description,
      capabilities
    );

    if (!agent) {
      console.error(`[TASK MANAGER] No suitable agent found for task ${id}`);
      return {
        success: false,
        message: "No suitable agent found",
        task,
      };
    }

    // Switch to the selected agent
    globalThis.MULTI_AGENT_SYSTEM.switchToAgent(agent.id);

    console.log(`[TASK MANAGER] Assigned task ${id} to agent: ${agent.name}`);

    // Store the assignment in task metadata if possible
    try {
      // Read and parse the task file to add metadata
      const taskFilePath = path.join(TASKS_DIR, `task_${id}.txt`);
      let content = fs.readFileSync(taskFilePath, "utf8");

      // Check if ASSIGNED_AGENT section already exists
      if (content.includes("ASSIGNED_AGENT:")) {
        // Update existing assignment
        content = content.replace(
          /ASSIGNED_AGENT:.*(\r?\n|$)/,
          `ASSIGNED_AGENT: ${agent.id} (${agent.name})$1`
        );
      } else {
        // Add new assignment at the end
        content += `\nASSIGNED_AGENT: ${agent.id} (${agent.name})`;
      }

      // Write updated content back to file
      fs.writeFileSync(taskFilePath, content);
    } catch (err) {
      console.error(`[TASK MANAGER] Error updating task file: ${err.message}`);
      // Continue anyway, this is just metadata
    }

    return {
      success: true,
      agent: agent,
      task: task,
      message: `Task ${id} assigned to ${agent.name}`,
    };
  } catch (error) {
    console.error(`[TASK MANAGER] Error assigning task: ${error.message}`);
    return {
      success: false,
      message: `Error assigning task: ${error.message}`,
    };
  }
}

/**
 * Determines required capabilities based on task details
 * @param {Object} task The task details
 * @returns {Array} Array of required capabilities
 */
function determineRequiredCapabilities(task) {
  const capabilities = [];

  // Extract capabilities from file path
  if (task.file) {
    const extension = path.extname(task.file).toLowerCase();

    // Frontend files
    if (
      [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html"].includes(
        extension
      )
    ) {
      capabilities.push("javascript");

      if ([".jsx", ".tsx"].includes(extension)) {
        capabilities.push("react");
      }

      if ([".css", ".scss"].includes(extension)) {
        capabilities.push("css");
      }

      if (
        task.file.includes("component") ||
        task.file.includes("/ui/") ||
        task.file.includes("/components/")
      ) {
        capabilities.push("ui");
        capabilities.push("ux");
      }
    }

    // Backend files
    if ([".js", ".ts", ".py", ".go", ".rb"].includes(extension)) {
      if (
        task.file.includes("/api/") ||
        task.file.includes("/server/") ||
        task.file.includes("/routes/") ||
        task.file.includes("/controllers/")
      ) {
        capabilities.push("api");
        capabilities.push("server");
      }

      if (
        task.file.includes("/db/") ||
        task.file.includes("/database/") ||
        task.file.includes("/models/")
      ) {
        capabilities.push("database");
      }
    }

    // CMS-related files
    if (
      task.file.includes("/cms/") ||
      task.file.includes("/content/") ||
      task.file.includes("wp-") ||
      task.file.includes("strapi")
    ) {
      capabilities.push("cms");
    }

    // Documentation files
    if (
      [".md", ".mdx", ".txt", ".doc", ".pdf"].includes(extension) ||
      task.file.includes("/docs/") ||
      task.file.includes("/documentation/")
    ) {
      capabilities.push("documentation");
      capabilities.push("technical-writing");
    }

    // Data-related files
    if (
      [".sql", ".json", ".csv", ".py"].includes(extension) ||
      task.file.includes("/data/") ||
      task.file.includes("/analytics/")
    ) {
      capabilities.push("data-modeling");
      capabilities.push("analytics");
    }
  }

  // Extract capabilities from prompt and description
  const textToAnalyze = (task.prompt + " " + task.description).toLowerCase();

  // Frontend indicators
  if (
    textToAnalyze.includes("ui") ||
    textToAnalyze.includes("ux") ||
    textToAnalyze.includes("interface") ||
    textToAnalyze.includes("component") ||
    textToAnalyze.includes("react") ||
    textToAnalyze.includes("css") ||
    textToAnalyze.includes("style") ||
    textToAnalyze.includes("layout")
  ) {
    capabilities.push("ui");
    capabilities.push("ux");

    if (textToAnalyze.includes("react")) {
      capabilities.push("react");
    }
  }

  // Backend indicators
  if (
    textToAnalyze.includes("api") ||
    textToAnalyze.includes("server") ||
    textToAnalyze.includes("database") ||
    textToAnalyze.includes("endpoint") ||
    textToAnalyze.includes("request") ||
    textToAnalyze.includes("response")
  ) {
    capabilities.push("api");
    capabilities.push("server");

    if (
      textToAnalyze.includes("database") ||
      textToAnalyze.includes("query") ||
      textToAnalyze.includes("data model")
    ) {
      capabilities.push("database");
    }

    if (textToAnalyze.includes("secure") || textToAnalyze.includes("auth")) {
      capabilities.push("security");
    }
  }

  // CMS indicators
  if (
    textToAnalyze.includes("cms") ||
    textToAnalyze.includes("content") ||
    textToAnalyze.includes("wordpress") ||
    textToAnalyze.includes("strapi") ||
    textToAnalyze.includes("contentful")
  ) {
    capabilities.push("cms");
    capabilities.push("content-modeling");
  }

  // Documentation indicators
  if (
    textToAnalyze.includes("document") ||
    textToAnalyze.includes("doc") ||
    textToAnalyze.includes("guide") ||
    textToAnalyze.includes("manual") ||
    textToAnalyze.includes("readme")
  ) {
    capabilities.push("documentation");
    capabilities.push("technical-writing");
  }

  // Data indicators
  if (
    textToAnalyze.includes("data") ||
    textToAnalyze.includes("analytic") ||
    textToAnalyze.includes("chart") ||
    textToAnalyze.includes("graph") ||
    textToAnalyze.includes("visualization") ||
    textToAnalyze.includes("metric")
  ) {
    capabilities.push("data-modeling");
    capabilities.push("analytics");
    capabilities.push("visualization");
  }

  // Integration indicators
  if (
    textToAnalyze.includes("integrate") ||
    textToAnalyze.includes("connection") ||
    textToAnalyze.includes("between") ||
    textToAnalyze.includes("full stack") ||
    textToAnalyze.includes("fullstack")
  ) {
    capabilities.push("integration");
    capabilities.push("full-stack");
  }

  // Planning indicators
  if (
    textToAnalyze.includes("plan") ||
    textToAnalyze.includes("coordinate") ||
    textToAnalyze.includes("architecture") ||
    textToAnalyze.includes("design") ||
    textToAnalyze.includes("strategy")
  ) {
    capabilities.push("planning");
    capabilities.push("coordination");
  }

  // Remove duplicates
  return [...new Set(capabilities)];
}

module.exports = {
  ensureTasksStructure,
  getAllTasks,
  getTaskById,
  getTaskDetails,
  createTask,
  updateTaskStatus,
  getNextPendingTask,
  getCurrentTask,
  getTaskStatusSummary,
  startNextTask,
  completeCurrentTask,
  assignTaskToAgent,
};
