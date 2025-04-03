/**
 * Memory System Bridge
 * Version: 2.0.0 (2023)
 *
 * This file ensures that the memory system is loaded using the centralized
 * database connection to prevent duplicate connections.
 */

console.log("🔄 Loading memory system from systems directory...");

// First check if the memory system is already loaded
if (globalThis.MEMORY_SYSTEM && globalThis.MEMORY_SYSTEM.initialized) {
  console.log("✅ Memory system already loaded and initialized");
} else {
  try {
    // Load the centralized database first
    const path = require("path");
    const databasePath = path.join(__dirname, "../db/database.js");

    console.log(`📂 Loading centralized database from: ${databasePath}`);
    const database = require(databasePath);

    // Load the memory system implementation
    const memorySystemPath = path.join(__dirname, "../db/memory-system.js");
    console.log(`📂 Loading memory system from: ${memorySystemPath}`);
    const memorySystem = require(memorySystemPath);

    console.log("✅ Memory system loaded successfully");

    // Force initialization if needed
    if (!globalThis.MEMORY_SYSTEM || !globalThis.MEMORY_SYSTEM.initialized) {
      console.log("🔄 Initializing memory system...");

      // Initialize from the loaded module if possible
      if (typeof memorySystem.initialize === "function") {
        memorySystem.initialize();
      }

      // Double-check initialization
      if (!globalThis.MEMORY_SYSTEM) {
        // Create a minimal implementation if loading failed
        globalThis.MEMORY_SYSTEM = {
          initialized: true,
          version: "2.0.0",
          shortTerm: {},
          episodic: [],
          semantic: {},

          storeContext: function (key, value) {
            this.shortTerm[key] = value;
            return true;
          },

          getContext: function (key) {
            return this.shortTerm[key];
          },

          storeConversation: function (conversation) {
            if (!this.episodic) {
              this.episodic = [];
            }
            this.episodic.push(conversation);
            return true;
          },

          getRecentConversations: function (limit = 10) {
            if (!this.episodic) {
              return [];
            }
            return this.episodic.slice(-limit);
          },

          storeEpisode: function (conversationId, type, content, options = {}) {
            if (
              this.db &&
              this.db.episodic &&
              typeof this.db.episodic.store === "function"
            ) {
              return this.db.episodic.store(content, {
                type: type,
                conversationId: conversationId,
                importance: options.importance || 1,
                metadata: options.metadata,
              });
            }

            if (!this.episodic) {
              this.episodic = [];
            }
            const episode = {
              id: Date.now(),
              conversation_id: conversationId,
              type: type,
              content: content,
              timestamp: Date.now(),
              importance: options.importance || 1,
            };
            this.episodic.push(episode);
            return episode.id;
          },

          getRecentEpisodes: function (limit = 10) {
            if (
              this.db &&
              this.db.episodic &&
              typeof this.db.episodic.search === "function"
            ) {
              return this.db.episodic.search("", {
                limit: limit,
                orderDesc: true,
              });
            }

            if (!this.episodic) {
              return [];
            }
            return this.episodic.slice(-limit);
          },

          storeKnowledge: function (topic, knowledge) {
            if (!this.semantic) {
              this.semantic = {};
            }
            if (!this.semantic[topic]) {
              this.semantic[topic] = {};
            }
            this.semantic[topic] = knowledge;
            return true;
          },

          getKnowledge: function (topic) {
            if (!this.semantic) {
              return null;
            }
            return this.semantic[topic];
          },
        };
        console.log("⚠️ Created minimal memory system");
      }
    }
  } catch (error) {
    console.error(`❌ Error loading memory system: ${error.message}`);

    // Create a minimal implementation as fallback
    globalThis.MEMORY_SYSTEM = {
      initialized: true,
      version: "2.0.0",
      shortTerm: {},
      episodic: [],
      semantic: {},

      storeContext: function (key, value) {
        this.shortTerm[key] = value;
        return true;
      },

      getContext: function (key) {
        return this.shortTerm[key];
      },

      storeConversation: function (conversation) {
        if (!this.episodic) {
          this.episodic = [];
        }
        this.episodic.push(conversation);
        return true;
      },

      getRecentConversations: function (limit = 10) {
        if (!this.episodic) {
          return [];
        }
        return this.episodic.slice(-limit);
      },

      storeEpisode: function (conversationId, type, content, options = {}) {
        if (
          this.db &&
          this.db.episodic &&
          typeof this.db.episodic.store === "function"
        ) {
          return this.db.episodic.store(content, {
            type: type,
            conversationId: conversationId,
            importance: options.importance || 1,
            metadata: options.metadata,
          });
        }

        if (!this.episodic) {
          this.episodic = [];
        }
        const episode = {
          id: Date.now(),
          conversation_id: conversationId,
          type: type,
          content: content,
          timestamp: Date.now(),
          importance: options.importance || 1,
        };
        this.episodic.push(episode);
        return episode.id;
      },

      getRecentEpisodes: function (limit = 10) {
        if (
          this.db &&
          this.db.episodic &&
          typeof this.db.episodic.search === "function"
        ) {
          return this.db.episodic.search("", { limit: limit, orderDesc: true });
        }

        if (!this.episodic) {
          return [];
        }
        return this.episodic.slice(-limit);
      },

      storeKnowledge: function (topic, knowledge) {
        if (!this.semantic) {
          this.semantic = {};
        }
        if (!this.semantic[topic]) {
          this.semantic[topic] = {};
        }
        this.semantic[topic] = knowledge;
        return true;
      },

      getKnowledge: function (topic) {
        if (!this.semantic) {
          return null;
        }
        return this.semantic[topic];
      },
    };
    console.log("⚠️ Created minimal memory system (fallback due to error)");
  }
}

// Ensure the banner system knows about our activation
if (globalThis.nextResponsePrepend) {
  // Check if banner is already added
  let hasMemoryBanner = false;
  for (const banner of globalThis.nextResponsePrepend) {
    if (banner.includes("MEMORY SYSTEM")) {
      hasMemoryBanner = true;
      break;
    }
  }

  // Add banner if not present
  if (!hasMemoryBanner) {
    globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
  }
}

// Add episodic memory methods if they don't exist
if (globalThis.MEMORY_SYSTEM) {
  // Add storeEpisode method if it doesn't exist
  if (!globalThis.MEMORY_SYSTEM.storeEpisode) {
    globalThis.MEMORY_SYSTEM.storeEpisode = function (
      conversationId,
      type,
      content,
      options = {}
    ) {
      // Use episodic.store if available in db
      if (
        this.db &&
        this.db.episodic &&
        typeof this.db.episodic.store === "function"
      ) {
        return this.db.episodic.store(content, {
          type: type,
          conversationId: conversationId,
          importance: options.importance || 1,
          metadata: options.metadata,
        });
      }

      // If the object has an episodic object with a store method, use that
      if (this.episodic && typeof this.episodic.store === "function") {
        return this.episodic.store(content, {
          type: type,
          conversationId: conversationId,
          importance: options.importance || 1,
          metadata: options.metadata,
        });
      }

      // Fallback implementation
      if (!this._episodicMemory) {
        this._episodicMemory = [];
      }

      const episode = {
        id: Date.now(),
        conversation_id: conversationId,
        type: type,
        content: content,
        timestamp: Date.now(),
        importance: options.importance || 1,
      };

      this._episodicMemory.push(episode);
      return episode.id;
    };
  }

  // Add getRecentEpisodes method if it doesn't exist
  if (!globalThis.MEMORY_SYSTEM.getRecentEpisodes) {
    globalThis.MEMORY_SYSTEM.getRecentEpisodes = function (limit = 10) {
      // Use episodic.search if available in db
      if (
        this.db &&
        this.db.episodic &&
        typeof this.db.episodic.search === "function"
      ) {
        return this.db.episodic.search("", { limit: limit, orderDesc: true });
      }

      // If the object has an episodic object with a search method, use that
      if (this.episodic && typeof this.episodic.search === "function") {
        return this.episodic.search("", { limit: limit, orderDesc: true });
      }

      // Fallback implementation
      if (!this._episodicMemory) {
        return [];
      }

      const episodes = this._episodicMemory.slice(-limit);
      return episodes;
    };
  }
}

// Make sure to expose the memory system globally
if (typeof globalThis !== "undefined") {
  if (!globalThis.MEMORY_SYSTEM) {
    console.log("📊 Exposing memory system globally...");
    globalThis.MEMORY_SYSTEM = module.exports;
  }

  // Ensure we have the key functions needed for auto-processing
  if (!globalThis.MEMORY_SYSTEM.processBeforeResponse) {
    globalThis.MEMORY_SYSTEM.processBeforeResponse = function (userInput) {
      console.log("🧠 Processing before response: storing user input");
      try {
        // Store the user's query in episodic memory
        this.storeConversation({
          role: "user",
          content: userInput,
          timestamp: Date.now(),
        });

        // Get recent conversations for context
        const recentConversations = this.getRecentConversations(5);

        // Store them in short-term memory for easy access
        this.shortTermMemory.lastQueryContext = recentConversations;

        console.log(
          `✅ Successfully processed user input: "${userInput.substring(
            0,
            30
          )}${userInput.length > 30 ? "..." : ""}"`
        );
        return true;
      } catch (error) {
        console.error("❌ Error in processBeforeResponse:", error.message);
        return false;
      }
    };
  }

  if (!globalThis.MEMORY_SYSTEM.processAfterResponse) {
    globalThis.MEMORY_SYSTEM.processAfterResponse = function (
      assistantResponse
    ) {
      console.log("🧠 Processing after response: storing assistant output");
      try {
        // Store the assistant's response in episodic memory
        this.storeConversation({
          role: "assistant",
          content: assistantResponse,
          timestamp: Date.now(),
        });

        // Update the conversation count
        if (this.shortTermMemory.conversationCount !== undefined) {
          this.shortTermMemory.conversationCount++;
        } else {
          this.shortTermMemory.conversationCount = 1;
        }

        console.log(
          `✅ Successfully processed assistant response: "${assistantResponse.substring(
            0,
            30
          )}${assistantResponse.length > 30 ? "..." : ""}"`
        );
        return true;
      } catch (error) {
        console.error("❌ Error in processAfterResponse:", error.message);
        return false;
      }
    };
  }
}

// Export the module
module.exports = memorySystem;
