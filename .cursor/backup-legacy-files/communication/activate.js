/**
 * Activation System
 * Version: 2.0.0 (April 2, 2025)
 *
 * This module ensures the multi-agent system is active for each user interaction.
 * It provides a robust activation sequence with fallbacks and detailed logging.
 */

console.log(`🚀 Activation process starting (ID: ${Date.now()})`);

// Track successful activations
let activationSuccessful = false;
let activationMethod = null;

// Main activation function
function activateSystem() {
  console.log("🔄 Starting system activation sequence");

  // Try different activation methods in order of reliability
  const activationMethods = [
    {
      name: "master-activation",
      path: "../master-activation.js",
      description: "Primary activation system",
    },
    {
      name: "direct-banner",
      path: "./direct-banner.js",
      description: "Direct banner activation",
    },
    {
      name: "init",
      path: "../init.js",
      description: "Legacy initialization",
    },
  ];

  // Try each activation method until one succeeds
  for (const method of activationMethods) {
    try {
      console.log(
        `Attempting to activate via: ${method.name} (${method.description})`
      );

      // Attempt to load the activation script
      const activationModule = require(method.path);

      // If we got here, the script loaded successfully
      activationSuccessful = true;
      activationMethod = method.name;
      console.log(`✅ System activation via ${method.name} successful`);

      // Load the multi-agent system if it's not already loaded
      if (!globalThis.MULTI_AGENT_SYSTEM) {
        try {
          console.log("🤖 Loading multi-agent system...");
          require("../agents/multi-agent-system.js");
          console.log("✅ Multi-agent system loaded successfully");
        } catch (error) {
          console.error(
            `⚠️ Error loading multi-agent system: ${error.message}`
          );
          // Continue with activation even if multi-agent system fails
        }
      }

      break;
    } catch (error) {
      console.error(
        `❌ Activation via ${method.name} failed: ${error.message}`
      );
    }
  }

  // If all methods failed, try emergency activation
  if (!activationSuccessful) {
    emergencyActivation();
  }

  return activationSuccessful;
}

// Emergency activation if all else fails
function emergencyActivation() {
  console.log(
    "⚠️ EMERGENCY ACTIVATION: All standard methods failed, using minimal setup"
  );

  try {
    // Set up minimal global objects
    if (typeof global !== "undefined") {
      // Ensure nextResponsePrepend is available
      if (!global.nextResponsePrepend) {
        global.nextResponsePrepend = [];
      }

      // Add emergency banner
      global.nextResponsePrepend.push("⚠️ [SYSTEM: EMERGENCY MODE]");

      // Initialize memory placeholders
      if (!global.MEMORY_SYSTEM) {
        global.MEMORY_SYSTEM = {
          initialized: false,
          storeContext: () => {},
          getContext: () => null,
          storeEpisode: () => {},
          searchEpisodes: () => [],
        };
      }

      // Initialize scratchpad placeholders
      if (!global.SCRATCHPAD) {
        global.SCRATCHPAD = {
          initialized: false,
          messages: [],
          threads: {},
          tasks: [],
        };
      }

      // Try to load the multi-agent system in emergency mode
      try {
        require("../agents/multi-agent-system.js");
      } catch (error) {
        // Create a placeholder multi-agent system
        global.MULTI_AGENT_SYSTEM = {
          activeAgent: {
            id: "emergency",
            name: "Emergency Agent",
            emoji: "⚠️",
          },
        };
      }

      // Log activation
      const fs = require("fs");
      const logPath = "../activation-log.txt";
      const logEntry = `[${new Date().toISOString()}] EMERGENCY ACTIVATION (PID: ${
        process.pid
      })\n`;

      try {
        fs.appendFileSync(logPath, logEntry);
      } catch (error) {
        // Silently fail if logging fails
      }

      activationSuccessful = true;
      activationMethod = "emergency";
      console.log("⚠️ Emergency activation complete");
    }
  } catch (error) {
    console.error(`❌ Emergency activation failed: ${error.message}`);
    return false;
  }

  return true;
}

// Execute activation
const activated = activateSystem();

// Export activation functions and status
module.exports = {
  activateSystem,
  emergencyActivation,
  status: {
    successful: activationSuccessful,
    method: activationMethod,
    timestamp: Date.now(),
  },
};

console.log(
  `🚀 Activation process complete (Success: ${activationSuccessful}, Method: ${
    activationMethod || "none"
  })`
);
