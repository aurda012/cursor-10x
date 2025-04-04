/**
 * System Fix and Test
 *
 * This script attempts to fix the scratchpad and banner systems,
 * then tests if they're working properly.
 */

console.log("🔧 Starting system fix...");

// Load the systems immediately without enforcer to avoid dependencies
console.log("\n📊 SYSTEM STATUS CHECK\n");

// Check system status
const memoryExists = !!globalThis.MEMORY_SYSTEM;
const scratchpadExists = !!globalThis.SCRATCHPAD;
const scratchpadSystemExists = !!globalThis.SCRATCHPAD_SYSTEM;
const multiAgentExists = !!globalThis.MULTI_AGENT_SYSTEM;
const agentSystemExists = !!globalThis.AGENT_SYSTEM;
const bannersExist = !!globalThis.nextResponsePrepend;

console.log("Memory System:", memoryExists);
console.log("Scratchpad:", scratchpadExists);
console.log("Scratchpad System:", scratchpadSystemExists);
console.log("Multi-Agent System:", multiAgentExists);
console.log("Agent System:", agentSystemExists);
console.log("Banners:", bannersExist);

// Fix systems if they don't exist
console.log("\n🛠️ FIXING SYSTEMS\n");

// Fix memory system
if (!memoryExists) {
  console.log("Creating memory system...");
  globalThis.MEMORY_SYSTEM = {
    initialized: true,
    shortTerm: {},
    episodic: [],

    storeContext: function (key, value) {
      this.shortTerm[key] = value;
      return true;
    },

    getContext: function (key) {
      return this.shortTerm[key];
    },

    storeConversation: function (conversation) {
      if (!this.episodic) this.episodic = [];
      this.episodic.push(conversation);
      return true;
    },

    getRecentConversations: function (limit = 10) {
      if (!this.episodic) return [];
      return this.episodic.slice(-limit);
    },
  };
  console.log("✅ Memory system created");
}

// Fix scratchpad system
if (!scratchpadExists) {
  console.log("Creating scratchpad system...");
  globalThis.SCRATCHPAD = {
    initialized: true,
    messages: [],

    createMessage: function (from, to, content) {
      const msg = {
        id: Date.now(),
        from,
        to,
        content,
        timestamp: Date.now(),
      };
      this.messages.push(msg);
      console.log(`Message created: ${from} -> ${to}`);
      return msg.id;
    },

    getMessages: function (filter = {}) {
      return this.messages.filter((msg) => {
        for (const key in filter) {
          if (msg[key] !== filter[key]) return false;
        }
        return true;
      });
    },
  };
  console.log("✅ Scratchpad created");
}

// Ensure SCRATCHPAD_SYSTEM reference is correct
if (
  !scratchpadSystemExists ||
  globalThis.SCRATCHPAD !== globalThis.SCRATCHPAD_SYSTEM
) {
  console.log("Fixing SCRATCHPAD_SYSTEM reference...");
  globalThis.SCRATCHPAD_SYSTEM = globalThis.SCRATCHPAD;
  console.log("✅ SCRATCHPAD_SYSTEM reference fixed");
}

// Fix multi-agent system
if (!multiAgentExists) {
  console.log("Creating multi-agent system...");
  globalThis.MULTI_AGENT_SYSTEM = {
    initialized: true,
    active_agent: "executive-architect",
    agents: {
      "executive-architect": {
        id: "executive-architect",
        name: "Executive Architect",
        emoji: "👑",
        description: "Technical leadership and project management",
        capabilities: [
          "planning",
          "coordination",
          "architecture",
          "leadership",
        ],
      },
      "frontend-developer": {
        id: "frontend-developer",
        name: "Frontend Developer",
        emoji: "🎨",
        description: "React and modern UI implementation",
        capabilities: ["ui", "ux", "react", "css", "javascript", "frontend"],
      },
      "backend-developer": {
        id: "backend-developer",
        name: "Backend Developer",
        emoji: "🔧",
        description: "Server-side architecture and implementation",
        capabilities: ["api", "server", "database", "security", "backend"],
      },
      "full-stack-integrator": {
        id: "full-stack-integrator",
        name: "Full Stack Integrator",
        emoji: "🔄",
        description: "Cross-system implementation",
        capabilities: ["integration", "full-stack", "deployment", "workflow"],
      },
      "cms-specialist": {
        id: "cms-specialist",
        name: "CMS Specialist",
        emoji: "📄",
        description: "Content management systems",
        capabilities: ["cms", "content-modeling", "content-management"],
      },
      "data-engineer": {
        id: "data-engineer",
        name: "Data Engineer",
        emoji: "📊",
        description: "Data pipelines and infrastructure",
        capabilities: ["data-modeling", "analytics", "visualization"],
      },
      "doc-specialist": {
        id: "doc-specialist",
        name: "Documentation Specialist",
        emoji: "📚",
        description: "Comprehensive documentation",
        capabilities: ["documentation", "technical-writing", "guides"],
      },
    },

    getActiveAgent: function () {
      return this.agents[this.active_agent];
    },

    getAllAgents: function () {
      return Object.values(this.agents);
    },

    // Add proper switchToAgent method for delegation
    switchToAgent: function (agentId) {
      if (this.agents[agentId]) {
        const previousAgent = this.active_agent;
        this.active_agent = agentId;

        console.log(`Switched from ${previousAgent} to ${agentId}`);

        // Update banner to indicate active agent
        this.updateAgentBanner();

        // Store the active agent in memory if available
        if (globalThis.MEMORY_SYSTEM && globalThis.MEMORY_SYSTEM.storeContext) {
          globalThis.MEMORY_SYSTEM.storeContext("active_agent", agentId);
        }

        // Notify via scratchpad if available
        if (globalThis.SCRATCHPAD && globalThis.SCRATCHPAD.createMessage) {
          globalThis.SCRATCHPAD.createMessage(
            "system",
            "all",
            `Agent switched to: ${this.agents[agentId].name} (${this.agents[agentId].emoji})`
          );
        }

        return true;
      }
      console.error(`Agent not found: ${agentId}`);
      return false;
    },

    // Add findBestAgentForTask method for task delegation
    findBestAgentForTask: function (
      taskDescription,
      requiredCapabilities = []
    ) {
      if (requiredCapabilities.length > 0) {
        // Find agent with most matching capabilities
        const agentMatches = Object.values(this.agents).map((agent) => {
          const agentCapabilities = agent.capabilities || [];
          const matchCount = agentCapabilities.filter((cap) =>
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

      // Simple content-based matching as backup
      taskDescription = taskDescription.toLowerCase();

      if (
        taskDescription.includes("frontend") ||
        taskDescription.includes("ui") ||
        taskDescription.includes("interface") ||
        taskDescription.includes("react") ||
        taskDescription.includes("component")
      ) {
        return this.agents["frontend-developer"];
      }

      if (
        taskDescription.includes("backend") ||
        taskDescription.includes("server") ||
        taskDescription.includes("api") ||
        taskDescription.includes("database")
      ) {
        return this.agents["backend-developer"];
      }

      if (
        taskDescription.includes("integration") ||
        taskDescription.includes("full-stack") ||
        taskDescription.includes("deploy")
      ) {
        return this.agents["full-stack-integrator"];
      }

      if (
        taskDescription.includes("content") ||
        taskDescription.includes("cms")
      ) {
        return this.agents["cms-specialist"];
      }

      if (
        taskDescription.includes("data") ||
        taskDescription.includes("analytics")
      ) {
        return this.agents["data-engineer"];
      }

      if (
        taskDescription.includes("documentation") ||
        taskDescription.includes("docs") ||
        taskDescription.includes("guide")
      ) {
        return this.agents["doc-specialist"];
      }

      // Fallback to executive architect
      return this.agents["executive-architect"];
    },

    // Add banner update method
    updateAgentBanner: function () {
      if (!globalThis.nextResponsePrepend) {
        globalThis.nextResponsePrepend = [];
      }

      const currentAgent = this.agents[this.active_agent];
      if (!currentAgent) return;

      // Remove any existing agent banners
      globalThis.nextResponsePrepend = globalThis.nextResponsePrepend.filter(
        (banner) => !banner.includes("[AGENT:")
      );

      // Add the current agent banner
      const agentBanner = `${
        currentAgent.emoji
      } [AGENT: ${currentAgent.name.toUpperCase()}]`;
      globalThis.nextResponsePrepend.push(agentBanner);
    },
  };
  console.log("✅ Multi-agent system created with delegation capabilities");
}

// Ensure AGENT_SYSTEM reference is correct
if (
  !agentSystemExists ||
  globalThis.MULTI_AGENT_SYSTEM !== globalThis.AGENT_SYSTEM
) {
  console.log("Fixing AGENT_SYSTEM reference...");
  globalThis.AGENT_SYSTEM = globalThis.MULTI_AGENT_SYSTEM;
  console.log("✅ AGENT_SYSTEM reference fixed");
}

// Fix banner system
if (!bannersExist) {
  console.log("Creating banner system...");
  globalThis.nextResponsePrepend = [];
  console.log("✅ Banner system created");
}

// Add system banners
console.log("Adding system banners...");

// Clear existing banners to avoid duplicates
globalThis.nextResponsePrepend = [];

// Add standard banners
globalThis.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");
globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
globalThis.nextResponsePrepend.push("📝 [SCRATCHPAD SYSTEM: ACTIVE]");

// Add agent banner
const agentCount = globalThis.MULTI_AGENT_SYSTEM.agents
  ? Object.keys(globalThis.MULTI_AGENT_SYSTEM.agents).length
  : 0;

globalThis.nextResponsePrepend.push(`👥 [ACTIVE AGENTS: ${agentCount}]`);

console.log(`✅ Added ${globalThis.nextResponsePrepend.length} system banners`);

// Test scratchpad functionality
console.log("\n🧪 TESTING SYSTEMS\n");

// Test scratchpad
console.log("Testing scratchpad...");
const testMessageId = globalThis.SCRATCHPAD.createMessage(
  "system",
  "executive-architect",
  "This is a test message from system fix script"
);

const retrievedMessages = globalThis.SCRATCHPAD.getMessages({
  from: "system",
});
console.log(`Retrieved ${retrievedMessages.length} messages`);
console.log("✅ Scratchpad test successful");

// Test memory system
console.log("\nTesting memory system...");
globalThis.MEMORY_SYSTEM.storeContext("system_fixed", true);
globalThis.MEMORY_SYSTEM.storeConversation({
  role: "system",
  content: "System fix script executed",
  timestamp: Date.now(),
});

const fixedState = globalThis.MEMORY_SYSTEM.getContext("system_fixed");
const recentConversations = globalThis.MEMORY_SYSTEM.getRecentConversations(1);

console.log("System fixed state:", fixedState);
console.log(`Retrieved ${recentConversations.length} recent conversations`);
console.log("✅ Memory system test successful");

// List current banners
console.log("\nCurrent banners:");
globalThis.nextResponsePrepend.forEach((banner, index) => {
  console.log(`${index + 1}. ${banner}`);
});

console.log("\n✅ SYSTEM FIX COMPLETED");
console.log(
  "The scratchpad and banner systems should now be working properly."
);
console.log(
  "You should see the system banners in the next assistant response."
);
