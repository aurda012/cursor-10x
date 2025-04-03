/**
 * Redundant Files Identification Script
 * Version 1.1.0 (2023)
 *
 * This script identifies files that may be redundant after implementing
 * the centralized initialization system. It doesn't delete any files,
 * just lists them for review.
 *
 * Updated to reflect the new organization with backup-legacy-files and tests directories.
 */

const fs = require("fs");
const path = require("path");

// Base directory
const BASE_DIR = path.resolve(__dirname);

// Check for reorganized directories
const BACKUP_DIR = path.join(BASE_DIR, "backup-legacy-files");
const TESTS_DIR = path.join(BASE_DIR, "tests");

// Files that were redundant and should now be in backup-legacy-files
const expectedBackupFiles = [
  "master-activation.js",
  "fixed-memory-system.js",
  "fix-memory-system.js",
  "fix-banners.js",
  "basic-test.js",
  "communication/activate.js",
];

// Files that should be in the tests directory
const expectedTestFiles = [
  "test-agents.js",
  "test-banner-system.js",
  "test-fixed-scratchpad.js",
  "test-memory.js",
  "test-system.js",
  "simple-banner-test.js",
  "check-agent.js",
  "check-agents.js",
  "check-memory-db.js",
  "check-memory.js",
  "check-scratchpad.js",
];

// Files that should still be checked in the root directory
const remainingFiles = ["activation-status.json"];

// Files that should NEVER be deleted
const criticalFiles = [
  "centralized-init.js",
  "centralized-banner.js",
  "system-compatibility.js",
  "fixes/enhance-compatibility.js",
  "enhance-systems.js",
  "enforcer.js",
  "verify-compatibility.js",
  "verify-centralized-system.js",
  "index.js",
  "rules/001-system-core.mdc",
  "agents/multi-agent-system.js",
  "agents/agent-modules.js",
  "systems/memory-system.js",
  "systems/scratchpad-system.js",
  "systems/multi-agent-system.js",
  "communication/direct-banner.js",
  "test-centralized-init.js",
  "list-redundant-files.js",
  "install-deps.js",
];

console.log("🔍 SCANNING FOR REORGANIZED FILES");
console.log("================================");

// Check if directories exist
console.log(`\n📁 Checking reorganized directories:`);
console.log(
  `  - Backup directory: ${
    fs.existsSync(BACKUP_DIR) ? "✅ exists" : "❌ missing"
  }`
);
console.log(
  `  - Tests directory: ${
    fs.existsSync(TESTS_DIR) ? "✅ exists" : "❌ missing"
  }`
);

// Results containers
const backupExists = [];
const backupMissing = [];
const testsExists = [];
const testsMissing = [];
const remainingExists = [];
const remainingMissing = [];

// Check backup files
console.log("\n📦 Checking files in backup directory:");
expectedBackupFiles.forEach((file) => {
  const fullPath = file.includes("/")
    ? path.join(BACKUP_DIR, file)
    : path.join(BACKUP_DIR, file);

  if (fs.existsSync(fullPath)) {
    backupExists.push(file);
    console.log(`  ✅ ${file}`);
  } else {
    backupMissing.push(file);
    console.log(`  ❌ ${file}`);
  }
});

// Check test files
console.log("\n🧪 Checking files in tests directory:");
expectedTestFiles.forEach((file) => {
  const fullPath = path.join(TESTS_DIR, file);

  if (fs.existsSync(fullPath)) {
    testsExists.push(file);
    console.log(`  ✅ ${file}`);
  } else {
    testsMissing.push(file);
    console.log(`  ❌ ${file}`);
  }
});

// Check remaining files
console.log("\n📄 Checking remaining files:");
remainingFiles.forEach((file) => {
  const fullPath = path.join(BASE_DIR, file);

  if (fs.existsSync(fullPath)) {
    remainingExists.push(file);
    console.log(`  ✅ ${file}`);
  } else {
    remainingMissing.push(file);
    console.log(`  ❌ ${file}`);
  }
});

// Critical files reminder
console.log("\n⚠️ CRITICAL FILES THAT SHOULD NEVER BE DELETED");
console.log("============================================");
criticalFiles.forEach((file, index) => {
  const fullPath = path.join(BASE_DIR, file);
  const exists = fs.existsSync(fullPath);
  console.log(
    `  ${index + 1}. ${file} - ${exists ? "✅ exists" : "❌ missing"}`
  );
});

console.log("\n🔍 SUMMARY");
console.log("=========");
console.log(
  `Backup files: ${backupExists.length}/${expectedBackupFiles.length} found`
);
console.log(
  `Test files: ${testsExists.length}/${expectedTestFiles.length} found`
);
console.log(
  `Remaining files: ${remainingExists.length}/${remainingFiles.length} found`
);
console.log(
  `Critical files: ${
    criticalFiles.filter((file) => fs.existsSync(path.join(BASE_DIR, file)))
      .length
  }/${criticalFiles.length} found`
);

console.log(
  "\n🚨 IMPORTANT: This script only verifies the organization of files."
);
console.log(
  "If any critical files are missing, please restore them from backups."
);

// Return results if running in Node
if (typeof module !== "undefined") {
  module.exports = {
    backupExists,
    backupMissing,
    testsExists,
    testsMissing,
    remainingExists,
    remainingMissing,
    criticalFiles,
  };
}
