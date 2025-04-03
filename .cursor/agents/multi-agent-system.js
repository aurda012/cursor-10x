/**
 * Multi-Agent System Controller
 * Version: 1.0.0 (April 2, 2025)
 *
 * This module provides the core functionality for the multi-agent system,
 * including agent registration, selection, and switching.
 */

const fs = require("fs");
const path = require("path");

// Import the rule loader
let ruleLoader;
try {
  ruleLoader = require("../utils/rule-loader");
} catch (error) {
  console.error(`Could not load rule loader: ${error.message}`);
}

console.log("🤖 MULTI-AGENT: Initializing multi-agent system...");

// Create utils directory if it doesn't exist
const utilsDir = path.join(__dirname, "../utils");
if (!fs.existsSync(utilsDir)) {
  try {
    fs.mkdirSync(utilsDir, { recursive: true });
    console.log(`Created directory: ${utilsDir}`);
  } catch (error) {
    console.error(`Error creating utils directory: ${error.message}`);
  }
}

// Constants
const AGENTS_DIR = path.join(__dirname);
const DEFAULT_AGENT = "executive-architect";

// Available agents configuration
const AVAILABLE_AGENTS = {
  "executive-architect": {
    name: "Executive Architect",
    emoji: "👑",
    description: "Leadership, planning, and coordination",
    capabilities: ["planning", "coordination", "oversight", "decision-making"],
    color: "#FFD700", // Gold
    rule: ".cursor/rules/101-executive-architect-agent.mdc",
  },
  "frontend-developer": {
    name: "Frontend Developer",
    emoji: "🎨",
    description: "UI/UX implementation and frontend code",
    capabilities: ["react", "css", "html", "javascript", "ui", "ux"],
    color: "#61DAFB", // React blue
    rule: ".cursor/rules/102-frontend-developer-agent.mdc",
  },
  "backend-developer": {
    name: "Backend Developer",
    emoji: "🔧",
    description: "Server-side architecture and implementation",
    capabilities: ["api", "database", "server", "security", "performance"],
    color: "#3C873A", // Node.js green
    rule: ".cursor/rules/103-backend-developer-agent.mdc",
  },
  "full-stack-integrator": {
    name: "Full-Stack Integrator",
    emoji: "🔄",
    description: "Cross-system implementation and integration",
    capabilities: ["integration", "testing", "deployment", "full-stack"],
    color: "#8A2BE2", // Blue Violet
    rule: ".cursor/rules/104-full-stack-integrator-agent.mdc",
  },
  "cms-specialist": {
    name: "CMS Specialist",
    emoji: "📄",
    description: "Content management systems expertise",
    capabilities: [
      "cms",
      "wordpress",
      "strapi",
      "contentful",
      "content-modeling",
    ],
    color: "#FF6B6B", // Coral
    rule: ".cursor/rules/105-cms-specialist-agent.mdc",
  },
  "data-engineer": {
    name: "Data Engineer",
    emoji: "📊",
    description: "Data pipelines and infrastructure",
    capabilities: ["data-modeling", "etl", "analytics", "visualization"],
    color: "#4169E1", // Royal Blue
    rule: ".cursor/rules/106-data-engineer-agent.mdc",
  },
  "doc-specialist": {
    name: "Documentation Specialist",
    emoji: "📚",
    description: "Comprehensive documentation",
    capabilities: [
      "documentation",
      "technical-writing",
      "api-docs",
      "user-guides",
    ],
    color: "#FFA500", // Orange
    rule: ".cursor/rules/107-doc-specialist-agent.mdc",
  },
};

// Initialize multi-agent system
class MultiAgentSystem {
  constructor() {
    this.activeAgent = null;
    this.registeredAgents = {};
    this.agentRules = {};
    this.loadRules();
    this.loadAgents();
    this.initializeGlobalSystem();
  }

  // Load rule files for all agents
  loadRules() {
    console.log("Loading agent rule files...");
    if (!ruleLoader) {
      console.warn("Rule loader not available, skipping rule loading");
      return;
    }

    try {
      // Load rules for all available agents
      Object.entries(AVAILABLE_AGENTS).forEach(([agentId, config]) => {
        if (config.rule) {
          const rule = ruleLoader.loadRule(config.rule);
          if (rule) {
            this.agentRules[agentId] = rule;
            console.log(`Loaded rule file for agent ${agentId}`);

            // Load referenced files if any
            const referencedFiles = ruleLoader.loadReferencedFiles(rule);
            if (Object.keys(referencedFiles).length > 0) {
              this.agentRules[agentId].referencedFiles = referencedFiles;
              console.log(
                `Loaded ${
                  Object.keys(referencedFiles).length
                } referenced files for agent ${agentId}`
              );
            }
          } else {
            console.warn(
              `Failed to load rule file for agent ${agentId}: ${config.rule}`
            );
          }
        }
      });

      console.log(
        `Loaded ${Object.keys(this.agentRules).length} agent rule files`
      );
    } catch (error) {
      console.error(`Error loading agent rules: ${error.message}`);
    }
  }

  // Load agent modules
  loadAgents() {
    console.log("Loading agent modules...");
    try {
      // Register built-in agents
      Object.keys(AVAILABLE_AGENTS).forEach((agentId) => {
        const agentConfig = AVAILABLE_AGENTS[agentId];
        this.registerAgent(agentId, agentConfig);

        // Try to load agent implementation if exists
        const agentFilePath = path.join(AGENTS_DIR, `${agentId}.js`);
        if (fs.existsSync(agentFilePath)) {
          try {
            const agentModule = require(agentFilePath);
            this.registeredAgents[agentId].module = agentModule;
            console.log(`Loaded agent module: ${agentId}`);
          } catch (error) {
            console.error(
              `Error loading agent module ${agentId}: ${error.message}`
            );
          }
        }
      });

      console.log(
        `Registered ${Object.keys(this.registeredAgents).length} agents`
      );
    } catch (error) {
      console.error(`Error loading agents: ${error.message}`);
    }
  }

  // Register an agent
  registerAgent(agentId, config) {
    // Get rule data if available
    const rule = this.agentRules[agentId] || null;

    // Create agent object with rule information
    this.registeredAgents[agentId] = {
      id: agentId,
      name: config.name,
      emoji: config.emoji,
      description: config.description,
      capabilities: config.capabilities || [],
      color: config.color,
      module: null,
      // Add rule information but don't parse it
      rulePath: rule ? rule.path : config.rule,
    };

    // Register agent in scratchpad database if available
    if (global.SCRATCHPAD && global.SCRATCHPAD.registerAgent) {
      global.SCRATCHPAD.registerAgent(agentId, config.name, {
        status: "active",
        capabilities: config.capabilities,
        metadata: {
          emoji: config.emoji,
          description: config.description,
          color: config.color,
          rulePath: rule ? rule.path : config.rule,
        },
      });
    }

    // Store agent information in memory system if available
    if (global.MEMORY_SYSTEM && global.MEMORY_SYSTEM.storeKnowledge) {
      global.MEMORY_SYSTEM.storeKnowledge("agents", agentId, {
        name: config.name,
        emoji: config.emoji,
        description: config.description,
        capabilities: config.capabilities || [],
        rulePath: rule ? rule.path : config.rule,
      });
    }

    return this.registeredAgents[agentId];
  }

  // Switch to a specific agent
  switchToAgent(agentId) {
    if (!this.registeredAgents[agentId]) {
      console.error(`Agent not found: ${agentId}`);
      return false;
    }

    const previousAgent = this.activeAgent;
    this.activeAgent = this.registeredAgents[agentId];

    console.log(
      `Switched from ${previousAgent ? previousAgent.id : "none"} to ${agentId}`
    );

    // Update banner to indicate active agent
    this.updateAgentBanner();

    // Store the active agent in memory
    if (global.MEMORY_SYSTEM && global.MEMORY_SYSTEM.storeContext) {
      global.MEMORY_SYSTEM.storeContext("active_agent", agentId);

      // Store agent details for easy access
      global.MEMORY_SYSTEM.storeContext("active_agent_details", {
        id: this.activeAgent.id,
        name: this.activeAgent.name,
        emoji: this.activeAgent.emoji,
        description: this.activeAgent.description,
        capabilities: this.activeAgent.capabilities,
        rulePath: this.activeAgent.rulePath,
      });
    }

    // Execute agent's activation method if available
    if (
      this.activeAgent.module &&
      typeof this.activeAgent.module.activate === "function"
    ) {
      try {
        // Provide the full rule to the agent
        if (this.agentRules[agentId]) {
          // Pass the complete rule object to the agent
          this.activeAgent.module.rule = this.agentRules[agentId].content;
          this.activeAgent.module.rulePath = this.agentRules[agentId].path;

          // Also provide referenced files if available
          if (this.agentRules[agentId].referencedFiles) {
            this.activeAgent.module.referencedFiles =
              this.agentRules[agentId].referencedFiles;
          }
        }

        this.activeAgent.module.activate();
      } catch (error) {
        console.error(`Error activating agent ${agentId}: ${error.message}`);
      }
    }

    return true;
  }

  // Get the currently active agent
  getActiveAgent() {
    return this.activeAgent;
  }

  // Get all registered agents
  getAllAgents() {
    return Object.values(this.registeredAgents);
  }

  // Get agent rule content
  getAgentRule(agentId) {
    if (!this.agentRules[agentId]) {
      console.warn(`No rule found for agent ${agentId}`);
      return null;
    }

    return this.agentRules[agentId];
  }

  // Find best agent for a specific task based on capabilities
  findBestAgentForTask(taskDescription, requiredCapabilities = []) {
    // Simplified agent selection logic (to be enhanced in future versions)
    if (requiredCapabilities.length > 0) {
      // Find agent with most matching capabilities
      const agentMatches = Object.values(this.registeredAgents).map((agent) => {
        const matchCount = agent.capabilities.filter((cap) =>
          requiredCapabilities.includes(cap)
        ).length;
        return { agent, matchCount };
      });

      // Sort by match count (descending)
      agentMatches.sort((a, b) => b.matchCount - a.matchCount);

      // Return the best match if it has at least one capability match
      if (agentMatches[0].matchCount > 0) {
        return agentMatches[0].agent;
      }
    }

    // Fallback to default agent
    return this.registeredAgents[DEFAULT_AGENT];
  }

  // Update the banner to show active agent
  updateAgentBanner() {
    if (!this.activeAgent) return;

    if (global.nextResponsePrepend) {
      // Remove any existing agent banners
      global.nextResponsePrepend = global.nextResponsePrepend.filter(
        (banner) => !banner.includes("[AGENT:")
      );

      // Add the current agent banner
      global.nextResponsePrepend.push(
        `${
          this.activeAgent.emoji
        } [AGENT: ${this.activeAgent.name.toUpperCase()}]`
      );
    }
  }

  // Initialize the global multi-agent system
  initializeGlobalSystem() {
    // Initialize with default agent
    this.switchToAgent(DEFAULT_AGENT);

    // Register with global system
    if (typeof global !== "undefined") {
      global.MULTI_AGENT_SYSTEM = this;
      console.log("Registered Multi-Agent System globally");
    }

    // Set up banner system if not already configured
    if (typeof global !== "undefined" && !global.nextResponsePrepend) {
      global.nextResponsePrepend = [];
    }

    // Add system banner
    if (typeof global !== "undefined" && global.nextResponsePrepend) {
      // Check if multi-agent system banner is already present
      const hasSystemBanner = global.nextResponsePrepend.some((banner) =>
        banner.includes("MULTI-AGENT SYSTEM")
      );

      if (!hasSystemBanner) {
        global.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");
      }
    }
  }
}

// Create the multi-agent system instance
const multiAgentSystem = new MultiAgentSystem();

// Export the module
module.exports = multiAgentSystem;

console.log("✅ MULTI-AGENT: Initialization complete");
