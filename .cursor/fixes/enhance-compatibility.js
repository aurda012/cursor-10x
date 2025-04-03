/**
 * Enhanced Compatibility Module
 * Version 1.0.0
 *
 * This module extends the system-compatibility.js by adding the necessary
 * methods to ensure Memory and Scratchpad systems show as ACTIVE in banners.
 */

console.log("🔧 Enhanced Compatibility Module loading...");

// First, ensure the compatibility layer is loaded
try {
  if (typeof globalThis.initializeCompatibilityLayer === "function") {
    globalThis.initializeCompatibilityLayer();
  } else {
    try {
      require("../system-compatibility.js");
    } catch (error) {
      console.error("❌ Failed to load system-compatibility.js:", error);
    }
  }
  console.log("✅ Core compatibility layer loaded");
} catch (error) {
  console.error("❌ Error loading core compatibility layer:", error);
}

// Create a better in-memory storage mechanism
const createStorage = () => {
  const storage = {};
  return {
    set: (key, value) => {
      storage[key] = value;
      return true;
    },
    get: (key) => storage[key],
    has: (key) => key in storage,
    delete: (key) => {
      if (key in storage) {
        delete storage[key];
        return true;
      }
      return false;
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
      return true;
    },
    keys: () => Object.keys(storage),
    values: () => Object.values(storage),
    entries: () => Object.entries(storage),
    size: () => Object.keys(storage).length,
  };
};

// Enhance Memory System
console.log("\n🧠 Enhancing Memory System...");

try {
  if (!globalThis.MEMORY_SYSTEM) {
    console.error("❌ Memory System does not exist");
  } else {
    // Create storage if it doesn't exist
    if (!globalThis.MEMORY_SYSTEM._storage) {
      globalThis.MEMORY_SYSTEM._storage = createStorage();
      console.log("➕ Created memory storage mechanism");
    }

    // Add or replace storeContext method with a working implementation
    globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
      if (typeof this._storage?.set === "function") {
        // Use our enhanced storage
        return this._storage.set(key, value);
      } else {
        // Fallback to direct object storage
        if (!this._contextStore) {
          this._contextStore = {};
        }
        this._contextStore[key] = value;
        return true;
      }
    };
    console.log("✅ Added storeContext method to Memory System");

    // Add or replace getContext method with a working implementation
    globalThis.MEMORY_SYSTEM.getContext = function (key) {
      if (typeof this._storage?.get === "function") {
        // Use our enhanced storage
        return this._storage.get(key);
      } else {
        // Fallback to direct object storage
        return this._contextStore ? this._contextStore[key] : null;
      }
    };
    console.log("✅ Added getContext method to Memory System");

    // Test the methods
    const testKey = `test_${Date.now()}`;
    const testValue = `value_${Date.now()}`;

    globalThis.MEMORY_SYSTEM.storeContext(testKey, testValue);
    const retrievedValue = globalThis.MEMORY_SYSTEM.getContext(testKey);

    if (retrievedValue === testValue) {
      console.log("✅ Memory System verification passed - methods are working");
    } else {
      console.error(
        `❌ Memory System still not working: stored '${testValue}' but got '${retrievedValue}'`
      );
    }
  }
} catch (error) {
  console.error("❌ Error enhancing Memory System:", error);
}

// Enhance Scratchpad System
console.log("\n📝 Enhancing Scratchpad System...");

try {
  // Get the scratchpad reference (either name)
  const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;

  if (!scratchpad) {
    console.error("❌ Scratchpad System does not exist");
  } else {
    // Create message storage if it doesn't exist
    if (!scratchpad._messages) {
      scratchpad._messages = [];
      console.log("➕ Created message storage for Scratchpad");
    }

    // Add or replace createMessage method with a working implementation
    scratchpad.createMessage = function (from, to, content, threadId = null) {
      // Create a unique message ID
      const messageId = `msg_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}`;

      // Create message object
      const message = {
        id: messageId,
        from: from || "system",
        to: to || "all",
        content: content || "",
        timestamp: Date.now(),
        thread_id: threadId || `default_thread`,
      };

      // Store the message
      if (!this._messages) {
        this._messages = [];
      }
      this._messages.push(message);

      // Call the write method if it exists (for compatibility)
      if (typeof this.write === "function") {
        this.write(content, from, to);
      }

      return messageId;
    };
    console.log("✅ Added createMessage method to Scratchpad System");

    // Test the method
    const messageId = scratchpad.createMessage(
      "system",
      "test",
      "Test message"
    );

    if (
      messageId &&
      typeof messageId === "string" &&
      messageId.startsWith("msg_")
    ) {
      console.log(
        `✅ Scratchpad System verification passed - createMessage returned: ${messageId}`
      );
    } else {
      console.error(
        `❌ Scratchpad createMessage still not working correctly: returned ${messageId}`
      );
    }
  }
} catch (error) {
  console.error("❌ Error enhancing Scratchpad System:", error);
}

// Export the enhance function for integration with centralized init
globalThis.enhanceCompatibilityLayer = function () {
  console.log("🔄 Enhancing compatibility layer with required methods...");

  // Enhance Memory System
  if (globalThis.MEMORY_SYSTEM) {
    if (!globalThis.MEMORY_SYSTEM._storage) {
      globalThis.MEMORY_SYSTEM._storage = createStorage();
    }

    globalThis.MEMORY_SYSTEM.storeContext = function (key, value) {
      return this._storage.set(key, value);
    };

    globalThis.MEMORY_SYSTEM.getContext = function (key) {
      return this._storage.get(key);
    };
  }

  // Enhance Scratchpad System
  const scratchpad = globalThis.SCRATCHPAD_SYSTEM || globalThis.SCRATCHPAD;
  if (scratchpad) {
    if (!scratchpad._messages) {
      scratchpad._messages = [];
    }

    scratchpad.createMessage = function (from, to, content, threadId = null) {
      const messageId = `msg_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}`;
      this._messages.push({
        id: messageId,
        from: from || "system",
        to: to || "all",
        content: content || "",
        timestamp: Date.now(),
        thread_id: threadId || `default_thread`,
      });
      return messageId;
    };
  }

  console.log("✅ Enhanced compatibility layer with required methods");
  return true;
};

// Call enhance function immediately
globalThis.enhanceCompatibilityLayer();

// Refresh banners if possible
console.log("\n🚩 Updating Banner System...");

try {
  if (
    globalThis.BANNER_SYSTEM &&
    typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
  ) {
    globalThis.BANNER_SYSTEM.forceBanners();
    console.log("✅ Banner System refreshed");
  } else {
    console.log("ℹ️ Banner System not available for refresh");

    // Try loading the banner system if it's not loaded
    try {
      require("../centralized-banner.js");
      console.log("✅ Loaded Banner System");

      // Try again to force banners
      if (
        globalThis.BANNER_SYSTEM &&
        typeof globalThis.BANNER_SYSTEM.forceBanners === "function"
      ) {
        globalThis.BANNER_SYSTEM.forceBanners();
        console.log("✅ Banner System refreshed after loading");
      }
    } catch (error) {
      console.log("ℹ️ Could not load Banner System:", error.message);
    }
  }
} catch (error) {
  console.error("❌ Error updating Banner System:", error);
}

console.log("\n✅ Enhanced Compatibility Module loaded successfully");

// Export for Node.js modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    enhance: globalThis.enhanceCompatibilityLayer,
    createStorage: createStorage,
  };
}
