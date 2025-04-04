/**
 * Ensure Agent Delegation System
 *
 * This script ensures that the multi-agent delegation system is properly
 * initialized and has the required methods for agent switching and task delegation.
 */

(function () {
  console.log("🔄 Ensuring agent delegation system is active...");

  try {
    // Check if multi-agent system exists
    if (!globalThis.MULTI_AGENT_SYSTEM) {
      console.error("🚨 Multi-agent system not found, attempting to fix...");
      try {
        require("./fix-systems.js");
      } catch (err) {
        console.error(`🚨 Failed to load fix-systems.js: ${err.message}`);
      }
    }

    // Now check if it exists after attempted fix
    if (!globalThis.MULTI_AGENT_SYSTEM) {
      console.error("🚨 Multi-agent system still not found after fix attempt!");
      // Create minimal multi-agent system
      globalThis.MULTI_AGENT_SYSTEM = {
        initialized: true,
        active_agent: "executive-architect",
        agents: {
          "executive-architect": {
            id: "executive-architect",
            name: "Executive Architect",
            emoji: "👑",
            capabilities: ["planning", "coordination"],
          },
        },
      };
    }

    // Check if required methods exist
    let needsFix = false;

    if (typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent !== "function") {
      console.log("🔧 Adding missing switchToAgent method");
      needsFix = true;
    }

    if (
      typeof globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask !== "function"
    ) {
      console.log("🔧 Adding missing findBestAgentForTask method");
      needsFix = true;
    }

    // Add missing methods if needed
    if (needsFix) {
      // Add switchToAgent method if missing
      if (typeof globalThis.MULTI_AGENT_SYSTEM.switchToAgent !== "function") {
        globalThis.MULTI_AGENT_SYSTEM.switchToAgent = function (agentId) {
          if (this.agents && this.agents[agentId]) {
            const previousAgent = this.active_agent;
            this.active_agent = agentId;

            console.log(`Switched from ${previousAgent} to ${agentId}`);

            // Update banner
            if (typeof this.updateAgentBanner === "function") {
              this.updateAgentBanner();
            } else {
              // Add a banner if nextResponsePrepend exists
              if (Array.isArray(globalThis.nextResponsePrepend)) {
                // Remove any existing agent banners
                globalThis.nextResponsePrepend =
                  globalThis.nextResponsePrepend.filter(
                    (banner) => !banner.includes("[AGENT:")
                  );

                // Add the current agent banner
                const agent = this.agents[agentId];
                const emoji = agent.emoji || "👤";
                globalThis.nextResponsePrepend.push(
                  `${emoji} [AGENT: ${agent.name.toUpperCase()}]`
                );
              }
            }

            // Store in memory if available
            if (
              globalThis.MEMORY_SYSTEM &&
              typeof globalThis.MEMORY_SYSTEM.storeContext === "function"
            ) {
              globalThis.MEMORY_SYSTEM.storeContext("active_agent", agentId);
              globalThis.MEMORY_SYSTEM.storeContext(
                "agent_switch_time",
                Date.now()
              );
            }

            // Notify via scratchpad if available
            if (
              globalThis.SCRATCHPAD &&
              typeof globalThis.SCRATCHPAD.createMessage === "function"
            ) {
              globalThis.SCRATCHPAD.createMessage(
                "system",
                "all",
                `Agent switched to: ${this.agents[agentId].name}`
              );
            }

            return true;
          }
          return false;
        };
        console.log("✅ Added switchToAgent method");
      }

      // Add findBestAgentForTask method if missing
      if (
        typeof globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask !== "function"
      ) {
        globalThis.MULTI_AGENT_SYSTEM.findBestAgentForTask = function (
          taskDescription,
          requiredCapabilities = []
        ) {
          // Ensure we have agents
          if (!this.agents || Object.keys(this.agents).length === 0) {
            return null;
          }

          // Try capability-based matching first
          if (
            Array.isArray(requiredCapabilities) &&
            requiredCapabilities.length > 0
          ) {
            const matches = [];

            for (const [id, agent] of Object.entries(this.agents)) {
              // Skip agents without capabilities
              if (!Array.isArray(agent.capabilities)) {
                continue;
              }

              // Count matching capabilities
              const matchCount = agent.capabilities.filter((cap) =>
                requiredCapabilities.includes(cap)
              ).length;

              if (matchCount > 0) {
                matches.push({ agent, matchCount });
              }
            }

            // Sort by match count (most matches first)
            if (matches.length > 0) {
              matches.sort((a, b) => b.matchCount - a.matchCount);
              return matches[0].agent;
            }
          }

          // Fallback to keyword matching in the task description
          if (taskDescription) {
            const normalized = taskDescription.toLowerCase();

            // Frontend tasks
            if (
              normalized.includes("frontend") ||
              normalized.includes("ui") ||
              normalized.includes("css") ||
              normalized.includes("react") ||
              normalized.includes("component")
            ) {
              return (
                this.agents["frontend-developer"] ||
                this.agents["executive-architect"]
              );
            }

            // Backend tasks
            if (
              normalized.includes("backend") ||
              normalized.includes("server") ||
              normalized.includes("api") ||
              normalized.includes("database")
            ) {
              return (
                this.agents["backend-developer"] ||
                this.agents["executive-architect"]
              );
            }

            // Integration tasks
            if (
              normalized.includes("integration") ||
              normalized.includes("fullstack") ||
              normalized.includes("deploy")
            ) {
              return (
                this.agents["full-stack-integrator"] ||
                this.agents["executive-architect"]
              );
            }

            // Documentation tasks
            if (
              normalized.includes("document") ||
              normalized.includes("docs")
            ) {
              return (
                this.agents["doc-specialist"] ||
                this.agents["executive-architect"]
              );
            }
          }

          // Default to executive architect
          return this.agents["executive-architect"];
        };
        console.log("✅ Added findBestAgentForTask method");
      }

      // Ensure AGENT_SYSTEM reference is correct
      if (globalThis.AGENT_SYSTEM !== globalThis.MULTI_AGENT_SYSTEM) {
        globalThis.AGENT_SYSTEM = globalThis.MULTI_AGENT_SYSTEM;
        console.log("✅ Synchronized AGENT_SYSTEM reference");
      }
    } else {
      console.log("✅ Agent delegation system is complete");
    }

    // Always reinforce the updateAgentBanner method
    if (typeof globalThis.MULTI_AGENT_SYSTEM.updateAgentBanner !== "function") {
      globalThis.MULTI_AGENT_SYSTEM.updateAgentBanner = function () {
        if (!Array.isArray(globalThis.nextResponsePrepend)) {
          globalThis.nextResponsePrepend = [];
        }

        if (
          !this.agents ||
          !this.active_agent ||
          !this.agents[this.active_agent]
        ) {
          return;
        }

        const agent = this.agents[this.active_agent];

        // Remove existing agent banners
        globalThis.nextResponsePrepend = globalThis.nextResponsePrepend.filter(
          (banner) => !banner.includes("[AGENT:")
        );

        // Add new agent banner
        const emoji = agent.emoji || "👤";
        globalThis.nextResponsePrepend.push(
          `${emoji} [AGENT: ${agent.name.toUpperCase()}]`
        );
      };
      console.log("✅ Added updateAgentBanner method");
    }

    // Ensure an agent banner is present
    globalThis.MULTI_AGENT_SYSTEM.updateAgentBanner();

    console.log("✅ Agent delegation system is now active");
  } catch (error) {
    console.error(
      `❌ Error ensuring agent delegation system: ${error.message}`
    );
  }
})();
