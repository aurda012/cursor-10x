/**
 * Conversation Capture System for Memory
 * Version: 1.0.0
 *
 * This module automatically captures conversation data and stores it in memory
 * without requiring explicit calls to store data.
 */

// Check if we're in a Node.js environment (for compatibility)
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;

// Define the module and its dependencies
const path = isNode ? require("path") : null;
const MEMORY_SYSTEM = global.MEMORY_SYSTEM || {};

// Track conversation state
let currentConversationId = null;
let messageCount = 0;
let conversationStartTime = null;

/**
 * Initialize the conversation capture system
 */
function initialize() {
  try {
    // Check if memory system is available
    if (!MEMORY_SYSTEM || typeof MEMORY_SYSTEM.storeEpisode !== "function") {
      console.warn(
        "Memory system not available, conversation capture disabled"
      );
      return false;
    }

    // Generate a conversation ID if not exists
    if (!currentConversationId) {
      currentConversationId = `conv_${Date.now()}`;
      conversationStartTime = new Date();
      messageCount = 0;

      // Store conversation start event
      MEMORY_SYSTEM.storeEpisode({
        id: `${currentConversationId}_start`,
        type: "conversation_start",
        timestamp: conversationStartTime,
        metadata: { conversationId: currentConversationId },
      });

      console.log(
        `Conversation capture initialized with ID: ${currentConversationId}`
      );
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize conversation capture:", error);
    return false;
  }
}

/**
 * Capture a user message and store in memory
 * @param {Object} message The user message object
 * @returns {boolean} Success status
 */
function captureUserMessage(message) {
  try {
    if (!initialize()) return false;

    messageCount++;
    const messageId = `${currentConversationId}_user_${messageCount}`;

    // Store in episodic memory
    MEMORY_SYSTEM.storeEpisode({
      id: messageId,
      type: "user_message",
      content: message.content || message.text || message,
      timestamp: new Date(),
      metadata: {
        conversationId: currentConversationId,
        messageNumber: messageCount,
      },
    });

    // Store relevant context
    MEMORY_SYSTEM.storeContext({
      key: "last_user_message",
      value: message.content || message.text || message,
      metadata: {
        messageId: messageId,
        timestamp: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to capture user message:", error);
    return false;
  }
}

/**
 * Capture an assistant response and store in memory
 * @param {Object} response The assistant response object
 * @returns {boolean} Success status
 */
function captureAssistantResponse(response) {
  try {
    if (!initialize()) return false;

    const responseId = `${currentConversationId}_assistant_${messageCount}`;

    // Store in episodic memory
    MEMORY_SYSTEM.storeEpisode({
      id: responseId,
      type: "assistant_response",
      content: response.content || response.text || response,
      timestamp: new Date(),
      metadata: {
        conversationId: currentConversationId,
        messageNumber: messageCount,
        toolCalls: response.tool_calls || [],
      },
    });

    // Store relevant context
    MEMORY_SYSTEM.storeContext({
      key: "last_assistant_response",
      value: response.content || response.text || response,
      metadata: {
        messageId: responseId,
        timestamp: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to capture assistant response:", error);
    return false;
  }
}

// Export the module functions
module.exports = {
  initialize,
  captureUserMessage,
  captureAssistantResponse,
  getCurrentConversationId: () => currentConversationId,
};

// If this module is loaded directly (not required), initialize immediately
if (isNode && require.main === module) {
  console.log("Conversation capture system loaded");
  initialize();
}
