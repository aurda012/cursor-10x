/**
 * System Verification Script
 *
 * This script checks that all critical systems are properly initialized
 * after the file reorganization. It verifies that core files exist in both
 * their primary locations and in the root directory for backward compatibility.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Define the root and core directories
const rootDir = path.resolve(__dirname, "..");
const coreDir = path.resolve(rootDir, "core");

// Define core files that should exist in both locations
const coreFiles = [
  "centralized-init.js",
  "centralized-banner.js",
  "system-compatibility.js",
  "enforcer.js",
  "pre-response-hook.js",
  "post-response-hook.js",
  "index.js",
];

// Define critical system directories
const criticalDirs = [
  "agents",
  "communication",
  "core",
  "db",
  "systems",
  "rules",
];

// Define critical system files
const criticalFiles = [
  "systems/memory-system.js",
  "systems/scratchpad-system.js",
  "systems/multi-agent-system.js",
  "communication/direct-banner.js",
];

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.blue}=== Cursor10x System Verification ===\n${colors.reset}`
);

// Check if core directory exists
if (!fs.existsSync(coreDir)) {
  console.error(`${colors.red}✖ Core directory does not exist!${colors.reset}`);
  console.log(
    `${colors.yellow}Try running: mkdir -p ${coreDir}${colors.reset}`
  );
  process.exit(1);
}

// Check for critical directories
console.log(`${colors.cyan}Checking critical directories...${colors.reset}`);
const missingDirs = [];
for (const dir of criticalDirs) {
  const dirPath = path.resolve(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`${colors.green}✓ ${dir}/ exists${colors.reset}`);
  } else {
    console.log(`${colors.red}✖ ${dir}/ is missing${colors.reset}`);
    missingDirs.push(dir);
  }
}

if (missingDirs.length > 0) {
  console.log(
    `\n${colors.yellow}Missing directories. Create them with:${colors.reset}`
  );
  console.log(
    `mkdir -p ${missingDirs.map((dir) => path.join(rootDir, dir)).join(" ")}`
  );
}

// Check for critical files
console.log(`\n${colors.cyan}Checking critical system files...${colors.reset}`);
const missingFiles = [];
for (const file of criticalFiles) {
  const filePath = path.resolve(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`${colors.green}✓ ${file} exists${colors.reset}`);
  } else {
    console.log(`${colors.red}✖ ${file} is missing${colors.reset}`);
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log(
    `\n${colors.yellow}Missing critical files. These need to be restored from backup or recreated.${colors.reset}`
  );
}

// Check for core files
console.log(`\n${colors.cyan}Checking core files...${colors.reset}`);
const missingCoreFiles = [];
const missingRootFiles = [];

for (const file of coreFiles) {
  const coreFilePath = path.resolve(coreDir, file);
  const rootFilePath = path.resolve(rootDir, file);

  // Check in core directory
  const coreExists = fs.existsSync(coreFilePath);
  console.log(
    `${coreExists ? colors.green + "✓" : colors.red + "✖"} ${file} in core/ ${
      coreExists ? "exists" : "is missing"
    }${colors.reset}`
  );
  if (!coreExists) missingCoreFiles.push(file);

  // Check in root directory
  const rootExists = fs.existsSync(rootFilePath);
  console.log(
    `${rootExists ? colors.green + "✓" : colors.red + "✖"} ${file} in root ${
      rootExists ? "exists" : "is missing"
    }${colors.reset}`
  );
  if (!rootExists) missingRootFiles.push(file);
}

// Summary
console.log(`\n${colors.blue}=== Verification Summary ===\n${colors.reset}`);

if (
  missingDirs.length === 0 &&
  missingFiles.length === 0 &&
  missingCoreFiles.length === 0 &&
  missingRootFiles.length === 0
) {
  console.log(
    `${colors.green}All systems are properly set up! 🎉${colors.reset}`
  );
} else {
  console.log(`${colors.yellow}Issues found:${colors.reset}`);
  if (missingDirs.length > 0)
    console.log(
      `${colors.yellow}- Missing directories: ${missingDirs.length}${colors.reset}`
    );
  if (missingFiles.length > 0)
    console.log(
      `${colors.yellow}- Missing critical files: ${missingFiles.length}${colors.reset}`
    );
  if (missingCoreFiles.length > 0)
    console.log(
      `${colors.yellow}- Missing core files: ${missingCoreFiles.length}${colors.reset}`
    );
  if (missingRootFiles.length > 0)
    console.log(
      `${colors.yellow}- Missing root files: ${missingRootFiles.length}${colors.reset}`
    );

  // Suggest fixes
  console.log(`\n${colors.cyan}Suggested fixes:${colors.reset}`);

  if (missingCoreFiles.length > 0 && missingRootFiles.length > 0) {
    console.log(
      `${colors.yellow}Files are missing from both core/ and root. You may need to restore from backup.${colors.reset}`
    );
  } else if (missingCoreFiles.length > 0) {
    console.log(
      `${colors.yellow}Files exist in root but missing from core/. Copy them with:${colors.reset}`
    );
    missingCoreFiles.forEach((file) => {
      console.log(`cp ${path.join(rootDir, file)} ${path.join(coreDir, file)}`);
    });
  } else if (missingRootFiles.length > 0) {
    console.log(
      `${colors.yellow}Files exist in core/ but missing from root. Run the copy script:${colors.reset}`
    );
    console.log(`node ${path.join(rootDir, "scripts", "copy-core-files.js")}`);
  }
}

// Attempt to run a test of the systems
console.log(`\n${colors.cyan}Testing system initialization...${colors.reset}`);

try {
  // Try to require the centralized-init.js file to see if it initializes without errors
  const requirePath = path.join(rootDir, "centralized-init.js");
  if (fs.existsSync(requirePath)) {
    try {
      require(requirePath);
      console.log(
        `${colors.green}✓ centralized-init.js loaded successfully${colors.reset}`
      );

      // Check if global systems are defined
      if (global.SYSTEMS_ACTIVE) {
        console.log(`${colors.green}✓ SYSTEMS_ACTIVE is set${colors.reset}`);
      } else {
        console.log(`${colors.red}✖ SYSTEMS_ACTIVE is not set${colors.reset}`);
      }

      if (global.MEMORY_SYSTEM) {
        console.log(`${colors.green}✓ MEMORY_SYSTEM is defined${colors.reset}`);
      } else {
        console.log(
          `${colors.red}✖ MEMORY_SYSTEM is not defined${colors.reset}`
        );
      }

      if (global.MULTI_AGENT_SYSTEM || global.AGENT_SYSTEM) {
        console.log(`${colors.green}✓ Agent system is defined${colors.reset}`);
      } else {
        console.log(
          `${colors.red}✖ Agent system is not defined${colors.reset}`
        );
      }

      if (global.SCRATCHPAD) {
        console.log(`${colors.green}✓ SCRATCHPAD is defined${colors.reset}`);
      } else {
        console.log(`${colors.red}✖ SCRATCHPAD is not defined${colors.reset}`);
      }
    } catch (error) {
      console.log(
        `${colors.red}✖ Error loading centralized-init.js: ${error.message}${colors.reset}`
      );
      console.log(
        `${colors.yellow}Try running the fix script: node ${path.join(
          rootDir,
          "scripts",
          "fix-systems.js"
        )}${colors.reset}`
      );
    }
  } else {
    console.log(
      `${colors.red}✖ centralized-init.js not found in root directory${colors.reset}`
    );
  }
} catch (error) {
  console.log(
    `${colors.red}✖ Error testing system: ${error.message}${colors.reset}`
  );
}

console.log(`\n${colors.blue}=== Verification Complete ===\n${colors.reset}`);
