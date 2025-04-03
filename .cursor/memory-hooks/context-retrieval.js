/**
 * Context Retrieval System for Memory
 * Version: 1.0.0
 *
 * This module automatically retrieves relevant context from memory
 * to maintain continuity in conversations.
 */

// Check if we're in a Node.js environment (for compatibility)
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;

// Define the module and its dependencies
const MEMORY_SYSTEM = global.MEMORY_SYSTEM || {};

/**
 * Initialize the context retrieval system
 */
function initialize() {
  try {
    // Check if memory system is available
    if (
      !MEMORY_SYSTEM ||
      typeof MEMORY_SYSTEM.getRecentEpisodes !== "function"
    ) {
      console.warn("Memory system not available, context retrieval disabled");
      return false;
    }

    console.log("Context retrieval system initialized");
    return true;
  } catch (error) {
    console.error("Failed to initialize context retrieval:", error);
    return false;
  }
}

/**
 * Retrieve conversation history from episodic memory
 * @param {Object} options Options for retrieving history
 * @returns {Array} Array of conversation episodes
 */
function retrieveConversationHistory(options = {}) {
  try {
    if (!initialize()) return [];

    const limit = options.limit || 10;
    const conversationId = options.conversationId;
    const types = options.types || ["user_message", "assistant_response"];

    // Get recent episodes from memory
    const episodes = MEMORY_SYSTEM.getRecentEpisodes({
      limit,
      filter: {
        type: { $in: types },
        ...(conversationId
          ? { "metadata.conversationId": conversationId }
          : {}),
      },
      sort: { timestamp: -1 },
    });

    // Format episodes for chat context
    const formattedHistory = Array.isArray(episodes)
      ? episodes.map((episode) => ({
          role: episode.type === "user_message" ? "user" : "assistant",
          content: episode.content,
          id: episode.id,
          timestamp: episode.timestamp,
        }))
      : [];

    return formattedHistory.reverse(); // Return in chronological order
  } catch (error) {
    console.error("Failed to retrieve conversation history:", error);
    return [];
  }
}

/**
 * Retrieve semantic knowledge relevant to the current conversation
 * @param {Object} options Options for retrieving knowledge
 * @returns {Array} Array of relevant semantic knowledge
 */
function retrieveSemanticKnowledge(options = {}) {
  try {
    if (!initialize() || typeof MEMORY_SYSTEM.getKnowledge !== "function") {
      return [];
    }

    const query = options.query || "";
    const limit = options.limit || 5;

    // Get knowledge from semantic memory
    const knowledge = MEMORY_SYSTEM.getKnowledge({
      query,
      limit,
    });

    return Array.isArray(knowledge) ? knowledge : [];
  } catch (error) {
    console.error("Failed to retrieve semantic knowledge:", error);
    return [];
  }
}

/**
 * Retrieve current context from short-term memory
 * @param {Array} keys Array of context keys to retrieve
 * @returns {Object} Object containing the context values
 */
function retrieveContext(
  keys = ["last_user_message", "last_assistant_response"]
) {
  try {
    if (!initialize() || typeof MEMORY_SYSTEM.getContext !== "function") {
      return {};
    }

    // Get multiple context values
    const context = {};
    for (const key of keys) {
      const value = MEMORY_SYSTEM.getContext(key);
      if (value !== null && value !== undefined) {
        context[key] = value;
      }
    }

    return context;
  } catch (error) {
    console.error("Failed to retrieve context:", error);
    return {};
  }
}

/**
 * Get comprehensive memory context for the current conversation
 * @returns {Object} Consolidated memory context
 */
function getMemoryContext() {
  try {
    const history = retrieveConversationHistory({ limit: 10 });
    const context = retrieveContext();
    const knowledge = retrieveSemanticKnowledge({
      query: context.last_user_message?.value || "",
    });

    return {
      history,
      context,
      knowledge,
      timestamp: new Date(),
      success: true,
    };
  } catch (error) {
    console.error("Failed to get memory context:", error);
    return {
      history: [],
      context: {},
      knowledge: [],
      timestamp: new Date(),
      success: false,
      error: error.message,
    };
  }
}

// Export the module functions
module.exports = {
  initialize,
  retrieveConversationHistory,
  retrieveSemanticKnowledge,
  retrieveContext,
  getMemoryContext,
};

// If this module is loaded directly (not required), initialize immediately
if (isNode && require.main === module) {
  console.log("Context retrieval system loaded");
  initialize();
}
