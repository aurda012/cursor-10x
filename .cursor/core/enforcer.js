/**
 * CURSOR UNIVERSAL ENFORCER SYSTEM
 *
 * This file is the universal enforcer for all cursor systems.
 * It ensures all systems are properly initialized and sets up
 * banners for displaying system status.
 */

console.log("🔒 ACTIVATING UNIVERSAL SYSTEM ENFORCER");

// First, load centralized initialization
try {
  console.log("Loading centralized initialization...");
  const centralized = require("./centralized-init.js");

  if (centralized.initializationComplete) {
    console.log("✅ Centralized initialization complete");

    // Get system status
    const systemStatus = centralized.checkAllSystems();
    console.log("Current system status:", systemStatus);

    // Ensure banners exist
    if (
      !globalThis.nextResponsePrepend ||
      !Array.isArray(globalThis.nextResponsePrepend)
    ) {
      console.log("Creating banner system...");
      globalThis.nextResponsePrepend = [];
    }

    // Add standard banners if they don't exist
    if (globalThis.nextResponsePrepend.length === 0) {
      console.log("Adding standard banners...");

      if (systemStatus.memory) {
        globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
      }

      if (systemStatus.scratchpad) {
        globalThis.nextResponsePrepend.push("📝 [SCRATCHPAD SYSTEM: ACTIVE]");
      }

      if (systemStatus.multiAgent) {
        globalThis.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");

        // Add agent count if available
        const agentCount = globalThis.MULTI_AGENT_SYSTEM.agents
          ? Object.keys(globalThis.MULTI_AGENT_SYSTEM.agents).length
          : 0;

        if (agentCount > 0) {
          globalThis.nextResponsePrepend.push(
            `👥 [ACTIVE AGENTS: ${agentCount}]`
          );
        }
      }

      console.log(
        `✅ Added ${globalThis.nextResponsePrepend.length} system banners`
      );
    }
  } else {
    console.error("❌ Centralized initialization failed");
  }
} catch (error) {
  console.error("❌ Error loading centralized initialization:", error.message);
}

// Load pre-response hook system
try {
  console.log("Loading pre-response hook system...");
  require("./pre-response-hook.js");
  console.log("✅ Pre-response hook system loaded");
} catch (error) {
  console.error("❌ Error loading pre-response hook system:", error.message);
  console.warn("⚠️ Memory operations before responses may not run");
}

// Load post-response hook system
try {
  console.log("Loading post-response hook system...");
  require("./post-response-hook.js");
  console.log("✅ Post-response hook system loaded");
} catch (error) {
  console.error("❌ Error loading post-response hook system:", error.message);
  console.warn("⚠️ Memory operations after responses may not run");
}

// Export for Node.js modules
module.exports = {
  activated: true,
  banners: globalThis.nextResponsePrepend || [],
  systems: {
    memory: !!globalThis.MEMORY_SYSTEM,
    scratchpad: !!globalThis.SCRATCHPAD,
    multiAgent: !!globalThis.MULTI_AGENT_SYSTEM,
  },
};

console.log("✅ UNIVERSAL SYSTEM ENFORCER ACTIVATED");
