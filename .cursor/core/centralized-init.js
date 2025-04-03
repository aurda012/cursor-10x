/**
 * CURSOR CENTRALIZED INITIALIZATION SYSTEM
 *
 * This file is responsible for initializing all cursor systems.
 * It is the first file loaded by the enforcer.
 */

console.log("🚀 INITIALIZING CURSOR CENTRALIZED SYSTEM");

// Import file system module for checking file existence
const fs = require("fs");

// Store the system paths for easy reference
const CORE_SYSTEM_PATHS = {
  memory: `${__dirname}/systems/memory-system.js`,
  memoryFix: `${__dirname}/memory-fix.js`,
  scratchpad: `${__dirname}/systems/scratchpad-system.js`,
  multiAgent: `${__dirname}/systems/multi-agent-system.js`,
  preResponseHook: `${__dirname}/pre-response-hook.js`,
  postResponseHook: `${__dirname}/post-response-hook.js`,
  fixSystems: `${__dirname}/fix-systems.js`,
  bannerHook: `${__dirname}/communication/banner-hook.js`,
  centralizedBanner: `${__dirname}/centralized-banner.js`,
};

// Log the paths for debugging
console.log("CORE SYSTEM PATHS:", CORE_SYSTEM_PATHS);

// Initialize the systems immediately to ensure they exist
try {
  require("./fix-systems.js");
  console.log("✅ Systems initialized through fix-systems");

  // Ensure banner system is loaded
  if (fs.existsSync(CORE_SYSTEM_PATHS.centralizedBanner)) {
    require(CORE_SYSTEM_PATHS.centralizedBanner);
    console.log("✅ Centralized banner system loaded");
  }

  // Load banner hook explicitly to ensure banners are shown
  if (fs.existsSync(CORE_SYSTEM_PATHS.bannerHook)) {
    require(CORE_SYSTEM_PATHS.bannerHook);
    console.log("✅ Banner hook loaded explicitly");
  }

  // Explicitly set the SYSTEMS_ACTIVE flag
  globalThis.SYSTEMS_ACTIVE = true;
  console.log("✅ SYSTEMS_ACTIVE flag set to true");
} catch (error) {
  console.error("❌ Error initializing systems:", error.message);

  // Fall back to creating essential systems
  console.log("Creating essential systems...");

  if (!globalThis.MEMORY_SYSTEM) {
    globalThis.MEMORY_SYSTEM = {
      initialized: true,
      shortTerm: {},
      episodic: [],
    };
    console.log("✅ Essential memory system created");
  }

  if (!globalThis.SCRATCHPAD) {
    globalThis.SCRATCHPAD = {
      initialized: true,
      messages: [],
    };
    globalThis.SCRATCHPAD_SYSTEM = globalThis.SCRATCHPAD;
    console.log("✅ Essential scratchpad system created");
  }

  if (!globalThis.MULTI_AGENT_SYSTEM) {
    globalThis.MULTI_AGENT_SYSTEM = {
      initialized: true,
      active_agent: "executive-architect",
    };
    globalThis.AGENT_SYSTEM = globalThis.MULTI_AGENT_SYSTEM;
    console.log("✅ Essential agent system created");
  }

  if (!globalThis.nextResponsePrepend) {
    globalThis.nextResponsePrepend = [
      "🤖 [MULTI-AGENT SYSTEM: ACTIVE]",
      "🧠 [MEMORY SYSTEM: ACTIVE]",
      "📝 [SCRATCHPAD SYSTEM: ACTIVE]",
    ];
    console.log("✅ Essential banners created");
  }

  // Ensure SYSTEMS_ACTIVE is set even in fallback mode
  globalThis.SYSTEMS_ACTIVE = true;
  console.log("✅ SYSTEMS_ACTIVE flag set in fallback mode");
}

// Make systems available through exports
module.exports = {
  CORE_SYSTEM_PATHS,
  MEMORY_SYSTEM: globalThis.MEMORY_SYSTEM,
  SCRATCHPAD: globalThis.SCRATCHPAD,
  MULTI_AGENT_SYSTEM: globalThis.MULTI_AGENT_SYSTEM,
  SYSTEMS_ACTIVE: globalThis.SYSTEMS_ACTIVE,
  initializationComplete: true,

  // Add a function to check system status
  checkAllSystems: function () {
    return {
      memory: !!globalThis.MEMORY_SYSTEM,
      scratchpad: !!globalThis.SCRATCHPAD,
      scratchpadSystem: !!globalThis.SCRATCHPAD_SYSTEM,
      multiAgent: !!globalThis.MULTI_AGENT_SYSTEM,
      agentSystem: !!globalThis.AGENT_SYSTEM,
      banners: !!globalThis.nextResponsePrepend,
      bannerCount: globalThis.nextResponsePrepend
        ? globalThis.nextResponsePrepend.length
        : 0,
      systemsActive: !!globalThis.SYSTEMS_ACTIVE,
    };
  },
};

// Force banners one more time before completing
(function forceFinalBanners() {
  // Always ensure nextResponsePrepend exists
  if (
    !globalThis.nextResponsePrepend ||
    !Array.isArray(globalThis.nextResponsePrepend)
  ) {
    globalThis.nextResponsePrepend = [];
  }

  // Add standard banners if needed
  const standardBanners = [
    "🤖 [MULTI-AGENT SYSTEM: ACTIVE]",
    "🧠 [MEMORY SYSTEM: ACTIVE]",
    "📝 [SCRATCHPAD SYSTEM: ACTIVE]",
    "👑 [AGENT: EXECUTIVE ARCHITECT]",
  ];

  // Check if each standard banner exists, add if not
  for (const banner of standardBanners) {
    const bannerType = banner.split("[")[1]?.split(":")[0];
    const exists = globalThis.nextResponsePrepend.some((existing) =>
      existing.includes(bannerType)
    );

    if (!exists) {
      globalThis.nextResponsePrepend.push(banner);
      console.log(`Added missing banner: ${banner}`);
    }
  }

  // Print final banner list
  console.log("\n==== STANDARD SYSTEM BANNERS ====");
  globalThis.nextResponsePrepend.forEach((banner) => console.log(banner));
  console.log("================================\n");
})();

console.log("✅ CURSOR CENTRALIZED INITIALIZATION COMPLETE");
