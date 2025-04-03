/**
 * Cursor Systems Index
 * Version: 1.0.0 (April 1, 2025)
 *
 * This file loads all required systems and ensures
 * banners are displayed with every response.
 */

console.log("🚀 [CURSOR-SYSTEMS] Loading systems...");

// Try loading systems in a specific order
// 1. Direct banner system first - ensures banners are displayed even if other systems fail
try {
  console.log("[CURSOR-SYSTEMS] Loading banner system...");
  require("./communication/direct-banner.js");
} catch (error) {
  console.error("[CURSOR-SYSTEMS] Error loading banner system:", error.message);
}

// 2. Load memory system
try {
  console.log("[CURSOR-SYSTEMS] Loading memory system...");
  require("./db/memory-system.js");
} catch (error) {
  console.error("[CURSOR-SYSTEMS] Error loading memory system:", error.message);
}

// 3. Load scratchpad system
try {
  console.log("[CURSOR-SYSTEMS] Loading scratchpad system...");
  require("./db/scratchpad-system.js");
} catch (error) {
  console.error(
    "[CURSOR-SYSTEMS] Error loading scratchpad system:",
    error.message
  );
}

// Final banner check - ensure banners are set
try {
  if (
    global.BANNER_SYSTEM &&
    typeof global.BANNER_SYSTEM.displaySystemStatus === "function"
  ) {
    global.BANNER_SYSTEM.displaySystemStatus();
  } else if (global.nextResponsePrepend) {
    if (
      !global.nextResponsePrepend.some((banner) =>
        banner.includes("CURSOR-SYSTEMS")
      )
    ) {
      global.nextResponsePrepend.push("🔄 [CURSOR-SYSTEMS: ACTIVE]");
    }
  } else {
    global.nextResponsePrepend = ["🔄 [CURSOR-SYSTEMS: ACTIVE]"];
  }
} catch (error) {
  console.error("[CURSOR-SYSTEMS] Error in final banner check:", error.message);
}

// Export loaded systems
module.exports = {
  MEMORY_SYSTEM: global.MEMORY_SYSTEM,
  SCRATCHPAD: global.SCRATCHPAD,
  BANNER_SYSTEM: global.BANNER_SYSTEM,
  banners: global.nextResponsePrepend,
};

console.log("✅ [CURSOR-SYSTEMS] All systems loaded!");
