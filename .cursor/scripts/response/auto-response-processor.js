/**
 * Auto-Response Processor
 *
 * This file implements a system that automatically intercepts and processes
 * user inputs and assistant responses to ensure they're stored in memory.
 */

(function () {
  console.log("🔄 Initializing Auto-Response Processor...");

  // Keep track of the original functions
  let originalSendMessage = null;
  let originalCreateMessage = null;

  // Try to intercept message functions
  try {
    // Intercept AI's output
    if (globalThis.AI && typeof globalThis.AI.sendMessage === "function") {
      console.log("🔄 Intercepting AI.sendMessage...");

      // Store original function
      originalSendMessage = globalThis.AI.sendMessage;

      // Replace with intercepting function
      globalThis.AI.sendMessage = function (message, options) {
        console.log("🔄 Processing assistant message before sending...");

        // Run post-response hooks if hook system exists
        if (
          globalThis.HOOK_SYSTEM &&
          typeof globalThis.HOOK_SYSTEM.runPostHooks === "function"
        ) {
          console.log("🔄 Running post-response hooks...");
          globalThis.HOOK_SYSTEM.runPostHooks(message);
        }
        // Direct store if memory system exists but no hook system
        else if (
          globalThis.MEMORY_SYSTEM &&
          typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
        ) {
          console.log("🔄 Storing assistant message directly in memory...");
          globalThis.MEMORY_SYSTEM.storeConversation({
            role: "assistant",
            content: message,
            timestamp: Date.now(),
          });
        }

        // Call original function
        return originalSendMessage.call(this, message, options);
      };

      console.log("✅ Successfully intercepted AI.sendMessage");
    } else {
      console.warn("⚠️ AI.sendMessage not found, cannot intercept");
    }

    // Intercept scratchpad messages for user input
    if (
      globalThis.SCRATCHPAD &&
      typeof globalThis.SCRATCHPAD.createMessage === "function"
    ) {
      console.log("🔄 Intercepting SCRATCHPAD.createMessage...");

      // Store original function
      originalCreateMessage = globalThis.SCRATCHPAD.createMessage;

      // Replace with intercepting function
      globalThis.SCRATCHPAD.createMessage = function (from, to, content) {
        console.log(`🔄 Processing message from ${from} to ${to}...`);

        // If this is from the user to the assistant
        if (from === "user" && to === "assistant") {
          // Run pre-response hooks if hook system exists
          if (
            globalThis.HOOK_SYSTEM &&
            typeof globalThis.HOOK_SYSTEM.runPreHooks === "function"
          ) {
            console.log("🔄 Running pre-response hooks...");
            globalThis.HOOK_SYSTEM.runPreHooks(content);
          }
          // Direct store if memory system exists but no hook system
          else if (
            globalThis.MEMORY_SYSTEM &&
            typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
          ) {
            console.log("🔄 Storing user message directly in memory...");
            globalThis.MEMORY_SYSTEM.storeConversation({
              role: "user",
              content: content,
              timestamp: Date.now(),
            });
          }
        }

        // Call original function
        return originalCreateMessage.call(this, from, to, content);
      };

      // Also ensure SCRATCHPAD_SYSTEM has the same function if it exists
      if (
        globalThis.SCRATCHPAD_SYSTEM &&
        globalThis.SCRATCHPAD_SYSTEM !== globalThis.SCRATCHPAD
      ) {
        globalThis.SCRATCHPAD_SYSTEM.createMessage =
          globalThis.SCRATCHPAD.createMessage;
      }

      console.log("✅ Successfully intercepted SCRATCHPAD.createMessage");
    } else {
      console.warn("⚠️ SCRATCHPAD.createMessage not found, cannot intercept");
    }

    // Monitor user input more generally
    try {
      // Try to access the message history or create a new one
      if (!globalThis.messageHistory) {
        globalThis.messageHistory = {
          messages: [],
          addMessage: function (role, content) {
            this.messages.push({
              role: role,
              content: content,
              timestamp: Date.now(),
            });

            // Process user messages
            if (role === "user") {
              // Run pre-response hooks if hook system exists
              if (
                globalThis.HOOK_SYSTEM &&
                typeof globalThis.HOOK_SYSTEM.runPreHooks === "function"
              ) {
                console.log(
                  "🔄 Running pre-response hooks for user message..."
                );
                globalThis.HOOK_SYSTEM.runPreHooks(content);
              }
              // Direct store if memory system exists but no hook system
              else if (
                globalThis.MEMORY_SYSTEM &&
                typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
              ) {
                console.log("🔄 Storing user message in memory...");
                globalThis.MEMORY_SYSTEM.storeConversation({
                  role: "user",
                  content: content,
                  timestamp: Date.now(),
                });
              }
            }
            // Process assistant messages
            else if (role === "assistant") {
              // Run post-response hooks if hook system exists
              if (
                globalThis.HOOK_SYSTEM &&
                typeof globalThis.HOOK_SYSTEM.runPostHooks === "function"
              ) {
                console.log(
                  "🔄 Running post-response hooks for assistant message..."
                );
                globalThis.HOOK_SYSTEM.runPostHooks(content);
              }
              // Direct store if memory system exists but no hook system
              else if (
                globalThis.MEMORY_SYSTEM &&
                typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
              ) {
                console.log("🔄 Storing assistant message in memory...");
                globalThis.MEMORY_SYSTEM.storeConversation({
                  role: "assistant",
                  content: content,
                  timestamp: Date.now(),
                });
              }
            }

            return this.messages.length - 1;
          },
          getMessages: function () {
            return [...this.messages];
          },
          getLastMessage: function () {
            return this.messages.length > 0
              ? this.messages[this.messages.length - 1]
              : null;
          },
        };

        console.log("✅ Created message history system");
      }
    } catch (historyError) {
      console.error("❌ Error creating message history:", historyError.message);
    }

    // Expose utility functions
    globalThis.storeUserMessage = function (userMessage) {
      console.log("📥 Manually storing user message...");

      if (globalThis.messageHistory) {
        globalThis.messageHistory.addMessage("user", userMessage);
        return true;
      } else if (
        globalThis.MEMORY_SYSTEM &&
        typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
      ) {
        globalThis.MEMORY_SYSTEM.storeConversation({
          role: "user",
          content: userMessage,
          timestamp: Date.now(),
        });
        return true;
      }

      console.error("❌ No suitable storage mechanism found for user message");
      return false;
    };

    globalThis.storeAssistantMessage = function (assistantMessage) {
      console.log("📤 Manually storing assistant message...");

      if (globalThis.messageHistory) {
        globalThis.messageHistory.addMessage("assistant", assistantMessage);
        return true;
      } else if (
        globalThis.MEMORY_SYSTEM &&
        typeof globalThis.MEMORY_SYSTEM.storeConversation === "function"
      ) {
        globalThis.MEMORY_SYSTEM.storeConversation({
          role: "assistant",
          content: assistantMessage,
          timestamp: Date.now(),
        });
        return true;
      }

      console.error(
        "❌ No suitable storage mechanism found for assistant message"
      );
      return false;
    };

    console.log("✅ Auto-Response Processor initialization completed");
  } catch (error) {
    console.error(
      `❌ Error initializing Auto-Response Processor: ${error.message}`
    );

    // Restore original functions if they were replaced
    if (originalSendMessage && globalThis.AI) {
      globalThis.AI.sendMessage = originalSendMessage;
    }

    if (originalCreateMessage && globalThis.SCRATCHPAD) {
      globalThis.SCRATCHPAD.createMessage = originalCreateMessage;
    }
  }

  // Test the auto-response processor
  console.log("🧪 Testing Auto-Response Processor...");

  // Test with memory system
  if (globalThis.MEMORY_SYSTEM) {
    console.log("✅ Memory system detected");

    // Test memory system functions
    if (typeof globalThis.MEMORY_SYSTEM.storeConversation === "function") {
      console.log("✅ Memory storeConversation function available");
    } else {
      console.warn("⚠️ Memory storeConversation function not available");
    }

    if (typeof globalThis.MEMORY_SYSTEM.getRecentConversations === "function") {
      console.log("✅ Memory getRecentConversations function available");
    } else {
      console.warn("⚠️ Memory getRecentConversations function not available");
    }

    if (
      typeof globalThis.MEMORY_SYSTEM.processBeforeResponse === "function" &&
      typeof globalThis.MEMORY_SYSTEM.processAfterResponse === "function"
    ) {
      console.log("✅ Memory processing functions available");
    } else {
      console.warn("⚠️ Memory processing functions not fully available");
    }
  } else {
    console.warn(
      "⚠️ No memory system detected, auto-response processor will have limited functionality"
    );
  }

  // Add a banner for the next response
  if (globalThis.nextResponsePrepend) {
    let memoryBannerFound = false;
    for (const banner of globalThis.nextResponsePrepend) {
      if (banner.includes("MEMORY") || banner.includes("🧠")) {
        memoryBannerFound = true;
        break;
      }
    }

    if (!memoryBannerFound) {
      globalThis.nextResponsePrepend.push("🧠 [MEMORY SYSTEM: ACTIVE]");
    }

    let processorBannerFound = false;
    for (const banner of globalThis.nextResponsePrepend) {
      if (banner.includes("AUTO-RESPONSE")) {
        processorBannerFound = true;
        break;
      }
    }

    if (!processorBannerFound) {
      globalThis.nextResponsePrepend.push(
        "🔄 [AUTO-RESPONSE PROCESSOR: ACTIVE]"
      );
    }
  }

  console.log("🚀 Auto-Response Processor is ready and active");
})();
