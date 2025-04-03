/**
 * System Compatibility Layer
 * Version 2.2.0 (2023)
 *
 * This file standardizes naming conventions for system global objects and
 * ensures proper compatibility between different naming conventions.
 *
 * It addresses the issue mentioned in mem.md:
 * - Both SCRATCHPAD and SCRATCHPAD_SYSTEM global objects
 * - Both MULTI_AGENT_SYSTEM and AGENT_SYSTEM global objects
 *
 * The standard naming convention will be:
 * - SCRATCHPAD_SYSTEM (with SCRATCHPAD alias maintained for compatibility)
 * - MULTI_AGENT_SYSTEM (with AGENT_SYSTEM alias maintained for compatibility)
 * - MEMORY_SYSTEM (standardized naming)
 */

// Export the initialization function for explicit use
globalThis.initializeCompatibilityLayer = function () {
  console.log("🔄 Initializing System Compatibility Layer...");

  try {
    // Initialize the validation functions

    // General validation of all systems
    globalThis.validateAllSystemsConsistency = function () {
      const issues = [];
      const result = { consistent: true, issues: issues };

      // Check Scratchpad consistency
      if (globalThis.SCRATCHPAD && globalThis.SCRATCHPAD_SYSTEM) {
        if (globalThis.SCRATCHPAD !== globalThis.SCRATCHPAD_SYSTEM) {
          issues.push("SCRATCHPAD and SCRATCHPAD_SYSTEM are different objects");
          result.consistent = false;
        }
      }

      // Check Multi-Agent System consistency
      if (globalThis.MULTI_AGENT_SYSTEM && globalThis.AGENT_SYSTEM) {
        if (globalThis.MULTI_AGENT_SYSTEM !== globalThis.AGENT_SYSTEM) {
          issues.push(
            "MULTI_AGENT_SYSTEM and AGENT_SYSTEM are different objects"
          );
          result.consistent = false;
        }
      }

      return result;
    };

    // System-specific validation
    globalThis.validateSystemConsistency = function (system) {
      if (!system) {
        // If no system specified, validate all systems
        return globalThis.validateAllSystemsConsistency().consistent;
      }

      switch (system.toLowerCase()) {
        case "scratchpad":
          if (globalThis.SCRATCHPAD && globalThis.SCRATCHPAD_SYSTEM) {
            return globalThis.SCRATCHPAD === globalThis.SCRATCHPAD_SYSTEM;
          }
          return false; // Neither exists or one is missing

        case "agent":
        case "multi-agent":
          if (globalThis.MULTI_AGENT_SYSTEM && globalThis.AGENT_SYSTEM) {
            return globalThis.MULTI_AGENT_SYSTEM === globalThis.AGENT_SYSTEM;
          }
          return false; // Neither exists or one is missing

        case "memory":
          // Memory system only has one standard name
          return !!globalThis.MEMORY_SYSTEM;

        case "banner":
          // Banner system validation
          return Array.isArray(globalThis.nextResponsePrepend);

        default:
          console.warn(`Unknown system to validate: ${system}`);
          return false;
      }
    };

    // Function to create a sync proxy for system objects
    const createSyncedSystemObjects = function (
      primaryName,
      aliasName,
      existingPrimary,
      existingAlias,
      createDefault
    ) {
      let primary = existingPrimary;
      let alias = existingAlias;

      // Case 1: Only primary exists
      if (primary && !alias) {
        alias = primary;
        console.log(
          `✅ Setting ${aliasName} as alias to existing ${primaryName}`
        );
      }
      // Case 2: Only alias exists
      else if (!primary && alias) {
        primary = alias;
        console.log(
          `✅ Setting ${primaryName} as primary to existing ${aliasName}`
        );
      }
      // Case 3: Neither exists
      else if (!primary && !alias) {
        console.log(`⚠️ No ${primaryName} found, creating minimal placeholder`);
        primary = createDefault();
        alias = primary;
      }
      // Case 4: Both exist but are different objects
      else if (primary !== alias) {
        console.log(
          `⚠️ ${primaryName} and ${aliasName} are different objects, synchronizing...`
        );
        // Create a new object that merges properties from both
        const merged = { ...alias, ...primary };
        merged._isPrimary = true;
        merged.version = "2.2.0";
        primary = merged;
        alias = primary;
      }

      // Create a proxy to ensure they always stay synchronized
      const handler = {
        set: function (target, prop, value) {
          target[prop] = value;
          // Ensure both references are updated
          globalThis[primaryName] = target;
          globalThis[aliasName] = target;
          return true;
        },
      };

      const proxy = new Proxy(primary, handler);

      // Apply the proxy to both global references
      globalThis[primaryName] = proxy;
      globalThis[aliasName] = proxy;

      return proxy;
    };

    // Standardize SCRATCHPAD and SCRATCHPAD_SYSTEM
    const createDefaultScratchpad = () => ({
      initialized: false,
      version: "2.2.0",
      write: function (message, sender = "system", recipient = "all_agents") {
        console.log(
          "[PLACEHOLDER] Message from " + sender + " to " + recipient
        );
        return true;
      },
      read: function () {
        return [];
      },
      getMessages: function () {
        return [];
      },
      _isPrimary: true,
    });

    const scratchpadProxy = createSyncedSystemObjects(
      "SCRATCHPAD_SYSTEM",
      "SCRATCHPAD",
      globalThis.SCRATCHPAD_SYSTEM,
      globalThis.SCRATCHPAD,
      createDefaultScratchpad
    );

    // Ensure key Scratchpad methods exist
    if (!scratchpadProxy.write || typeof scratchpadProxy.write !== "function") {
      scratchpadProxy.write = function (
        message,
        sender = "system",
        recipient = "all_agents"
      ) {
        console.log(
          "[PLACEHOLDER] Message from " + sender + " to " + recipient
        );
        return true;
      };
    }

    if (!scratchpadProxy.read || typeof scratchpadProxy.read !== "function") {
      scratchpadProxy.read = function () {
        return [];
      };
    }

    if (
      !scratchpadProxy.getMessages ||
      typeof scratchpadProxy.getMessages !== "function"
    ) {
      scratchpadProxy.getMessages = function () {
        return [];
      };
    }

    // Standardize MULTI_AGENT_SYSTEM and AGENT_SYSTEM
    const createDefaultAgentSystem = () => ({
      initialized: false,
      version: "2.2.0",
      agents: {},
      activeAgent: "executive-architect",
      registerAgent: function (id, config) {
        this.agents[id] = config;
        return true;
      },
      getActiveAgent: function () {
        return this.activeAgent;
      },
      getAllAgents: function () {
        return Object.keys(this.agents);
      },
      getAgentById: function (id) {
        return this.agents[id] || null;
      },
      switchAgent: function (agentId) {
        this.activeAgent = agentId;
        return true;
      },
      _isPrimary: true,
    });

    const agentSystemProxy = createSyncedSystemObjects(
      "MULTI_AGENT_SYSTEM",
      "AGENT_SYSTEM",
      globalThis.MULTI_AGENT_SYSTEM,
      globalThis.AGENT_SYSTEM,
      createDefaultAgentSystem
    );

    // Ensure key Agent System methods exist
    if (
      !agentSystemProxy.getActiveAgent ||
      typeof agentSystemProxy.getActiveAgent !== "function"
    ) {
      agentSystemProxy.getActiveAgent = function () {
        return this.activeAgent || "executive-architect";
      };
    }

    if (
      !agentSystemProxy.getAllAgents ||
      typeof agentSystemProxy.getAllAgents !== "function"
    ) {
      agentSystemProxy.getAllAgents = function () {
        return Object.keys(this.agents || {});
      };
    }

    if (
      !agentSystemProxy.getAgentById ||
      typeof agentSystemProxy.getAgentById !== "function"
    ) {
      agentSystemProxy.getAgentById = function (id) {
        return (this.agents || {})[id] || null;
      };
    }

    // Ensure Memory System interface
    if (globalThis.MEMORY_SYSTEM) {
      // Add minimal methods if needed
      if (
        !globalThis.MEMORY_SYSTEM.getShortTermMemory ||
        typeof globalThis.MEMORY_SYSTEM.getShortTermMemory !== "function"
      ) {
        globalThis.MEMORY_SYSTEM.getShortTermMemory = function (key) {
          console.log(`[PLACEHOLDER] Getting memory for key: ${key}`);
          return null;
        };
      }

      if (
        !globalThis.MEMORY_SYSTEM.setShortTermMemory ||
        typeof globalThis.MEMORY_SYSTEM.setShortTermMemory !== "function"
      ) {
        globalThis.MEMORY_SYSTEM.setShortTermMemory = function (key, value) {
          console.log(`[PLACEHOLDER] Setting memory for key: ${key}`);
          return true;
        };
      }
    } else {
      // Create minimal memory system if it doesn't exist
      console.log("⚠️ No Memory System found, creating minimal placeholder");

      globalThis.MEMORY_SYSTEM = {
        initialized: false,
        version: "2.2.0",
        getShortTermMemory: function (key) {
          console.log(`[PLACEHOLDER] Getting memory for key: ${key}`);
          return null;
        },
        setShortTermMemory: function (key, value) {
          console.log(`[PLACEHOLDER] Setting memory for key: ${key}`);
          return true;
        },
        getStatus: function () {
          return {
            initialized: false,
            version: "2.2.0",
            subsystems: [],
            integrations: [],
          };
        },
        _isPrimary: true,
      };
    }

    // Initialize banner system if needed
    if (!Array.isArray(globalThis.nextResponsePrepend)) {
      console.log("🚩 Initializing nextResponsePrepend for banners");
      globalThis.nextResponsePrepend = [];
    }

    // Register a MutationObserver to watch for system changes
    globalThis._systemSyncInterval = setInterval(() => {
      // Check if systems have diverged and fix them
      if (globalThis.SCRATCHPAD !== globalThis.SCRATCHPAD_SYSTEM) {
        console.log("🔄 Re-synchronizing Scratchpad systems");
        const merged = {
          ...globalThis.SCRATCHPAD_SYSTEM,
          ...globalThis.SCRATCHPAD,
        };
        globalThis.SCRATCHPAD = merged;
        globalThis.SCRATCHPAD_SYSTEM = merged;
      }

      if (globalThis.MULTI_AGENT_SYSTEM !== globalThis.AGENT_SYSTEM) {
        console.log("🔄 Re-synchronizing Agent systems");
        const merged = {
          ...globalThis.AGENT_SYSTEM,
          ...globalThis.MULTI_AGENT_SYSTEM,
        };
        globalThis.MULTI_AGENT_SYSTEM = merged;
        globalThis.AGENT_SYSTEM = merged;
      }
    }, 1000);

    console.log("✅ System Compatibility Layer initialized successfully");
    return true;
  } catch (error) {
    console.error(
      "❌ Error initializing System Compatibility Layer:",
      error.message
    );

    // Minimal recovery in case of errors
    if (!globalThis.SCRATCHPAD)
      globalThis.SCRATCHPAD = { initialized: false, version: "2.2.0" };
    if (!globalThis.SCRATCHPAD_SYSTEM)
      globalThis.SCRATCHPAD_SYSTEM = globalThis.SCRATCHPAD;
    if (!globalThis.MULTI_AGENT_SYSTEM)
      globalThis.MULTI_AGENT_SYSTEM = { initialized: false, version: "2.2.0" };
    if (!globalThis.AGENT_SYSTEM)
      globalThis.AGENT_SYSTEM = globalThis.MULTI_AGENT_SYSTEM;
    if (!globalThis.MEMORY_SYSTEM)
      globalThis.MEMORY_SYSTEM = { initialized: false, version: "2.2.0" };
    if (!Array.isArray(globalThis.nextResponsePrepend))
      globalThis.nextResponsePrepend = [];

    return false;
  }
};

// Self-invoking function to initialize the compatibility layer
(function () {
  if (typeof globalThis.initializeCompatibilityLayer === "function") {
    globalThis.initializeCompatibilityLayer();
  }
})();
