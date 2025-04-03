/**
 * Task Workflow Rule Implementation
 * Implements the task workflow management system for the Executive Architect agent
 */

module.exports = async function (context) {
  try {
    // Dynamically import the task integration module
    const taskIntegration = require("./task-integration");

    // Initialize the task system
    const options = {
      memory: context.memory,
      registry: context.registry,
    };

    const success = taskIntegration.initializeTaskSystem(options);

    if (success) {
      console.log("[400-tasks-workflow] Task system initialized successfully");

      // Optionally register with memory system if available
      if (context.memory) {
        context.memory.set("taskManagerLoaded", true);
      }

      // Optionally register with system registry if available
      if (context.registry) {
        context.registry.register("taskWorkflowActive", true);
      }
    } else {
      console.error("[400-tasks-workflow] Failed to initialize task system");

      // Load fallback task manager if available
      try {
        const fallbackManager = require("../fallbacks/task-fallback");
        fallbackManager.initialize();
        console.log("[400-tasks-workflow] Fallback task manager loaded");
      } catch (fallbackErr) {
        console.error(
          "[400-tasks-workflow] Fallback task manager also failed:",
          fallbackErr
        );
      }
    }
  } catch (err) {
    console.error(
      "[400-tasks-workflow] Error during task system activation:",
      err
    );
  }
};
