/**
 * Setup Symlinks for Core Files
 *
 * This script creates symbolic links from the core directory back to the root directory
 * to maintain backward compatibility with any imports that expect these files to be
 * in the root .cursor directory.
 */

const fs = require("fs");
const path = require("path");

// Base directories
const ROOT_DIR = path.resolve(__dirname, "..");
const CORE_DIR = path.join(ROOT_DIR, "core");

// Core files that should be linked back to the root
const CORE_FILES = [
  "centralized-init.js",
  "centralized-banner.js",
  "system-compatibility.js",
  "enforcer.js",
  "pre-response-hook.js",
  "post-response-hook.js",
  "index.js",
];

console.log("🔗 Setting up symlinks for core files...");

// Ensure core directory exists
if (!fs.existsSync(CORE_DIR)) {
  console.error(`❌ Core directory not found: ${CORE_DIR}`);
  process.exit(1);
}

// Create symlinks for each core file
let successCount = 0;
let errorCount = 0;

for (const file of CORE_FILES) {
  const sourcePath = path.join(CORE_DIR, file);
  const linkPath = path.join(ROOT_DIR, file);

  // Skip if source file doesn't exist
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️ Source file not found: ${sourcePath}`);
    continue;
  }

  // Remove existing file or symlink if it exists
  if (fs.existsSync(linkPath)) {
    try {
      fs.unlinkSync(linkPath);
    } catch (error) {
      console.error(`❌ Failed to remove existing file: ${linkPath}`, error);
      errorCount++;
      continue;
    }
  }

  // Create the symlink
  try {
    // Create relative path for better portability
    const relativeSourcePath = path.relative(ROOT_DIR, sourcePath);
    fs.symlinkSync(relativeSourcePath, linkPath);
    console.log(`✅ Created symlink: ${linkPath} -> ${relativeSourcePath}`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to create symlink for ${file}:`, error);
    errorCount++;
  }
}

console.log(`\n🔄 Symlink setup complete`);
console.log(`  ✅ ${successCount} symlinks created successfully`);
console.log(`  ❌ ${errorCount} symlinks failed`);

if (errorCount > 0) {
  console.log(
    "\n⚠️ Some symlinks could not be created. You may need to run this script with administrator privileges or manually create the required files."
  );
}
