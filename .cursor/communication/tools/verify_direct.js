/**
 * URDAFX Direct Database Verification
 * 
 * This script directly tests the SQLite database operations without going through the activation system.
 * Use this tool to verify the database schema and content independently.
 * 
 * Run it with: node .cursor/communication/tools/verify_direct.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database paths
const DB_PATHS = {
  memory: '.cursor/communication/logs/memory.db',
  scratchpad: '.cursor/communication/logs/scratchpad.db'
};

console.log("=== URDAFX DIRECT DATABASE VERIFICATION ===\n");

// Check if database files exist
let databasesExist = true;
for (const [key, dbPath] of Object.entries(DB_PATHS)) {
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`✅ ${key} database exists: ${dbPath} (${(stats.size/1024).toFixed(2)} KB)`);
  } else {
    console.error(`❌ ${key} database not found: ${dbPath}`);
    databasesExist = false;
  }
}

if (!databasesExist) {
  console.error("\n❌ Database files not found. Please run the system first to create them.");
  process.exit(1);
}

// Test direct insertion into memory database
const testKey = `direct_test_${Date.now()}`;
const testValue = { message: 'Direct database test', timestamp: Date.now() };
const jsonValue = JSON.stringify(testValue);

console.log(`\nTesting direct insertion for key: ${testKey}`);

// Open the memory database
console.log("Opening memory database connection...");
const memoryDb = new sqlite3.Database(DB_PATHS.memory, (err) => {
  if (err) {
    console.error('Error opening memory database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the memory database.');
});

// List the tables in memory database
memoryDb.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('Error getting memory tables:', err.message);
  } else {
    console.log('\nMemory database tables:');
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
  }
  
  // Insert test data into short_term_memory
  memoryDb.run(
    'INSERT OR REPLACE INTO short_term_memory (key, value, timestamp, expires_at) VALUES (?, ?, ?, ?)', 
    [testKey, jsonValue, Date.now(), null], 
    function(err) {
      if (err) {
        console.error('Error inserting into memory database:', err.message);
      } else {
        console.log(`\nInserted data into memory database. Row ID: ${this.lastID}`);
        
        // Query the inserted data
        memoryDb.get('SELECT * FROM short_term_memory WHERE key = ?', [testKey], (err, row) => {
          if (err) {
            console.error('Error retrieving from memory database:', err.message);
          } else if (row) {
            console.log('\nRetrieved data from memory database:');
            console.log(`- Key: ${row.key}`);
            console.log(`- Value: ${row.value}`);
            console.log(`- Timestamp: ${row.timestamp}`);
            
            try {
              const parsedValue = JSON.parse(row.value);
              console.log('\nParsed value:');
              console.log(parsedValue);
              console.log('\n✅ Memory database direct access verified!');
            } catch (e) {
              console.error('Error parsing value:', e.message);
            }
          } else {
            console.error('No data found for key:', testKey);
          }
          
          // Test scratchpad database next
          testScratchpadDatabase();
        });
      }
    }
  );
});

function testScratchpadDatabase() {
  console.log("\n=== TESTING SCRATCHPAD DATABASE ===");
  
  // Open the scratchpad database
  console.log("Opening scratchpad database connection...");
  const scratchpadDb = new sqlite3.Database(DB_PATHS.scratchpad, (err) => {
    if (err) {
      console.error('Error opening scratchpad database:', err.message);
      memoryDb.close();
      process.exit(1);
    }
    console.log('Connected to the scratchpad database.');
  });
  
  // List the tables in scratchpad database
  scratchpadDb.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error getting scratchpad tables:', err.message);
      memoryDb.close();
      scratchpadDb.close();
      return;
    }
    
    console.log('\nScratchpad database tables:');
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // Create a test thread
    const threadId = `thread_direct_${Date.now()}`;
    const threadTitle = "Direct Test Thread";
    const createdBy = "Direct_Test";
    const timestamp = Date.now();
    
    scratchpadDb.run(
      'INSERT INTO threads (id, title, created_by, created_at, last_activity, status) VALUES (?, ?, ?, ?, ?, ?)',
      [threadId, threadTitle, createdBy, timestamp, timestamp, 'active'],
      function(err) {
        if (err) {
          console.error('Error creating thread:', err.message);
          memoryDb.close();
          scratchpadDb.close();
          return;
        }
        
        console.log(`\nCreated test thread with ID: ${threadId}`);
        
        // Add a participant to the thread
        scratchpadDb.run(
          'INSERT INTO thread_participants (thread_id, participant_id, joined_at) VALUES (?, ?, ?)',
          [threadId, createdBy, timestamp],
          function(err) {
            if (err) {
              console.error('Error adding thread participant:', err.message);
            } else {
              console.log(`Added participant ${createdBy} to thread`);
            }
            
            // Create a test message
            const messageId = `msg_direct_${Date.now()}`;
            const content = JSON.stringify({ text: "This is a direct test message", timestamp: Date.now() });
            
            scratchpadDb.run(
              'INSERT INTO messages (id, sender_id, content, timestamp, thread_id, partition, message_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [messageId, createdBy, content, timestamp, threadId, 'general', 'information'],
              function(err) {
                if (err) {
                  console.error('Error creating message:', err.message);
                  memoryDb.close();
                  scratchpadDb.close();
                  return;
                }
                
                console.log(`\nCreated test message with ID: ${messageId}`);
                
                // Add a recipient to the message
                const recipientId = "Test_Recipient";
                
                scratchpadDb.run(
                  'INSERT INTO message_recipients (message_id, recipient_id) VALUES (?, ?)',
                  [messageId, recipientId],
                  function(err) {
                    if (err) {
                      console.error('Error adding message recipient:', err.message);
                    } else {
                      console.log(`Added recipient ${recipientId} to message`);
                    }
                    
                    // Verify by retrieving the message
                    const sql = `
                      SELECT m.id, m.sender_id, m.content, m.timestamp, m.thread_id, r.recipient_id
                      FROM messages m
                      JOIN message_recipients r ON m.id = r.message_id
                      WHERE m.id = ?
                    `;
                    
                    scratchpadDb.get(sql, [messageId], (err, row) => {
                      if (err) {
                        console.error('Error retrieving message:', err.message);
                      } else if (row) {
                        console.log('\nRetrieved message from scratchpad database:');
                        console.log(`- ID: ${row.id}`);
                        console.log(`- Sender: ${row.sender_id}`);
                        console.log(`- Content: ${row.content}`);
                        console.log(`- Thread: ${row.thread_id}`);
                        console.log(`- Recipient: ${row.recipient_id}`);
                        console.log('\n✅ Scratchpad database direct access verified!');
                      } else {
                        console.error('No message found with ID:', messageId);
                      }
                      
                      // Count records in all tables
                      countRecords(scratchpadDb, memoryDb);
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

function countRecords(scratchpadDb, memoryDb) {
  console.log("\n=== DATABASE RECORDS COUNT ===");
  
  // Count memory records
  memoryDb.get("SELECT COUNT(*) as count FROM short_term_memory", [], (err, row) => {
    if (err) {
      console.error('Error counting short-term memory records:', err.message);
    } else {
      console.log(`Short-term memory records: ${row.count}`);
    }
    
    memoryDb.get("SELECT COUNT(*) as count FROM episodic_memory", [], (err, row) => {
      if (err) {
        console.error('Error counting episodic memory records:', err.message);
      } else {
        console.log(`Episodic memory records: ${row.count}`);
      }
      
      memoryDb.get("SELECT COUNT(*) as count FROM semantic_memory", [], (err, row) => {
        if (err) {
          console.error('Error counting semantic memory records:', err.message);
        } else {
          console.log(`Semantic memory records: ${row.count}`);
        }
        
        // Count scratchpad records
        scratchpadDb.get("SELECT COUNT(*) as count FROM messages", [], (err, row) => {
          if (err) {
            console.error('Error counting message records:', err.message);
          } else {
            console.log(`Message records: ${row.count}`);
          }
          
          scratchpadDb.get("SELECT COUNT(*) as count FROM threads", [], (err, row) => {
            if (err) {
              console.error('Error counting thread records:', err.message);
            } else {
              console.log(`Thread records: ${row.count}`);
            }
            
            scratchpadDb.get("SELECT COUNT(*) as count FROM message_recipients", [], (err, row) => {
              if (err) {
                console.error('Error counting message recipient records:', err.message);
              } else {
                console.log(`Message recipient records: ${row.count}`);
              }
              
              scratchpadDb.get("SELECT COUNT(*) as count FROM thread_participants", [], (err, row) => {
                if (err) {
                  console.error('Error counting thread participant records:', err.message);
                } else {
                  console.log(`Thread participant records: ${row.count}`);
                }
                
                // Close database connections
                memoryDb.close((err) => {
                  if (err) {
                    console.error('Error closing memory database:', err.message);
                  } else {
                    console.log('\nMemory database connection closed.');
                  }
                });
                
                scratchpadDb.close((err) => {
                  if (err) {
                    console.error('Error closing scratchpad database:', err.message);
                  } else {
                    console.log('Scratchpad database connection closed.');
                  }
                  
                  console.log("\n=== VERIFICATION COMPLETE ===");
                  console.log("✅ All database tests completed successfully!");
                });
              });
            });
          });
        });
      });
    });
  });
} 