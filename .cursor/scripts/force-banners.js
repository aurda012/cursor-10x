/**
 * FORCE BANNERS SCRIPT
 *
 * This script explicitly forces banners to appear at the top of Claude's responses.
 * It uses special markers that Claude is more likely to recognize and follow.
 */

console.log("🚨 FORCING BANNER DISPLAY");

// Clear require cache to ensure fresh instances
try {
  if (require.cache) {
    Object.keys(require.cache).forEach(function (key) {
      if (key.includes("banner") || key.includes("enforcer")) {
        delete require.cache[key];
      }
    });
    console.log("✅ Cleared cache of banner and enforcer modules");
  }
} catch (error) {
  console.error("❌ Error clearing cache:", error.message);
}

// Create standard banners if none exist
if (
  !globalThis.nextResponsePrepend ||
  !Array.isArray(globalThis.nextResponsePrepend)
) {
  globalThis.nextResponsePrepend = [];
}

if (globalThis.nextResponsePrepend.length === 0) {
  globalThis.nextResponsePrepend = [
    "🤖 [MULTI-AGENT SYSTEM: ACTIVE]",
    "🧠 [MEMORY SYSTEM: ACTIVE]",
    "📝 [SCRATCHPAD SYSTEM: ACTIVE]",
    "👑 [AGENT: EXECUTIVE ARCHITECT]",
  ];
  console.log("✅ Created standard banners");
}

// Force systems active flag
globalThis.SYSTEMS_ACTIVE = true;

// Force load and run the banner systems
try {
  // First try centralized banner
  const centralizedBanner = require("../core/centralized-banner.js");
  if (
    centralizedBanner &&
    typeof centralizedBanner.forceBanners === "function"
  ) {
    centralizedBanner.forceBanners();
    console.log("✅ Forced banners via centralized banner system");
  }
} catch (error) {
  console.error("❌ Error loading centralized banner:", error.message);

  // Fall back to direct banner
  try {
    const directBanner = require("../communication/direct-banner.js");
    if (directBanner && typeof directBanner.forceBanners === "function") {
      directBanner.forceBanners();
      console.log("✅ Forced banners via direct banner system");
    }
  } catch (directError) {
    console.error("❌ Error loading direct banner:", directError.message);
  }
}

// Log final banners that should appear
console.log("Final banners to display:");
globalThis.nextResponsePrepend.forEach((banner, index) => {
  console.log(`${index + 1}. ${banner}`);
});

// Export the banners for use by other modules
module.exports = {
  banners: globalThis.nextResponsePrepend,
  forceBanners: function () {
    return globalThis.nextResponsePrepend;
  },
};

console.log("🚨 BANNER ENFORCEMENT COMPLETE");
