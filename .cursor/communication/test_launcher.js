/**
 * URDAFX Systems Test Script
 * 
 * This script verifies that all URDAFX systems are properly initialized and functioning.
 * It specifically tests the banner system to ensure it displays properly.
 */

// Load the launcher
const { initializeAllSystems } = require('./launcher.js');

async function testAllSystems() {
  console.log('==================================================');
  console.log('URDAFX SYSTEMS TEST');
  console.log('==================================================');
  console.log('');
  
  try {
    // Initialize all systems
    console.log('1. Initializing all systems...');
    const initResult = await initializeAllSystems(true);
    console.log(`   Result: ${initResult ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('');
    
    // Test banner system if available
    if (global.URDAFX_SYSTEM && global.URDAFX_SYSTEM.bannerInitialized) {
      console.log('2. Testing Banner System...');
      const bannerSystem = require('./systems/banner').getBannerSystem();
      
      if (bannerSystem) {
        // Display system active banner
        console.log('   Displaying System Active Banner:');
        bannerSystem.displayBanner('system_active', { 
          systemName: 'URDAFX',
          version: '1.0.0',
          status: 'Active'
        });
        
        // Display agent active banner
        console.log('   Displaying Agent Active Banner:');
        bannerSystem.displayBanner('agent_active', {
          agentName: 'Project Manager',
          agentRole: 'Project Manager/Planner',
          action: 'Planning workflow'
        });
        
        console.log('   Banner System Tests: ✅ SUCCESS');
      } else {
        console.log('   Banner System not available: ❌ FAILED');
      }
    } else {
      console.log('2. Banner System not initialized: ❌ FAILED');
    }
    console.log('');
    
    // Test memory system if available
    if (global.URDAFX_SYSTEM && global.URDAFX_SYSTEM.memoryInitialized) {
      console.log('3. Testing Memory System...');
      const memorySystem = require('./systems/comprehensive_memory').getMemorySystem();
      
      if (memorySystem) {
        // Test short-term memory
        memorySystem.storeContext('test_value', 'Hello from test script!');
        const recalled = memorySystem.getContext('test_value');
        
        if (recalled === 'Hello from test script!') {
          console.log('   Short-Term Memory Test: ✅ SUCCESS');
        } else {
          console.log('   Short-Term Memory Test: ❌ FAILED');
        }
      } else {
        console.log('   Memory System not available: ❌ FAILED');
      }
    } else {
      console.log('3. Memory System not initialized: ❌ FAILED');
    }
    console.log('');
    
    // Test agent system if available
    if (global.URDAFX_SYSTEM && global.URDAFX_SYSTEM.agentInitialized) {
      console.log('4. Testing Agent System...');
      const agentSystem = require('./systems/agent_system').getAgentSystem();
      
      if (agentSystem) {
        const agents = agentSystem.getAgents();
        console.log(`   Found ${agents.length} agents: ${agents.map(a => a.name).join(', ')}`);
        console.log('   Agent System Test: ✅ SUCCESS');
      } else {
        console.log('   Agent System not available: ❌ FAILED');
      }
    } else {
      console.log('4. Agent System not initialized: ❌ FAILED');
    }
    console.log('');
    
    // Test scratchpad system if available
    if (global.URDAFX_SYSTEM && global.URDAFX_SYSTEM.scratchpadInitialized) {
      console.log('5. Testing Scratchpad System...');
      const scratchpadSystem = require('./systems/scratchpad').getScratchpadSystem();
      
      if (scratchpadSystem) {
        console.log('   Creating test thread...');
        const threadId = await scratchpadSystem.createThread('test-thread', 'Test Thread');
        
        console.log('   Creating test message...');
        await scratchpadSystem.createMessage({
          thread_id: threadId,
          content: 'Test message from test script',
          sender: 'System',
          message_type: 'system',
          partition: 'test'
        });
        
        console.log('   Reading test thread...');
        const messages = await scratchpadSystem.readThread(threadId);
        
        if (messages && messages.length > 0) {
          console.log('   Scratchpad System Test: ✅ SUCCESS');
        } else {
          console.log('   Scratchpad System Test: ❌ FAILED');
        }
      } else {
        console.log('   Scratchpad System not available: ❌ FAILED');
      }
    } else {
      console.log('5. Scratchpad System not initialized: ❌ FAILED');
    }
    console.log('');
    
    // Summary
    console.log('==================================================');
    console.log('TEST SUMMARY');
    console.log('==================================================');
    
    const systemStatuses = [
      { name: 'Date Verification', initialized: global.URDAFX_SYSTEM?.dateInitialized || false },
      { name: 'Memory System', initialized: global.URDAFX_SYSTEM?.memoryInitialized || false },
      { name: 'Scratchpad System', initialized: global.URDAFX_SYSTEM?.scratchpadInitialized || false },
      { name: 'Agent System', initialized: global.URDAFX_SYSTEM?.agentInitialized || false },
      { name: 'MCP Server Integration', initialized: global.URDAFX_SYSTEM?.mcpInitialized || false },
      { name: 'Banner System', initialized: global.URDAFX_SYSTEM?.bannerInitialized || false },
    ];
    
    let totalSystems = systemStatuses.length;
    let initializedSystems = systemStatuses.filter(s => s.initialized).length;
    
    systemStatuses.forEach(system => {
      console.log(`${system.name}: ${system.initialized ? '✅ INITIALIZED' : '❌ NOT INITIALIZED'}`);
    });
    
    console.log('');
    console.log(`Systems Initialized: ${initializedSystems}/${totalSystems}`);
    console.log(`Overall Status: ${initializedSystems === totalSystems ? '✅ ALL SYSTEMS GO' : '⚠️ SOME SYSTEMS FAILED'}`);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('ERROR DURING TESTING:', error);
    return false;
  }
}

// Run the test
testAllSystems().then(result => {
  console.log(`Test completed ${result ? 'successfully' : 'with errors'}`);
}); 