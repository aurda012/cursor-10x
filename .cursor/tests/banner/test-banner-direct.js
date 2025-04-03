/**
 * Direct Banner System Test
 *
 * Tests the banner system by directly loading the components
 * and checking their functionality.
 */

// Load required components
require("./system-compatibility.js");
require("./claude-banner-hook.js");
require("./centralized-banner.js");

// Check current banner state
console.log("Current banners:", globalThis.nextResponsePrepend);

// Get formatted display from Claude hook
if (globalThis.CLAUDE_BANNER_HOOK) {
  const display = globalThis.CLAUDE_BANNER_HOOK.displayBanners();
  console.log("\nClaude banner display:\n" + display);
}

// Force banner refresh
if (globalThis.BANNER_SYSTEM) {
  console.log("\nForcing banner refresh...");
  globalThis.BANNER_SYSTEM.forceBanners();

  // Display again after refresh
  if (globalThis.CLAUDE_BANNER_HOOK) {
    const display = globalThis.CLAUDE_BANNER_HOOK.displayBanners();
    console.log("\nRefreshed Claude banner display:\n" + display);
  }
}
