/**
 * Memory System Database Handler
 * Version: 2.0.0 (2023)
 *
 * This module provides database operations for the Memory System
 * using the centralized database connection.
 */

const path = require("path");
const Database = require("./database");

console.log("💾 MEMORY-DB: Initializing memory system database layer...");

// Get the database connection
const db = Database.db;

// Define database methods
const MemoryDB = {
  // Short-term memory methods
  shortTerm: {
    store: function (key, value, options = {}) {
      try {
        const expiryTime = options.expiryTime || null;
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;

        // Check if key exists
        const existingEntry = this.get(key);
        const stmt = existingEntry
          ? db.prepare(`
              UPDATE short_term_memory
              SET value = ?, timestamp = ?, expiry_time = ?, metadata = ?
              WHERE key = ?
            `)
          : db.prepare(`
              INSERT INTO short_term_memory
              (key, value, timestamp, expiry_time, metadata)
              VALUES (?, ?, ?, ?, ?)
            `);

        const valueStr =
          typeof value === "object" ? JSON.stringify(value) : String(value);

        if (existingEntry) {
          stmt.run(valueStr, Date.now(), expiryTime, metadata, key);
        } else {
          stmt.run(key, valueStr, Date.now(), expiryTime, metadata);
        }

        return true;
      } catch (error) {
        console.error(`Error storing short-term memory: ${error.message}`);
        return false;
      }
    },

    get: function (key) {
      try {
        const stmt = db.prepare(`
          SELECT key, value, timestamp, expiry_time, metadata
          FROM short_term_memory
          WHERE key = ?
        `);

        const row = stmt.get(key);
        if (!row) return null;

        // Check expiry
        if (row.expiry_time && Date.now() > row.expiry_time) {
          // Memory has expired, delete it
          this.remove(key);
          return null;
        }

        // Parse JSON value if possible
        try {
          row.value = JSON.parse(row.value);
        } catch (e) {
          // Leave as string if not valid JSON
        }

        if (row.metadata) {
          try {
            row.metadata = JSON.parse(row.metadata);
          } catch (e) {
            // Leave as string if not valid JSON
          }
        }

        // Update last accessed time
        const updateStmt = db.prepare(`
          UPDATE short_term_memory
          SET timestamp = ?
          WHERE key = ?
        `);
        updateStmt.run(Date.now(), key);

        return row.value;
      } catch (error) {
        console.error(`Error retrieving short-term memory: ${error.message}`);
        return null;
      }
    },

    getAll: function (options = {}) {
      try {
        let sql = `
          SELECT key, value, timestamp, expiry_time, metadata
          FROM short_term_memory
        `;

        const params = [];

        // Add WHERE clause for pattern matching
        if (options.pattern) {
          sql += ` WHERE key LIKE ?`;
          params.push(`%${options.pattern}%`);
        }

        // Add ORDER BY clause
        sql += ` ORDER BY timestamp DESC`;

        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);

        // Process results
        const result = {};
        for (const row of rows) {
          // Check expiry
          if (row.expiry_time && Date.now() > row.expiry_time) {
            // Skip expired memory
            continue;
          }

          // Parse JSON value if possible
          try {
            row.value = JSON.parse(row.value);
          } catch (e) {
            // Leave as string if not valid JSON
          }

          result[row.key] = row.value;
        }

        return result;
      } catch (error) {
        console.error(
          `Error retrieving all short-term memories: ${error.message}`
        );
        return {};
      }
    },

    remove: function (key) {
      try {
        const stmt = db.prepare(`
          DELETE FROM short_term_memory
          WHERE key = ?
        `);

        const result = stmt.run(key);
        return result.changes > 0;
      } catch (error) {
        console.error(`Error removing short-term memory: ${error.message}`);
        return false;
      }
    },

    purgeExpired: function () {
      try {
        const stmt = db.prepare(`
          DELETE FROM short_term_memory
          WHERE expiry_time IS NOT NULL AND expiry_time < ?
        `);

        const result = stmt.run(Date.now());
        return result.changes;
      } catch (error) {
        console.error(
          `Error purging expired short-term memories: ${error.message}`
        );
        return 0;
      }
    },
  },

  // Episodic memory methods
  episodic: {
    store: function (content, options = {}) {
      try {
        const contentStr =
          typeof content === "object"
            ? JSON.stringify(content)
            : String(content);
        const type = options.type || "conversation";
        const importance = options.importance || 1;
        const conversationId =
          options.conversationId || options.conversation_id;
        const relatedIds = options.relatedIds
          ? JSON.stringify(options.relatedIds)
          : null;
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;

        const stmt = db.prepare(`
          INSERT INTO episodic_memory
          (conversation_id, type, content, timestamp, importance, related_ids, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
          conversationId,
          type,
          contentStr,
          Date.now(),
          importance,
          relatedIds,
          metadata
        );

        return result.lastInsertRowid;
      } catch (error) {
        console.error(`Error storing episodic memory: ${error.message}`);
        return null;
      }
    },

    get: function (id) {
      try {
        const stmt = db.prepare(`
          SELECT id, conversation_id, type, content, timestamp, importance, related_ids, metadata
          FROM episodic_memory
          WHERE id = ?
        `);

        const row = stmt.get(id);
        if (!row) return null;

        // Parse JSON fields if possible
        try {
          row.content = JSON.parse(row.content);
        } catch (e) {
          // Leave as string if not valid JSON
        }

        if (row.related_ids) {
          try {
            row.related_ids = JSON.parse(row.related_ids);
          } catch (e) {
            // Leave as string if not valid JSON
          }
        }

        if (row.metadata) {
          try {
            row.metadata = JSON.parse(row.metadata);
          } catch (e) {
            // Leave as string if not valid JSON
          }
        }

        return row;
      } catch (error) {
        console.error(`Error retrieving episodic memory: ${error.message}`);
        return null;
      }
    },

    getByConversation: function (conversationId, options = {}) {
      try {
        let sql = `
          SELECT id, conversation_id, type, content, timestamp, importance, related_ids, metadata
          FROM episodic_memory
          WHERE conversation_id = ?
        `;

        const params = [conversationId];

        // Add additional filters
        if (options.type) {
          sql += ` AND type = ?`;
          params.push(options.type);
        }

        if (options.minImportance) {
          sql += ` AND importance >= ?`;
          params.push(options.minImportance);
        }

        if (options.fromTimestamp) {
          sql += ` AND timestamp >= ?`;
          params.push(options.fromTimestamp);
        }

        if (options.toTimestamp) {
          sql += ` AND timestamp <= ?`;
          params.push(options.toTimestamp);
        }

        // Add order by
        sql += ` ORDER BY timestamp ${options.orderDesc ? "DESC" : "ASC"}`;

        // Add limit if specified
        if (options.limit) {
          sql += ` LIMIT ?`;
          params.push(options.limit);
        }

        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);

        // Parse JSON fields if possible
        return rows.map((row) => {
          try {
            row.content = JSON.parse(row.content);
          } catch (e) {
            // Leave as string if not valid JSON
          }

          if (row.related_ids) {
            try {
              row.related_ids = JSON.parse(row.related_ids);
            } catch (e) {
              // Leave as string if not valid JSON
            }
          }

          if (row.metadata) {
            try {
              row.metadata = JSON.parse(row.metadata);
            } catch (e) {
              // Leave as string if not valid JSON
            }
          }

          return row;
        });
      } catch (error) {
        console.error(
          `Error retrieving episodic memories by conversation: ${error.message}`
        );
        return [];
      }
    },

    search: function (query, options = {}) {
      try {
        // Log search query
        this.logQuery("episodic", query);

        // Basic content search (in a production system, this would use full-text search)
        let sql = `
          SELECT id, conversation_id, type, content, timestamp, importance, related_ids, metadata
          FROM episodic_memory
          WHERE content LIKE ?
        `;

        const params = [`%${query}%`];

        // Add additional filters
        if (options.type) {
          sql += ` AND type = ?`;
          params.push(options.type);
        }

        if (options.conversationId) {
          sql += ` AND conversation_id = ?`;
          params.push(options.conversationId);
        }

        if (options.minImportance) {
          sql += ` AND importance >= ?`;
          params.push(options.minImportance);
        }

        // Add order by importance and recency
        sql += ` ORDER BY importance DESC, timestamp DESC`;

        // Add limit
        sql += ` LIMIT ?`;
        params.push(options.limit || 10);

        const startTime = Date.now();
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        const duration = Date.now() - startTime;

        // Update query log with results
        this.updateQueryResults("episodic", query, rows.length, duration);

        // Parse JSON fields if possible
        return rows.map((row) => {
          try {
            row.content = JSON.parse(row.content);
          } catch (e) {
            // Leave as string if not valid JSON
          }

          if (row.related_ids) {
            try {
              row.related_ids = JSON.parse(row.related_ids);
            } catch (e) {
              // Leave as string if not valid JSON
            }
          }

          if (row.metadata) {
            try {
              row.metadata = JSON.parse(row.metadata);
            } catch (e) {
              // Leave as string if not valid JSON
            }
          }

          return row;
        });
      } catch (error) {
        console.error(`Error searching episodic memories: ${error.message}`);
        return [];
      }
    },

    updateImportance: function (id, importance) {
      try {
        const stmt = db.prepare(`
          UPDATE episodic_memory
          SET importance = ?
          WHERE id = ?
        `);

        const result = stmt.run(importance, id);
        return result.changes > 0;
      } catch (error) {
        console.error(
          `Error updating episodic memory importance: ${error.message}`
        );
        return false;
      }
    },

    logQuery: function (memoryType, query) {
      try {
        const stmt = db.prepare(`
          INSERT INTO memory_queries
          (memory_type, query, timestamp, result_count, duration_ms)
          VALUES (?, ?, ?, 0, 0)
        `);

        return stmt.run(memoryType, query, Date.now()).lastInsertRowid;
      } catch (error) {
        console.error(`Error logging memory query: ${error.message}`);
        return null;
      }
    },

    updateQueryResults: function (memoryType, query, resultCount, durationMs) {
      try {
        const stmt = db.prepare(`
          UPDATE memory_queries
          SET result_count = ?, duration_ms = ?
          WHERE memory_type = ? AND query = ? AND timestamp = (
            SELECT MAX(timestamp) FROM memory_queries 
            WHERE memory_type = ? AND query = ?
          )
        `);

        stmt.run(resultCount, durationMs, memoryType, query, memoryType, query);
      } catch (error) {
        console.error(`Error updating memory query results: ${error.message}`);
      }
    },
  },

  // Semantic memory methods
  semantic: {
    storeKnowledge: function (category, topic, content, options = {}) {
      try {
        // Generate a unique ID if not provided
        const id =
          options.id ||
          `${category}_${topic}_${Date.now()}`.replace(/\s+/g, "_");
        const contentStr =
          typeof content === "object"
            ? JSON.stringify(content)
            : String(content);
        const confidence = options.confidence || 1.0;
        const source = options.source || null;
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;
        const now = Date.now();

        // Check if knowledge already exists
        const existingKnowledge = this.getKnowledge(category, topic);

        if (existingKnowledge) {
          // Update existing knowledge
          const stmt = db.prepare(`
            UPDATE semantic_knowledge
            SET content = ?, confidence = ?, timestamp = ?, source = ?, metadata = ?
            WHERE category = ? AND topic = ?
          `);

          stmt.run(
            contentStr,
            confidence,
            now,
            source,
            metadata,
            category,
            topic
          );
        } else {
          // Insert new knowledge
          const stmt = db.prepare(`
            INSERT INTO semantic_knowledge
            (id, category, topic, content, confidence, timestamp, last_accessed, source, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            id,
            category,
            topic,
            contentStr,
            confidence,
            now,
            now,
            source,
            metadata
          );
        }

        return id;
      } catch (error) {
        console.error(`Error storing semantic knowledge: ${error.message}`);
        return null;
      }
    },

    getKnowledge: function (category, topic) {
      try {
        const stmt = db.prepare(`
          SELECT id, category, topic, content, confidence, timestamp, last_accessed, source, metadata
          FROM semantic_knowledge
          WHERE category = ? AND topic = ?
        `);

        const row = stmt.get(category, topic);
        if (!row) return null;

        // Update last accessed time
        this.updateLastAccessed(row.id);

        // Parse JSON content if possible
        try {
          row.content = JSON.parse(row.content);
        } catch (e) {
          // Leave as string if not valid JSON
        }

        if (row.metadata) {
          try {
            row.metadata = JSON.parse(row.metadata);
          } catch (e) {
            // Leave as string if not valid JSON
          }
        }

        return row;
      } catch (error) {
        console.error(`Error retrieving semantic knowledge: ${error.message}`);
        return null;
      }
    },

    getById: function (id) {
      try {
        const stmt = db.prepare(`
          SELECT id, category, topic, content, confidence, timestamp, last_accessed, source, metadata
          FROM semantic_knowledge
          WHERE id = ?
        `);

        const row = stmt.get(id);
        if (!row) return null;

        // Update last accessed time
        this.updateLastAccessed(id);

        // Parse JSON content if possible
        try {
          row.content = JSON.parse(row.content);
        } catch (e) {
          // Leave as string if not valid JSON
        }

        if (row.metadata) {
          try {
            row.metadata = JSON.parse(row.metadata);
          } catch (e) {
            // Leave as string if not valid JSON
          }
        }

        return row;
      } catch (error) {
        console.error(
          `Error retrieving semantic knowledge by ID: ${error.message}`
        );
        return null;
      }
    },

    getByCategory: function (category) {
      try {
        const stmt = db.prepare(`
          SELECT id, category, topic, content, confidence, timestamp, last_accessed, source, metadata
          FROM semantic_knowledge
          WHERE category = ?
          ORDER BY topic
        `);

        const rows = stmt.all(category);

        // Update last accessed time for all results
        rows.forEach((row) => this.updateLastAccessed(row.id));

        // Parse JSON content if possible
        return rows.map((row) => {
          try {
            row.content = JSON.parse(row.content);
          } catch (e) {
            // Leave as string if not valid JSON
          }

          if (row.metadata) {
            try {
              row.metadata = JSON.parse(row.metadata);
            } catch (e) {
              // Leave as string if not valid JSON
            }
          }

          return row;
        });
      } catch (error) {
        console.error(
          `Error retrieving semantic knowledge by category: ${error.message}`
        );
        return [];
      }
    },

    search: function (query, options = {}) {
      try {
        // Log search query
        this.logQuery("semantic", query);

        // Basic search
        let sql = `
          SELECT id, category, topic, content, confidence, timestamp, last_accessed, source, metadata
          FROM semantic_knowledge
          WHERE topic LIKE ? OR content LIKE ?
        `;

        const params = [`%${query}%`, `%${query}%`];

        // Add category filter if provided
        if (options.category) {
          sql += ` AND category = ?`;
          params.push(options.category);
        }

        // Add order by confidence and recency
        sql += ` ORDER BY confidence DESC, last_accessed DESC`;

        // Add limit
        sql += ` LIMIT ?`;
        params.push(options.limit || 10);

        const startTime = Date.now();
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        const duration = Date.now() - startTime;

        // Update query log with results
        this.updateQueryResults("semantic", query, rows.length, duration);

        // Update last accessed time for all results
        rows.forEach((row) => this.updateLastAccessed(row.id));

        // Parse JSON content if possible
        return rows.map((row) => {
          try {
            row.content = JSON.parse(row.content);
          } catch (e) {
            // Leave as string if not valid JSON
          }

          if (row.metadata) {
            try {
              row.metadata = JSON.parse(row.metadata);
            } catch (e) {
              // Leave as string if not valid JSON
            }
          }

          return row;
        });
      } catch (error) {
        console.error(`Error searching semantic knowledge: ${error.message}`);
        return [];
      }
    },

    updateLastAccessed: function (id) {
      try {
        const stmt = db.prepare(`
          UPDATE semantic_knowledge
          SET last_accessed = ?
          WHERE id = ?
        `);

        stmt.run(Date.now(), id);
      } catch (error) {
        console.error(`Error updating last accessed time: ${error.message}`);
      }
    },

    createRelationship: function (
      sourceId,
      targetId,
      relationshipType,
      options = {}
    ) {
      try {
        // Validate that source and target exist
        const source = this.getById(sourceId);
        const target = this.getById(targetId);

        if (!source || !target) {
          console.error(`Source or target knowledge node does not exist`);
          return false;
        }

        const strength = options.strength || 1.0;
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;

        // Check if relationship already exists
        const existingRel = this.getRelationship(
          sourceId,
          targetId,
          relationshipType
        );

        if (existingRel) {
          // Update existing relationship
          const stmt = db.prepare(`
            UPDATE knowledge_relationships
            SET strength = ?, timestamp = ?, metadata = ?
            WHERE source_id = ? AND target_id = ? AND relationship_type = ?
          `);

          stmt.run(
            strength,
            Date.now(),
            metadata,
            sourceId,
            targetId,
            relationshipType
          );
        } else {
          // Create new relationship
          const stmt = db.prepare(`
            INSERT INTO knowledge_relationships
            (source_id, target_id, relationship_type, strength, timestamp, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            sourceId,
            targetId,
            relationshipType,
            strength,
            Date.now(),
            metadata
          );
        }

        return true;
      } catch (error) {
        console.error(
          `Error creating knowledge relationship: ${error.message}`
        );
        return false;
      }
    },

    getRelationship: function (sourceId, targetId, relationshipType) {
      try {
        const stmt = db.prepare(`
          SELECT id, source_id, target_id, relationship_type, strength, timestamp, metadata
          FROM knowledge_relationships
          WHERE source_id = ? AND target_id = ? AND relationship_type = ?
        `);

        const row = stmt.get(sourceId, targetId, relationshipType);

        if (!row) return null;

        if (row.metadata) {
          try {
            row.metadata = JSON.parse(row.metadata);
          } catch (e) {
            // Leave as string if not valid JSON
          }
        }

        return row;
      } catch (error) {
        console.error(`Error getting knowledge relationship: ${error.message}`);
        return null;
      }
    },

    getRelationships: function (nodeId, options = {}) {
      try {
        let sql;
        let params = [];

        // Determine relationship direction
        if (options.direction === "outgoing") {
          sql = `
            SELECT kr.id, kr.source_id, kr.target_id, kr.relationship_type, kr.strength, kr.timestamp, kr.metadata,
                   sk.category as target_category, sk.topic as target_topic
            FROM knowledge_relationships kr
            JOIN semantic_knowledge sk ON kr.target_id = sk.id
            WHERE kr.source_id = ?
          `;
          params.push(nodeId);
        } else if (options.direction === "incoming") {
          sql = `
            SELECT kr.id, kr.source_id, kr.target_id, kr.relationship_type, kr.strength, kr.timestamp, kr.metadata,
                   sk.category as source_category, sk.topic as source_topic
            FROM knowledge_relationships kr
            JOIN semantic_knowledge sk ON kr.source_id = sk.id
            WHERE kr.target_id = ?
          `;
          params.push(nodeId);
        } else {
          // Default: both directions
          sql = `
            SELECT kr.id, kr.source_id, kr.target_id, kr.relationship_type, kr.strength, kr.timestamp, kr.metadata,
                   CASE
                     WHEN kr.source_id = ? THEN sk.category
                     ELSE sk2.category
                   END as other_category,
                   CASE
                     WHEN kr.source_id = ? THEN sk.topic
                     ELSE sk2.topic
                   END as other_topic
            FROM knowledge_relationships kr
            LEFT JOIN semantic_knowledge sk ON kr.target_id = sk.id
            LEFT JOIN semantic_knowledge sk2 ON kr.source_id = sk2.id
            WHERE kr.source_id = ? OR kr.target_id = ?
          `;
          params.push(nodeId, nodeId, nodeId, nodeId);
        }

        // Filter by relationship type if provided
        if (options.relationshipType) {
          sql += ` AND kr.relationship_type = ?`;
          params.push(options.relationshipType);
        }

        // Order by strength and timestamp
        sql += ` ORDER BY kr.strength DESC, kr.timestamp DESC`;

        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);

        // Parse JSON metadata if possible
        return rows.map((row) => {
          if (row.metadata) {
            try {
              row.metadata = JSON.parse(row.metadata);
            } catch (e) {
              // Leave as string if not valid JSON
            }
          }

          return row;
        });
      } catch (error) {
        console.error(
          `Error getting knowledge relationships: ${error.message}`
        );
        return [];
      }
    },

    logQuery: function (memoryType, query) {
      try {
        const stmt = db.prepare(`
          INSERT INTO memory_queries
          (memory_type, query, timestamp, result_count, duration_ms)
          VALUES (?, ?, ?, 0, 0)
        `);

        return stmt.run(memoryType, query, Date.now()).lastInsertRowid;
      } catch (error) {
        console.error(`Error logging memory query: ${error.message}`);
        return null;
      }
    },

    updateQueryResults: function (memoryType, query, resultCount, durationMs) {
      try {
        const stmt = db.prepare(`
          UPDATE memory_queries
          SET result_count = ?, duration_ms = ?
          WHERE memory_type = ? AND query = ? AND timestamp = (
            SELECT MAX(timestamp) FROM memory_queries 
            WHERE memory_type = ? AND query = ?
          )
        `);

        stmt.run(resultCount, durationMs, memoryType, query, memoryType, query);
      } catch (error) {
        console.error(`Error updating memory query results: ${error.message}`);
      }
    },
  },
};

// Initialize the global memory system if it doesn't exist
if (!globalThis.MEMORY_SYSTEM) {
  console.log("Creating global MEMORY_SYSTEM object");

  globalThis.MEMORY_SYSTEM = {
    initialized: true,
    version: "2.0.0",
    db: MemoryDB,
    shortTerm: {},
    episodic: [],
    semantic: {},

    // Basic memory functions
    storeContext: function (key, value) {
      this.shortTerm[key] = value;

      // Also store in database if possible
      if (
        this.db &&
        this.db.shortTerm &&
        typeof this.db.shortTerm.store === "function"
      ) {
        this.db.shortTerm.store(key, value);
      }

      return true;
    },

    getContext: function (key) {
      // Try to get from database first
      if (
        this.db &&
        this.db.shortTerm &&
        typeof this.db.shortTerm.get === "function"
      ) {
        const value = this.db.shortTerm.get(key);
        if (value !== null) {
          return value;
        }
      }

      // Fall back to in-memory
      return this.shortTerm[key];
    },

    // Add other memory functions as needed
  };
}

// Initialize function for explicit initialization
function initialize() {
  console.log("Explicitly initializing memory database");

  // Nothing to do here since the database is already initialized through the require above

  return true;
}

// Export the memory database and initialize function
module.exports = {
  MemoryDB,
  initialize,
};

console.log("✅ Memory database layer initialized");
