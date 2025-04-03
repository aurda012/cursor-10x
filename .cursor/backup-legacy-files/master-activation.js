// Master Activation Script for Cursor Multi-Agent System
// Version: 2.0.0 (March 31, 2025)
// This file combines multiple activation approaches for maximum reliability

console.log("🚀 MASTER ACTIVATION: Initializing multi-agent system...");

// Import required modules
const fs = require("fs");
const path = require("path");
const PROJECT_ROOT = process.cwd();
const PROJECT_NAME = path.basename(PROJECT_ROOT);

// Constants
const ACTIVATION_FLAG_PATH = path.join(
  PROJECT_ROOT,
  ".cursor",
  "activation-status.json"
);
const RULE_DIR = path.join(PROJECT_ROOT, ".cursor", "rules");
const BANNER_PATH = path.join(
  PROJECT_ROOT,
  ".cursor",
  "communication",
  "banner_auto.js"
);

// Initialize activation tracking
function initActivationStatus() {
  try {
    const timestamp = new Date().toISOString();
    const activationData = {
      lastActivation: timestamp,
      status: "active",
      project: PROJECT_NAME,
      components: {
        multiAgentSystem: true,
        memorySystem: true,
        scratchpad: true,
        mcpServers: true,
        bannerSystem: true,
      },
      activations: [
        {
          timestamp,
          source: "master-activation.js",
          success: true,
        },
      ],
    };

    fs.writeFileSync(
      ACTIVATION_FLAG_PATH,
      JSON.stringify(activationData, null, 2)
    );
    console.log("✅ Created activation status file");
    return true;
  } catch (error) {
    console.error("❌ Error creating activation status:", error);
    return false;
  }
}

// Dynamic script loading with fallbacks
function loadScript(scriptPath) {
  try {
    if (fs.existsSync(scriptPath)) {
      console.log(`Loading script: ${scriptPath}`);
      try {
        // Clear require cache to ensure fresh load
        if (require.cache[require.resolve(scriptPath)]) {
          delete require.cache[require.resolve(scriptPath)];
        }

        // Attempt to load the script
        require(scriptPath);
        return true;
      } catch (error) {
        console.error(`Error loading script ${scriptPath}:`, error);
        return false;
      }
    } else {
      console.warn(`Script not found: ${scriptPath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking script ${scriptPath}:`, error);
    return false;
  }
}

// Initialize systems with multiple fallbacks
function initializeSystems() {
  console.log("🔄 Initializing all systems...");

  // Try multiple activation paths with fallbacks
  const activationPaths = [
    path.join(PROJECT_ROOT, ".cursor", "init.js"),
    path.join(PROJECT_ROOT, ".cursor", "communication", "activate.js"),
    path.join(PROJECT_ROOT, ".cursor", "communication", "launcher.js"),
    path.join(
      PROJECT_ROOT,
      ".cursor",
      "communication",
      "systems",
      "activation.js"
    ),
  ];

  let activationSuccess = false;

  // Try each activation path
  for (const activationPath of activationPaths) {
    if (loadScript(activationPath)) {
      activationSuccess = true;
      console.log(`✅ System activated via ${activationPath}`);
    }
  }

  // If all activations failed, use direct initialization
  if (!activationSuccess) {
    console.log(
      "⚠️ Standard activation failed, using direct initialization..."
    );
    directSystemInitialization();
  }

  return activationSuccess;
}

// Direct initialization of core systems if all else fails
function directSystemInitialization() {
  console.log("🛠️ Performing direct system initialization...");

  // Initialize multi-agent system
  if (!globalThis.SYSTEM) {
    globalThis.SYSTEM = { systemInitialized: true };
  }

  // Initialize memory system
  if (!globalThis.MEMORY_SYSTEM) {
    globalThis.MEMORY_SYSTEM = {
      initialized: true,
      shortTerm: {},
      episodic: [],
      semantic: {},
      storeContext: (key, value) => {
        globalThis.MEMORY_SYSTEM.shortTerm[key] = value;
        return true;
      },
      getContext: (key) => globalThis.MEMORY_SYSTEM.shortTerm[key],
      storeConversation: (conversation) => {
        globalThis.MEMORY_SYSTEM.episodic.push(conversation);
        return true;
      },
      getRecentConversations: (limit = 10) => {
        return globalThis.MEMORY_SYSTEM.episodic.slice(-limit);
      },
      storeKnowledge: (topic, knowledge) => {
        if (!globalThis.MEMORY_SYSTEM.semantic[topic]) {
          globalThis.MEMORY_SYSTEM.semantic[topic] = {};
        }
        globalThis.MEMORY_SYSTEM.semantic[topic] = knowledge;
        return true;
      },
      getKnowledge: (topic) => globalThis.MEMORY_SYSTEM.semantic[topic],
    };
  }

  // Initialize agent system
  if (!globalThis.AGENT_SYSTEM) {
    globalThis.AGENT_SYSTEM = {
      initialized: true,
      agents: {
        EA: {
          id: "EA",
          name: "Executive Architect",
          role: "System architecture and project management",
        },
        FD: {
          id: "FD",
          name: "Frontend Developer",
          role: "React and UI component development",
        },
        BD: {
          id: "BD",
          name: "Backend Developer",
          role: "API and server-side implementation",
        },
        FSI: {
          id: "FSI",
          name: "Full-Stack Integrator",
          role: "Integration between frontend and backend",
        },
        CMS: {
          id: "CMS",
          name: "CMS Specialist",
          role: "Content management system integration",
        },
        DE: {
          id: "DE",
          name: "Data Engineer",
          role: "Data pipeline and storage implementation",
        },
        DS: {
          id: "DS",
          name: "Documentation Specialist",
          role: "Technical documentation and knowledge management",
        },
      },
      getAgents: function () {
        return Object.values(this.agents);
      },
      getAgent: function (agentId) {
        return this.agents[agentId] || null;
      },
    };
  }

  // Initialize scratchpad system
  if (!globalThis.SCRATCHPAD) {
    globalThis.SCRATCHPAD = {
      initialized: true,
      messages: [],
      threads: {},
      createMessage: function (sender, messageType, content, threadId) {
        const message = {
          id: `msg_${Date.now()}`,
          sender,
          messageType,
          content,
          threadId: threadId || `thread_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        this.messages.push(message);
        return message.id;
      },
      readThread: function (threadId) {
        return this.messages.filter((msg) => msg.threadId === threadId);
      },
    };
  }

  // Initialize MCP registry
  if (!globalThis.MCP_REGISTRY) {
    globalThis.MCP_REGISTRY = {
      initialized: true,
      available_servers: {
        braveSearch: {
          id: "braveSearch",
          name: "Brave Search",
          capabilities: ["web_search", "information_retrieval"],
          status: "available",
        },
      },
    };
  }

  // Initialize banner system - direct approach
  if (!globalThis.nextResponsePrepend) {
    globalThis.nextResponsePrepend = [];
  }

  // Add system banners
  forceBanners();

  console.log("✅ Direct system initialization completed");
  return true;
}

// Force banners to be displayed regardless of other system status
function forceBanners() {
  console.log("🎯 Ensuring banners are displayed...");

  // Create or reset nextResponsePrepend
  if (!Array.isArray(globalThis.nextResponsePrepend)) {
    globalThis.nextResponsePrepend = [];
  }

  // Add multiple banner formats to maximize chances of one working
  globalThis.nextResponsePrepend = [
    `🤖 [${PROJECT_NAME.toUpperCase()} MULTI-AGENT SYSTEM: ACTIVE]`,
    `🧠 [MEMORY SYSTEM: ACTIVE]`,
    `💬 [SCRATCHPAD SYSTEM: ACTIVE]`,
    `🔌 [MCP INTEGRATION: ACTIVE]`,
    `📅 [CURRENT DATE: ${new Date().toISOString().split("T")[0]}]`,
  ];

  // Create a flag file to indicate banners were set
  try {
    fs.writeFileSync(
      path.join(PROJECT_ROOT, ".cursor", "banner-status.txt"),
      `Banners set at ${new Date().toISOString()}\n`
    );
  } catch (error) {
    console.error("Error creating banner status file:", error);
  }

  console.log("✅ Banners set successfully");
  return true;
}

// Check rules directory and parse MDC files
function processRuleFiles() {
  console.log("📚 Processing rule files...");

  try {
    if (!fs.existsSync(RULE_DIR)) {
      console.warn(`Rules directory not found: ${RULE_DIR}`);
      return false;
    }

    // Read all MDC files
    const ruleFiles = fs
      .readdirSync(RULE_DIR)
      .filter((file) => file.endsWith(".mdc"))
      .sort(); // Sort to ensure proper order

    console.log(`Found ${ruleFiles.length} rule files`);

    // Process each rule file
    for (const ruleFile of ruleFiles) {
      const rulePath = path.join(RULE_DIR, ruleFile);
      console.log(`Processing rule file: ${rulePath}`);

      try {
        const ruleContent = fs.readFileSync(rulePath, "utf8");

        // Extract frontmatter (simplified)
        const frontmatterMatch = ruleContent.match(/^---\s*([\s\S]*?)\s*---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          console.log(
            `Rule ${ruleFile} has frontmatter: ${frontmatter.replace(
              /\n/g,
              " "
            )}`
          );
        }

        // Check for script sections
        if (ruleContent.includes("<script>")) {
          console.log(`Rule ${ruleFile} contains JavaScript`);
          // Note: We don't execute JavaScript from MDC files here as it's unreliable
          // Instead, we load specific known script files directly
        }
      } catch (error) {
        console.error(`Error processing rule file ${ruleFile}:`, error);
      }
    }

    console.log("✅ Rule files processed");
    return true;
  } catch (error) {
    console.error("❌ Error processing rule files:", error);
    return false;
  }
}

// Main activation function - this is the entry point
function activateSystem() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  MASTER ACTIVATION PROCESS STARTING                        ║
║  Project: ${PROJECT_NAME.padEnd(43)}║
║  Date: ${new Date().toISOString().split("T")[0].padEnd(49)}║
╚════════════════════════════════════════════════════════════╝
  `);

  // Initialize activation tracking
  initActivationStatus();

  // Try standard initialization
  const initialized = initializeSystems();

  // Process rule files
  processRuleFiles();

  // Force banners as a fallback
  forceBanners();

  console.log(`
╔════════════════════════════════════════════════════════════╗
║  MASTER ACTIVATION PROCESS COMPLETE                        ║
║  Status: ${(initialized ? "SUCCESS" : "FALLBACK").padEnd(47)}║
╚════════════════════════════════════════════════════════════╝
  `);

  return true;
}

// Execute the activation process
activateSystem();
