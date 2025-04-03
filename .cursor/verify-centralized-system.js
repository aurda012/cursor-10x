/**
 * Centralized System Verification Script
 * Version 1.1.0 (2023)
 *
 * This script runs a complete verification of the centralized initialization system.
 * It tests system initialization and identifies potentially redundant files.
 *
 * Updated to reference the new organization with tests and backup directories.
 */

console.log("🔍 CENTRALIZED SYSTEM VERIFICATION");
console.log("=================================");
console.log(
  "Running comprehensive verification of the centralized initialization system"
);
console.log(
  "This will test initialization functionality and identify reorganized files\n"
);

// Run initialization test
console.log("🧪 PHASE 1: TESTING SYSTEM INITIALIZATION");
console.log("----------------------------------------");

try {
  const testResults = require("./test-centralized-init.js");

  if (testResults.success) {
    console.log("\n✅ INITIALIZATION TEST PASSED");
    console.log("All core systems initialized successfully");
  } else {
    console.error("\n❌ INITIALIZATION TEST FAILED");
    console.error("The following systems failed to initialize properly:");

    if (!testResults.results.memoryActive) console.error("- Memory System");
    if (!testResults.results.scratchpadActive)
      console.error("- Scratchpad System");
    if (!testResults.results.agentSystemActive)
      console.error("- Multi-Agent System");
    if (!testResults.results.bannersActive) console.error("- Banner System");
  }
} catch (error) {
  console.error("\n❌ ERROR RUNNING INITIALIZATION TEST:", error);
  console.error(
    "Check that test-centralized-init.js exists and can be executed"
  );
}

// Run file organization check
console.log("\n\n🔍 PHASE 2: VERIFYING FILE ORGANIZATION");
console.log("--------------------------------------");

try {
  const fileResults = require("./list-redundant-files.js");

  console.log("\n📊 FILE ORGANIZATION SUMMARY");
  console.log(
    `${fileResults.backupExists.length}/${
      fileResults.backupExists.length + fileResults.backupMissing.length
    } deprecated files moved to backup directory`
  );
  console.log(
    `${fileResults.testsExists.length}/${
      fileResults.testsExists.length + fileResults.testsMissing.length
    } test files moved to tests directory`
  );

  // Check if any tests are still in the root directory
  const fs = require("fs");
  const path = require("path");
  const testsInRoot = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        (file.startsWith("test-") || file.startsWith("check-")) &&
        file !== "test-centralized-init.js"
    )
    .map((file) => path.join(__dirname, file))
    .filter((file) => fs.statSync(file).isFile());

  if (testsInRoot.length > 0) {
    console.log(
      "\n⚠️ WARNING: The following test files are still in the root directory:"
    );
    testsInRoot.forEach((file) => console.log(`- ${path.basename(file)}`));
    console.log("Consider moving these to the tests directory");
  }

  // Critical files check
  const missingCritical = fileResults.criticalFiles.filter((file) => {
    const fs = require("fs");
    const path = require("path");
    return !fs.existsSync(path.join(__dirname, file));
  });

  if (missingCritical.length > 0) {
    console.error("\n⚠️ WARNING: The following critical files are missing:");
    missingCritical.forEach((file) => console.error(`- ${file}`));
    console.error(
      "These files are required for the centralized system to function properly"
    );
  } else {
    console.log("\n✅ All critical files are present");
  }
} catch (error) {
  console.error("\n❌ ERROR CHECKING FILE ORGANIZATION:", error);
  console.error(
    "Check that list-redundant-files.js exists and can be executed"
  );
}

// Display final instructions
console.log("\n\n📋 NEXT STEPS");
console.log("-----------");
console.log(
  "1. Review test results and fix any issues with system initialization"
);
console.log(
  "2. The file reorganization is complete - tests are in tests/, old files in backup-legacy-files/"
);
console.log(
  "3. Update any remaining references to test files to point to the tests/ directory"
);
console.log(
  "4. Update package.json scripts if they refer to test files in the root directory"
);

console.log("\n🚀 VERIFICATION COMPLETE");

// Return combined results if running in Node
if (typeof module !== "undefined") {
  try {
    module.exports = {
      testResults: require("./test-centralized-init.js"),
      fileResults: require("./list-redundant-files.js"),
    };
  } catch (error) {
    module.exports = {
      error: error.message,
    };
  }
}
