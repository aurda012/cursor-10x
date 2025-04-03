/**
 * URDAFX Show Banner
 * 
 * This is a simple standalone script that shows the URDAFX banner.
 * It can be called at the beginning of every response to ensure the banner is visible.
 */

// Display banner
console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  URDAFX MULTI-AGENT SYSTEM                                         ║
║  Status: ACTIVE                                                    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

// Return immediately so the actual response can follow
process.exit(0); 