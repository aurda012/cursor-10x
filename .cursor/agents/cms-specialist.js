/**
 * CMS Specialist Agent
 *
 * Specializes in content management systems, focusing on:
 * - CMS implementation and customization
 * - Content modeling and structuring
 * - Content APIs and headless architectures
 * - Content workflow optimization
 */

const fs = require("fs");
const path = require("path");

// Agent metadata
const AGENT_METADATA = {
  name: "CMS Specialist",
  emoji: "📄",
  description: "Content management systems expertise",
  rulesFile: ".cursor/rules/105-cms-specialist-agent.mdc",
};

// Agent state
const state = {
  rule: null,
  rulePath: null,
  referencedFiles: {},
  activationTime: null,
};

/**
 * Activate the CMS Specialist agent
 * This function will be called when the agent is activated
 * by the multi-agent system
 */
function activate() {
  const timestamp = new Date().toISOString();
  state.activationTime = timestamp;

  console.log(`🚀 CMS Specialist Agent activated at ${timestamp}`);

  // Store activation in memory if memory system is available
  if (global.MEMORY_SYSTEM && global.MEMORY_SYSTEM.storeEvent) {
    global.MEMORY_SYSTEM.storeEvent("agent_activation", {
      agent: "cms-specialist",
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
      agent: "cms-specialist",
      timestamp: timestamp,
      content: `${AGENT_METADATA.emoji} CMS Specialist Agent has been activated`,
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
          global.MEMORY_SYSTEM.storeKnowledge("agent_files", "cms-specialist", {
            rulePath: state.rulePath,
            referencedFiles: Object.keys(state.referencedFiles),
          });
        }
      }
    }
  }
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
  getRule,
  getReferencedFiles,
  state, // Exposing state for debugging
};

console.log("✅ CMS Specialist agent loaded");
