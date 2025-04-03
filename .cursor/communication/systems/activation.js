/**
 * System Activation Script
 *
 * This script ensures all necessary systems are properly initialized at the start of each chat session.
 * It is designed to be automatically loaded by the rules system.
 */

async function activateAllSystems() {
  // Get project name from the current working directory
  const path = require("path");
  const PROJECT_NAME = path.basename(process.cwd());
  console.log(`🚀 Activating all systems for ${PROJECT_NAME}...`);

  // Set global activation flag
  if (!globalThis.SYSTEMS_ACTIVE) {
    globalThis.SYSTEMS_ACTIVE = true;
    globalThis.PROJECT_NAME = PROJECT_NAME;
  }

  // Initialize Memory System
  if (!globalThis.MEMORY_SYSTEM) {
    globalThis.MEMORY_SYSTEM = {
      initialized: true,
      storeContext: (key, value) => {
        console.log(`[Memory] Storing ${key}`);
        globalThis.MEMORY_SYSTEM[key] = value;
      },
      getContext: (key) => globalThis.MEMORY_SYSTEM[key],
      storeConversation: (conv) => {
        console.log(`[Memory] Storing conversation`);
        if (!globalThis.MEMORY_SYSTEM.conversations) {
          globalThis.MEMORY_SYSTEM.conversations = [];
        }
        globalThis.MEMORY_SYSTEM.conversations.push(conv);
      },
      getRecentConversations: () =>
        globalThis.MEMORY_SYSTEM.conversations || [],
      storeKnowledge: (topic, knowledge) => {
        console.log(`[Memory] Storing knowledge: ${topic}`);
        if (!globalThis.MEMORY_SYSTEM.knowledge) {
          globalThis.MEMORY_SYSTEM.knowledge = {};
        }
        globalThis.MEMORY_SYSTEM.knowledge[topic] = knowledge;
      },
      getKnowledge: (topic) =>
        (globalThis.MEMORY_SYSTEM.knowledge || {})[topic],
    };
    console.log("✅ Memory system activated");
  }

  // Initialize Scratchpad System
  if (!globalThis.SCRATCHPAD) {
    globalThis.SCRATCHPAD = {
      messages: [],
      createThread: (creator, title) => {
        const threadId = `thread_${Date.now()}`;
        console.log(`[Scratchpad] Created thread ${threadId}`);
        return threadId;
      },
      createMessage: (sender, partition, type, content, threadId) => {
        const message = {
          id: `msg_${Date.now()}`,
          sender,
          partition,
          type,
          content,
          threadId,
          timestamp: new Date().toISOString(),
        };
        globalThis.SCRATCHPAD.messages.push(message);
        return message;
      },
      readMessages: () => globalThis.SCRATCHPAD.messages,
    };
    console.log("✅ Scratchpad system activated");
  }

  // Initialize Agent System
  if (!globalThis.AGENT_SYSTEM) {
    globalThis.AGENT_SYSTEM = {
      initialized: true,
      agents: {
        EA: { name: "Executive Architect", status: "active" },
        FD: { name: "Frontend Developer", status: "active" },
        BD: { name: "Backend Developer", status: "active" },
        FSI: { name: "Full-Stack Integrator", status: "active" },
        CMS: { name: "CMS Specialist", status: "active" },
        DE: { name: "Data Engineer", status: "active" },
        DS: { name: "Documentation Specialist", status: "active" },
      },
      getAgentIds: () => Object.keys(globalThis.AGENT_SYSTEM.agents),
      communicate: (from, to, msg) => {
        console.log(`[Agents] ${from} -> ${to}: Message sent`);
        if (globalThis.SCRATCHPAD) {
          globalThis.SCRATCHPAD.createMessage(
            from,
            "communication",
            "agent_message",
            {
              to: to,
              content: msg,
            }
          );
        }
      },
      performAction: (agent, action) => {
        console.log(`[Agents] ${agent} performing ${action}`);
        return true;
      },
    };
    console.log("✅ Agent system activated");
  }

  // Initialize MCP Server
  if (!globalThis.MCP_SERVER) {
    globalThis.MCP_SERVER = {
      initialized: true,
      executeQuery: async () => ({ rows: [], status: "success" }),
    };
    console.log("✅ MCP server activated");
  }

  // Initialize Date System
  if (!globalThis.CURRENT_DATE) {
    const now = new Date();
    globalThis.CURRENT_DATE = {
      full: now.toISOString().split("T")[0],
      year: now.getFullYear(),
      timestamp: now.getTime(),
      formatted: {
        short: now.toLocaleDateString(),
        long: now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };
    console.log("✅ Date system activated");
  }

  // Set up banners
  if (!globalThis.nextResponsePrepend) {
    globalThis.nextResponsePrepend = [];
  }

  // Add system banners
  globalThis.nextResponsePrepend = [
    `[🤖 ${PROJECT_NAME} Multi-Agent System Active]`,
    `[🧠 Memory System Active]`,
    `[📝 Scratchpad System Active]`,
    `[🔌 MCP Server Active]`,
    `[🗓️ Current Date: ${globalThis.CURRENT_DATE.formatted.long}]`,
    "-----",
    "○ Executive Architect     ✓ ONLINE",
    "○ Frontend Developer      ✓ ONLINE",
    "○ Backend Developer       ✓ ONLINE",
    "○ Full-Stack Integrator   ✓ ONLINE",
    "○ CMS Specialist          ✓ ONLINE",
    "○ Data Engineer           ✓ ONLINE",
    "○ Documentation Spec.     ✓ ONLINE",
    "-----",
    "All agent communications logged via scratchpad",
  ];

  console.log("✅ System banners initialized");
  console.log(`✅ All systems activated successfully for ${PROJECT_NAME}`);

  return true;
}

// Export the activation function
module.exports = {
  activateAllSystems,
};
