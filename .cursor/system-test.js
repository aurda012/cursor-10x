/**
 * System Test Script
 * This script checks the status of the multi-agent system, scratchpad, and banners
 */

console.log("🧪 Starting system test...");

// Load the enforcer to initialize all systems
try {
  console.log("Loading enforcer...");
  require("./enforcer.js");
  console.log("✅ Enforcer loaded successfully");
} catch (error) {
  console.error("❌ Error loading enforcer:", error.message);
}

// Wait a moment for everything to initialize
setTimeout(() => {
  console.log("\n📊 SYSTEM STATUS CHECK\n");

  // Check memory system
  console.log("1️⃣ Memory System:");
  if (globalThis.MEMORY_SYSTEM) {
    console.log("  ✅ Memory system exists");
    console.log("  📦 Memory type:", typeof globalThis.MEMORY_SYSTEM);
    console.log(
      "  🔑 Available methods:",
      Object.keys(globalThis.MEMORY_SYSTEM)
        .filter((k) => typeof globalThis.MEMORY_SYSTEM[k] === "function")
        .join(", ")
    );
  } else {
    console.log("  ❌ Memory system not found");
  }

  // Check scratchpad system
  console.log("\n2️⃣ Scratchpad System:");
  if (globalThis.SCRATCHPAD_SYSTEM) {
    console.log("  ✅ SCRATCHPAD_SYSTEM exists");
    console.log("  📦 Type:", typeof globalThis.SCRATCHPAD_SYSTEM);
    console.log(
      "  🔑 Available methods:",
      Object.keys(globalThis.SCRATCHPAD_SYSTEM)
        .filter((k) => typeof globalThis.SCRATCHPAD_SYSTEM[k] === "function")
        .join(", ")
    );
  } else {
    console.log("  ❌ SCRATCHPAD_SYSTEM not found");
  }

  if (globalThis.SCRATCHPAD) {
    console.log("  ✅ SCRATCHPAD exists");
    console.log("  📦 Type:", typeof globalThis.SCRATCHPAD);
    console.log(
      "  🔑 Available methods:",
      Object.keys(globalThis.SCRATCHPAD)
        .filter((k) => typeof globalThis.SCRATCHPAD[k] === "function")
        .join(", ")
    );

    // Check if the two references are the same
    if (globalThis.SCRATCHPAD === globalThis.SCRATCHPAD_SYSTEM) {
      console.log(
        "  ✅ SCRATCHPAD and SCRATCHPAD_SYSTEM are the same object (proper reference)"
      );
    } else {
      console.log(
        "  ❌ SCRATCHPAD and SCRATCHPAD_SYSTEM are different objects (reference issue)"
      );
    }
  } else {
    console.log("  ❌ SCRATCHPAD not found");
  }

  // Check multi-agent system
  console.log("\n3️⃣ Multi-Agent System:");
  if (globalThis.MULTI_AGENT_SYSTEM) {
    console.log("  ✅ MULTI_AGENT_SYSTEM exists");
    console.log("  📦 Type:", typeof globalThis.MULTI_AGENT_SYSTEM);
    console.log(
      "  🔑 Available methods:",
      Object.keys(globalThis.MULTI_AGENT_SYSTEM)
        .filter((k) => typeof globalThis.MULTI_AGENT_SYSTEM[k] === "function")
        .join(", ")
    );

    // Check agents
    if (globalThis.MULTI_AGENT_SYSTEM.agents) {
      const agentCount = Object.keys(
        globalThis.MULTI_AGENT_SYSTEM.agents
      ).length;
      console.log(`  👥 Number of agents: ${agentCount}`);
      console.log(
        `  👤 Active agent: ${
          globalThis.MULTI_AGENT_SYSTEM.active_agent || "none"
        }`
      );
    } else {
      console.log("  ❌ No agents found in MULTI_AGENT_SYSTEM");
    }
  } else {
    console.log("  ❌ MULTI_AGENT_SYSTEM not found");
  }

  if (globalThis.AGENT_SYSTEM) {
    console.log("  ✅ AGENT_SYSTEM exists");

    // Check if the two references are the same
    if (globalThis.AGENT_SYSTEM === globalThis.MULTI_AGENT_SYSTEM) {
      console.log(
        "  ✅ AGENT_SYSTEM and MULTI_AGENT_SYSTEM are the same object (proper reference)"
      );
    } else {
      console.log(
        "  ❌ AGENT_SYSTEM and MULTI_AGENT_SYSTEM are different objects (reference issue)"
      );
    }
  } else {
    console.log("  ❌ AGENT_SYSTEM not found");
  }

  // Check banner system
  console.log("\n4️⃣ Banner System:");
  if (globalThis.nextResponsePrepend) {
    console.log("  ✅ nextResponsePrepend exists");
    console.log("  📦 Type:", typeof globalThis.nextResponsePrepend);
    if (Array.isArray(globalThis.nextResponsePrepend)) {
      console.log(
        `  🔢 Number of banners: ${globalThis.nextResponsePrepend.length}`
      );
      console.log("  🎌 Current banners:");
      globalThis.nextResponsePrepend.forEach((banner, index) => {
        console.log(`    ${index + 1}. ${banner}`);
      });
    } else {
      console.log("  ❌ nextResponsePrepend is not an array");
    }
  } else {
    console.log("  ❌ nextResponsePrepend not found");
  }

  console.log("\n🏁 SYSTEM TEST COMPLETE");
}, 1000);
