/**
 * State Persistence System
 *
 * This module provides state persistence capabilities for the multi-agent system
 */

// Ensure global system object exists
if (typeof globalThis.SYSTEM === "undefined") {
  globalThis.SYSTEM = {};
}

// Configuration
const config = {
  storageKey: "multiAgentSystemState",
  enableLocalStorage: true,
  enableSessionStorage: false,
  enableFileSystemStorage: false,
  storagePath: "./.cursor/communication/state",
};

// Initialize the state persistence system
async function initialize() {
  console.log("Initializing state persistence system...");

  try {
    // Load stored state if available
    const state = await loadState();

    if (state) {
      console.log("Loaded persisted state");

      // Restore important state variables
      await restoreState(state);
    } else {
      console.log("No persisted state found");
    }

    // Setup state tracking
    setupStateTracking();

    // Mark as initialized
    globalThis.SYSTEM.statePersistenceInitialized = true;

    console.log("State persistence system initialized");
    return true;
  } catch (error) {
    console.error("Error initializing state persistence system:", error);
    return false;
  }
}

// Save the current system state
async function saveState() {
  try {
    // Get the current state
    const state = {
      timestamp: Date.now(),
      system: captureSystemState(),
      memory: captureMemoryState(),
      agents: captureAgentState(),
      scratchpad: captureScratchpadState(),
    };

    // Store state in available storage mechanisms
    if (config.enableLocalStorage && typeof localStorage !== "undefined") {
      localStorage.setItem(config.storageKey, JSON.stringify(state));
    }

    if (config.enableSessionStorage && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(config.storageKey, JSON.stringify(state));
    }

    // Return the state
    return state;
  } catch (error) {
    console.error("Error saving state:", error);
    return null;
  }
}

// Load the stored system state
async function loadState() {
  try {
    let state = null;

    // Try to load from available storage mechanisms
    if (config.enableLocalStorage && typeof localStorage !== "undefined") {
      const storedState = localStorage.getItem(config.storageKey);
      if (storedState) {
        state = JSON.parse(storedState);
      }
    }

    if (
      !state &&
      config.enableSessionStorage &&
      typeof sessionStorage !== "undefined"
    ) {
      const storedState = sessionStorage.getItem(config.storageKey);
      if (storedState) {
        state = JSON.parse(storedState);
      }
    }

    return state;
  } catch (error) {
    console.error("Error loading state:", error);
    return null;
  }
}

// Capture the current system state
function captureSystemState() {
  return {
    dateInitialized: globalThis.SYSTEM.dateInitialized || false,
    memoryInitialized: globalThis.SYSTEM.memoryInitialized || false,
    scratchpadInitialized: globalThis.SYSTEM.scratchpadInitialized || false,
    agentInitialized: globalThis.SYSTEM.agentInitialized || false,
    mcpInitialized: globalThis.SYSTEM.mcpInitialized || false,
    bannerInitialized: globalThis.SYSTEM.bannerInitialized || false,
    currentDate: globalThis.CURRENT_DATE || null,
  };
}

// Capture the current memory state
function captureMemoryState() {
  if (!globalThis.MEMORY_SYSTEM) {
    return null;
  }

  try {
    return {
      shortTerm: globalThis.MEMORY_SYSTEM.shortTerm || [],
      episodic: globalThis.MEMORY_SYSTEM.episodic || [],
      semantic: globalThis.MEMORY_SYSTEM.semantic || {},
      summaries: globalThis.MEMORY_SYSTEM.summaries || [],
    };
  } catch (error) {
    console.error("Error capturing memory state:", error);
    return null;
  }
}

// Capture the current agent state
function captureAgentState() {
  if (!globalThis.AGENT_SYSTEM) {
    return null;
  }

  try {
    return {
      agents: Object.keys(globalThis.AGENT_SYSTEM.agents || {}),
    };
  } catch (error) {
    console.error("Error capturing agent state:", error);
    return null;
  }
}

// Capture the current scratchpad state
function captureScratchpadState() {
  if (!globalThis.SCRATCHPAD) {
    return null;
  }

  try {
    return {
      messages: globalThis.SCRATCHPAD.messages || [],
    };
  } catch (error) {
    console.error("Error capturing scratchpad state:", error);
    return null;
  }
}

// Restore system state from saved state
async function restoreState(state) {
  try {
    // Restore system state
    if (state.system) {
      // Restore date
      if (state.system.currentDate && !globalThis.CURRENT_DATE) {
        globalThis.CURRENT_DATE = state.system.currentDate;
      }
    }

    // Restore memory if needed
    if (state.memory && !globalThis.MEMORY_SYSTEM) {
      // Create a minimal memory system if needed
      if (!globalThis.MEMORY_SYSTEM) {
        globalThis.MEMORY_SYSTEM = {
          shortTerm: state.memory.shortTerm || [],
          episodic: state.memory.episodic || [],
          semantic: state.memory.semantic || {},
          summaries: state.memory.summaries || [],
        };
      }
    }

    return true;
  } catch (error) {
    console.error("Error restoring state:", error);
    return false;
  }
}

// Setup automatic state tracking
function setupStateTracking() {
  // Periodically save state
  setInterval(async () => {
    await saveState();
  }, 30000); // Save every 30 seconds
}

// Update SYSTEM status
globalThis.SYSTEM.statePersistenceInitialized = true;

// Export the module
module.exports = {
  initialize,
  saveState,
  loadState,
};
