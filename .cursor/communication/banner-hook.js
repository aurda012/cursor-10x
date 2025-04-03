/**
 * BANNER SYSTEM PRE-RESPONSE HOOK
 *
 * This hook ensures that banners are always displayed at the beginning of each response.
 * It's designed to be robust and provide fallback mechanisms if the primary banner system fails.
 */

console.log("🎌 Initializing Banner System Pre-Response Hook...");

// Ensure nextResponsePrepend exists
if (!globalThis.nextResponsePrepend) {
  globalThis.nextResponsePrepend = [];
  console.log("Created nextResponsePrepend array");
}

// Register with the hook system if available
if (globalThis.HOOK_SYSTEM) {
  // Create banner processing function
  const processBanners = function () {
    console.log("Processing banners before response...");

    try {
      // First, try to use the centralized banner system
      if (typeof require === "function") {
        try {
          const path = require("path");
          const fs = require("fs");
          const centralizedBannerPath = path.resolve(
            process.cwd(),
            ".cursor/centralized-banner.js"
          );

          if (fs.existsSync(centralizedBannerPath)) {
            console.log("Loading centralized banner system...");
            const bannerSystem = require(centralizedBannerPath);

            if (
              bannerSystem &&
              typeof bannerSystem.forceBanners === "function"
            ) {
              bannerSystem.forceBanners();
              console.log("✅ Banners forced via centralized banner system");
              return true;
            }
          }
        } catch (error) {
          console.error(
            "Error loading centralized banner system:",
            error.message
          );
          // Continue to fallback methods
        }
      }

      // Second, try direct banner system
      if (typeof require === "function") {
        try {
          const path = require("path");
          const fs = require("fs");
          const directBannerPath = path.resolve(
            process.cwd(),
            ".cursor/communication/direct-banner.js"
          );

          if (fs.existsSync(directBannerPath)) {
            console.log("Loading direct banner system...");
            const directBanner = require(directBannerPath);

            if (
              directBanner &&
              typeof directBanner.forceBanners === "function"
            ) {
              directBanner.forceBanners();
              console.log("✅ Banners forced via direct banner system");
              return true;
            }
          }
        } catch (error) {
          console.error("Error loading direct banner system:", error.message);
          // Continue to fallback methods
        }
      }

      // Fallback: Check for existing banners and add standard ones if missing
      let hasMemoryBanner = false;
      let hasAgentBanner = false;
      let hasScratchpadBanner = false;
      let hasSystemBanner = false;

      // Check existing banners
      for (const banner of globalThis.nextResponsePrepend) {
        if (banner.includes("MEMORY SYSTEM")) hasMemoryBanner = true;
        if (banner.includes("AGENT:")) hasAgentBanner = true;
        if (banner.includes("SCRATCHPAD")) hasScratchpadBanner = true;
        if (banner.includes("MULTI-AGENT SYSTEM")) hasSystemBanner = true;
      }

      // Add missing banners with basic information
      if (!hasSystemBanner) {
        globalThis.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");
      }

      if (!hasMemoryBanner) {
        globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
      }

      if (!hasScratchpadBanner) {
        globalThis.nextResponsePrepend.push("📝 [SCRATCHPAD SYSTEM: ACTIVE]");
      }

      // Add agent banner if not present and if we can determine active agent
      if (!hasAgentBanner) {
        if (
          globalThis.MULTI_AGENT_SYSTEM &&
          typeof globalThis.MULTI_AGENT_SYSTEM.getActiveAgent === "function"
        ) {
          const activeAgent = globalThis.MULTI_AGENT_SYSTEM.getActiveAgent();
          if (activeAgent) {
            const emoji = activeAgent.emoji || "👑";
            const name = activeAgent.name || "Executive Architect";
            globalThis.nextResponsePrepend.push(
              `${emoji} [AGENT: ${name.toUpperCase()}]`
            );
          } else {
            // Default agent banner
            globalThis.nextResponsePrepend.push(
              "👑 [AGENT: EXECUTIVE ARCHITECT]"
            );
          }
        } else {
          // Default agent banner
          globalThis.nextResponsePrepend.push(
            "👑 [AGENT: EXECUTIVE ARCHITECT]"
          );
        }
      }

      console.log(
        `✅ Added ${globalThis.nextResponsePrepend.length} standard banners`
      );
      return true;
    } catch (error) {
      console.error("Error in banner processing:", error.message);

      // Just return false without adding emergency banners
      return false;
    }
  };

  // Register high-priority banner hook to run before other hooks
  globalThis.HOOK_SYSTEM.registerPreHook(
    "banner-system-enforcer",
    200, // Higher priority than memory hooks (100)
    processBanners
  );

  console.log("✅ Registered banner system enforcer hook");

  // Run the banner processing immediately
  processBanners();
} else {
  console.warn("⚠️ Hook system not available for banner hook registration");

  // Create standard banners
  if (globalThis.nextResponsePrepend.length === 0) {
    globalThis.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");
    globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
    globalThis.nextResponsePrepend.push("👑 [AGENT: EXECUTIVE ARCHITECT]");

    console.log("✅ Added standard banners without hook system");
  }
}

// Export for Node.js modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    processBanners:
      processBanners ||
      function () {
        console.log("Banner processing function not available");
        return false;
      },
  };
}

console.log("✅ Banner System Pre-Response Hook initialization completed");
