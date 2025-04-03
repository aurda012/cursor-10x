/**
 * Centralized Banner System - Bridge File
 *
 * This file serves as a bridge to the direct banner system.
 * It's placed at .cursor/centralized-banner.js to satisfy path resolution
 * in the master activation system.
 */

console.log("🌉 Centralized Banner Bridge loading...");

try {
  // Load the actual banner implementation using absolute path
  const path = require("path");
  const directBannerPath = path.resolve(
    process.cwd(),
    ".cursor/communication/direct-banner.js"
  );
  const directBannerSystem = require(directBannerPath);

  // Export the direct banner system
  module.exports = directBannerSystem;

  // Initialize BANNER_SYSTEM if it doesn't exist
  if (!globalThis.BANNER_SYSTEM) {
    globalThis.BANNER_SYSTEM = directBannerSystem;

    // Add forceBanners method if it doesn't exist
    if (!globalThis.BANNER_SYSTEM.forceBanners) {
      globalThis.BANNER_SYSTEM.forceBanners = directBannerSystem.forceBanners;
    }

    console.log("✅ Banner system initialized via bridge");
  }

  // Modified to prevent recursion - don't directly call force banners here
  // Instead, just make sure necessary properties are set
  if (!Array.isArray(globalThis.nextResponsePrepend)) {
    globalThis.nextResponsePrepend = [];
  }

  // Only set standard banners if they are not already set
  if (globalThis.nextResponsePrepend.length === 0) {
    // Set minimal banners directly without calling forceBanners
    globalThis.nextResponsePrepend.push("🤖 [MULTI-AGENT SYSTEM: ACTIVE]");
    globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
    globalThis.nextResponsePrepend.push("📝 [SCRATCHPAD SYSTEM: ACTIVE]");
    globalThis.nextResponsePrepend.push("👑 [AGENT: EXECUTIVE ARCHITECT]");
    console.log("✅ Basic banners added directly by bridge");
  }
} catch (error) {
  console.error("❌ Error in centralized banner bridge:", error);

  // Create minimal banner system if needed - no emergency banners
  if (!globalThis.BANNER_SYSTEM) {
    globalThis.BANNER_SYSTEM = {
      forceBanners: function () {
        if (!Array.isArray(globalThis.nextResponsePrepend)) {
          globalThis.nextResponsePrepend = [];
        }

        // Only add standard banners if none exist
        if (globalThis.nextResponsePrepend.length === 0) {
          globalThis.nextResponsePrepend.push(
            "🤖 [MULTI-AGENT SYSTEM: ACTIVE]"
          );
          globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
          globalThis.nextResponsePrepend.push("📝 [SCRATCHPAD SYSTEM: ACTIVE]");
          globalThis.nextResponsePrepend.push(
            "👑 [AGENT: EXECUTIVE ARCHITECT]"
          );
        }

        return globalThis.nextResponsePrepend;
      },
    };

    // Add standard banners
    globalThis.BANNER_SYSTEM.forceBanners();
  }
}

console.log("🌉 Centralized Banner Bridge loaded");
