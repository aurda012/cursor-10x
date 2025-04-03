/**
 * Logger System for Multi-Agent Framework
 * Version: 1.0.0 (April 1, 2025)
 *
 * This module provides logging functionality for various components
 * of the multi-agent system, storing logs in the .cursor/logs directory.
 */

const fs = require("fs");
const path = require("path");

// Initialize
console.log("📋 LOGGER: Initializing logger system...");

// Constants
const LOG_DIR = path.join(process.cwd(), ".cursor", "logs");
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
};

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`Created log directory at: ${LOG_DIR}`);
  } catch (error) {
    console.error(`Failed to create log directory: ${error.message}`);
  }
}

// The Logger class
class Logger {
  constructor(component, options = {}) {
    this.component = component;
    this.options = {
      logLevel: LOG_LEVELS.INFO,
      toConsole: true,
      toFile: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      ...options,
    };

    this.logFile = path.join(
      LOG_DIR,
      `${component.toLowerCase().replace(/\s+/g, "-")}.log`
    );

    // Create an empty log file if it doesn't exist
    if (this.options.toFile && !fs.existsSync(this.logFile)) {
      try {
        fs.writeFileSync(this.logFile, "");
      } catch (error) {
        console.error(`Failed to create log file: ${error.message}`);
        this.options.toFile = false;
      }
    }

    console.log(`Logger initialized for component: ${component}`);
  }

  // Internal log method
  _log(level, message, data = null) {
    if (level < this.options.logLevel) return;

    const timestamp = new Date().toISOString();
    const levelName =
      Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === level) ||
      "UNKNOWN";

    // Format log entry
    let logEntry = `[${timestamp}] [${levelName}] [${this.component}] ${message}`;

    // Add data if present
    if (data !== null) {
      let dataStr;
      try {
        dataStr =
          typeof data === "object" ? JSON.stringify(data) : String(data);
        logEntry += `\nDATA: ${dataStr}`;
      } catch (error) {
        logEntry += `\nDATA: [Error stringifying data: ${error.message}]`;
      }
    }

    // Log to console if enabled
    if (this.options.toConsole) {
      const consoleMethod =
        level >= LOG_LEVELS.ERROR
          ? "error"
          : level >= LOG_LEVELS.WARN
          ? "warn"
          : "log";
      console[consoleMethod](logEntry);
    }

    // Log to file if enabled
    if (this.options.toFile) {
      try {
        // Check file size and rotate if needed
        this._checkRotation();

        // Append to log file
        fs.appendFileSync(this.logFile, logEntry + "\n");
      } catch (error) {
        console.error(`Failed to write to log file: ${error.message}`);
      }
    }

    return logEntry;
  }

  // Check if log rotation is needed
  _checkRotation() {
    try {
      const stats = fs.statSync(this.logFile);

      if (stats.size >= this.options.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/:/g, "-");
        const rotatedFile = `${this.logFile}.${timestamp}`;

        fs.renameSync(this.logFile, rotatedFile);
        fs.writeFileSync(
          this.logFile,
          `Log rotated from ${rotatedFile} at ${new Date().toISOString()}\n`
        );

        console.log(`Rotated log file: ${rotatedFile}`);
      }
    } catch (error) {
      console.error(`Error checking log rotation: ${error.message}`);
    }
  }

  // Public logging methods
  debug(message, data = null) {
    return this._log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = null) {
    return this._log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = null) {
    return this._log(LOG_LEVELS.WARN, message, data);
  }

  error(message, data = null) {
    return this._log(LOG_LEVELS.ERROR, message, data);
  }

  critical(message, data = null) {
    return this._log(LOG_LEVELS.CRITICAL, message, data);
  }
}

// Create logger factory
const loggers = {};

function getLogger(component, options = {}) {
  if (!loggers[component]) {
    loggers[component] = new Logger(component, options);
  }
  return loggers[component];
}

// Create system logger
const systemLogger = getLogger("System");
systemLogger.info("Logger system initialized");

// Export the logger module
module.exports = {
  getLogger,
  LOG_LEVELS,
  systemLogger,
};

// Register with global system if available
if (typeof globalThis !== "undefined") {
  if (!globalThis.LOGGER_SYSTEM) {
    globalThis.LOGGER_SYSTEM = {
      initialized: true,
      getLogger,
      LOG_LEVELS,
      systemLogger,
    };
    systemLogger.info("Registered logger system with global context");
  }
}

console.log("✅ LOGGER: System initialized and ready");
