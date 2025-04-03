/**
 * Memory and Scratchpad Systems Fix
 * Version 1.0.0
 *
 * This script enhances the Memory and Scratchpad systems to ensure they have
 * the required methods for ACTIVE status in the banner system.
 */

console.log("🔧 Starting Memory and Scratchpad Systems Fix...");

// Load compatibility layer first to ensure system objects exist
try {
  require("../system-compatibility.js");
  console.log("✅ Loaded system compatibility layer");
} catch (error) {
  console.error("❌ Failed to load compatibility layer:", error);
}

// Fix Memory System
console.log("\n🧠 Fixing Memory System...");

try {
  if (!globalThis.MEMORY_SYSTEM) {
    console.error(
      "❌ Memory System does not exist even after loading compatibility layer"
    );
  } else {
    // Check if storeContext method exists
    if (typeof globalThis.MEMORY_SYSTEM.storeContext !== "function") {
      console.log("Adding storeContext method to Memory System");

      // Add storeContext method that maps to existing setShortTermMemory
      globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
        console.log(`[MEMORY] Storing context: ${key}`);
        if (typeof this.setShortTermMemory === "function") {
          return this.setShortTermMemory(key, value);
        } else {
          // Create in-memory storage if needed
          if (!this._contextStorage) {
            this._contextStorage = {};
          }
          this._contextStorage[key] = value;
          return true;
        }
      };
    }

    // Check if getContext method exists
    if (typeof globalThis.MEMORY_SYSTEM.getContext !== "function") {
      console.log("Adding getContext method to Memory System");

      // Add getContext method that maps to existing getShortTermMemory
      globalThis.MEMORY_SYSTEM.getContext = function (key) {
        console.log(`[MEMORY] Getting context: ${key}`);
        if (typeof this.getShortTermMemory === "function") {
          return this.getShortTermMemory(key);
        } else {
          // Return from in-memory storage if it exists
          return this._contextStorage ? this._contextStorage[key] : null;
        }
      };
    }

    // Test if methods are working
    const testKey = `test_${Date.now()}`;
    const testValue = `value_${Date.now()}`;

    try {
      globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
      const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);

      if (retrievedValue === testValue) {
        console.log(
          "✅ Memory System fix validated - methods are working properly"
        );
      } else {
        console.error(
          `❌ Memory System methods not working correctly: stored '${testValue}' but got '${retrievedValue}'`
        );
      }
    } catch (error) {
      console.error("❌ Error testing Memory System methods:", error);
    }
  }
} catch (error) {
  console.error("❌ Error fixing Memory System:", error);
}

// Fix Scratchpad System
console.log("\n📝 Fixing Scratchpad System...");

try {
  const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

  if (!scratchpad) {
    console.error(
      "❌ Scratchpad System does not exist even after loading compatibility layer"
    );
  } else {
    // Check if createMessage method exists
    if (typeof scratchpad.createMessage !== "function") {
      console.log("Adding createMessage method to Scratchpad System");

      // Add createMessage method that maps to existing write method
      scratchpad.createMessage = function (from, to, content, threadId = null) {
        console.log(`[SCRATCHPAD] Creating message from ${from} to ${to}`);

        // Use existing write method if available
        if (typeof this.write === "function") {
          return this.write(content, from, to);
        } else {
          // Initialize message storage if it doesn't exist
          if (!this._messages) {
            this._messages = [];
          }

          // Create message object
          const messageId = `msg_${Date.now()}_${Math.floor(
            Math.random() * 10000
          )}`;
          const message = {
            id: messageId,
            from: from,
            to: to,
            content: content,
            timestamp: Date.now(),
            thread_id: threadId || `thread_${Date.now()}`,
          };

          // Store message
          this._messages.push(message);

          return messageId;
        }
      };
    }

    // Test if method is working
    try {
      const messageId = scratchpad.createMessage(
        "system",
        "test",
        "Test message"
      );

      if (messageId) {
        console.log(
          `✅ Scratchpad System fix validated - createMessage returned: ${messageId}`
        );
      } else {
        console.error(
          "❌ Scratchpad createMessage method not working correctly"
        );
      }
    } catch (error) {
      console.error("❌ Error testing Scratchpad System method:", error);
    }
  }
} catch (error) {
  console.error("❌ Error fixing Scratchpad System:", error);
}

// Update Banner System (if available)
console.log("\n🚩 Updating Banner System...");

try {
  if (
    globalThis.BANNER_SYSTEM &&
    typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
  ) {
    console.log("Refreshing banners to reflect system status updates");
    globalThis.BANNER_SYSTEM.forceBanners();
    console.log("✅ Banner System updated");
  } else {
    console.log("❗ Banner System not available for refresh");
  }
} catch (error) {
  console.error("❌ Error updating Banner System:", error);
}

// Export methods for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fixMemorySystem: function () {
      // Add storeContext method
      if (!globalThis.MEMORY_SYSTEM.storeContext) {
        globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
          if (!this._contextStorage) this._contextStorage = {};
          this._contextStorage[key] = value;
          return true;
        };
      }

      // Add getContext method
      if (!globalThis.MEMORY_SYSTEM.getContext) {
        globalThis.MEMORY_SYSTEM.getContext = function (key) {
          return this._contextStorage ? this._contextStorage[key] : null;
        };
      }

      return true;
    },

    fixScratchpadSystem: function () {
      const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

      // Add createMessage method
      if (!scratchpad.createMessage) {
        scratchpad.createMessage = function (
          from,
          to,
          content,
          threadId = null
        ) {
          if (!this._messages) this._messages = [];
          const messageId = `msg_${Date.now()}_${Math.floor(
            Math.random() * 10000
          )}`;
          this._messages.push({
            id: messageId,
            from,
            to,
            content,
            timestamp: Date.now(),
            thread_id: threadId || `thread_${Date.now()}`,
          });
          return messageId;
        };
      }

      return true;
    },

    refreshBanners: function () {
      if (
        globalThis.BANNER_SYSTEM &&
        typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
      ) {
        return globalThis.BANNER_SYSTEM.forceBanners();
      }
      return false;
    },
  };
}
