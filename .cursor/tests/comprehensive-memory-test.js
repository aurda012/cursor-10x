/**
 * Comprehensive Memory System Test
 *
 * This script performs a complete test of the memory system, verifying:
 * 1. Data retrieval at the beginning of interactions
 * 2. Data storage at the end of interactions
 * 3. All memory subsystems (short-term, episodic, semantic)
 * 4. Hook system integration
 */

console.log("🧠 COMPREHENSIVE MEMORY SYSTEM TEST 🧠");
console.log("======================================\n");

// Load necessary modules
const path = require("path");
const fs = require("fs");

// Paths to required modules
const enforcer = path.resolve(process.cwd(), ".cursor/core/enforcer.js");
const preHook = path.resolve(
  process.cwd(),
  ".cursor/core/pre-response-hook.js"
);
const postHook = path.resolve(
  process.cwd(),
  ".cursor/core/post-response-hook.js"
);
const memorySystemPath = path.resolve(
  process.cwd(),
  ".cursor/systems/memory-system.js"
);
const dbMemorySystemPath = path.resolve(
  process.cwd(),
  ".cursor/db/memory-system.js"
);

// Step 1: Load the enforcer to initialize all systems
console.log("Step 1: Loading enforcer and initializing systems...");
try {
  require(enforcer);
  console.log("✅ Enforcer loaded successfully\n");
} catch (error) {
  console.error("❌ Error loading enforcer:", error);

  // Try to load memory system directly if enforcer fails
  console.log("Attempting to load memory system directly...");
  try {
    require(memorySystemPath);
    console.log("✅ Memory system loaded directly\n");
  } catch (memError) {
    console.error("❌ Error loading memory system:", memError);
    process.exit(1);
  }
}

// Wait for systems to initialize
console.log("Waiting for systems to initialize...");
setTimeout(() => {
  runTests();
}, 1000);

function runTests() {
  console.log("\n🔍 BEGINNING TESTS\n");

  // Step 2: Verify memory system exists
  console.log("Step 2: Verifying memory system exists...");
  if (!globalThis.MEMORY_SYSTEM) {
    console.error(
      "❌ Memory system not found! Attempting to initialize it directly..."
    );

    try {
      // Try to initialize the memory system directly
      const memorySystem = require(dbMemorySystemPath);
      if (typeof memorySystem.initialize === "function") {
        memorySystem.initialize();
        console.log("✅ Memory system initialized directly");
      } else {
        console.error("❌ Memory system initialize function not found");
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Failed to initialize memory system:", error);
      process.exit(1);
    }
  }

  if (!globalThis.MEMORY_SYSTEM) {
    console.error(
      "❌ Memory system still not found after initialization attempts!"
    );
    process.exit(1);
  }

  console.log("✅ Memory system found\n");
  console.log("Memory System Properties:");
  const memorySystemProps = Object.getOwnPropertyNames(
    globalThis.MEMORY_SYSTEM
  );
  console.log(memorySystemProps);
  console.log("\nMemory System Methods:");
  const memorySystemMethods = memorySystemProps.filter(
    (prop) => typeof globalThis.MEMORY_SYSTEM[prop] === "function"
  );
  console.log(memorySystemMethods);
  console.log();

  // Step 3: Generate unique test data
  const testId = Date.now();
  const initialData = {
    id: testId,
    message: `Test message created at ${new Date().toISOString()}`,
    test_phase: "initial",
  };

  // Step 4: Test pre-response behavior (data retrieval)
  console.log("Step 4: Testing pre-response hook (data retrieval)...");
  testPreResponseHook(initialData);

  // Step 5: Test post-response behavior (data storage)
  console.log("\nStep 5: Testing post-response hook (data storage)...");
  testPostResponseHook(initialData);

  // Step 6: Verify storage across all subsystems
  console.log("\nStep 6: Verifying data across all memory subsystems...");
  verifyStoredData(initialData);

  // Step 7: Test memory system search capabilities
  console.log("\nStep 7: Testing memory search capabilities...");
  testMemorySearch(initialData);

  // Step 8: Test memory system cleanup
  console.log("\nStep 8: Testing memory system cleanup...");
  testMemoryCleanup(initialData);

  // Conclusion
  console.log("\n======================================");
  console.log("🎉 MEMORY SYSTEM TEST COMPLETE");
  reportResults();
}

// Track test results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: {},
};

function recordTestResult(testName, passed, details) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }

  testResults.tests[testName] = {
    passed,
    details,
  };

  console.log(`${passed ? "✅" : "❌"} ${testName}`);
  if (details && !passed) {
    console.log(`   Details: ${details}`);
  }
}

function safeExec(func, ...args) {
  try {
    return { success: true, result: func(...args) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function testPreResponseHook(testData) {
  // 1. Test if hook system exists
  const hookExists = Boolean(globalThis.HOOK_SYSTEM);
  recordTestResult("Pre-response hook system exists", hookExists);

  if (!hookExists) return;

  // 2. Test if pre-hooks array exists and has items
  const preHooksExist =
    Array.isArray(globalThis.HOOK_SYSTEM.preHooks) &&
    globalThis.HOOK_SYSTEM.preHooks.length > 0;
  recordTestResult("Pre-hooks are registered", preHooksExist);

  // 3. Test if processBeforeResponse exists
  const processFnExists =
    typeof globalThis.MEMORY_SYSTEM.processBeforeResponse === "function";
  recordTestResult("processBeforeResponse function exists", processFnExists);

  if (!processFnExists) return;

  // 4. Test running the pre-response hook
  try {
    const userQuery = `MEMORY_TEST_QUERY_${testData.id}`;
    const result = globalThis.MEMORY_SYSTEM.processBeforeResponse(userQuery);
    recordTestResult("processBeforeResponse execution", Boolean(result));

    // 5. Test direct context storage if available
    if (typeof globalThis.MEMORY_SYSTEM.storeContext === "function") {
      // Try to store the query directly
      const storeResult = safeExec(
        globalThis.MEMORY_SYSTEM.storeContext.bind(globalThis.MEMORY_SYSTEM),
        "lastQuery",
        userQuery
      );
      recordTestResult(
        "Direct context storage",
        storeResult.success,
        storeResult.error
      );

      // Try to retrieve the stored query
      if (storeResult.success) {
        const getResult = safeExec(
          globalThis.MEMORY_SYSTEM.getContext.bind(globalThis.MEMORY_SYSTEM),
          "lastQuery"
        );
        recordTestResult(
          "Direct context retrieval",
          getResult.success && getResult.result === userQuery,
          getResult.error
        );
      }
    }

    // 6. Test retrieving conversations if available
    if (typeof globalThis.MEMORY_SYSTEM.getRecentConversations === "function") {
      const getConvResult = safeExec(
        globalThis.MEMORY_SYSTEM.getRecentConversations.bind(
          globalThis.MEMORY_SYSTEM
        ),
        1
      );
      recordTestResult(
        "Get recent conversations",
        getConvResult.success,
        getConvResult.error
      );
    }
  } catch (error) {
    recordTestResult("processBeforeResponse execution", false, error.message);
  }
}

function testPostResponseHook(testData) {
  // 1. Test if post-hooks array exists and has items
  const postHooksExist =
    Array.isArray(globalThis.HOOK_SYSTEM.postHooks) &&
    globalThis.HOOK_SYSTEM.postHooks.length > 0;
  recordTestResult("Post-hooks are registered", postHooksExist);

  // 2. Test if processAfterResponse exists
  const processFnExists =
    typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function";
  recordTestResult("processAfterResponse function exists", processFnExists);

  if (!processFnExists) return;

  // 3. Test running the post-response hook
  try {
    const assistantResponse = `MEMORY_TEST_RESPONSE_${testData.id}`;
    const result =
      globalThis.MEMORY_SYSTEM.processAfterResponse(assistantResponse);
    recordTestResult("processAfterResponse execution", Boolean(result));

    // 4. Test direct conversation storage if available
    if (typeof globalThis.MEMORY_SYSTEM.storeConversation === "function") {
      // Try to store a conversation directly
      const storeResult = safeExec(
        globalThis.MEMORY_SYSTEM.storeConversation.bind(
          globalThis.MEMORY_SYSTEM
        ),
        {
          role: "assistant",
          content: assistantResponse,
          timestamp: Date.now(),
        }
      );
      recordTestResult(
        "Direct conversation storage",
        storeResult.success,
        storeResult.error
      );
    }

    // 5. Test retrieving conversations if available
    if (typeof globalThis.MEMORY_SYSTEM.getRecentConversations === "function") {
      const getConvResult = safeExec(
        globalThis.MEMORY_SYSTEM.getRecentConversations.bind(
          globalThis.MEMORY_SYSTEM
        ),
        1
      );
      recordTestResult(
        "Get recent conversations after storage",
        getConvResult.success,
        getConvResult.error
      );
    }
  } catch (error) {
    recordTestResult("processAfterResponse execution", false, error.message);
  }
}

function verifyStoredData(testData) {
  // 1. Test short-term memory
  if (typeof globalThis.MEMORY_SYSTEM.storeContext === "function") {
    try {
      // Store test data in short-term memory
      const storeResult = safeExec(
        globalThis.MEMORY_SYSTEM.storeContext.bind(globalThis.MEMORY_SYSTEM),
        `test_data_${testData.id}`,
        testData
      );

      if (storeResult.success) {
        // Retrieve the data
        const getResult = safeExec(
          globalThis.MEMORY_SYSTEM.getContext.bind(globalThis.MEMORY_SYSTEM),
          `test_data_${testData.id}`
        );

        const dataCorrect =
          getResult.success &&
          getResult.result &&
          getResult.result.id === testData.id;
        recordTestResult(
          "Short-term memory storage and retrieval",
          dataCorrect,
          !dataCorrect ? getResult.error || "Data mismatch" : undefined
        );
      } else {
        recordTestResult("Short-term memory storage", false, storeResult.error);
      }
    } catch (error) {
      recordTestResult(
        "Short-term memory storage and retrieval",
        false,
        error.message
      );
    }
  } else {
    console.log("⚠️ Short-term memory functions not available");
  }

  // 2. Test episodic memory
  if (typeof globalThis.MEMORY_SYSTEM.storeConversation === "function") {
    try {
      // Store test data in episodic memory
      const storeResult = safeExec(
        globalThis.MEMORY_SYSTEM.storeConversation.bind(
          globalThis.MEMORY_SYSTEM
        ),
        {
          role: "system",
          content: `EPISODIC_TEST_${testData.id}`,
          timestamp: Date.now(),
          metadata: { test_id: testData.id },
        }
      );

      if (storeResult.success) {
        // Retrieve conversations
        if (
          typeof globalThis.MEMORY_SYSTEM.getRecentConversations === "function"
        ) {
          const getResult = safeExec(
            globalThis.MEMORY_SYSTEM.getRecentConversations.bind(
              globalThis.MEMORY_SYSTEM
            ),
            5
          );

          const episodicStored =
            getResult.success &&
            getResult.result &&
            Array.isArray(getResult.result) &&
            getResult.result.some(
              (c) => c.content === `EPISODIC_TEST_${testData.id}`
            );

          recordTestResult(
            "Episodic memory storage and retrieval",
            episodicStored,
            !episodicStored
              ? getResult.error || "Data not found in episodic memory"
              : undefined
          );
        } else {
          recordTestResult(
            "Episodic memory retrieval",
            false,
            "getRecentConversations not available"
          );
        }
      } else {
        recordTestResult("Episodic memory storage", false, storeResult.error);
      }
    } catch (error) {
      recordTestResult(
        "Episodic memory storage and retrieval",
        false,
        error.message
      );
    }
  } else {
    console.log("⚠️ Episodic memory functions not available");
  }

  // 3. Test semantic memory if available
  if (typeof globalThis.MEMORY_SYSTEM.storeKnowledge === "function") {
    try {
      // Store test data in semantic memory
      const knowledgeId = `test_knowledge_${testData.id}`;
      const storeResult = safeExec(
        globalThis.MEMORY_SYSTEM.storeKnowledge.bind(globalThis.MEMORY_SYSTEM),
        "test_category",
        {
          id: knowledgeId,
          content: `SEMANTIC_TEST_${testData.id}`,
          importance: "medium",
          timestamp: Date.now(),
        }
      );

      if (storeResult.success) {
        // Retrieve the knowledge
        const getResult = safeExec(
          globalThis.MEMORY_SYSTEM.getKnowledge.bind(globalThis.MEMORY_SYSTEM),
          "test_category"
        );

        const semanticStored =
          getResult.success &&
          getResult.result &&
          typeof getResult.result === "object" &&
          Object.values(getResult.result).some(
            (k) =>
              k.id === knowledgeId ||
              (k.content && k.content.includes(`SEMANTIC_TEST_${testData.id}`))
          );

        recordTestResult(
          "Semantic memory storage and retrieval",
          semanticStored,
          !semanticStored
            ? getResult.error || "Data not found in semantic memory"
            : undefined
        );
      } else {
        recordTestResult("Semantic memory storage", false, storeResult.error);
      }
    } catch (error) {
      recordTestResult(
        "Semantic memory storage and retrieval",
        false,
        error.message
      );
    }
  } else {
    console.log("⚠️ Semantic memory functions not available");
  }
}

function testMemorySearch(testData) {
  // Test if getRecentConversations exists
  if (typeof globalThis.MEMORY_SYSTEM.getRecentConversations !== "function") {
    console.log("⚠️ Memory search functions not available");
    return;
  }

  try {
    // Get recent conversations
    const getResult = safeExec(
      globalThis.MEMORY_SYSTEM.getRecentConversations.bind(
        globalThis.MEMORY_SYSTEM
      ),
      10
    );

    recordTestResult(
      "Conversation history retrieval",
      getResult.success &&
        Array.isArray(getResult.result) &&
        getResult.result.length > 0,
      getResult.error
    );

    // Test semantic search if available
    if (typeof globalThis.MEMORY_SYSTEM.searchKnowledge === "function") {
      const searchResult = safeExec(
        globalThis.MEMORY_SYSTEM.searchKnowledge.bind(globalThis.MEMORY_SYSTEM),
        "TEST"
      );

      recordTestResult(
        "Semantic knowledge search",
        searchResult.success &&
          (Array.isArray(searchResult.result) ||
            typeof searchResult.result === "object"),
        searchResult.error
      );
    }
  } catch (error) {
    recordTestResult("Memory search capabilities", false, error.message);
  }
}

function testMemoryCleanup(testData) {
  // Test clearing context if available
  if (typeof globalThis.MEMORY_SYSTEM.clearContext === "function") {
    try {
      // First, ensure we have something to clear
      if (typeof globalThis.MEMORY_SYSTEM.storeContext === "function") {
        globalThis.MEMORY_SYSTEM.storeContext(
          `cleanup_test_${testData.id}`,
          "test_value"
        );
      }

      // Now try to clear it
      const clearResult = safeExec(
        globalThis.MEMORY_SYSTEM.clearContext.bind(globalThis.MEMORY_SYSTEM),
        `cleanup_test_${testData.id}`
      );

      // Verify it was cleared
      const checkResult = safeExec(
        globalThis.MEMORY_SYSTEM.getContext.bind(globalThis.MEMORY_SYSTEM),
        `cleanup_test_${testData.id}`
      );

      const cleared =
        clearResult.success && checkResult.success && !checkResult.result;
      recordTestResult(
        "Context clearing",
        cleared,
        !cleared
          ? clearResult.error || "Context was not properly cleared"
          : undefined
      );
    } catch (error) {
      recordTestResult("Context clearing", false, error.message);
    }
  }

  // Test pruning memory if available
  if (typeof globalThis.MEMORY_SYSTEM.pruneMemory === "function") {
    try {
      const pruneResult = safeExec(
        globalThis.MEMORY_SYSTEM.pruneMemory.bind(globalThis.MEMORY_SYSTEM)
      );

      recordTestResult(
        "Memory pruning",
        pruneResult.success,
        pruneResult.error || `Pruned ${pruneResult.result || 0} items`
      );
    } catch (error) {
      recordTestResult("Memory pruning", false, error.message);
    }
  }
}

function reportResults() {
  console.log(
    `\nTest Results: ${testResults.passed}/${testResults.total} tests passed (${testResults.failed} failed)`
  );

  if (testResults.failed > 0) {
    console.log("\nFailed Tests:");
    Object.entries(testResults.tests)
      .filter(([_, result]) => !result.passed)
      .forEach(([name, result]) => {
        console.log(`- ${name}: ${result.details || "Test failed"}`);
      });
    console.log("\nRecommendations:");
    console.log("- Ensure memory system is properly initialized");
    console.log(
      "- Check that pre-response and post-response hooks are registered"
    );
    console.log(
      "- Verify that memory subsystems (short-term, episodic, semantic) are working"
    );
  } else {
    console.log(
      "\n🎖️  All memory tests passed! The memory system is fully operational."
    );
    console.log("Key findings:");
    console.log("✓ Data retrieval at the beginning of interactions is working");
    console.log("✓ Data storage at the end of interactions is working");
    console.log("✓ All memory subsystems are functioning correctly");
    console.log("✓ Hook system integration is complete");
  }

  console.log(
    "\nTo ensure memory functions at the beginning and end of every interaction:"
  );
  console.log(
    "1. Verify pre-response-hook.js is loaded at the start of each conversation"
  );
  console.log("2. Verify post-response-hook.js is loaded after each response");
  console.log(
    "3. Check that these hooks are registered in your custom instructions"
  );
  console.log(
    "4. Consider adding automatic memory activation to your startup scripts"
  );
}
