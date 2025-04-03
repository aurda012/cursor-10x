/**
 * Multi-Agent System Bridge
 *
 * This file ensures that the multi-agent system is loaded from its actual location
 * and properly initialized.
 */

console.log("🔄 Loading multi-agent system from systems directory...");

// First check if the multi-agent system is already loaded
if (
  globalThis.MULTI_AGENT_SYSTEM &&
  globalThis.MULTI_AGENT_SYSTEM.initialized
) {
  console.log("✅ Multi-agent system already loaded and initialized");
} else {
  try {
    // Try to load the actual implementation
    const path = require("path");
    const agentSystemPath = path.join(
      __dirname,
      "../agents/multi-agent-system.js"
    );

    console.log(`📂 Loading from: ${agentSystemPath}`);
    const agentSystem = require(agentSystemPath);

    console.log("✅ Multi-agent system loaded successfully");

    // Force initialization if needed
    if (
      !globalThis.MULTI_AGENT_SYSTEM ||
      !globalThis.MULTI_AGENT_SYSTEM.initialized
    ) {
      console.log("🔄 Initializing multi-agent system...");

      // Initialize from the loaded module if possible
      if (typeof agentSystem.initialize === "function") {
        agentSystem.initialize();
      }

      // Double-check initialization
      if (!globalThis.MULTI_AGENT_SYSTEM) {
        // Create a minimal implementation if loading failed
        globalThis.MULTI_AGENT_SYSTEM = {
          initialized: true,
          active_agent: "executive-architect",
          agents: {
            "executive-architect": {
              id: "executive-architect",
              name: "Executive Architect",
              emoji: "👑",
              status: "active",
            },
          },
          getActiveAgent: function () {
            return this.agents[this.active_agent];
          },
        };
        console.log("⚠️ Created minimal multi-agent system");
      }
    }
  } catch (error) {
    console.error(`❌ Error loading multi-agent system: ${error.message}`);

    // Create a minimal implementation as fallback
    globalThis.MULTI_AGENT_SYSTEM = {
      initialized: true,
      active_agent: "executive-architect",
      agents: {
        "executive-architect": {
          id: "executive-architect",
          name: "Executive Architect",
          emoji: "👑",
          status: "active",
        },
      },
      getActiveAgent: function () {
        return this.agents[this.active_agent];
      },
    };
    console.log(
      "⚠️ Created minimal multi-agent system (fallback due to error)"
    );
  }
}

// Ensure the banner system knows about our activation
if (globalThis.nextResponsePrepend) {
  // Check if banner is already added
  let hasMultiAgentBanner = false;
  for (const banner of globalThis.nextResponsePrepend) {
    if (banner.includes("MULTI-AGENT SYSTEM") || banner.includes("[AGENT:")) {
      hasMultiAgentBanner = true;
      break;
    }
  }

  // Add banner if not present
  if (!hasMultiAgentBanner) {
    globalThis.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");

    const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
    if (activeAgent) {
      globalThis.nextResponsePrepend.push(
        `${
          activeAgent.emoji || "👑"
        } [AGENT: ${activeAgent.name.toUpperCase()}]`
      );
    }
  }
}

// Export the multi-agent system to ensure it's accessible
module.exports = globalThis.MULTI_AGENT_SYSTEM || { initialized: false };
