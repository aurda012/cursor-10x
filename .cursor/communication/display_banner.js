/**
 * URDAFX Display Banner
 * 
 * This is a simple script to display the URDAFX system banner.
 * It can be run at any time to show that the system is active.
 */

// Default banner for when the system isn't initialized
const defaultBanner = `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  URDAFX MULTI-AGENT SYSTEM                                         ║
║  Status: ACTIVE                                                    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`;

// Try to display the banner using the API
try {
  const api = require('./api');
  
  // Check if system is initialized
  if (global.BANNER_SYSTEM) {
    // Use the banner system
    global.BANNER_SYSTEM.displaySystemStatus();
  } else if (global.URDAFX_SYSTEM) {
    // System exists but banner system isn't initialized
    console.log(defaultBanner);
  } else {
    // System not initialized
    console.log(defaultBanner);
  }
} catch (error) {
  // Fall back to default banner
  console.log(defaultBanner);
}

// For use in scripts
module.exports = {
  displayBanner: () => {
    if (global.BANNER_SYSTEM) {
      return global.BANNER_SYSTEM.displaySystemStatus();
    } else {
      console.log(defaultBanner);
      return defaultBanner;
    }
  }
}; 