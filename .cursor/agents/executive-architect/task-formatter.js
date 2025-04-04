/**
 * Task Formatter
 *
 * Utilities for formatting task output in a consistent way.
 */

/**
 * Format a list of tasks as a table
 * @param {Array} tasks - The tasks to format
 * @returns {string} Formatted tasks table
 */
function formatTaskTable(tasks) {
  if (!tasks || tasks.length === 0) {
    return "No tasks found.";
  }

  // Sort tasks by ID
  tasks.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  // Create table header
  let output = "## Project Tasks\n\n";
  output += "| ID | Status | Title | Target File |\n";
  output += "|:--:|:------:|:------|:------------|\n";

  // Add table rows
  tasks.forEach((task) => {
    const status = getStatusEmoji(task.status);
    output += `| ${task.id} | ${status} | ${task.title} | \`${task.file}\` |\n`;
  });

  return output;
}

/**
 * Format task status summary
 * @param {Object} summary - The task status summary
 * @returns {string} Formatted status
 */
function formatTaskSummary(summary) {
  if (!summary) {
    return "No task status available.";
  }

  let output = "## Task Status Summary\n\n";
  output += `- **Total Tasks:** ${summary.total}\n`;
  output += `- **Pending:** ${summary.pending}\n`;
  output += `- **In Progress:** ${summary.inProgress}\n`;
  output += `- **Completed:** ${summary.done}\n`;
  output += `- **Progress:** ${summary.percentComplete}%\n\n`;

  // Create progress bar
  const completedBlocks = Math.round(summary.percentComplete / 10);
  const emptyBlocks = 10 - completedBlocks;
  const progressBar = "🟩".repeat(completedBlocks) + "⬜".repeat(emptyBlocks);

  output += `${progressBar}`;

  return output;
}

/**
 * Format detailed task information
 * @param {Object} task - The task to format
 * @returns {string} Formatted task details
 */
function formatTaskDetails(task) {
  if (!task) {
    return "No task details available.";
  }

  const status = getStatusEmoji(task.status);

  let output = `## Task #${task.id}: ${task.title}\n\n`;
  output += `**Status:** ${status} ${task.status}\n`;
  output += `**Target File:** \`${task.file}\`\n\n`;

  if (task.prompt) {
    output += "### Task Prompt\n";
    output += task.prompt + "\n\n";
  }

  // Add assignment information if available
  if (task.assignedAgent) {
    const agentEmoji = getAgentEmoji(task.assignedAgent);
    output += `**Assigned to:** ${agentEmoji} ${task.assignedAgent}\n\n`;
  }

  return output;
}

/**
 * Format task assignment result
 * @param {Object} assignResult - The assignment result object
 * @returns {string} Formatted assignment message
 */
function formatTaskAssignment(assignResult) {
  if (!assignResult || !assignResult.success) {
    return "Failed to assign task.";
  }

  const { agent, task } = assignResult;
  const agentEmoji = agent.emoji || "👤";

  let output = `**Task assigned to: ${agentEmoji} ${agent.name}**\n\n`;

  if (agent.capabilities && agent.capabilities.length > 0) {
    output += `Capabilities: ${agent.capabilities.join(", ")}`;
  }

  return output;
}

/**
 * Get emoji for task status
 * @param {string} status - Task status
 * @returns {string} Status emoji
 */
function getStatusEmoji(status) {
  switch (status) {
    case "pending":
      return "⏳";
    case "in-progress":
      return "🔄";
    case "done":
      return "✅";
    default:
      return "❓";
  }
}

/**
 * Get emoji for agent
 * @param {string} agentId - Agent ID
 * @returns {string} Agent emoji
 */
function getAgentEmoji(agentId) {
  const agentEmojis = {
    "executive-architect": "👑",
    "frontend-developer": "🎨",
    "backend-developer": "🔧",
    "full-stack-integrator": "🔄",
    "cms-specialist": "📄",
    "data-engineer": "📊",
    "doc-specialist": "📚",
  };

  return agentEmojis[agentId] || "👤";
}

module.exports = {
  formatTaskTable,
  formatTaskSummary,
  formatTaskDetails,
  formatTaskAssignment,
  getStatusEmoji,
  getAgentEmoji,
};
