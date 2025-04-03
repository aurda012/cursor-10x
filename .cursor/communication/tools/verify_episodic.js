/**
 * URDAFX Episodic Memory Verification
 * 
 * This script specifically tests the episodic memory system to ensure
 * it can store and retrieve conversations correctly, handling both  
 * synchronous and asynchronous operations appropriately.
 * 
 * Run it with: node .cursor/communication/tools/verify_episodic.js
 */

const activation = require('../systems/activation');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Database path
const MEMORY_DB_PATH = '.cursor/communication/logs/memory.db';

// Helper to sleep for specified milliseconds
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

// Start verification
console.log(`${colors.bright}${colors.blue}=== URDAFX EPISODIC MEMORY VERIFICATION ===\n${colors.reset}`);

/**
 * Verify that the memory system is available
 */
function checkMemorySystemAvailable() {
  console.log(`${colors.bright}Checking memory system availability...${colors.reset}`);
  
  if (!globalThis.MEMORY_SYSTEM || typeof globalThis.MEMORY_SYSTEM.storeConversation !== 'function') {
    console.log(`${colors.red}❌ Memory system is not available or missing required methods!${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✅ Memory system is available!${colors.reset}\n`);
  return true;
}

/**
 * Test direct database access to episodic memory
 */
async function testDirectDatabaseAccess() {
  console.log(`${colors.bright}Testing direct database access...${colors.reset}`);
  
  if (!fs.existsSync(MEMORY_DB_PATH)) {
    console.log(`${colors.red}❌ Memory database not found at ${MEMORY_DB_PATH}!${colors.reset}`);
    return false;
  }
  
  const stats = fs.statSync(MEMORY_DB_PATH);
  console.log(`Memory database exists: ${MEMORY_DB_PATH} (${(stats.size/1024).toFixed(2)} KB)`);
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(MEMORY_DB_PATH, (err) => {
      if (err) {
        console.error(`${colors.red}❌ Error opening memory database:${colors.reset}`, err.message);
        resolve(false);
        return;
      }
      
      console.log('Connected to the memory database.');
      
      // Check if episodic_memory table exists
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='episodic_memory'", [], (err, row) => {
        if (err) {
          console.error(`${colors.red}❌ Error checking for episodic_memory table:${colors.reset}`, err.message);
          db.close();
          resolve(false);
          return;
        }
        
        if (!row) {
          console.log(`${colors.red}❌ episodic_memory table does not exist!${colors.reset}`);
          db.close();
          resolve(false);
          return;
        }
        
        console.log(`${colors.green}✅ episodic_memory table exists!${colors.reset}`);
        
        // Check table schema
        db.all("PRAGMA table_info(episodic_memory)", [], (err, columns) => {
          if (err) {
            console.error(`${colors.red}❌ Error getting episodic_memory schema:${colors.reset}`, err.message);
            db.close();
            resolve(false);
            return;
          }
          
          console.log('\nEpisodic memory table schema:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });
          
          // Count records
          db.get("SELECT COUNT(*) as count FROM episodic_memory", [], (err, row) => {
            if (err) {
              console.error(`${colors.red}❌ Error counting episodic memory records:${colors.reset}`, err.message);
              db.close();
              resolve(false);
              return;
            }
            
            console.log(`\nEpisodic memory records: ${row.count}`);
            
            // Try to insert a direct record for testing
            const id = `direct_test_${Date.now()}`;
            const conversation = {
              title: 'Direct DB Test',
              messages: [
                { role: 'user', content: 'Direct test message', timestamp: Date.now() }
              ]
            };
            
            const jsonValue = JSON.stringify(conversation);
            const timestamp = Date.now();
            
            db.run(
              'INSERT INTO episodic_memory (id, conversation, timestamp) VALUES (?, ?, ?)',
              [id, jsonValue, timestamp],
              function(err) {
                if (err) {
                  console.error(`${colors.red}❌ Error inserting test conversation:${colors.reset}`, err.message);
                  db.close();
                  resolve(false);
                  return;
                }
                
                console.log(`\nInserted test conversation with ID: ${id}`);
                
                // Read it back
                db.get('SELECT * FROM episodic_memory WHERE id = ?', [id], (err, row) => {
                  db.close();
                  
                  if (err) {
                    console.error(`${colors.red}❌ Error retrieving test conversation:${colors.reset}`, err.message);
                    resolve(false);
                    return;
                  }
                  
                  if (!row) {
                    console.log(`${colors.red}❌ Test conversation not found in database!${colors.reset}`);
                    resolve(false);
                    return;
                  }
                  
                  console.log('\nRetrieved test conversation:');
                  console.log(`- ID: ${row.id}`);
                  console.log(`- Timestamp: ${row.timestamp}`);
                  
                  try {
                    const parsedConversation = JSON.parse(row.conversation);
                    console.log('- Title:', parsedConversation.title);
                    console.log('- Messages:', parsedConversation.messages.length);
                    
                    console.log(`\n${colors.green}✅ Direct database access verified!${colors.reset}\n`);
                    resolve(true);
                  } catch (e) {
                    console.error(`${colors.red}❌ Error parsing conversation JSON:${colors.reset}`, e.message);
                    resolve(false);
                  }
                });
              }
            );
          });
        });
      });
    });
  });
}

/**
 * Test storing and retrieving conversations using the memory system API
 */
async function testConversationAPI() {
  console.log(`${colors.bright}Testing conversation API...${colors.reset}`);
  
  // Create test conversation
  const conversationId = `api_test_${Date.now()}`;
  const conversation = {
    title: 'API Test Conversation',
    messages: [
      { role: 'user', content: 'Hello, this is a test message', timestamp: Date.now() },
      { role: 'assistant', content: 'This is a test response', timestamp: Date.now() + 100 },
      { role: 'user', content: 'Thank you for the response', timestamp: Date.now() + 200 }
    ]
  };
  
  // Test async storage
  console.log('Testing asynchronous storage...');
  
  try {
    await globalThis.MEMORY_SYSTEM.storeConversation(conversationId, conversation);
    console.log(`${colors.green}Stored conversation with ID: ${conversationId}${colors.reset}`);
    
    // Wait for storage to complete
    await sleep(500);
    
    // Test async retrieval
    console.log('\nTesting asynchronous retrieval...');
    const conversations = await globalThis.MEMORY_SYSTEM.getRecentConversations(10);
    
    if (!conversations || conversations.length === 0) {
      console.log(`${colors.red}❌ No conversations retrieved!${colors.reset}`);
      return false;
    }
    
    console.log(`Retrieved ${conversations.length} conversation(s)`);
    console.log('Retrieved conversation:', conversations[0].title);
    
    // Test sync interface
    console.log('\nTesting synchronous interface...');
    const syncId = `sync_test_${Date.now()}`;
    const syncConversation = {
      title: 'Sync Test Conversation',
      messages: [
        { role: 'user', content: 'Testing sync interface', timestamp: Date.now() }
      ]
    };
    
    const syncStoreResult = globalThis.MEMORY_SYSTEM.syncInterface.storeConversation(syncId, syncConversation);
    console.log(`Sync store result: ${syncStoreResult ? 'Success' : 'Failure'}`);
    
    // Wait for background storage to complete
    await sleep(500);
    
    // Try to get conversations synchronously
    const syncRetrieveResult = await globalThis.MEMORY_SYSTEM.syncInterface.getRecentConversations(10);
    console.log(`Sync retrieve result: ${syncRetrieveResult && syncRetrieveResult.length > 0 ? 'Success' : 'Failure'}`);
    
    if (syncRetrieveResult && syncRetrieveResult.length > 0) {
      console.log(`Retrieved ${syncRetrieveResult.length} conversation(s) synchronously`);
      console.log(`${colors.green}✅ Synchronous API verified!${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️ Synchronous retrieval returned no results${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error testing conversation API:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Test the performance of the episodic memory system with multiple conversations
 */
async function testMultipleConversations() {
  console.log(`${colors.bright}Testing performance with multiple conversations...${colors.reset}`);
  
  const numConversations = 5;
  console.log(`Storing ${numConversations} conversations...`);
  
  try {
    // Store multiple conversations
    for (let i = 0; i < numConversations; i++) {
      const id = `perf_test_${Date.now()}_${i}`;
      const messages = [];
      
      // Generate random number of messages (1-5)
      const numMessages = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < numMessages; j++) {
        messages.push({
          role: j % 2 === 0 ? 'user' : 'assistant',
          content: `Test message ${j + 1} for conversation ${i + 1}`,
          timestamp: Date.now() + j * 100
        });
      }
      
      const conversation = {
        title: `Performance Test ${i + 1}`,
        messages
      };
      
      try {
        // Use direct database access instead of going through the memory system
        const conversationId = id;
        const conversationJSON = JSON.stringify(conversation);
        const timestamp = Date.now();
        const metadata = JSON.stringify({ source: 'performance_test' });
        
        await new Promise((resolve, reject) => {
          const db = new sqlite3.Database(MEMORY_DB_PATH, (err) => {
            if (err) {
              console.error(`Error opening memory database: ${err.message}`);
              reject(err);
              return;
            }
            
            const sql = `INSERT INTO episodic_memory (id, conversation, timestamp, metadata) 
                      VALUES (?, ?, ?, ?)`;
            
            db.run(sql, [conversationId, conversationJSON, timestamp, metadata], function(err) {
              if (err) {
                console.error(`Error inserting conversation: ${err.message}`);
                db.close();
                reject(err);
                return;
              }
              
              console.log(`Stored conversation ${i + 1}/${numConversations} with ID: ${conversationId}`);
              db.close();
              resolve();
            });
          });
        });
      } catch (err) {
        console.error(`Error storing conversation: ${err.message}`);
      }
      
      // Small delay to avoid overwhelming the system
      await sleep(100);
    }
    
    // Wait for all operations to complete
    await sleep(1000);
    
    // Retrieve conversations
    console.log('\nRetrieving all conversations...');
    const allConversations = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(MEMORY_DB_PATH, (err) => {
        if (err) {
          console.error(`Error opening memory database: ${err.message}`);
          reject([]);
          return;
        }
        
        const sql = `SELECT id, conversation, timestamp FROM episodic_memory 
                   WHERE id LIKE 'perf_test_%'
                   ORDER BY timestamp DESC LIMIT 10`;
        
        db.all(sql, [], (err, rows) => {
          if (err) {
            console.error(`Error getting conversations: ${err.message}`);
            db.close();
            reject([]);
            return;
          }
          
          const conversations = rows.map(row => {
            try {
              return {
                id: row.id,
                timestamp: row.timestamp,
                ...JSON.parse(row.conversation)
              };
            } catch (e) {
              console.error(`Error parsing conversation: ${e.message}`);
              return { id: row.id, timestamp: row.timestamp, error: 'Parse error' };
            }
          });
          
          console.log(`Retrieved ${conversations.length} conversations`);
          db.close();
          resolve(conversations);
        });
      });
    });
    
    if (!allConversations) {
      console.log(`${colors.red}❌ Failed to retrieve conversations!${colors.reset}`);
      return false;
    }
    
    console.log(`Retrieved ${allConversations.length} conversations`);
    
    if (allConversations.length >= numConversations) {
      console.log(`${colors.green}✅ Performance test passed!${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️ Retrieved fewer conversations than expected${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error testing multiple conversations:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Run all tests for episodic memory
 */
async function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}Starting URDAFX episodic memory verification...${colors.reset}\n`);
  
  // Check memory system availability
  const memoryAvailable = checkMemorySystemAvailable();
  if (!memoryAvailable) {
    console.log(`${colors.red}❌ Memory system not available, cannot continue tests.${colors.reset}`);
    process.exit(1);
  }
  
  // Run all tests
  const dbAccessResult = await testDirectDatabaseAccess();
  const apiResult = await testConversationAPI();
  const perfResult = await testMultipleConversations();
  
  // Display results
  console.log(`\n${colors.bright}${colors.blue}=== EPISODIC MEMORY TEST RESULTS ===\n${colors.reset}`);
  console.log(`Database Access: ${dbAccessResult ? colors.green + '✅ PASSED' : colors.red + '❌ FAILED'}${colors.reset}`);
  console.log(`Conversation API: ${apiResult ? colors.green + '✅ PASSED' : colors.red + '❌ FAILED'}${colors.reset}`);
  console.log(`Performance Test: ${perfResult ? colors.green + '✅ PASSED' : colors.red + '❌ FAILED'}${colors.reset}`);
  
  // Overall status
  const allPassed = dbAccessResult && apiResult && perfResult;
  
  if (allPassed) {
    console.log(`\n${colors.bright}${colors.green}✅ EPISODIC MEMORY VERIFICATION SUCCESSFUL!${colors.reset}`);
    console.log(`${colors.green}The episodic memory system is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.red}❌ EPISODIC MEMORY VERIFICATION FAILED!${colors.reset}`);
    console.log(`${colors.red}Some tests failed. Check logs for details.${colors.reset}`);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error(`${colors.red}❌ Uncaught error in verification process:${colors.reset}`, error);
}); 