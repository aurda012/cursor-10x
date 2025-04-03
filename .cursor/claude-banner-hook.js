/**
 * Claude Banner Hook
 * Version 1.0.0
 *
 * This script provides a specialized hook for Claude to ensure banners
 * are correctly displayed at the beginning of each response.
 * It integrates with the centralized banner system and compatibility layer.
 */

(function () {
  console.log("🔄 Initializing Claude Banner Hook...");

  try {
    // Ensure nextResponsePrepend exists
    if (!Array.isArray(globalThis.nextResponsePrepend)) {
      console.warn("⚠️ nextResponsePrepend array not found, creating it");
      globalThis.nextResponsePrepend = [];
    }

    // Define the Claude banner hook
    const ClaudeBannerHook = {
      // Display all queued banners
      displayBanners: function () {
        try {
          if (
            !Array.isArray(globalThis.nextResponsePrepend) ||
            globalThis.nextResponsePrepend.length === 0
          ) {
            console.warn("⚠️ No banners found to display");
            return "";
          }

          // Create banner display string
          const bannerDisplay =
            globalThis.nextResponsePrepend.join("\n") + "\n\n";
          console.log(
            `📢 Displaying ${globalThis.nextResponsePrepend.length} banners`
          );

          return bannerDisplay;
        } catch (error) {
          console.error("❌ Error displaying banners:", error);
          return "";
        }
      },

      // Refresh banners using centralized system if available
      refreshBanners: function () {
        try {
          // Check for centralized banner system
          if (
            globalThis.BANNER_SYSTEM &&
            typeof globalThis.BANNER_SYSTEM.setBanners === "function"
          ) {
            globalThis.BANNER_SYSTEM.setBanners();
            console.log("🔄 Refreshed banners using centralized system");
            return true;
          }

          // Fallback to direct banner testing
          if (typeof globalThis.testAndSetAllBanners === "function") {
            globalThis.testAndSetAllBanners();
            console.log("🔄 Refreshed banners using direct testing");
            return true;
          }

          return false;
        } catch (error) {
          console.error("❌ Error refreshing banners:", error);
          return false;
        }
      },

      // Add emergency banner if system is failing
      addEmergencyBanner: function () {
        try {
          const emergencyBanner = "⚠️ [SYSTEM STATUS: LIMITED]";

          if (!Array.isArray(globalThis.nextResponsePrepend)) {
            globalThis.nextResponsePrepend = [emergencyBanner];
          } else if (
            !globalThis.nextResponsePrepend.includes(emergencyBanner)
          ) {
            globalThis.nextResponsePrepend.push(emergencyBanner);
          }

          console.warn("⚠️ Added emergency banner due to system issues");
          return true;
        } catch (error) {
          console.error("❌ Error adding emergency banner:", error);
          return false;
        }
      },
    };

    // Register the hook globally
    globalThis.CLAUDE_BANNER_HOOK = ClaudeBannerHook;

    // Try to refresh banners immediately
    ClaudeBannerHook.refreshBanners();

    console.log("✅ Claude Banner Hook initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Claude Banner Hook:", error);
  }
})();

// Module exports for Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = globalThis.CLAUDE_BANNER_HOOK;
}
