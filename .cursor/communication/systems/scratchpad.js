/**
 * Scratchpad System
 * 
 * Provides persistent inter-agent communication
 * Implements thread-based messaging with message types and partitions
 */

// Create global namespace if it doesn't exist
if (typeof globalThis.URDAFX_SYSTEM === 'undefined') {
  globalThis.URDAFX_SYSTEM = {};
}

// Core Node modules
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Define paths
const basePath = process.cwd();
const scratchpadDbPath = path.join(basePath, '.cursor/communication/logs/scratchpad.db');
const scratchpadDir = path.dirname(scratchpadDbPath);

// Ensure the directory exists
if (!fs.existsSync(scratchpadDir)) {
  fs.mkdirSync(scratchpadDir, { recursive: true });
  console.log(`Created directory: ${scratchpadDir}`);
}

/**
 * Scratchpad System
 * Manages persistent inter-agent communication
 */
class ScratchpadSystem {
  constructor() {
    this.db = null;
    this.inMemoryDb = {
      threads: {},
      messages: []
    };
    this.useSqlite = false;
    this.initialized = false;
  }

  /**
   * Initialize the scratchpad system
   */
  async initialize() {
    console.log("Initializing Scratchpad System...");
    
    try {
      // Try to load SQLite
      try {
        const sqlite3 = require('sqlite3').verbose();
        
        // Create a new database connection
        this.db = new sqlite3.Database(scratchpadDbPath, (err) => {
          if (err) {
            console.error("Error opening scratchpad database:", err);
            this.useSqlite = false;
          } else {
            console.log(`Connected to scratchpad database at ${scratchpadDbPath}`);
            this.useSqlite = true;
            
            // Create tables if they don't exist
            this.createTables();
          }
        });
      } catch (error) {
        console.error("Error loading SQLite:", error);
        console.log("Falling back to in-memory storage");
        this.useSqlite = false;
      }
      
      this.initialized = true;
      console.log("Scratchpad System initialized successfully");
      
      return true;
    } catch (error) {
      console.error("Error initializing Scratchpad System:", error);
      return false;
    }
  }

  /**
   * Create database tables
   */
  createTables() {
    console.log(`Creating tables in scratchpad database...`);
    
    // Create threads table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        name TEXT,
        created_at TEXT,
        updated_at TEXT,
        metadata TEXT
      )
    `, err => {
      if (err) {
        console.error("Error creating threads table:", err);
      } else {
        console.log("Created or verified threads table");
      }
    });
    
    // Create messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        sender_id TEXT,
        message_type TEXT,
        content TEXT,
        thread_id TEXT,
        partition TEXT,
        priority INTEGER,
        expires_at TEXT,
        tags TEXT,
        ref_messages TEXT,
        attachments TEXT,
        FOREIGN KEY (thread_id) REFERENCES threads (id)
      )
    `, err => {
      if (err) {
        console.error("Error creating messages table:", err);
      } else {
        console.log("Created or verified messages table");
      }
    });
  }

  /**
   * Create a new message
   * @param {string} senderId - ID of the sender
   * @param {string} partition - Message partition
   * @param {string} messageType - Type of message
   * @param {object|string} content - Message content
   * @param {string} threadId - Thread ID (optional, creates new thread if not provided)
   * @param {object} options - Additional options
   * @returns {string} Message ID
   */
  createMessage(senderId, partition, messageType, content, threadId = null, options = {}) {
    // Generate a new thread ID if not provided
    if (!threadId) {
      threadId = this.createThread(senderId, `Thread by ${senderId}`);
    }
    
    // Create message ID
    const messageId = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Create message object
    const message = {
      id: messageId,
      timestamp: new Date().toISOString(),
      sender_id: senderId,
      message_type: messageType,
      content: typeof content === 'object' ? JSON.stringify(content) : content,
      thread_id: threadId,
      partition: partition,
      priority: options.priority || 3,
      expires_at: options.expires_at || null,
      tags: options.tags ? JSON.stringify(options.tags) : '[]',
      ref_messages: options.ref_messages ? JSON.stringify(options.ref_messages) : '[]',
      attachments: options.attachments ? JSON.stringify(options.attachments) : '[]'
    };
    
    // Store message
    if (this.useSqlite) {
      this.db.run(
        `INSERT INTO messages (id, timestamp, sender_id, message_type, content, thread_id, partition, priority, expires_at, tags, ref_messages, attachments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.timestamp,
          message.sender_id,
          message.message_type,
          message.content,
          message.thread_id,
          message.partition,
          message.priority,
          message.expires_at,
          message.tags,
          message.ref_messages,
          message.attachments
        ],
        function(err) {
          if (err) {
            console.error("Error creating message:", err);
          }
        }
      );
      
      // Update thread message count and last activity
      this.db.run(
        `UPDATE threads SET updated_at = ? WHERE id = ?`,
        [message.timestamp, threadId],
        function(err) {
          if (err) {
            console.error("Error updating thread:", err);
          }
        }
      );
    } else {
      // In-memory storage
      this.inMemoryDb.messages.push(message);
      
      // Update thread
      if (this.inMemoryDb.threads[threadId]) {
        this.inMemoryDb.threads[threadId].updated_at = message.timestamp;
      }
    }
    
    return messageId;
  }

  /**
   * Create a new thread
   * @param {string} creatorId - ID of the creator
   * @param {string} title - Thread title
   * @returns {string} Thread ID
   */
  createThread(creatorId, title) {
    // Create thread ID
    const threadId = `thread_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Create thread object
    const thread = {
      id: threadId,
      name: title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: JSON.stringify({
        created_by: creatorId,
        status: "active",
        participants: JSON.stringify([creatorId]),
        message_count: 0
      })
    };
    
    // Store thread
    if (this.useSqlite) {
      this.db.run(
        `INSERT INTO threads (id, name, created_at, updated_at, metadata)
         VALUES (?, ?, ?, ?, ?)`,
        [
          thread.id,
          thread.name,
          thread.created_at,
          thread.updated_at,
          thread.metadata
        ],
        function(err) {
          if (err) {
            console.error("Error creating thread:", err);
          }
        }
      );
    } else {
      // In-memory storage
      this.inMemoryDb.threads[threadId] = thread;
    }
    
    return threadId;
  }

  /**
   * Read messages by thread ID
   * @param {string} threadId - Thread ID
   * @param {object} options - Query options
   * @returns {Promise<object[]>} Array of messages
   */
  readThread(threadId, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.useSqlite) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        const order = options.order === 'asc' ? 'ASC' : 'DESC';
        
        this.db.all(
          `SELECT * FROM messages 
           WHERE thread_id = ? 
           ORDER BY timestamp ${order}
           LIMIT ? OFFSET ?`,
          [threadId, limit, offset],
          (err, rows) => {
            if (err) {
              console.error("Error reading thread:", err);
              reject(err);
            } else {
              resolve(rows.map(row => this.parseMessage(row)));
            }
          }
        );
      } else {
        // In-memory storage
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        const messages = this.inMemoryDb.messages
          .filter(msg => msg.thread_id === threadId)
          .sort((a, b) => {
            if (options.order === 'asc') {
              return new Date(a.timestamp) - new Date(b.timestamp);
            } else {
              return new Date(b.timestamp) - new Date(a.timestamp);
            }
          })
          .slice(offset, offset + limit);
        
        resolve(messages);
      }
    });
  }

  /**
   * Read messages from a specific sender
   * @param {string} senderId - Sender ID
   * @param {object} options - Query options
   * @returns {Promise<object[]>} Array of messages
   */
  readMessagesBySender(senderId, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.useSqlite) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        
        this.db.all(
          `SELECT * FROM messages 
           WHERE sender_id = ? 
           ORDER BY timestamp DESC
           LIMIT ? OFFSET ?`,
          [senderId, limit, offset],
          (err, rows) => {
            if (err) {
              console.error("Error reading messages by sender:", err);
              reject(err);
            } else {
              resolve(rows.map(row => this.parseMessage(row)));
            }
          }
        );
      } else {
        // In-memory storage
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        const messages = this.inMemoryDb.messages
          .filter(msg => msg.sender_id === senderId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(offset, offset + limit);
        
        resolve(messages);
      }
    });
  }

  /**
   * Read messages by partition
   * @param {string} partition - Partition name
   * @param {object} options - Query options
   * @returns {Promise<object[]>} Array of messages
   */
  readMessagesByPartition(partition, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.useSqlite) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        
        this.db.all(
          `SELECT * FROM messages 
           WHERE partition = ? 
           ORDER BY timestamp DESC
           LIMIT ? OFFSET ?`,
          [partition, limit, offset],
          (err, rows) => {
            if (err) {
              console.error("Error reading messages by partition:", err);
              reject(err);
            } else {
              resolve(rows.map(row => this.parseMessage(row)));
            }
          }
        );
      } else {
        // In-memory storage
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        const messages = this.inMemoryDb.messages
          .filter(msg => msg.partition === partition)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(offset, offset + limit);
        
        resolve(messages);
      }
    });
  }

  /**
   * Get threads
   * @param {object} options - Query options
   * @returns {Promise<object[]>} Array of threads
   */
  getThreads(options = {}) {
    return new Promise((resolve, reject) => {
      if (this.useSqlite) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        
        this.db.all(
          `SELECT * FROM threads 
           ORDER BY updated_at DESC
           LIMIT ? OFFSET ?`,
          [limit, offset],
          (err, rows) => {
            if (err) {
              console.error("Error getting threads:", err);
              reject(err);
            } else {
              resolve(rows.map(row => this.parseThread(row)));
            }
          }
        );
      } else {
        // In-memory storage
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        const threads = Object.values(this.inMemoryDb.threads)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(offset, offset + limit);
        
        resolve(threads);
      }
    });
  }

  /**
   * Parse a message row from the database
   * @param {object} row - Database row
   * @returns {object} Parsed message
   * @private
   */
  parseMessage(row) {
    try {
      return {
        ...row,
        content: typeof row.content === 'string' && (row.content.startsWith('{') || row.content.startsWith('[')) ? 
          JSON.parse(row.content) : row.content,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        ref_messages: typeof row.ref_messages === 'string' ? JSON.parse(row.ref_messages) : row.ref_messages,
        attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments
      };
    } catch (error) {
      console.error("Error parsing message:", error);
      return row;
    }
  }

  /**
   * Parse a thread row from the database
   * @param {object} row - Database row
   * @returns {object} Parsed thread
   * @private
   */
  parseThread(row) {
    try {
      return {
        ...row,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
      };
    } catch (error) {
      console.error("Error parsing thread:", error);
      return row;
    }
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db && this.useSqlite) {
      this.db.close();
    }
  }
}

// Singleton instance
let scratchpadSystem = null;

/**
 * Initialize the scratchpad system
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
async function initializeScratchpadSystem() {
  console.log("Initializing Scratchpad System...");
  
  try {
    // Create scratchpad if it doesn't exist
    if (!scratchpadSystem) {
      scratchpadSystem = new ScratchpadSystem();
      const initialized = await scratchpadSystem.initialize();
      
      if (!initialized) {
        throw new Error("Failed to initialize Scratchpad System");
      }
      
      // Set up global SCRATCHPAD_SYSTEM reference
      console.log("Setting up global SCRATCHPAD_SYSTEM reference");
      globalThis.SCRATCHPAD_SYSTEM = scratchpadSystem;
    }
    
    // Update URDAFX_SYSTEM status
    globalThis.URDAFX_SYSTEM.scratchpadInitialized = true;
    
    console.log("✅ Scratchpad System initialized successfully");
    
    return true;
  } catch (error) {
    console.error("Error initializing Scratchpad System:", error);
    return false;
  }
}

// Module exports
module.exports = {
  initializeScratchpadSystem,
  getScratchpadSystem: () => scratchpadSystem
};
