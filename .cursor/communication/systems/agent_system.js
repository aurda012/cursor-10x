/**
 * Agent System
 *
 * Manages and coordinates seven specialized agents:
 * - Executive Architect
 * - Frontend Developer
 * - Backend Developer
 * - Full-Stack Integrator
 * - CMS Specialist
 * - Data Engineer
 * - Documentation Specialist
 */

// Create global namespace if it doesn't exist
if (typeof globalThis.SYSTEM === "undefined") {
  globalThis.SYSTEM = {};
}

// Configuration for all agents
const AGENT_CONFIG = [
  {
    id: "ea",
    name: "Executive Architect",
    role: "Executive Architect",
    capabilities: [
      "project_orchestration",
      "technical_architecture",
      "strategic_decision_making",
      "team_leadership",
      "quality_assurance",
    ],
  },
  {
    id: "frontend",
    name: "Frontend Developer",
    role: "Frontend Developer",
    capabilities: [
      "react_components",
      "ui_implementation",
      "performance_optimization",
      "accessibility",
      "cross_functional_collaboration",
    ],
  },
  {
    id: "backend",
    name: "Backend Developer",
    role: "Backend Developer",
    capabilities: [
      "system_architecture",
      "code_implementation",
      "database_management",
      "security_implementation",
      "devops_integration",
    ],
  },
  {
    id: "fullstack",
    name: "Full-Stack Integrator",
    role: "Full-Stack Integrator",
    capabilities: [
      "task_coordination",
      "workflow_management",
      "system_integration",
      "decision_making",
      "communication_facilitation",
    ],
  },
  {
    id: "cms",
    name: "CMS Specialist",
    role: "CMS Specialist",
    capabilities: [
      "content_management",
      "technical_implementation",
      "quality_assurance",
      "cross_functional_collaboration",
      "performance_optimization",
    ],
  },
  {
    id: "data",
    name: "Data Engineer",
    role: "Data Engineer",
    capabilities: [
      "data_pipeline",
      "data_processing",
      "database_management",
      "data_quality",
      "data_architecture",
    ],
  },
  {
    id: "doc",
    name: "Documentation Specialist",
    role: "Documentation Specialist",
    capabilities: [
      "technical_writing",
      "api_documentation",
      "user_guides",
      "system_documentation",
      "knowledge_management",
    ],
  },
];

/**
 * AgentSystem manages seven specialized agents
 */
class AgentSystem {
  constructor() {
    this.agents = {};
    this.activeAgents = [];
    this.actionLog = [];
    this.initialized = false;

    // Register all agents
    AGENT_CONFIG.forEach((agent) => {
      this.registerAgent(agent);
    });
  }

  /**
   * Initialize the agent system
   */
  initialize() {
    console.log("Initializing Agent System...");

    try {
      // Already initialized by constructor, just update status
      this.initialized = true;
      console.log("Agent System initialized successfully");

      // Store agent initialization in memory system if available
      this._recordToMemory(
        "system",
        "Agent System initialized with agents: " +
          Object.values(this.agents)
            .map((a) => a.name)
            .join(", ")
      );

      return true;
    } catch (error) {
      console.error("Error initializing Agent System:", error);
      return false;
    }
  }

  /**
   * Register an agent
   * @param {object} agent - Agent configuration
   */
  registerAgent(agent) {
    this.agents[agent.id] = {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      capabilities: agent.capabilities || [],
      stats: {
        taskCount: 0,
        successRate: 0,
        lastActive: null,
      },
    };

    console.log(`Registered agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Get all agents
   * @returns {object[]} - Array of agents
   */
  getAgents() {
    return Object.values(this.agents);
  }

  /**
   * Get a specific agent by ID
   * @param {string} agentId - Agent ID
   * @returns {object|null} - Agent or null if not found
   */
  getAgent(agentId) {
    return this.agents[agentId] || null;
  }

  /**
   * Set the active agent
   * @param {string} agentId - Agent ID
   */
  setActiveAgent(agentId) {
    const agent = this.getAgent(agentId);

    if (!agent) {
      console.error(`Agent not found: ${agentId}`);
      return false;
    }

    // Update agent stats
    agent.stats.lastActive = new Date().toISOString();

    // Add to active agents if not already there
    if (!this.activeAgents.includes(agentId)) {
      this.activeAgents.push(agentId);
    }

    // Log action
    this.logAction({
      type: "agent_activated",
      agentId: agent.id,
      timestamp: Date.now(),
    });

    // Record to memory
    this._recordToMemory("system", `Agent activated: ${agent.name}`);

    return true;
  }

  /**
   * Log an agent action
   * @param {object} action - Action object
   */
  logAction(action) {
    this.actionLog.push(action);
    console.log(`Agent action logged: ${action.type} by ${action.agentId}`);

    // Store in memory if important action
    if (action.type.includes("complete") || action.type.includes("error")) {
      this._recordToMemory(
        "system",
        `Agent ${action.agentId} ${action.type}: ${action.details || ""}`
      );
    }
  }

  /**
   * Get recommended agents for a task
   * @param {string} task - Task description
   * @returns {string[]} - Array of recommended agent IDs
   */
  getRecommendedAgents(task) {
    const taskLower = task.toLowerCase();
    const matches = [];

    // Simple keyword matching
    if (
      taskLower.includes("plan") ||
      taskLower.includes("project") ||
      taskLower.includes("coordinate") ||
      taskLower.includes("architect") ||
      taskLower.includes("strategy")
    ) {
      matches.push("ea");
    }

    if (
      taskLower.includes("ui") ||
      taskLower.includes("interface") ||
      taskLower.includes("react") ||
      taskLower.includes("component") ||
      taskLower.includes("frontend")
    ) {
      matches.push("frontend");
    }

    if (
      taskLower.includes("api") ||
      taskLower.includes("server") ||
      taskLower.includes("backend") ||
      taskLower.includes("database") ||
      taskLower.includes("authentication")
    ) {
      matches.push("backend");
    }

    if (
      taskLower.includes("integration") ||
      taskLower.includes("workflow") ||
      taskLower.includes("fullstack") ||
      taskLower.includes("deployment") ||
      taskLower.includes("orchestration")
    ) {
      matches.push("fullstack");
    }

    if (
      taskLower.includes("content") ||
      taskLower.includes("cms") ||
      taskLower.includes("wordpress") ||
      taskLower.includes("publishing") ||
      taskLower.includes("headless")
    ) {
      matches.push("cms");
    }

    if (
      taskLower.includes("data") ||
      taskLower.includes("pipeline") ||
      taskLower.includes("etl") ||
      taskLower.includes("storage") ||
      taskLower.includes("dataset")
    ) {
      matches.push("data");
    }

    if (
      taskLower.includes("document") ||
      taskLower.includes("manual") ||
      taskLower.includes("guide") ||
      taskLower.includes("documentation") ||
      taskLower.includes("wiki")
    ) {
      matches.push("doc");
    }

    // For general development tasks, involve multiple agents
    if (
      taskLower.includes("develop") ||
      taskLower.includes("code") ||
      taskLower.includes("implement")
    ) {
      // Check for specific context to determine if we need frontend or backend or both
      if (
        taskLower.includes("ui") ||
        taskLower.includes("component") ||
        taskLower.includes("interface")
      ) {
        matches.push("frontend");
      } else if (
        taskLower.includes("api") ||
        taskLower.includes("server") ||
        taskLower.includes("database")
      ) {
        matches.push("backend");
      } else {
        // If no specific context, involve both frontend and backend
        if (!matches.includes("frontend")) matches.push("frontend");
        if (!matches.includes("backend")) matches.push("backend");
        if (!matches.includes("fullstack")) matches.push("fullstack");
      }
    }

    // Ensure at least one agent is recommended
    if (matches.length === 0) {
      matches.push("ea"); // Default to Executive Architect
    }

    // Record task recommendations to memory
    this._recordToMemory(
      "system",
      `Agent recommendations for task: ${task}\nRecommended: ${matches.join(
        ", "
      )}`
    );

    return matches;
  }

  /**
   * Create a collaboration session between agents
   * @param {string[]} agentIds - Array of agent IDs
   * @param {string} taskDescription - Task description
   * @returns {string} - Session ID
   */
  createCollaborationSession(agentIds, taskDescription) {
    // Validate agent IDs
    const validAgentIds = agentIds.filter((id) => this.getAgent(id) !== null);

    if (validAgentIds.length === 0) {
      throw new Error("No valid agents provided for collaboration session");
    }

    // Create session ID
    const sessionId = `collab_${Date.now()}`;

    // Activate all agents in the session
    validAgentIds.forEach((id) => this.setActiveAgent(id));

    // Log action
    this.logAction({
      type: "collaboration_session_created",
      agentIds: validAgentIds,
      sessionId,
      task: taskDescription,
      timestamp: Date.now(),
    });

    // Record to memory system for persistent recall
    const agentNames = validAgentIds
      .map((id) => this.getAgent(id).name)
      .join(", ");
    this._recordToMemory(
      "system",
      `Collaboration session ${sessionId} created for task: ${taskDescription}\n` +
        `Participating agents: ${agentNames}`
    );

    console.log(
      `Created collaboration session ${sessionId} for agents: ${validAgentIds.join(
        ", "
      )}`
    );

    // Record the collaboration session in the scratchpad if available
    if (globalThis.SCRATCHPAD_SYSTEM) {
      try {
        // Create a thread for this collaboration
        const threadId = globalThis.SCRATCHPAD_SYSTEM.createThread(
          "system",
          `Collaboration: ${taskDescription}`,
          sessionId
        );

        // Add initial task message
        globalThis.SCRATCHPAD_SYSTEM.createMessage(
          "system",
          "general",
          "collaboration_init",
          {
            task: taskDescription,
            agents: validAgentIds,
            created_at: new Date().toISOString(),
          },
          threadId
        );

        console.log(
          `Created scratchpad thread for collaboration session: ${threadId}`
        );
      } catch (error) {
        console.error(
          "Error creating scratchpad entries for collaboration:",
          error
        );
      }
    }

    return sessionId;
  }

  /**
   * Record important agent events to memory system
   * @private
   * @param {string} role - Role (usually 'system' or agent ID)
   * @param {string} content - Content to store
   */
  _recordToMemory(role, content) {
    // Store to memory system if available
    if (globalThis.MEMORY_SYSTEM) {
      try {
        globalThis.MEMORY_SYSTEM.storeConversation({
          role: role,
          content: content,
          timestamp: Date.now(),
          metadata: {
            type: "agent_system",
            context: "agent_coordination",
          },
        });
      } catch (error) {
        console.error("Error recording to memory system:", error);
      }
    }

    // Also store to global conversation store if available
    if (typeof globalThis.storeConversation === "function") {
      try {
        globalThis.storeConversation(role, content, {
          type: "agent_system",
          context: "agent_coordination",
        });
      } catch (error) {
        // Silently continue if this fails
      }
    }
  }
}

// Singleton instance
let agentSystem = null;

/**
 * Initialize the agent system
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function initializeAgentSystem() {
  console.log("Initializing Agent System...");

  try {
    // Create agent system if it doesn't exist
    if (!agentSystem) {
      agentSystem = new AgentSystem();
      const initialized = agentSystem.initialize();

      if (!initialized) {
        throw new Error("Failed to initialize Agent System");
      }

      // Set up global AGENT_SYSTEM reference
      console.log("Setting up global AGENT_SYSTEM reference");
      globalThis.AGENT_SYSTEM = agentSystem;

      // Store agent information in SYSTEM
      globalThis.SYSTEM.agents = {};
      agentSystem.getAgents().forEach((agent) => {
        globalThis.SYSTEM.agents[agent.id] = agent;
      });
    }

    // Update SYSTEM status
    globalThis.SYSTEM.agentInitialized = true;

    console.log("Agent System initialized successfully");

    return true;
  } catch (error) {
    console.error("Error initializing Agent System:", error);
    return false;
  }
}

// Module exports
module.exports = {
  initializeAgentSystem,
  getAgentSystem: () => agentSystem,
};
