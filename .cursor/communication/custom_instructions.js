/**
 * Custom Instructions Generator
 * Version: 3.2.0 (April 3, 2025)
 *
 * This script generates custom instructions for Claude that complement
 * cursor.json without duplicating configuration. It focuses on defining
 * available rules and multi-agent system details.
 */

const fs = require("fs");
const path = require("path");

console.log("📝 Generating custom instructions...");

// Try to load the banner system for status checking
let bannerSystem;
try {
  const bannerPath = path.join(__dirname, "direct-banner.js");
  if (fs.existsSync(bannerPath)) {
    bannerSystem = require(bannerPath);
    console.log("📊 Loaded banner system for status checking");
  }
} catch (error) {
  console.error(`❌ Error loading banner system: ${error.message}`);
}

// Generate the custom instructions object
function generateCustomInstructions() {
  const instructions = {
    version: "3.2.0",
    description: "Cursor System Rules",

    // Define multi-agent system
    multi_agent_system: {
      defaultAgent: "executive-architect",
      agents: [
        {
          id: "executive-architect",
          name: "Executive Architect",
          emoji: "👑",
          description: "Leadership, planning, and coordination",
          rulePath: ".cursor/rules/101-executive-architect-agent.mdc",
        },
        {
          id: "frontend-developer",
          name: "Frontend Developer",
          emoji: "🎨",
          description: "UI/UX implementation and frontend code",
          rulePath: ".cursor/rules/102-frontend-developer-agent.mdc",
        },
        {
          id: "backend-developer",
          name: "Backend Developer",
          emoji: "🔧",
          description: "Server-side architecture and implementation",
          rulePath: ".cursor/rules/103-backend-developer-agent.mdc",
        },
        {
          id: "full-stack-integrator",
          name: "Full-Stack Integrator",
          emoji: "🔄",
          description: "Cross-system implementation and integration",
          rulePath: ".cursor/rules/104-full-stack-integrator-agent.mdc",
        },
        {
          id: "cms-specialist",
          name: "CMS Specialist",
          emoji: "📄",
          description: "Content management systems expertise",
          rulePath: ".cursor/rules/105-cms-specialist-agent.mdc",
        },
        {
          id: "data-engineer",
          name: "Data Engineer",
          emoji: "📊",
          description: "Data pipelines and infrastructure",
          rulePath: ".cursor/rules/106-data-engineer-agent.mdc",
        },
        {
          id: "doc-specialist",
          name: "Documentation Specialist",
          emoji: "📚",
          description: "Comprehensive documentation",
          rulePath: ".cursor/rules/107-doc-specialist-agent.mdc",
        },
      ],
    },

    // Get dynamic banner content based on actual system status
    banner_instructions: getBannerInstructions(),
  };

  // Add available instructions section with rules info
  instructions.available_instructions = {
    title:
      "Cursor rules are user provided instructions for the AI to follow to help work with the codebase.",
    description:
      "They may or may not be relevant to the task at hand. If they are, use the fetch_rules tool to fetch the full rule.",
    note: "Some rules may be automatically attached to the conversation if the user attaches a file that matches the rule's glob, and won't need to be fetched.",
    rules: [],
  };

  // Check for rule files
  try {
    const rulesDir = path.join(__dirname, "..", "rules");

    if (fs.existsSync(rulesDir)) {
      const ruleFiles = fs
        .readdirSync(rulesDir)
        .filter((file) => file.endsWith(".mdc"));

      if (ruleFiles.length > 0) {
        // Parse each rule file for description
        ruleFiles.forEach((file) => {
          const filePath = path.join(rulesDir, file);
          const content = fs.readFileSync(filePath, "utf8");

          // Extract the rule key (filename without extension)
          const ruleId = file.replace(".mdc", "");
          const ruleName = ruleId.split("-").slice(1).join(" ");

          // Try to extract description from frontmatter or content
          let description = "";
          const descMatch = content.match(/description:\s*["'](.+?)["']/);

          if (descMatch && descMatch[1]) {
            description = descMatch[1];
          } else {
            description = `Rule for ${ruleName}`;
          }

          // Add rule to available instructions
          instructions.available_instructions.rules.push({
            id: ruleId,
            name: ruleName,
            description: description,
          });
        });
      }
    }
  } catch (error) {
    console.error(`Error processing rule files: ${error.message}`);
  }

  return instructions;
}

/**
 * Get banner instructions with dynamic system status
 * @returns {Object} Banner instructions object with content based on actual system status
 */
function getBannerInstructions() {
  // Default banner instructions
  const defaultBanners = {
    display: true,
    position: "top",
    format: "plaintext",
    always_show: true,
    required: true,
    content: [
      "🧠 [MEMORY SYSTEM: ACTIVE]",
      "💬 [SCRATCHPAD SYSTEM: ACTIVE]",
      "👑 [AGENT: EXECUTIVE ARCHITECT]",
      "🤖 [MULTI-AGENT SYSTEM: ACTIVE]",
    ],
    instruction:
      "YOU MUST start EVERY response with EXACTLY these banner lines at the top, with no introduction or explanation:",
  };

  // If banner system is not available, return default
  if (!bannerSystem || !bannerSystem.checkSystemStatus) {
    console.log(
      "ℹ️ Using default banner instructions (banner system not available)"
    );
    return defaultBanners;
  }

  try {
    console.log("🔍 Testing system status for accurate banners...");

    // Check Memory System
    const memoryStatus = bannerSystem.checkSystemStatus.testMemorySystem();

    // Check Scratchpad System
    const scratchpadStatus =
      bannerSystem.checkSystemStatus.testScratchpadSystem();

    // Get active agent
    const agentStatus = bannerSystem.checkSystemStatus.getActiveAgent();

    // Check Multi-Agent System
    const multiAgentStatus =
      bannerSystem.checkSystemStatus.testMultiAgentSystem();

    // Create dynamic banner content
    const dynamicContent = [
      `🧠 [MEMORY SYSTEM: ${memoryStatus.active ? "ACTIVE" : "INACTIVE"}]`,
      `💬 [SCRATCHPAD SYSTEM: ${
        scratchpadStatus.active ? "ACTIVE" : "INACTIVE"
      }]`,
      `${agentStatus.emoji} [AGENT: ${agentStatus.name}]`,
      `🤖 [MULTI-AGENT SYSTEM: ${
        multiAgentStatus.active ? "ACTIVE" : "INACTIVE"
      }]`,
    ];

    console.log(
      "✅ Dynamic banner content generated based on actual system status"
    );

    return {
      ...defaultBanners,
      content: dynamicContent,
    };
  } catch (error) {
    console.error(
      `❌ Error generating dynamic banner content: ${error.message}`
    );
    console.log("⚠️ Falling back to default banner instructions");
    return defaultBanners;
  }
}

// Save the custom instructions to a file
function saveInstructions(instructions) {
  try {
    const filePath = path.join(__dirname, "..", "custom_instructions.json");
    fs.writeFileSync(filePath, JSON.stringify(instructions, null, 2));
    console.log(`✅ Custom instructions saved to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving custom instructions: ${error.message}`);
    return false;
  }
}

// Delete redundant custom_settings.json if it exists
function deleteRedundantFiles() {
  try {
    const settingsPath = path.join(__dirname, "..", "custom_settings.json");

    if (fs.existsSync(settingsPath)) {
      fs.unlinkSync(settingsPath);
      console.log(`✅ Removed redundant custom_settings.json`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error removing redundant files: ${error.message}`);
    return false;
  }
}

// Generate and save the custom instructions
console.log("🔄 Generating custom instructions with dynamic system status...");
const instructions = generateCustomInstructions();
saveInstructions(instructions);
deleteRedundantFiles();
console.log("✅ Configuration complete with actual system status");

module.exports = {
  generateCustomInstructions,
  saveInstructions,
};
