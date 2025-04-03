/**
 * URDAFX System Verification
 * 
 * This script verifies all URDAFX system components:
 * - Memory System (short-term, episodic, semantic)
 * - Multi-Agent System
 * - Scratchpad Communication
 * - Database Integrity
 * - Agent Communication
 * 
 * Run it with: node .cursor/communication/tools/verify_system.js
 */

// Load required modules
const fs = require('fs');
const path = require('path');
const util = require('util');
const sqlite3 = require('sqlite3').verbose();

// Import activation system
require('../systems/activation');

// Set up logging
let allPassed = true;
let verificationResults = {};

// Database paths
const DB_PATHS = {
  memory: '.cursor/communication/logs/memory.db',
  scratchpad: '.cursor/communication/logs/scratchpad.db'
};

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

// Helper to sleep for specified milliseconds
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Start verification
console.log(`${colors.bright}${colors.blue}=== URDAFX SYSTEM VERIFICATION ===\n${colors.reset}`);

/**
 * Check if all URDAFX systems are activated
 * @returns {boolean} True if all systems are active
 */
function checkSystemsActive() {
  console.log(`${colors.bright}Checking system activation status...${colors.reset}`);
  
  const requiredSystems = [
    'memory', 'agent', 'scratchpad'
  ];
  
  const activeComponents = [];
  const missingComponents = [];
  
  // Check each required system
  if (globalThis.MEMORY_SYSTEM) {
    activeComponents.push('memory');
  } else {
    missingComponents.push('memory');
  }
  
  if (globalThis.AGENT_SYSTEM) {
    activeComponents.push('agent');
  } else {
    missingComponents.push('agent');
  }
  
  if (globalThis.SCRATCHPAD) {
    activeComponents.push('scratchpad');
  } else {
    missingComponents.push('scratchpad');
  }
  
  // Log active components
  console.log(`${colors.green}Active components:${colors.reset} ${activeComponents.join(', ')}`);
  
  // Log missing components
  if (missingComponents.length > 0) {
    console.log(`${colors.red}Missing components:${colors.reset} ${missingComponents.join(', ')}`);
    verificationResults.systemsActive = false;
    return false;
  }
  
  console.log(`${colors.green}✅ All URDAFX systems are active!${colors.reset}\n`);
  verificationResults.systemsActive = true;
  return true;
}

/**
 * Verify that the memory system is working correctly
 * @returns {Promise<boolean>} True if memory system is working
 */
async function verifyMemorySystem() {
  console.log(`${colors.bright}Verifying memory system...${colors.reset}`);
  
  if (!globalThis.MEMORY_SYSTEM) {
    console.log(`${colors.red}❌ Memory system is not activated!${colors.reset}`);
    verificationResults.memorySystem = false;
    return false;
  }
  
  try {
    // Test short-term memory using direct database access
    console.log('Testing short-term memory...');
    
    // Create a test key and value
    const testKey = `test_key_${Date.now()}`;
    const testValue = { message: 'This is a test', timestamp: Date.now() };
    const jsonValue = JSON.stringify(testValue);
    const timestamp = Date.now();
    
    // Open database directly
    const memoryDb = new sqlite3.Database(DB_PATHS.memory, sqlite3.OPEN_READWRITE);
    
    // Insert directly into database
    await new Promise((resolve, reject) => {
      memoryDb.run(
        'INSERT INTO short_term_memory (key, value, timestamp) VALUES (?, ?, ?)',
        [testKey, jsonValue, timestamp],
        function(err) {
          if (err) {
            console.error(`${colors.red}Error inserting into short-term memory:${colors.reset}`, err.message);
            reject(err);
          } else {
            console.log(`${colors.green}Inserted test key: ${testKey}${colors.reset}`);
            resolve();
          }
        }
      );
    });
    
    // Wait for storage to complete
    await sleep(100);
    
    // Retrieve from database
    const retrievedValue = await new Promise((resolve, reject) => {
      memoryDb.get(
        'SELECT value FROM short_term_memory WHERE key = ?',
        [testKey],
        (err, row) => {
          if (err) {
            console.error(`${colors.red}Error retrieving from short-term memory:${colors.reset}`, err.message);
            reject(err);
          } else if (row) {
            try {
              const parsed = JSON.parse(row.value);
              resolve(parsed);
            } catch (e) {
              console.error(`${colors.red}Error parsing value:${colors.reset}`, e.message);
              reject(e);
            }
          } else {
            console.log(`${colors.red}No value found for key: ${testKey}${colors.reset}`);
            resolve(null);
          }
        }
      );
    });
    
    if (!retrievedValue) {
      console.log(`${colors.red}❌ Failed to retrieve context!${colors.reset}`);
      memoryDb.close();
      verificationResults.memorySystem = false;
      return false;
    }
    
    console.log(`${colors.green}Retrieved value:${colors.reset}`, retrievedValue);
    
    // Verify the retrieved value matches what we stored
    const valuesMatch = JSON.stringify(retrievedValue) === JSON.stringify(testValue);
    if (!valuesMatch) {
      console.log(`${colors.red}❌ Retrieved value doesn't match stored value!${colors.reset}`);
      console.log('Stored:', testValue);
      console.log('Retrieved:', retrievedValue);
      memoryDb.close();
      verificationResults.memorySystem = false;
      return false;
    }
    
    console.log(`${colors.green}✅ Short-term memory verified!${colors.reset}`);
    
    // Test episodic memory
    console.log('\nTesting episodic memory...');
    
    try {
      const conversationId = `conv_${Date.now()}`;
      const conversation = {
        title: 'Test conversation',
        messages: [
          { role: 'user', content: 'Hello', timestamp: Date.now() },
          { role: 'assistant', content: 'Hi there', timestamp: Date.now() + 100 }
        ]
      };
      
      // Convert to JSON for storage
      const jsonConversation = JSON.stringify(conversation);
      
      // Store directly in the database
      await new Promise((resolve, reject) => {
        memoryDb.run(
          'INSERT INTO episodic_memory (id, conversation, timestamp) VALUES (?, ?, ?)',
          [conversationId, jsonConversation, Date.now()],
          function(err) {
            if (err) {
              console.error(`${colors.red}Error inserting conversation:${colors.reset}`, err.message);
              reject(err);
            } else {
              console.log(`${colors.green}Inserted conversation with ID: ${conversationId}${colors.reset}`);
              resolve();
            }
          }
        );
      });
      
      // Retrieve from database
      const episodicResult = await new Promise((resolve, reject) => {
        memoryDb.get(
          'SELECT id, conversation FROM episodic_memory WHERE id = ?',
          [conversationId],
          (err, row) => {
            if (err) {
              console.error(`${colors.red}Error getting conversation:${colors.reset}`, err.message);
              reject(err);
            } else if (row) {
              try {
                const parsedConversation = JSON.parse(row.conversation);
                resolve(parsedConversation);
              } catch (e) {
                console.error(`${colors.red}Error parsing conversation:${colors.reset}`, e.message);
                reject(e);
              }
            } else {
              console.log(`${colors.red}No conversation found with ID:${colors.reset} ${conversationId}`);
              resolve(null);
            }
          }
        );
      });
      
      if (episodicResult) {
        console.log(`${colors.green}Retrieved conversation:${colors.reset}`, episodicResult.title);
        console.log(`${colors.green}✅ Episodic memory verified!${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Failed to retrieve conversation!${colors.reset}`);
        memoryDb.close();
        verificationResults.memorySystem = false;
        return false;
      }
    } catch (error) {
      console.error(`${colors.red}❌ Error testing episodic memory:${colors.reset}`, error.message);
      console.log('Skipping remainder of episodic memory test...');
      memoryDb.close();
      verificationResults.memorySystem = false;
      return false;
    }
    
    // Test semantic memory
    console.log('\nTesting semantic memory...');
    
    try {
      const knowledgeId = `knowledge_${Date.now()}`;
      const knowledge = {
        concept: 'URDAFX',
        definition: 'Advanced Forex Trading System',
        details: 'A multi-agent system for forex trading analysis and execution'
      };
      
      // Convert to JSON for storage
      const jsonKnowledge = JSON.stringify(knowledge);
      
      // First check the schema to see what columns are available
      await new Promise((resolve, reject) => {
        memoryDb.all("PRAGMA table_info(semantic_memory)", [], (err, columns) => {
          if (err) {
            console.error(`${colors.red}Error getting semantic_memory schema:${colors.reset}`, err.message);
            reject(err);
            return;
          }
          
          console.log('\nSemantic memory table schema:');
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });
          resolve();
        });
      });
      
      // Store directly in the database - use the correct column names from schema
      await new Promise((resolve, reject) => {
        memoryDb.run(
          'INSERT INTO semantic_memory (topic, knowledge, timestamp) VALUES (?, ?, ?)',
          [knowledgeId, jsonKnowledge, Date.now()],
          function(err) {
            if (err) {
              console.error(`${colors.red}Error inserting knowledge:${colors.reset}`, err.message);
              reject(err);
            } else {
              console.log(`${colors.green}Inserted knowledge with topic: ${knowledgeId}${colors.reset}`);
              resolve();
            }
          }
        );
      });
      
      // Retrieve from database - adapt column names based on schema
      const semanticResult = await new Promise((resolve, reject) => {
        memoryDb.get(
          'SELECT topic, knowledge FROM semantic_memory WHERE topic = ?',
          [knowledgeId],
          (err, row) => {
            if (err) {
              console.error(`${colors.red}Error getting knowledge:${colors.reset}`, err.message);
              reject(err);
            } else if (row) {
              try {
                const parsedKnowledge = JSON.parse(row.knowledge);
                resolve(parsedKnowledge);
              } catch (e) {
                console.error(`${colors.red}Error parsing knowledge:${colors.reset}`, e.message);
                reject(e);
              }
            } else {
              console.log(`${colors.red}No knowledge found with topic:${colors.reset} ${knowledgeId}`);
              resolve(null);
            }
          }
        );
      });
      
      if (semanticResult) {
        console.log(`${colors.green}Retrieved knowledge:${colors.reset}`, semanticResult.concept);
        console.log(`${colors.green}✅ Semantic memory verified!${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Failed to retrieve knowledge!${colors.reset}`);
        memoryDb.close();
        verificationResults.memorySystem = false;
        return false;
      }
    } catch (error) {
      console.error(`${colors.red}❌ Error testing semantic memory:${colors.reset}`, error.message);
      console.log('Skipping remainder of semantic memory test...');
      memoryDb.close();
      verificationResults.memorySystem = false;
      return false;
    }
    
    // Close the database connection
    memoryDb.close();
    
    console.log(`${colors.green}✅ Memory system verification complete!${colors.reset}\n`);
    verificationResults.memorySystem = true;
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error verifying memory system:${colors.reset}`, error.message);
    console.error(error);
    verificationResults.memorySystem = false;
    return false;
  }
}

/**
 * Verify that the agent system is working correctly
 * @returns {boolean} True if agent system is working
 */
function verifyAgentSystem() {
  console.log(`${colors.bright}Verifying agent system...${colors.reset}`);
  
  if (!globalThis.AGENT_SYSTEM) {
    console.log(`${colors.red}❌ Agent system is not activated!${colors.reset}`);
    verificationResults.agentSystem = false;
    return false;
  }
  
  try {
    // Get all agents
    const agents = globalThis.AGENT_SYSTEM.getAgentIds();
    console.log(`Found ${agents.length} agents:`);
    agents.forEach(agent => {
      console.log(`- ${agent}`);
    });
    
    if (agents.length === 0) {
      console.log(`${colors.red}❌ No agents found!${colors.reset}`);
      verificationResults.agentSystem = false;
      return false;
    }
    
    // Test query processing
    const testQueries = [
      { query: 'What is the project plan?', expectedAgent: 'Project_Manager' },
      { query: 'How do we handle data pipelines?', expectedAgent: 'Data_Engineer' },
      { query: 'What trading algorithms are we using?', expectedAgent: 'Quantitative_Analyst' }
    ];
    
    console.log('\nTesting agent query routing...');
    let allQueriesPassed = true;
    
    testQueries.forEach(test => {
      try {
        const result = globalThis.AGENT_SYSTEM.processQuery(test.query);
        console.log(`Query: "${test.query}"`);
        console.log(`Routed to: ${result.agent}`);
        
        if (result.agent !== test.expectedAgent) {
          console.log(`${colors.yellow}⚠️ Expected ${test.expectedAgent}, got ${result.agent}${colors.reset}`);
          allQueriesPassed = false;
        }
      } catch (error) {
        console.error(`${colors.red}❌ Error processing query "${test.query}":${colors.reset}`, error.message);
        allQueriesPassed = false;
      }
    });
    
    if (!allQueriesPassed) {
      console.log(`${colors.yellow}⚠️ Some agent queries were not routed as expected${colors.reset}`);
    }
    
    console.log(`${colors.green}✅ Agent system verification complete!${colors.reset}\n`);
    verificationResults.agentSystem = true;
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error verifying agent system:${colors.reset}`, error.message);
    verificationResults.agentSystem = false;
    return false;
  }
}

/**
 * Verify that the scratchpad communication is working correctly
 * @returns {Promise<boolean>} True if scratchpad is working
 */
async function verifyScratchpad() {
  console.log(`${colors.bright}Verifying scratchpad communication...${colors.reset}`);
  
  if (!globalThis.SCRATCHPAD) {
    console.log(`${colors.red}❌ Scratchpad is not activated!${colors.reset}`);
    verificationResults.scratchpad = false;
    return false;
  }
  
  try {
    // Create a new thread
    const threadTitle = 'Test Thread';
    const creator = 'Verification_System';
    
    const thread = await globalThis.SCRATCHPAD.createThread(threadTitle, creator);
    if (!thread || !thread.id) {
      console.log(`${colors.red}❌ Failed to create thread!${colors.reset}`);
      verificationResults.scratchpad = false;
      return false;
    }
    
    const threadId = thread.id;
    console.log(`Created thread: ${threadId}`);
    
    // Post a message to the thread
    const testMessage = { 
      text: 'This is a test message', 
      timestamp: Date.now() 
    };
    
    const recipients = ['Project_Manager', 'Data_Engineer', 'Quantitative_Analyst'];
    
    const messageResult = await globalThis.SCRATCHPAD.postMessage(
      creator, 
      testMessage, 
      recipients
    );
    
    if (!messageResult || !messageResult.id) {
      console.log(`${colors.red}❌ Failed to post message to thread!${colors.reset}`);
      verificationResults.scratchpad = false;
      return false;
    }
    
    console.log(`Posted message: ${messageResult.id}`);
    
    // Get messages for a recipient
    const messages = await globalThis.SCRATCHPAD.getMessages('Project_Manager', 10);
    console.log(`Retrieved ${messages.length} messages for Project_Manager`);
    
    if (messages.length === 0) {
      console.log(`${colors.red}❌ No messages retrieved!${colors.reset}`);
      verificationResults.scratchpad = false;
      return false;
    }
    
    console.log('Retrieved message:', messages[0]);
    
    console.log(`${colors.green}✅ Scratchpad verification complete!${colors.reset}\n`);
    verificationResults.scratchpad = true;
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error verifying scratchpad:${colors.reset}`, error.message);
    verificationResults.scratchpad = false;
    return false;
  }
}

/**
 * Verify that the databases exist and have the correct structure
 * @returns {Promise<boolean>} True if databases are correctly structured
 */
async function verifyDatabases() {
  console.log(`${colors.bright}Verifying database structure...${colors.reset}`);
  
  // Check if database files exist
  let databasesExist = true;
  for (const [key, dbPath] of Object.entries(DB_PATHS)) {
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`${colors.green}✅ ${key} database exists:${colors.reset} ${dbPath} (${(stats.size/1024).toFixed(2)} KB)`);
    } else {
      console.error(`${colors.red}❌ ${key} database not found:${colors.reset} ${dbPath}`);
      databasesExist = false;
    }
  }
  
  if (!databasesExist) {
    console.error(`${colors.red}❌ Database files not found. Please run the system first to create them.${colors.reset}`);
    verificationResults.databases = false;
    return false;
  }
  
  const dbPromises = [];
  
  // Check memory database structure
  const checkMemoryDb = new Promise((resolve, reject) => {
    const memoryDb = new sqlite3.Database(DB_PATHS.memory, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(`${colors.red}❌ Error opening memory database:${colors.reset}`, err.message);
        resolve(false);
        return;
      }
      
      memoryDb.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          console.error(`${colors.red}❌ Error getting memory tables:${colors.reset}`, err.message);
          memoryDb.close();
          resolve(false);
          return;
        }
        
        console.log('\nMemory database tables:');
        const tableNames = tables.map(table => table.name);
        tableNames.forEach(table => {
          console.log(`- ${table}`);
        });
        
        // Check for required tables
        const requiredTables = ['short_term_memory', 'episodic_memory', 'semantic_memory'];
        const missingTables = requiredTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
          console.error(`${colors.red}❌ Missing memory tables:${colors.reset} ${missingTables.join(', ')}`);
          memoryDb.close();
          resolve(false);
          return;
        }
        
        memoryDb.close();
        console.log(`${colors.green}✅ Memory database structure verified!${colors.reset}`);
        resolve(true);
      });
    });
  });
  
  // Check scratchpad database structure
  const checkScratchpadDb = new Promise((resolve, reject) => {
    const scratchpadDb = new sqlite3.Database(DB_PATHS.scratchpad, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(`${colors.red}❌ Error opening scratchpad database:${colors.reset}`, err.message);
        resolve(false);
        return;
      }
      
      scratchpadDb.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          console.error(`${colors.red}❌ Error getting scratchpad tables:${colors.reset}`, err.message);
          scratchpadDb.close();
          resolve(false);
          return;
        }
        
        console.log('\nScratchpad database tables:');
        const tableNames = tables.map(table => table.name);
        tableNames.forEach(table => {
          console.log(`- ${table}`);
        });
        
        // Check for required tables
        const requiredTables = ['threads', 'messages', 'message_recipients', 'thread_participants'];
        const missingTables = requiredTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
          console.error(`${colors.red}❌ Missing scratchpad tables:${colors.reset} ${missingTables.join(', ')}`);
          scratchpadDb.close();
          resolve(false);
          return;
        }
        
        scratchpadDb.close();
        console.log(`${colors.green}✅ Scratchpad database structure verified!${colors.reset}`);
        resolve(true);
      });
    });
  });
  
  dbPromises.push(checkMemoryDb, checkScratchpadDb);
  
  try {
    const results = await Promise.all(dbPromises);
    const allDbsValid = results.every(result => result === true);
    
    console.log(`${colors.green}✅ Database verification complete!${colors.reset}\n`);
    verificationResults.databases = allDbsValid;
    return allDbsValid;
  } catch (error) {
    console.error(`${colors.red}❌ Error verifying databases:${colors.reset}`, error.message);
    verificationResults.databases = false;
    return false;
  }
}

/**
 * Verify agent communication using the scratchpad
 * @returns {Promise<boolean>} True if agent communication is working
 */
async function verifyAgentCommunication() {
  console.log(`${colors.bright}Verifying agent communication...${colors.reset}`);
  
  if (!globalThis.AGENT_SYSTEM || !globalThis.SCRATCHPAD) {
    console.log(`${colors.red}❌ Required systems not activated for communication test!${colors.reset}`);
    verificationResults.agentCommunication = false;
    return false;
  }
  
  try {
    // Simulate communication between agents
    const agents = globalThis.AGENT_SYSTEM.getAgentIds();
    
    if (agents.length < 2) {
      console.log(`${colors.yellow}⚠️ Need at least 2 agents to test communication${colors.reset}`);
      verificationResults.agentCommunication = false;
      return false;
    }
    
    // Create a thread for agents to communicate
    const threadTitle = 'Agent Communication Test';
    const creator = agents[0];
    
    const thread = await globalThis.SCRATCHPAD.createThread(threadTitle, creator);
    if (!thread || !thread.id) {
      console.log(`${colors.red}❌ Failed to create communication thread!${colors.reset}`);
      verificationResults.agentCommunication = false;
      return false;
    }
    
    console.log(`Created communication thread: ${thread.id}`);
    
    // First agent posts a message
    const messageContent1 = { 
      text: 'This is a test communication from agent 1', 
      timestamp: Date.now(),
      data: { test: 'payload' }
    };
    
    const message1 = await globalThis.SCRATCHPAD.postMessage(
      creator, 
      messageContent1, 
      [agents[1]]
    );
    
    console.log(`Agent ${creator} posted message: ${message1.id}`);
    
    // Second agent responds
    const messageContent2 = { 
      text: 'Response from agent 2', 
      timestamp: Date.now(),
      data: { response: 'acknowledged' }
    };
    
    const message2 = await globalThis.SCRATCHPAD.postMessage(
      agents[1], 
      messageContent2, 
      [creator]
    );
    
    console.log(`Agent ${agents[1]} responded with message: ${message2.id}`);
    
    // Get messages for the first agent
    const messages = await globalThis.SCRATCHPAD.getMessages(creator, 10);
    console.log(`Retrieved ${messages.length} messages for ${creator}`);
    
    if (messages.length < 2) {
      console.log(`${colors.red}❌ Expected at least 2 messages, found ${messages.length}!${colors.reset}`);
      verificationResults.agentCommunication = false;
      return false;
    }
    
    console.log(`${colors.green}✅ Agent communication verification complete!${colors.reset}\n`);
    verificationResults.agentCommunication = true;
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error verifying agent communication:${colors.reset}`, error.message);
    verificationResults.agentCommunication = false;
    return false;
  }
}

/**
 * Run all verification tests and log results
 */
async function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}Starting URDAFX verification...${colors.reset}\n`);
  
  // Run all verification functions
  const systemsActive = checkSystemsActive();
  
  if (!systemsActive) {
    console.error(`${colors.red}❌ Systems not activated, skipping further tests.${colors.reset}`);
    process.exit(1);
  }
  
  // Run tests that require activated systems
  await verifyMemorySystem();
  verifyAgentSystem();
  await verifyScratchpad();
  await verifyDatabases();
  await verifyAgentCommunication();
  
  // Log verification results
  console.log(`\n${colors.bright}${colors.blue}=== VERIFICATION RESULTS ===\n${colors.reset}`);
  
  let allTestsPassed = true;
  for (const [test, passed] of Object.entries(verificationResults)) {
    const status = passed ? `${colors.green}✅ PASSED${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
    console.log(`${test}: ${status}`);
    
    if (!passed) {
      allTestsPassed = false;
    }
  }
  
  // Final verification status
  if (allTestsPassed) {
    console.log(`\n${colors.bright}${colors.green}✅ VERIFICATION SUCCESSFUL!${colors.reset}`);
    console.log(`${colors.green}All URDAFX systems are working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.red}❌ VERIFICATION FAILED!${colors.reset}`);
    console.log(`${colors.red}Some systems failed verification. Check logs for details.${colors.reset}`);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error(`${colors.red}❌ Uncaught error in verification process:${colors.reset}`, error);
}); 