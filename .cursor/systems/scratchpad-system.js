/**
 * Scratchpad System
 * Version: 1.0.0 (April 3, 2025)
 *
 * Provides a communication medium for agents to share information
 * and coordinate activities across the multi-agent system.
 */

console.log("📝 Initializing Scratchpad System...");

// Initialize if not already exists
if (!globalThis.SCRATCHPAD) {
  console.log("🆕 Creating new Scratchpad System...");

  // Create the scratchpad system
  globalThis.SCRATCHPAD = {
    initialized: true,
    version: "1.0.0",
    threads: {},
    messages: [],

    /**
     * Creates a new message in the specified thread
     * @param {string} from - Sender identifier
     * @param {string} to - Recipient identifier
     * @param {string|object} content - Message content
     * @param {string} [threadId] - Optional thread ID (creates new thread if not provided)
     * @returns {string} Message ID
     */
    createMessage: function (from, to, content, threadId = null) {
      // Generate IDs if needed
      const messageId = `msg_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}`;
      threadId = threadId || `thread_${Date.now()}`;

      // Create thread if it doesn't exist
      if (!this.threads[threadId]) {
        this.createThread(threadId, `Thread from ${from} to ${to}`);
      }

      // Create message object
      const message = {
        id: messageId,
        thread_id: threadId,
        from: from,
        to: to,
        content: content,
        timestamp: Date.now(),
      };

      // Store in thread
      this.threads[threadId].messages.push(message);

      // Store in flat message list
      this.messages.push(message);

      console.log(
        `📤 Message created from ${from} to ${to} in thread ${threadId}`
      );

      return messageId;
    },

    /**
     * Creates a new thread
     * @param {string} threadId - Thread identifier
     * @param {string} title - Thread title
     * @param {string} [creatorId='system'] - Creator identifier
     * @returns {string} Thread ID
     */
    createThread: function (threadId, title, creatorId = "system") {
      // Generate ID if needed
      threadId = threadId || `thread_${Date.now()}`;

      // Create thread object
      this.threads[threadId] = {
        id: threadId,
        title: title,
        creator: creatorId,
        created_at: Date.now(),
        messages: [],
      };

      console.log(`📁 Thread created: ${title} (${threadId})`);

      return threadId;
    },

    /**
     * Retrieves messages from the specified thread
     * @param {string} threadId - Thread identifier
     * @returns {Array} Messages in the thread
     */
    getThreadMessages: function (threadId) {
      if (!this.threads[threadId]) {
        console.warn(`⚠️ Thread not found: ${threadId}`);
        return [];
      }

      return this.threads[threadId].messages;
    },

    /**
     * Lists all threads
     * @returns {Array} Thread objects
     */
    listThreads: function () {
      return Object.values(this.threads).map((thread) => ({
        id: thread.id,
        title: thread.title,
        creator: thread.creator,
        created_at: thread.created_at,
        message_count: thread.messages.length,
      }));
    },

    /**
     * Searches for messages matching the query
     * @param {string} query - Search query
     * @returns {Array} Matching messages
     */
    searchMessages: function (query) {
      const queryLower = query.toLowerCase();

      return this.messages.filter((message) => {
        // Search in content
        if (
          typeof message.content === "string" &&
          message.content.toLowerCase().includes(queryLower)
        ) {
          return true;
        }

        // Search in object content
        if (
          typeof message.content === "object" &&
          JSON.stringify(message.content).toLowerCase().includes(queryLower)
        ) {
          return true;
        }

        // Search in from/to
        if (
          message.from.toLowerCase().includes(queryLower) ||
          message.to.toLowerCase().includes(queryLower)
        ) {
          return true;
        }

        return false;
      });
    },
  };

  // Test the scratchpad
  const testThreadId = globalThis.SCRATCHPAD.createThread(
    null,
    "System Initialization Thread"
  );

  globalThis.SCRATCHPAD.createMessage(
    "system",
    "all_agents",
    "Scratchpad system initialized successfully",
    testThreadId
  );

  console.log("✅ Scratchpad System initialized successfully");
} else {
  console.log("✅ Scratchpad System already initialized");
}

// For backward compatibility
globalThis.SCRATCHPAD_SYSTEM = globalThis.SCRATCHPAD;

// Export the scratchpad system
module.exports = globalThis.SCRATCHPAD;
