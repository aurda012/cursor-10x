/**
 * Copy Core Files
 *
 * This script copies files from the core directory back to the root directory
 * to maintain backward compatibility with any imports that expect these files to be
 * in the root .cursor directory. Use this as an alternative to setup-symlinks.js
 * if your system doesn't support symbolic links.
 */

const fs = require("fs");
const path = require("path");

// Base directories
const ROOT_DIR = path.resolve(__dirname, "..");
const CORE_DIR = path.join(ROOT_DIR, "core");

// Core files that should be copied back to the root
const CORE_FILES = [
  "centralized-init.js",
  "centralized-banner.js",
  "system-compatibility.js",
  "enforcer.js",
  "pre-response-hook.js",
  "post-response-hook.js",
  "index.js",
];

console.log("📄 Copying core files to root directory...");

// Ensure core directory exists
if (!fs.existsSync(CORE_DIR)) {
  console.error(`❌ Core directory not found: ${CORE_DIR}`);
  process.exit(1);
}

// Copy each core file
let successCount = 0;
let errorCount = 0;

for (const file of CORE_FILES) {
  const sourcePath = path.join(CORE_DIR, file);
  const destPath = path.join(ROOT_DIR, file);

  // Skip if source file doesn't exist
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️ Source file not found: ${sourcePath}`);
    continue;
  }

  // Copy the file
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${file}`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to copy ${file}:`, error);
    errorCount++;
  }
}

console.log(`\n🔄 File copy complete`);
console.log(`  ✅ ${successCount} files copied successfully`);
console.log(`  ❌ ${errorCount} files failed`);

if (successCount > 0) {
  console.log(
    "\n⚠️ Note: These are duplicate files. Any changes should be made to the original files in the core directory, then run this script again to update the copies."
  );
}
