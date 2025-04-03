/**
 * Executive Architect Agent
 *
 * Specializes in leadership, planning, and coordination, focusing on:
 * - System architecture and technical planning
 * - Team coordination and task delegation
 * - Decision making and strategic oversight
 * - Project management and technical leadership
 */

const fs = require("fs");
const path = require("path");

// Agent metadata
const AGENT_METADATA = {
  name: "Executive Architect",
  emoji: "👑",
  description: "Leadership, planning, and coordination",
  rulesFile: ".cursor/rules/101-executive-architect-agent.mdc",
};

// Agent state
const state = {
  rule: null,
  rulePath: null,
  referencedFiles: {},
  activationTime: null,
  activeAgents: {},
};

/**
 * Activate the Executive Architect agent
 * This function will be called when the agent is activated
 * by the multi-agent system
 */
function activate() {
  const timestamp = new Date().toISOString();
  state.activationTime = timestamp;

  console.log(`🚀 Executive Architect Agent activated at ${timestamp}`);

  // Store activation in memory if memory system is available
  if (global.MEMORY_SYSTEM && global.MEMORY_SYSTEM.storeEvent) {
    global.MEMORY_SYSTEM.storeEvent("agent_activation", {
      agent: "executive-architect",
      timestamp: timestamp,
      details: {
        name: AGENT_METADATA.name,
        emoji: AGENT_METADATA.emoji,
      },
    });
  }

  // Send message to scratchpad if available
  if (global.SCRATCHPAD && global.SCRATCHPAD.createMessage) {
    global.SCRATCHPAD.createMessage("system", "notifications", {
      type: "agent_activation",
      agent: "executive-architect",
      timestamp: timestamp,
      content: `${AGENT_METADATA.emoji} Executive Architect Agent has been activated`,
      metadata: {
        name: AGENT_METADATA.name,
        description: AGENT_METADATA.description,
      },
    });
  }

  // Log rule information if available
  if (state.rule) {
    console.log(
      `📜 Loaded rule content of length: ${state.rule.length} characters`
    );

    // Log referenced files if any
    if (state.referencedFiles) {
      const fileCount = Object.keys(state.referencedFiles).length;
      if (fileCount > 0) {
        console.log(`📁 Loaded ${fileCount} referenced files from rule`);

        // Store file references in memory if available
        if (global.MEMORY_SYSTEM && global.MEMORY_SYSTEM.storeKnowledge) {
          global.MEMORY_SYSTEM.storeKnowledge(
            "agent_files",
            "executive-architect",
            {
              rulePath: state.rulePath,
              referencedFiles: Object.keys(state.referencedFiles),
            }
          );
        }
      }
    }
  }

  // As the lead agent, collect information about the system state
  collectSystemState();
}

/**
 * Collect information about the current system state
 * This helps the Executive Architect make informed decisions
 */
function collectSystemState() {
  // Get information about other agents if available
  if (global.MULTI_AGENT_SYSTEM) {
    const allAgents = global.MULTI_AGENT_SYSTEM.getAllAgents();
    if (allAgents) {
      state.activeAgents = {};
      allAgents.forEach((agent) => {
        state.activeAgents[agent.id] = {
          name: agent.name,
          emoji: agent.emoji,
          description: agent.description,
          capabilities: agent.capabilities || [],
        };
      });

      // Store collected information in memory
      if (global.MEMORY_SYSTEM && global.MEMORY_SYSTEM.storeContext) {
        global.MEMORY_SYSTEM.storeContext("system_state", {
          activeAgents: state.activeAgents,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}

/**
 * Delegate a task to another agent
 * @param {string} agentId - ID of the agent to delegate to
 * @param {object} task - Task details
 * @returns {boolean} - Success status
 */
function delegateTask(agentId, task) {
  if (!global.MULTI_AGENT_SYSTEM) {
    console.error("Cannot delegate task: Multi-agent system not available");
    return false;
  }

  // Switch to the target agent
  const success = global.MULTI_AGENT_SYSTEM.switchToAgent(agentId);

  if (success) {
    // Store the delegation in memory
    if (global.MEMORY_SYSTEM && global.MEMORY_SYSTEM.storeEvent) {
      global.MEMORY_SYSTEM.storeEvent("task_delegation", {
        from: "executive-architect",
        to: agentId,
        task: task,
        timestamp: new Date().toISOString(),
      });
    }

    // Notify via scratchpad
    if (global.SCRATCHPAD && global.SCRATCHPAD.createMessage) {
      global.SCRATCHPAD.createMessage("executive-architect", "tasks", {
        type: "task_delegation",
        to: agentId,
        content: `Task delegated to ${agentId}: ${task.description}`,
        task: task,
      });
    }
  }

  return success;
}

// Getter for rule content
function getRule() {
  return state.rule;
}

// Setter for rule content
function setRule(ruleContent, rulePath) {
  state.rule = ruleContent;
  state.rulePath = rulePath;
  return true;
}

// Getter for referenced files
function getReferencedFiles() {
  return state.referencedFiles;
}

// Setter for referenced files
function setReferencedFiles(files) {
  state.referencedFiles = files;
  return true;
}

// Expose rule content and referenced files as module properties
// These will be set by the multi-agent system
Object.defineProperties(module.exports, {
  rule: {
    get: getRule,
    set: function (content) {
      return setRule(content, this.rulePath);
    },
  },
  rulePath: {
    get: function () {
      return state.rulePath;
    },
    set: function (path) {
      state.rulePath = path;
      return true;
    },
  },
  referencedFiles: {
    get: getReferencedFiles,
    set: setReferencedFiles,
  },
});

// Export the agent API
module.exports = {
  metadata: AGENT_METADATA,
  activate,
  delegateTask,
  collectSystemState,
  getRule,
  getReferencedFiles,
  state, // Exposing state for debugging
};

console.log("✅ Executive Architect agent loaded");
