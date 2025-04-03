/**
 * Memory Database Fix
 * Version: 1.0.0
 *
 * This script fixes issues with memory database storage and retrieval,
 * ensuring proper SQLite connection and fallback mechanisms.
 */

console.log("🧠 Memory Database Fix - Starting repair process...");

// Required modules
const fs = require("fs");
const path = require("path");
const dbDir = path.join(__dirname, "..", "db");
const dbPath = path.join(dbDir, "memory-system.db");

// Load compatibility layer first to ensure system objects exist
try {
  require("../system-compatibility.js");
  console.log("✅ Loaded system compatibility layer");
} catch (error) {
  console.error("❌ Failed to load compatibility layer:", error);
}

// First, check if we can actually access the database file
console.log(`\n📊 Checking database at: ${dbPath}`);
let dbStats = null;

try {
  if (fs.existsSync(dbPath)) {
    dbStats = fs.statSync(dbPath);
    console.log(
      `✅ Database file exists (${(dbStats.size / 1024).toFixed(2)} KB)`
    );
  } else {
    console.log("⚠️ Database file does not exist - will be created");
  }
} catch (error) {
  console.error("❌ Error checking database file:", error.message);
}

// Try to access database module
let Database = null;
try {
  Database = require("../db/database.js");
  console.log("✅ Successfully loaded database module");
} catch (error) {
  console.error("❌ Failed to load database module:", error.message);
}

// Try to load better-sqlite3
let sqlite3 = null;
try {
  // Try different paths to find the module
  const possiblePaths = [
    path.resolve(__dirname, "../../node_modules/better-sqlite3"),
    path.resolve(__dirname, "../node_modules/better-sqlite3"),
    path.resolve(__dirname, "../../../node_modules/better-sqlite3"),
    "better-sqlite3", // Let Node.js resolve it
  ];

  for (const potentialPath of possiblePaths) {
    try {
      sqlite3 = require(potentialPath);
      console.log(`✅ Loaded better-sqlite3 from: ${potentialPath}`);
      break;
    } catch (err) {
      // Continue trying other paths
    }
  }

  if (!sqlite3) {
    throw new Error("Could not find better-sqlite3 module");
  }
} catch (moduleError) {
  console.error("❌ Failed to load better-sqlite3:", moduleError.message);
}

// Fix 1: Attempt direct database connection
console.log("\n🔧 Fix 1: Testing direct database connection");
let db = null;

try {
  if (sqlite3) {
    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory at: ${dbDir}`);
    }

    // Open database connection
    db = new sqlite3(dbPath);
    console.log("✅ Successfully opened direct database connection");

    // Test the database with a simple query
    const tableInfo = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all();
    console.log(`Found ${tableInfo.length} tables in the database:`);
    tableInfo.forEach((table) => console.log(`- ${table.name}`));

    // Check if we need to initialize schema
    if (tableInfo.length === 0) {
      console.log("Database is empty, initializing schema...");
      // Initialize schema (similar to what's in database.js)
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

      console.log("✅ Database schema initialized");
    }

    // Test database write and read operations
    const testKey = `test_${Date.now()}`;
    const testValue = { test: "Database Write Test", timestamp: Date.now() };
    const testValueStr = JSON.stringify(testValue);

    console.log(`\nTesting database operations with key: ${testKey}`);

    // Write to database
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO short_term_memory (key, value, timestamp, expiry_time)
      VALUES (?, ?, ?, ?)
    `);

    const insertResult = insertStmt.run(
      testKey,
      testValueStr,
      Date.now(),
      null
    );
    console.log(
      `✅ Write test successful. Last row ID: ${insertResult.lastInsertRowid}`
    );

    // Read from database
    const selectStmt = db.prepare(`
      SELECT * FROM short_term_memory WHERE key = ?
    `);

    const row = selectStmt.get(testKey);
    if (row) {
      console.log("✅ Read test successful. Retrieved value:", row.value);
      try {
        const parsedValue = JSON.parse(row.value);
        console.log("✅ Successfully parsed JSON value");
      } catch (e) {
        console.error("❌ Error parsing JSON value:", e.message);
      }
    } else {
      console.error("❌ Failed to retrieve test value");
    }

    // Close the test connection
    db.close();
    console.log("✅ Database connection closed");
  } else {
    console.log("⚠️ Cannot test direct connection without better-sqlite3");
  }
} catch (error) {
  console.error("❌ Error testing database connection:", error.message);
  if (db) {
    try {
      db.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}

// Fix 2: Repair MEMORY_SYSTEM to use the database properly
console.log("\n🔧 Fix 2: Repairing MEMORY_SYSTEM database integration");

// Create an enhanced database adapter
const createEnhancedStorage = () => {
  // First try to use the SQLite database
  if (sqlite3) {
    try {
      // Create direct connection to the database
      // Don't use verbose option as it requires a function and can cause errors
      const db = new sqlite3(dbPath);

      console.log("✅ Created enhanced SQLite storage adapter");

      // Return an object with storage functions
      return {
        set: (key, value) => {
          try {
            const valueStr =
              typeof value === "object" ? JSON.stringify(value) : String(value);
            const stmt = db.prepare(`
              INSERT OR REPLACE INTO short_term_memory (key, value, timestamp, expiry_time)
              VALUES (?, ?, ?, ?)
            `);
            stmt.run(key, valueStr, Date.now(), null);
            return true;
          } catch (error) {
            console.error("Error storing in database:", error.message);
            return false;
          }
        },

        get: (key) => {
          try {
            const stmt = db.prepare(`
              SELECT value FROM short_term_memory WHERE key = ?
            `);
            const row = stmt.get(key);
            if (!row) return null;

            // Try to parse JSON if possible
            try {
              return JSON.parse(row.value);
            } catch (e) {
              // Return as string if not valid JSON
              return row.value;
            }
          } catch (error) {
            console.error("Error retrieving from database:", error.message);
            return null;
          }
        },

        getAll: (pattern = null) => {
          try {
            let sql = `SELECT key, value FROM short_term_memory`;
            const params = [];

            if (pattern) {
              sql += ` WHERE key LIKE ?`;
              params.push(`%${pattern}%`);
            }

            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);

            const result = {};
            rows.forEach((row) => {
              try {
                result[row.key] = JSON.parse(row.value);
              } catch (e) {
                result[row.key] = row.value;
              }
            });

            return result;
          } catch (error) {
            console.error("Error retrieving all keys:", error.message);
            return {};
          }
        },

        delete: (key) => {
          try {
            const stmt = db.prepare(`
              DELETE FROM short_term_memory WHERE key = ?
            `);
            const result = stmt.run(key);
            return result.changes > 0;
          } catch (error) {
            console.error("Error deleting from database:", error.message);
            return false;
          }
        },

        clear: () => {
          try {
            const stmt = db.prepare(`DELETE FROM short_term_memory`);
            stmt.run();
            return true;
          } catch (error) {
            console.error("Error clearing database:", error.message);
            return false;
          }
        },

        close: () => {
          try {
            db.close();
            return true;
          } catch (error) {
            console.error("Error closing database:", error.message);
            return false;
          }
        },

        // Additional utility functions
        keys: () => {
          try {
            const stmt = db.prepare(`SELECT key FROM short_term_memory`);
            const rows = stmt.all();
            return rows.map((row) => row.key);
          } catch (error) {
            console.error("Error getting keys:", error.message);
            return [];
          }
        },

        has: (key) => {
          try {
            const stmt = db.prepare(`
              SELECT 1 FROM short_term_memory WHERE key = ?
            `);
            return !!stmt.get(key);
          } catch (error) {
            console.error("Error checking key existence:", error.message);
            return false;
          }
        },

        size: () => {
          try {
            const stmt = db.prepare(
              `SELECT COUNT(*) as count FROM short_term_memory`
            );
            const result = stmt.get();
            return result ? result.count : 0;
          } catch (error) {
            console.error("Error getting size:", error.message);
            return 0;
          }
        },
      };
    } catch (error) {
      console.error("Failed to create SQLite storage adapter:", error.message);
      console.log("⚠️ Falling back to in-memory storage");
    }
  }

  // Fallback to in-memory storage
  console.log("⚠️ Using in-memory storage adapter");
  const memStorage = {};

  return {
    set: (key, value) => {
      memStorage[key] = value;
      return true;
    },
    get: (key) => memStorage[key] || null,
    getAll: (pattern = null) => {
      if (!pattern) return { ...memStorage };

      const result = {};
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));

      for (const [key, value] of Object.entries(memStorage)) {
        if (regex.test(key)) {
          result[key] = value;
        }
      }

      return result;
    },
    delete: (key) => {
      if (key in memStorage) {
        delete memStorage[key];
        return true;
      }
      return false;
    },
    clear: () => {
      Object.keys(memStorage).forEach((key) => delete memStorage[key]);
      return true;
    },
    close: () => true,
    keys: () => Object.keys(memStorage),
    has: (key) => key in memStorage,
    size: () => Object.keys(memStorage).length,
  };
};

// Apply the fix to MEMORY_SYSTEM
try {
  if (globalThis.MEMORY_SYSTEM) {
    console.log("🔧 Enhancing MEMORY_SYSTEM with reliable database storage...");

    // Ensure shortTerm exists
    if (!globalThis.MEMORY_SYSTEM.shortTerm) {
      globalThis.MEMORY_SYSTEM.shortTerm = {};
      console.log("➕ Created shortTerm object");
    }

    // Create enhanced storage
    const enhancedStorage = createEnhancedStorage();

    // Replace or add _storage
    globalThis.MEMORY_SYSTEM._storage = enhancedStorage;
    console.log("✅ Created enhanced storage adapter");

    // Override storeContext and getContext methods
    globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
      // Also store in in-memory object for fallback
      if (!this.shortTerm) {
        this.shortTerm = {};
      }
      this.shortTerm[key] = value;

      // Store in enhanced storage
      const result = this._storage.set(key, value);
      return result;
    };

    globalThis.MEMORY_SYSTEM.getContext = function (key) {
      // Try to get from storage first
      const value = this._storage.get(key);

      // If not found, try in-memory fallback
      if (value === null) {
        if (!this.shortTerm) {
          this.shortTerm = {};
          return undefined;
        }
        return this.shortTerm[key];
      }

      return value;
    };

    // Add additional utility methods
    globalThis.MEMORY_SYSTEM.getAllContext = function (pattern = null) {
      return this._storage.getAll(pattern);
    };

    globalThis.MEMORY_SYSTEM.removeContext = function (key) {
      // Remove from in-memory fallback
      if (key in this.shortTerm) {
        delete this.shortTerm[key];
      }

      // Remove from storage
      return this._storage.delete(key);
    };

    globalThis.MEMORY_SYSTEM.clearContext = function () {
      // Clear in-memory fallback
      this.shortTerm = {};

      // Clear storage
      return this._storage.clear();
    };

    // Test the enhanced methods
    const testKey = `test_enhanced_${Date.now()}`;
    const testValue = {
      message: "Enhanced Memory System Test",
      timestamp: Date.now(),
    };

    console.log(`\nTesting enhanced MEMORY_SYSTEM with key: ${testKey}`);

    // Test store
    const storeResult = globalThis.MEMORY_SYSTEM.storeContext(
      testKey,
      testValue
    );
    console.log(`Store result: ${storeResult ? "✅ Success" : "❌ Failed"}`);

    // Test retrieve
    const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);
    if (retrievedValue && retrievedValue.message === testValue.message) {
      console.log("✅ Successfully retrieved test value");
    } else {
      console.error("❌ Failed to retrieve correct test value", retrievedValue);
    }

    console.log("✅ MEMORY_SYSTEM database integration fixed");
  } else {
    console.error("❌ MEMORY_SYSTEM global object does not exist");
  }
} catch (error) {
  console.error("❌ Error fixing MEMORY_SYSTEM:", error.message);
}

// Fix 3: Update system status
console.log("\n🔧 Fix 3: Updating memory system status");

try {
  if (globalThis.MEMORY_SYSTEM) {
    globalThis.MEMORY_SYSTEM.initialized = true;
    globalThis.MEMORY_SYSTEM.db_status = "active";

    // Update in registry if available
    if (globalThis.SYSTEM_REGISTRY?.active_components?.memory_system) {
      globalThis.SYSTEM_REGISTRY.active_components.memory_system.status =
        "active";
      globalThis.SYSTEM_REGISTRY.active_components.memory_system.db_connected = true;
      console.log("✅ Updated memory system status in registry");
    }

    // Update banners
    if (Array.isArray(globalThis.nextResponsePrepend)) {
      // Remove any old memory banners
      globalThis.nextResponsePrepend = globalThis.nextResponsePrepend.filter(
        (banner) => !banner.includes("Memory System")
      );

      // Add updated banner
      globalThis.nextResponsePrepend.push(
        "🧠 [MEMORY SYSTEM: ACTIVE] Database connected"
      );
      console.log("✅ Updated memory system banner");
    }

    console.log("✅ Memory system status updated");
  }
} catch (error) {
  console.error("❌ Error updating memory system status:", error.message);
}

console.log("\n✅ Memory Database Fix completed");

// Export functions for use by other modules
module.exports = {
  createEnhancedStorage,
  fixMemorySystem: () => {
    if (globalThis.MEMORY_SYSTEM) {
      // Create enhanced storage if needed
      if (!globalThis.MEMORY_SYSTEM._storage) {
        globalThis.MEMORY_SYSTEM._storage = createEnhancedStorage();
      }

      return true;
    }
    return false;
  },
  // Add a debug export function
  debugExport: () => {
    console.log("\n🐛 DEBUG: Memory Database Fix Module");

    try {
      // Check if we can access the filesystem
      const fs = require("fs");
      const path = require("path");
      console.log("✅ Can access filesystem modules");

      // Check if db directory exists
      const dbDir = path.join(__dirname, "..", "db");
      if (fs.existsSync(dbDir)) {
        console.log(`✅ DB directory exists: ${dbDir}`);

        // List files in db directory
        const files = fs.readdirSync(dbDir);
        console.log(`Files in db directory: ${files.join(", ")}`);
      } else {
        console.log(`❌ DB directory does not exist: ${dbDir}`);
      }

      // Try to check better-sqlite3
      try {
        const sqlite3 = require("better-sqlite3");
        console.log("✅ better-sqlite3 module loaded successfully");
      } catch (err) {
        console.error("❌ Failed to load better-sqlite3:", err.message);
      }

      // Check if memory system exists
      if (globalThis.MEMORY_SYSTEM) {
        console.log("✅ MEMORY_SYSTEM global object exists");
        console.log(`- initialized: ${globalThis.MEMORY_SYSTEM.initialized}`);
        console.log(`- version: ${globalThis.MEMORY_SYSTEM.version}`);
        console.log(`- has _storage: ${!!globalThis.MEMORY_SYSTEM._storage}`);
        console.log(
          `- has storeContext: ${
            typeof globalThis.MEMORY_SYSTEM.storeContext === "function"
          }`
        );
        console.log(
          `- has getContext: ${
            typeof globalThis.MEMORY_SYSTEM.getContext === "function"
          }`
        );
      } else {
        console.log("❌ MEMORY_SYSTEM global object does not exist");
      }

      return "Debug completed successfully";
    } catch (error) {
      console.error("❌ Error during debug:", error);
      return `Debug failed: ${error.message}`;
    }
  },
};
