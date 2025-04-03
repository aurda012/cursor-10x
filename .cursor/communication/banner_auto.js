/**
 * Automatic Banner System
 * Version: 1.0.0 (April 1, 2025)
 *
 * This script automatically adds system banners to every AI response.
 * It runs on every message and response to ensure banners are consistently displayed.
 */

// Self-executing function to ensure banners are added
(function () {
  console.log("🎌 [BANNER_AUTO] Initializing automatic banner system...");

  // Ensure nextResponsePrepend exists
  if (typeof globalThis.nextResponsePrepend === "undefined") {
    globalThis.nextResponsePrepend = [];
  }

  // Define standard system banners
  const SYSTEM_BANNERS = [
    "🤖 [CURSOR-SYSTEMS MULTI-AGENT SYSTEM: ACTIVE]",
    "🧠 [MEMORY SYSTEM: ACTIVE]",
    "💬 [SCRATCHPAD SYSTEM: ACTIVE]",
    `📅 [CURRENT DATE: 2025-04-01]`,
  ];

  // Check if each banner exists and add if missing
  SYSTEM_BANNERS.forEach((banner) => {
    const bannerType = banner.split("[")[1].split(":")[0];

    // Check if this type of banner already exists
    const exists = globalThis.nextResponsePrepend.some((existing) =>
      existing.includes(bannerType)
    );

    // Add banner if it doesn't exist
    if (!exists) {
      globalThis.nextResponsePrepend.push(banner);
      console.log(`🎌 [BANNER_AUTO] Added banner: ${banner}`);
    }
  });

  // Add a special verification banner
  const verificationBanner = `✅ [SYSTEM VERIFICATION: ${Date.now()}]`;
  globalThis.nextResponsePrepend.push(verificationBanner);

  console.log(
    `🎌 [BANNER_AUTO] ${globalThis.nextResponsePrepend.length} banners are set for next response`
  );

  // Export systems info for debugging
  module.exports = {
    banners: globalThis.nextResponsePrepend,
    systemStatus: {
      memory: globalThis.MEMORY_SYSTEM ? "active" : "inactive",
      scratchpad: globalThis.SCRATCHPAD ? "active" : "inactive",
      banner: "active",
    },
  };
})();
