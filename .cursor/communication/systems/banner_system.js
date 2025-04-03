/**
 * Dedicated Banner System
 * 
 * This system ensures that banners are always visible in user responses.
 * It provides multiple redundant mechanisms for displaying system status.
 */

// Core modules
const path = require('path');
const fs = require('fs');

// Get project name from current directory
const PROJECT_NAME = path.basename(process.cwd());

// Banner System Class
class BannerSystem {
  constructor() {
    // Banner configuration
    this.config = {
      alwaysDisplay: true,
      useFallback: true,
      enforceVisibility: true,
      retryOnFailure: true
    };
    
    // Banner styles
    this.styles = {
      standard: {
        prefix: '🤖',
        suffix: '',
        uppercase: true
      },
      memory: {
        prefix: '🧠',
        suffix: '',
        uppercase: true
      },
      warning: {
        prefix: '⚠️',
        suffix: '',
        uppercase: true
      },
      error: {
        prefix: '❌',
        suffix: '',
        uppercase: true
      },
      critical: {
        prefix: '🚨',
        suffix: '',
        uppercase: true
      }
    };
    
    // System status
    this.status = {
      systemActive: false,
      memoryActive: false,
      scratchpadActive: false,
      agentsActive: false,
      dateSystemActive: false,
      mcpServerActive: false
    };
    
    // Initialize banner system
    this.initialize();
    
    // Register globally
    globalThis.BANNER_SYSTEM = this;
    console.log("Banner System initialized");
  }
  
  // Initialize the banner system
  initialize() {
    // Create global nextResponsePrepend if it doesn't exist
    if (!globalThis.nextResponsePrepend) {
      globalThis.nextResponsePrepend = [];
    }
    
    // Detect active systems
    this.detectActiveSystems();
    
    // Create system banners array if it doesn't exist
    if (!globalThis.SYSTEM_BANNERS) {
      globalThis.SYSTEM_BANNERS = [];
    }
    
    // Add standard banners to system banners
    this.addStandardBanners();
    
    console.log("Banner System initialization complete");
  }
  
  // Detect which systems are active
  detectActiveSystems() {
    // Check if core system is active
    this.status.systemActive = 
      typeof globalThis.MULTI_AGENT_SYSTEM !== 'undefined' || 
      typeof globalThis.SYSTEM !== 'undefined' ||
      typeof globalThis.URDAFX_SYSTEM !== 'undefined';
    
    // Check if memory system is active
    this.status.memoryActive = 
      typeof globalThis.MEMORY_SYSTEM !== 'undefined';
    
    // Check if scratchpad is active
    this.status.scratchpadActive = 
      typeof globalThis.SCRATCHPAD !== 'undefined' || 
      typeof globalThis.SCRATCHPAD_SYSTEM !== 'undefined';
    
    // Check if agent system is active
    this.status.agentsActive = 
      typeof globalThis.AGENT_SYSTEM !== 'undefined';
    
    // Check if date system is active
    this.status.dateSystemActive = 
      typeof globalThis.DATE_SYSTEM !== 'undefined';
    
    // Check if MCP server is active
    this.status.mcpServerActive = 
      typeof globalThis.MCP_SERVER !== 'undefined' || 
      typeof globalThis.MCP_REGISTRY !== 'undefined';
  }
  
  // Add standard banners to global system banners
  addStandardBanners() {
    // Clear existing system banners
    globalThis.SYSTEM_BANNERS = [];
    
    // Add multi-agent system banner
    globalThis.SYSTEM_BANNERS.push(this.formatBanner(
      'standard',
      `${PROJECT_NAME} MULTI-AGENT SYSTEM`,
      this.status.systemActive ? 'ACTIVE' : 'INACTIVE'
    ));
    
    // Add memory system banner
    globalThis.SYSTEM_BANNERS.push(this.formatBanner(
      'memory',
      'MEMORY SYSTEM',
      this.status.memoryActive ? 'ACTIVE' : 'INACTIVE',
      this.getMemoryStats()
    ));
    
    // Add to nextResponsePrepend
    this.injectBannersToResponse();
  }
  
  // Format a banner with style
  formatBanner(style, system, status, details = '') {
    const styleConfig = this.styles[style] || this.styles.standard;
    
    // Format system name
    let systemName = styleConfig.uppercase ? system.toUpperCase() : system;
    
    // Format details
    let detailsText = details ? `: ${details}` : '';
    
    // Create banner
    return `${styleConfig.prefix} [${systemName}: ${status}${detailsText}]${styleConfig.suffix}`;
  }
  
  // Get memory system statistics
  getMemoryStats() {
    if (!this.status.memoryActive || !globalThis.MEMORY_SYSTEM || typeof globalThis.MEMORY_SYSTEM.getStatus !== 'function') {
      return '';
    }
    
    try {
      const memStatus = globalThis.MEMORY_SYSTEM.getStatus();
      
      // Format memory statistics
      if (memStatus.episodicEntries !== undefined) {
        const summaryText = memStatus.summarizedConversations ? 
          ` + ${memStatus.summarizedConversations} summarized` : '';
        
        return `${memStatus.episodicEntries} active${summaryText}`;
      }
      
      return '';
    } catch (error) {
      console.error("Error getting memory stats:", error);
      return '';
    }
  }
  
  // Inject banners into the response
  injectBannersToResponse() {
    if (!globalThis.nextResponsePrepend) {
      globalThis.nextResponsePrepend = [];
    }
    
    // Clear any existing system banners
    globalThis.nextResponsePrepend = globalThis.nextResponsePrepend.filter(
      line => !line.includes('MULTI-AGENT SYSTEM') && !line.includes('MEMORY SYSTEM')
    );
    
    // Add all system banners to response prepend
    for (const banner of globalThis.SYSTEM_BANNERS) {
      globalThis.nextResponsePrepend.push(banner);
    }
    
    console.log(`Injected ${globalThis.SYSTEM_BANNERS.length} banners into response`);
  }
  
  // Display the system status in console
  displaySystemStatus() {
    // Update active system detection
    this.detectActiveSystems();
    
    // Create ASCII art banner
    const banner = `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  ${PROJECT_NAME.toUpperCase()} MULTI-AGENT SYSTEM                  ║
║  Status: ${this.status.systemActive ? 'ACTIVE' : 'INACTIVE'}       ║
║                                                                    ║
║  Memory System: ${this.status.memoryActive ? 'ACTIVE' : 'INACTIVE'}║
║  Agent System: ${this.status.agentsActive ? 'ACTIVE' : 'INACTIVE'} ║
║  Scratchpad: ${this.status.scratchpadActive ? 'ACTIVE' : 'INACTIVE'}║
║  MCP Server: ${this.status.mcpServerActive ? 'ACTIVE' : 'INACTIVE'}║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    `;
    
    // Display in console
    console.log(banner);
    
    // Update system banners
    this.addStandardBanners();
    
    return banner;
  }
  
  // Render a banner with custom parameters
  renderBanner(type, params = {}) {
    // Create banner based on type
    let banner = '';
    
    switch (type) {
      case 'system_active':
        banner = this.formatBanner(
          'standard',
          `${PROJECT_NAME} MULTI-AGENT SYSTEM`,
          'ACTIVE',
          params.details || ''
        );
        break;
        
      case 'memory_active':
        banner = this.formatBanner(
          'memory',
          'MEMORY SYSTEM',
          'ACTIVE',
          params.details || this.getMemoryStats()
        );
        break;
        
      case 'error':
        banner = this.formatBanner(
          'error',
          params.system || `${PROJECT_NAME} SYSTEM`,
          'ERROR',
          params.details || ''
        );
        break;
        
      case 'warning':
        banner = this.formatBanner(
          'warning',
          params.system || `${PROJECT_NAME} SYSTEM`,
          'WARNING',
          params.details || ''
        );
        break;
        
      default:
        banner = this.formatBanner(
          params.style || 'standard',
          params.system || `${PROJECT_NAME} SYSTEM`,
          params.status || 'ACTIVE',
          params.details || ''
        );
    }
    
    // Add to system banners
    if (!globalThis.SYSTEM_BANNERS.includes(banner)) {
      globalThis.SYSTEM_BANNERS.push(banner);
    }
    
    // Inject to response
    this.injectBannersToResponse();
    
    return banner;
  }
  
  // Force display of system banners
  forceBanners() {
    // Detect active systems
    this.detectActiveSystems();
    
    // Update banners
    this.addStandardBanners();
    
    // Ensure they're injected into response
    this.injectBannersToResponse();
    
    return globalThis.nextResponsePrepend.length;
  }
}

// Create and export banner system
let bannerSystem;

function initializeBannerSystem() {
  if (!bannerSystem) {
    bannerSystem = new BannerSystem();
  }
  
  return bannerSystem;
}

// Initialize immediately
initializeBannerSystem();

// Export the banner system
module.exports = {
  BannerSystem,
  initializeBannerSystem,
  displaySystemStatus: () => {
    if (bannerSystem) {
      return bannerSystem.displaySystemStatus();
    }
    return initializeBannerSystem().displaySystemStatus();
  },
  renderBanner: (type, params) => {
    if (bannerSystem) {
      return bannerSystem.renderBanner(type, params);
    }
    return initializeBannerSystem().renderBanner(type, params);
  },
  forceBanners: () => {
    if (bannerSystem) {
      return bannerSystem.forceBanners();
    }
    return initializeBannerSystem().forceBanners();
  }
}; 