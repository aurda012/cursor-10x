/**
 * Scratchpad System Database Handler
 * Version: 1.0.0 (April 1, 2025)
 *
 * This module provides a SQLite database interface for the Scratchpad System
 * to persist messages, tasks, and shared workspace data.
 */

const fs = require("fs");
const path = require("path");
const cursorRoot = path.resolve(__dirname, "..");
const sqlite3 = require(path.join(
  cursorRoot,
  "node_modules",
  "better-sqlite3"
));

console.log("💾 SCRATCHPAD-DB: Initializing scratchpad database...");

// Constants
const DB_DIR = path.join(cursorRoot, "db");
const DB_PATH = path.join(DB_DIR, "scratchpad-system.db");

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

// Initialize database connection
let db;
try {
  db = new sqlite3(DB_PATH, { verbose: console.log });
  console.log(`Connected to database at: ${DB_PATH}`);
} catch (error) {
  console.error(`Failed to connect to database: ${error.message}`);

  // Create a stub db object with methods that log errors
  db = {
    prepare: () => ({ run: () => {}, all: () => [], get: () => null }),
    transaction: (fn) => fn,
    exec: () => {},
    close: () => {},
  };
  console.error("Using stub database object - scratchpad will not persist!");
}

// Initialize tables
function initializeTables() {
  console.log("Creating database tables if they don't exist...");

  try {
    // Messages table
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT,
        from_agent TEXT NOT NULL,
        to_agent TEXT NOT NULL,
        message_type TEXT NOT NULL,
        content TEXT,
        timestamp INTEGER NOT NULL,
        read INTEGER DEFAULT 0,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_msg_thread ON messages(thread_id);
      CREATE INDEX IF NOT EXISTS idx_msg_from ON messages(from_agent);
      CREATE INDEX IF NOT EXISTS idx_msg_to ON messages(to_agent);
      CREATE INDEX IF NOT EXISTS idx_msg_timestamp ON messages(timestamp);
    `);

    // Threads table
    db.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_thread_creator ON threads(creator_id);
      CREATE INDEX IF NOT EXISTS idx_thread_status ON threads(status);
    `);

    // Tasks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        thread_id TEXT,
        description TEXT NOT NULL,
        assigned_to TEXT NOT NULL,
        status TEXT NOT NULL,
        priority INTEGER DEFAULT 3,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        result TEXT,
        metadata TEXT,
        FOREIGN KEY (thread_id) REFERENCES threads(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_task_thread ON tasks(thread_id);
      CREATE INDEX IF NOT EXISTS idx_task_assigned ON tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_task_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_task_priority ON tasks(priority);
    `);

    // Workspace variables table
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_variables (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        scope TEXT DEFAULT 'global',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        created_by TEXT,
        metadata TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_var_scope ON workspace_variables(scope);
    `);

    // Agents table
    db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        capabilities TEXT,
        last_active INTEGER,
        metadata TEXT
      );
    `);

    console.log("Database tables created successfully");
    return true;
  } catch (error) {
    console.error(`Failed to create database tables: ${error.message}`);
    return false;
  }
}

// Initialize tables
initializeTables();

// Define database methods
const ScratchpadDB = {
  // Messages methods
  messages: {
    create: function (fromAgent, toAgent, content, options = {}) {
      try {
        const id =
          options.id ||
          `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const threadId = options.threadId || options.thread_id;
        const messageType =
          options.messageType || options.message_type || "text";
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;

        const stmt = db.prepare(`
          INSERT INTO messages 
          (id, thread_id, from_agent, to_agent, message_type, content, timestamp, read, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          threadId,
          fromAgent,
          toAgent,
          messageType,
          typeof content === "object"
            ? JSON.stringify(content)
            : String(content),
          Date.now(),
          0, // not read
          metadata
        );

        console.log(`Created message from ${fromAgent} to ${toAgent}`);

        // Update thread updated_at if thread_id is provided
        if (threadId) {
          this.updateThreadTimestamp(threadId);
        }

        return id;
      } catch (error) {
        console.error(`Error creating message: ${error.message}`);
        return null;
      }
    },

    get: function (id) {
      try {
        const stmt = db.prepare(`
          SELECT id, thread_id, from_agent, to_agent, message_type, content, timestamp, read, metadata
          FROM messages
          WHERE id = ?
        `);

        const row = stmt.get(id);

        if (!row) return null;

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
        console.error(`Error getting message: ${error.message}`);
        return null;
      }
    },

    getByThread: function (threadId, options = {}) {
      try {
        let query = `
          SELECT id, thread_id, from_agent, to_agent, message_type, content, timestamp, read, metadata
          FROM messages
          WHERE thread_id = ?
        `;

        const params = [threadId];

        if (options.fromTimestamp) {
          query += ` AND timestamp >= ?`;
          params.push(options.fromTimestamp);
        }

        query += ` ORDER BY timestamp ASC`;

        const stmt = db.prepare(query);
        const rows = stmt.all(...params);

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
        console.error(`Error getting messages by thread: ${error.message}`);
        return [];
      }
    },

    getByAgent: function (agentId, options = {}) {
      try {
        let query = `
          SELECT id, thread_id, from_agent, to_agent, message_type, content, timestamp, read, metadata
          FROM messages
          WHERE to_agent = ?
        `;

        const params = [agentId];

        if (options.unreadOnly) {
          query += ` AND read = 0`;
        }

        if (options.fromTimestamp) {
          query += ` AND timestamp >= ?`;
          params.push(options.fromTimestamp);
        }

        query += ` ORDER BY timestamp DESC`;

        if (options.limit) {
          query += ` LIMIT ?`;
          params.push(options.limit);
        }

        const stmt = db.prepare(query);
        const rows = stmt.all(...params);

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
        console.error(`Error getting messages by agent: ${error.message}`);
        return [];
      }
    },

    markAsRead: function (id) {
      try {
        const stmt = db.prepare(`
          UPDATE messages
          SET read = 1
          WHERE id = ?
        `);

        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error(`Error marking message as read: ${error.message}`);
        return false;
      }
    },

    updateThreadTimestamp: function (threadId) {
      try {
        const stmt = db.prepare(`
          UPDATE threads
          SET updated_at = ?
          WHERE id = ?
        `);

        stmt.run(Date.now(), threadId);
      } catch (error) {
        console.error(`Error updating thread timestamp: ${error.message}`);
      }
    },
  },

  // Threads methods
  threads: {
    create: function (title, creatorId, options = {}) {
      try {
        const id =
          options.id ||
          `thread_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;
        const now = Date.now();

        const stmt = db.prepare(`
          INSERT INTO threads 
          (id, title, creator_id, created_at, updated_at, status, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          title,
          creatorId,
          now,
          now,
          options.status || "active",
          metadata
        );

        console.log(`Created thread: ${title}`);
        return id;
      } catch (error) {
        console.error(`Error creating thread: ${error.message}`);
        return null;
      }
    },

    get: function (id) {
      try {
        const stmt = db.prepare(`
          SELECT id, title, creator_id, created_at, updated_at, status, metadata
          FROM threads
          WHERE id = ?
        `);

        const row = stmt.get(id);

        if (!row) return null;

        if (row.metadata) {
          try {
            row.metadata = JSON.parse(row.metadata);
          } catch (e) {
            // Leave as string if not valid JSON
          }
        }

        // Add messages to thread
        row.messages = ScratchpadDB.messages.getByThread(id);

        return row;
      } catch (error) {
        console.error(`Error getting thread: ${error.message}`);
        return null;
      }
    },

    getAll: function (options = {}) {
      try {
        let query = `
          SELECT id, title, creator_id, created_at, updated_at, status, metadata
          FROM threads
          WHERE 1=1
        `;

        const params = [];

        if (options.status) {
          query += ` AND status = ?`;
          params.push(options.status);
        }

        if (options.creatorId) {
          query += ` AND creator_id = ?`;
          params.push(options.creatorId);
        }

        query += ` ORDER BY updated_at DESC`;

        if (options.limit) {
          query += ` LIMIT ?`;
          params.push(options.limit);
        }

        const stmt = db.prepare(query);
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
        console.error(`Error getting all threads: ${error.message}`);
        return [];
      }
    },

    updateStatus: function (id, status) {
      try {
        const stmt = db.prepare(`
          UPDATE threads
          SET status = ?, updated_at = ?
          WHERE id = ?
        `);

        const result = stmt.run(status, Date.now(), id);
        return result.changes > 0;
      } catch (error) {
        console.error(`Error updating thread status: ${error.message}`);
        return false;
      }
    },
  },

  // Tasks methods
  tasks: {
    create: function (description, assignedTo, options = {}) {
      try {
        const id =
          options.id ||
          `task_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const threadId = options.threadId || options.thread_id;
        const priority = options.priority || 3;
        const status = options.status || "pending";
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;
        const now = Date.now();

        const stmt = db.prepare(`
          INSERT INTO tasks 
          (id, thread_id, description, assigned_to, status, priority, created_at, updated_at, result, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          threadId,
          description,
          assignedTo,
          status,
          priority,
          now,
          now,
          null, // result
          metadata
        );

        console.log(`Created task: ${description} (assigned to ${assignedTo})`);
        return id;
      } catch (error) {
        console.error(`Error creating task: ${error.message}`);
        return null;
      }
    },

    get: function (id) {
      try {
        const stmt = db.prepare(`
          SELECT id, thread_id, description, assigned_to, status, priority, created_at, updated_at, result, metadata
          FROM tasks
          WHERE id = ?
        `);

        const row = stmt.get(id);

        if (!row) return null;

        // Parse JSON if possible
        try {
          row.result = JSON.parse(row.result);
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
        console.error(`Error getting task: ${error.message}`);
        return null;
      }
    },

    getByAgent: function (agentId, options = {}) {
      try {
        let query = `
          SELECT id, thread_id, description, assigned_to, status, priority, created_at, updated_at, result, metadata
          FROM tasks
          WHERE assigned_to = ?
        `;

        const params = [agentId];

        if (options.status) {
          if (Array.isArray(options.status)) {
            const placeholders = options.status.map(() => "?").join(", ");
            query += ` AND status IN (${placeholders})`;
            params.push(...options.status);
          } else {
            query += ` AND status = ?`;
            params.push(options.status);
          }
        }

        query += ` ORDER BY priority DESC, created_at ASC`;

        if (options.limit) {
          query += ` LIMIT ?`;
          params.push(options.limit);
        }

        const stmt = db.prepare(query);
        const rows = stmt.all(...params);

        // Parse JSON if possible
        return rows.map((row) => {
          try {
            row.result = JSON.parse(row.result);
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
        console.error(`Error getting tasks by agent: ${error.message}`);
        return [];
      }
    },

    updateStatus: function (id, status, result = null) {
      try {
        const stmt = db.prepare(`
          UPDATE tasks
          SET status = ?, updated_at = ?, result = ?
          WHERE id = ?
        `);

        const resultStr =
          result !== null
            ? typeof result === "object"
              ? JSON.stringify(result)
              : String(result)
            : null;

        const dbResult = stmt.run(status, Date.now(), resultStr, id);
        return dbResult.changes > 0;
      } catch (error) {
        console.error(`Error updating task status: ${error.message}`);
        return false;
      }
    },
  },

  // Variables methods
  variables: {
    set: function (key, value, options = {}) {
      try {
        const scope = options.scope || "global";
        const createdBy = options.createdBy || options.created_by || "system";
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;
        const now = Date.now();

        // Check if the variable exists
        const existingVar = this.get(key, scope);

        if (existingVar) {
          // Update existing variable
          const stmt = db.prepare(`
            UPDATE workspace_variables
            SET value = ?, updated_at = ?, metadata = ?
            WHERE key = ? AND scope = ?
          `);

          stmt.run(
            typeof value === "object" ? JSON.stringify(value) : String(value),
            now,
            metadata,
            key,
            scope
          );
        } else {
          // Create new variable
          const stmt = db.prepare(`
            INSERT INTO workspace_variables
            (key, value, scope, created_at, updated_at, created_by, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            key,
            typeof value === "object" ? JSON.stringify(value) : String(value),
            scope,
            now,
            now,
            createdBy,
            metadata
          );
        }

        console.log(`Set variable: ${key} (scope: ${scope})`);
        return true;
      } catch (error) {
        console.error(`Error setting variable: ${error.message}`);
        return false;
      }
    },

    get: function (key, scope = "global") {
      try {
        const stmt = db.prepare(`
          SELECT key, value, scope, created_at, updated_at, created_by, metadata
          FROM workspace_variables
          WHERE key = ? AND scope = ?
        `);

        const row = stmt.get(key, scope);

        if (!row) return null;

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

        return row.value;
      } catch (error) {
        console.error(`Error getting variable: ${error.message}`);
        return null;
      }
    },

    getByScope: function (scope = "global") {
      try {
        const stmt = db.prepare(`
          SELECT key, value, scope, created_at, updated_at, created_by, metadata
          FROM workspace_variables
          WHERE scope = ?
          ORDER BY key
        `);

        const rows = stmt.all(scope);

        // Parse JSON values if possible
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
        console.error(`Error getting variables by scope: ${error.message}`);
        return {};
      }
    },

    remove: function (key, scope = "global") {
      try {
        const stmt = db.prepare(`
          DELETE FROM workspace_variables
          WHERE key = ? AND scope = ?
        `);

        const result = stmt.run(key, scope);
        return result.changes > 0;
      } catch (error) {
        console.error(`Error removing variable: ${error.message}`);
        return false;
      }
    },
  },

  // Agents methods
  agents: {
    register: function (id, name, options = {}) {
      try {
        const status = options.status || "active";
        const capabilities = options.capabilities
          ? Array.isArray(options.capabilities)
            ? JSON.stringify(options.capabilities)
            : options.capabilities
          : "[]";
        const metadata = options.metadata
          ? JSON.stringify(options.metadata)
          : null;

        // Check if the agent exists
        const existingAgent = this.get(id);

        if (existingAgent) {
          // Update existing agent
          const stmt = db.prepare(`
            UPDATE agents
            SET name = ?, status = ?, capabilities = ?, last_active = ?, metadata = ?
            WHERE id = ?
          `);

          stmt.run(name, status, capabilities, Date.now(), metadata, id);
        } else {
          // Create new agent
          const stmt = db.prepare(`
            INSERT INTO agents
            (id, name, status, capabilities, last_active, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          stmt.run(id, name, status, capabilities, Date.now(), metadata);
        }

        console.log(`Registered agent: ${name} (${id})`);
        return true;
      } catch (error) {
        console.error(`Error registering agent: ${error.message}`);
        return false;
      }
    },

    get: function (id) {
      try {
        const stmt = db.prepare(`
          SELECT id, name, status, capabilities, last_active, metadata
          FROM agents
          WHERE id = ?
        `);

        const row = stmt.get(id);

        if (!row) return null;

        // Parse JSON if possible
        try {
          row.capabilities = JSON.parse(row.capabilities);
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
        console.error(`Error getting agent: ${error.message}`);
        return null;
      }
    },

    getAll: function () {
      try {
        const stmt = db.prepare(`
          SELECT id, name, status, capabilities, last_active, metadata
          FROM agents
          ORDER BY name
        `);

        const rows = stmt.all();

        // Parse JSON if possible
        return rows.map((row) => {
          try {
            row.capabilities = JSON.parse(row.capabilities);
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
        console.error(`Error getting all agents: ${error.message}`);
        return [];
      }
    },

    updateStatus: function (id, status) {
      try {
        const stmt = db.prepare(`
          UPDATE agents
          SET status = ?, last_active = ?
          WHERE id = ?
        `);

        const result = stmt.run(status, Date.now(), id);
        return result.changes > 0;
      } catch (error) {
        console.error(`Error updating agent status: ${error.message}`);
        return false;
      }
    },
  },
};

// Register with global scratchpad if available
if (typeof globalThis !== "undefined") {
  if (!globalThis.SCRATCHPAD) {
    globalThis.SCRATCHPAD = {
      initialized: true,
      db: ScratchpadDB,
      messages: [],
      threads: {},
      tasks: [],
      workspace: { variables: {} },
    };
  } else {
    globalThis.SCRATCHPAD.db = ScratchpadDB;
    globalThis.SCRATCHPAD.initialized = true;
  }

  console.log("Registered Scratchpad Database with SCRATCHPAD");

  // Add database-backed methods to scratchpad
  if (!globalThis.SCRATCHPAD.createMessage) {
    globalThis.SCRATCHPAD.createMessage = function (
      fromAgent,
      toAgent,
      content,
      options = {}
    ) {
      return ScratchpadDB.messages.create(fromAgent, toAgent, content, options);
    };
  }

  if (!globalThis.SCRATCHPAD.readMessages) {
    globalThis.SCRATCHPAD.readMessages = function (agentId, options = {}) {
      return ScratchpadDB.messages.getByAgent(agentId, options);
    };
  }

  if (!globalThis.SCRATCHPAD.createThread) {
    globalThis.SCRATCHPAD.createThread = function (
      title,
      creatorId,
      options = {}
    ) {
      return ScratchpadDB.threads.create(title, creatorId, options);
    };
  }

  if (!globalThis.SCRATCHPAD.readThread) {
    globalThis.SCRATCHPAD.readThread = function (threadId) {
      return ScratchpadDB.threads.get(threadId);
    };
  }

  if (!globalThis.SCRATCHPAD.createTask) {
    globalThis.SCRATCHPAD.createTask = function (
      description,
      assignedTo,
      options = {}
    ) {
      return ScratchpadDB.tasks.create(description, assignedTo, options);
    };
  }

  if (!globalThis.SCRATCHPAD.updateTask) {
    globalThis.SCRATCHPAD.updateTask = function (
      taskId,
      status,
      result = null
    ) {
      return ScratchpadDB.tasks.updateStatus(taskId, status, result);
    };
  }

  if (!globalThis.SCRATCHPAD.getTasks) {
    globalThis.SCRATCHPAD.getTasks = function (agentId, options = {}) {
      return ScratchpadDB.tasks.getByAgent(agentId, options);
    };
  }

  if (!globalThis.SCRATCHPAD.setVariable) {
    globalThis.SCRATCHPAD.setVariable = function (key, value, options = {}) {
      return ScratchpadDB.variables.set(key, value, options);
    };
  }

  if (!globalThis.SCRATCHPAD.getVariable) {
    globalThis.SCRATCHPAD.getVariable = function (key, scope = "global") {
      return ScratchpadDB.variables.get(key, scope);
    };
  }

  if (!globalThis.SCRATCHPAD.registerAgent) {
    globalThis.SCRATCHPAD.registerAgent = function (id, name, options = {}) {
      return ScratchpadDB.agents.register(id, name, options);
    };
  }
}

// Set up banner system if not already configured
if (typeof globalThis !== "undefined" && !globalThis.nextResponsePrepend) {
  globalThis.nextResponsePrepend = [];
}

if (typeof globalThis !== "undefined" && globalThis.nextResponsePrepend) {
  // Check if scratchpad system banner is already present
  const hasScratchpadBanner = globalThis.nextResponsePrepend.some((banner) =>
    banner.includes("SCRATCHPAD SYSTEM")
  );

  if (!hasScratchpadBanner) {
    globalThis.nextResponsePrepend.push("💬 [SCRATCHPAD SYSTEM: ACTIVE]");
  }
}

// Export module
module.exports = ScratchpadDB;

console.log("✅ SCRATCHPAD-DB: Initialization complete");
