/**
 * Centralized Database Management System
 * Version: 1.0.0 (2023)
 *
 * This module provides a centralized SQLite database interface for all systems
 * to prevent duplicate connections and ensure consistent database access.
 */

const fs = require("fs");
const path = require("path");

console.log("💾 DB-CORE: Initializing centralized database system...");

// Constants
const PROJECT_ROOT = process.cwd().replace(/\/\.cursor$/, "");
const CURSOR_DIR = path.join(PROJECT_ROOT, ".cursor");
const DB_DIR = path.join(CURSOR_DIR, "db");
const DB_PATH = path.join(DB_DIR, "memory-system.db");

// Database connection singleton
let dbInstance = null;

/**
 * Get the database connection instance
 * @returns {Object} The database connection
 */
function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Ensure database directory exists
    if (!fs.existsSync(DB_DIR)) {
      try {
        fs.mkdirSync(DB_DIR, { recursive: true });
        console.log(`Created database directory at: ${DB_DIR}`);
      } catch (error) {
        console.error(`Failed to create database directory: ${error.message}`);
        throw error;
      }
    }

    // Try to load better-sqlite3 dynamically
    let sqlite3;
    try {
      // Try different paths to find the module
      const possiblePaths = [
        path.join(PROJECT_ROOT, "node_modules", "better-sqlite3"),
        path.join(CURSOR_DIR, "node_modules", "better-sqlite3"),
        path.join(PROJECT_ROOT, ".cursor", "node_modules", "better-sqlite3"),
        "better-sqlite3", // Let Node.js resolve it
      ];

      let modulePath = null;
      for (const potentialPath of possiblePaths) {
        try {
          const resolved = require.resolve(potentialPath);
          modulePath = potentialPath;
          break;
        } catch (err) {
          // Continue trying other paths
        }
      }

      if (modulePath) {
        console.log(`Found better-sqlite3 at: ${modulePath}`);
        sqlite3 = require(modulePath);
      } else {
        throw new Error("Could not find better-sqlite3 module");
      }
    } catch (moduleError) {
      console.error(`Failed to load better-sqlite3: ${moduleError.message}`);

      // Create in-memory fallback with the same API
      console.log("Creating in-memory database fallback");
      dbInstance = createInMemoryFallback();
      return dbInstance;
    }

    // Initialize the database connection
    console.log(`Connecting to SQLite database at: ${DB_PATH}`);
    dbInstance = new sqlite3(DB_PATH, { verbose: console.log });

    // Initialize the schema
    initializeSchema(dbInstance);

    console.log("✅ Database connection established successfully");
    return dbInstance;
  } catch (error) {
    console.error(`Critical database error: ${error.message}`);

    // Create in-memory fallback
    console.log("Creating in-memory database fallback");
    dbInstance = createInMemoryFallback();
    return dbInstance;
  }
}

/**
 * Initialize the database schema
 * @param {Object} db - The database connection
 */
function initializeSchema(db) {
  console.log("Initializing database schema...");

  try {
    // Short-term memory table
    db.exec(`
      CREATE TABLE IF NOT EXISTS short_term_memory (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        expiry_time INTEGER,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_stm_timestamp ON short_term_memory(timestamp);
      CREATE INDEX IF NOT EXISTS idx_stm_expiry ON short_term_memory(expiry_time);
    `);

    // Episodic memory table
    db.exec(`
      CREATE TABLE IF NOT EXISTS episodic_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        importance INTEGER DEFAULT 1,
        related_ids TEXT,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_em_timestamp ON episodic_memory(timestamp);
      CREATE INDEX IF NOT EXISTS idx_em_conversation ON episodic_memory(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_em_importance ON episodic_memory(importance);
      CREATE INDEX IF NOT EXISTS idx_em_type ON episodic_memory(type);
    `);

    // Semantic memory table - knowledge nodes
    db.exec(`
      CREATE TABLE IF NOT EXISTS semantic_knowledge (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        confidence REAL DEFAULT 1.0,
        timestamp INTEGER NOT NULL,
        last_accessed INTEGER,
        source TEXT,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_sk_category ON semantic_knowledge(category);
      CREATE INDEX IF NOT EXISTS idx_sk_topic ON semantic_knowledge(topic);
      CREATE INDEX IF NOT EXISTS idx_sk_timestamp ON semantic_knowledge(timestamp);
      CREATE INDEX IF NOT EXISTS idx_sk_last_accessed ON semantic_knowledge(last_accessed);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sk_category_topic ON semantic_knowledge(category, topic);
    `);

    // Semantic memory table - relationships
    db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        strength REAL DEFAULT 1.0,
        timestamp INTEGER NOT NULL,
        metadata TEXT,
        UNIQUE(source_id, target_id, relationship_type),
        FOREIGN KEY (source_id) REFERENCES semantic_knowledge(id),
        FOREIGN KEY (target_id) REFERENCES semantic_knowledge(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_kr_source ON knowledge_relationships(source_id);
      CREATE INDEX IF NOT EXISTS idx_kr_target ON knowledge_relationships(target_id);
      CREATE INDEX IF NOT EXISTS idx_kr_relationship ON knowledge_relationships(relationship_type);
    `);

    // Memory queries log
    db.exec(`
      CREATE TABLE IF NOT EXISTS memory_queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_type TEXT NOT NULL,
        query TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        result_count INTEGER DEFAULT 0,
        duration_ms INTEGER DEFAULT 0,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_mq_timestamp ON memory_queries(timestamp);
      CREATE INDEX IF NOT EXISTS idx_mq_memory_type ON memory_queries(memory_type);
    `);

    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error(`Failed to initialize database schema: ${error.message}`);
  }
}

/**
 * Create an in-memory database fallback
 * @returns {Object} An in-memory database with the same API
 */
function createInMemoryFallback() {
  console.log("Creating in-memory database fallback");

  // Simple in-memory storage
  const storage = {
    short_term_memory: new Map(),
    episodic_memory: [],
    semantic_knowledge: new Map(),
    knowledge_relationships: [],
    memory_queries: [],
  };

  // Return an object with the same API as better-sqlite3
  return {
    // Mock prepare method that returns functions for run, get, and all
    prepare: (query) => {
      const queryType = query.trim().split(" ")[0].toUpperCase();
      const tableName = getTableNameFromQuery(query);

      return {
        // Insert or update data
        run: (...params) => {
          if (queryType === "INSERT") {
            if (tableName === "short_term_memory") {
              const [key, value, timestamp, expiry_time, metadata] = params;
              storage.short_term_memory.set(key, {
                key,
                value,
                timestamp,
                expiry_time,
                metadata,
              });
            } else if (tableName === "episodic_memory") {
              const id = storage.episodic_memory.length + 1;
              const [
                conversation_id,
                type,
                content,
                timestamp,
                importance,
                related_ids,
                metadata,
              ] = params;
              storage.episodic_memory.push({
                id,
                conversation_id,
                type,
                content,
                timestamp,
                importance,
                related_ids,
                metadata,
              });
              return { lastInsertRowid: id };
            }
          } else if (queryType === "UPDATE") {
            if (tableName === "short_term_memory") {
              const key = params[params.length - 1]; // Last param is the key in WHERE clause
              if (storage.short_term_memory.has(key)) {
                const record = storage.short_term_memory.get(key);
                if (query.includes("SET value")) {
                  record.value = params[0];
                  record.timestamp = params[1];
                }
                storage.short_term_memory.set(key, record);
              }
            }
          }
          return { changes: 1 };
        },

        // Get a single record
        get: (...params) => {
          if (tableName === "short_term_memory") {
            const key = params[0];
            return storage.short_term_memory.get(key);
          }
          return null;
        },

        // Get all matching records
        all: (...params) => {
          if (tableName === "episodic_memory") {
            return [...storage.episodic_memory]
              .reverse()
              .slice(0, params[0] || 10);
          }
          return [];
        },
      };
    },

    // Mock exec method for creating tables
    exec: (query) => {
      console.log(`In-memory DB mock exec: ${query.substring(0, 50)}...`);
      return true;
    },

    // Mock transaction method
    transaction: (fn) => {
      return function (...args) {
        return fn(...args);
      };
    },

    // Mock close method
    close: () => {
      console.log("Closing in-memory database");
      return true;
    },
  };
}

/**
 * Extract table name from SQL query (simple version)
 * @param {string} query - The SQL query
 * @returns {string} The table name
 */
function getTableNameFromQuery(query) {
  const normalized = query.toLowerCase().replace(/\s+/g, " ");

  if (
    normalized.includes("from short_term_memory") ||
    normalized.includes("into short_term_memory")
  ) {
    return "short_term_memory";
  }

  if (
    normalized.includes("from episodic_memory") ||
    normalized.includes("into episodic_memory")
  ) {
    return "episodic_memory";
  }

  if (
    normalized.includes("from semantic_knowledge") ||
    normalized.includes("into semantic_knowledge")
  ) {
    return "semantic_knowledge";
  }

  if (
    normalized.includes("from knowledge_relationships") ||
    normalized.includes("into knowledge_relationships")
  ) {
    return "knowledge_relationships";
  }

  return "unknown";
}

// Export the database accessor functions
module.exports = {
  getDatabase,

  // Shorthand method to get the current database instance
  get db() {
    return getDatabase();
  },

  // Initialize the database
  initialize: function () {
    console.log("Explicitly initializing database");
    getDatabase();
    return dbInstance !== null;
  },

  // Check if the database is initialized
  isInitialized: function () {
    return dbInstance !== null;
  },
};
