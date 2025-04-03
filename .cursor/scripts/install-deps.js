/**
 * Dependency Installer
 * Version 1.0.0 (2023)
 *
 * This script ensures that all required dependencies are installed
 * for the memory system to function properly.
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("📦 Checking and installing dependencies...");

// Paths
const CURSOR_DIR = path.resolve(__dirname);
const PACKAGE_JSON_PATH = path.join(CURSOR_DIR, "package.json");

// Check if better-sqlite3 is listed in package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
  console.log("Package.json found, checking dependencies...");
} catch (error) {
  console.log("Package.json not found, creating it...");
  packageJson = {
    name: "cursor-systems",
    version: "1.0.0",
    description: "Multi-agent system with memory and scratchpad capabilities",
    private: true,
    scripts: {
      test: "node test-system.js",
    },
    dependencies: {},
  };
}

// Ensure better-sqlite3 is in the dependencies
const needsInstall =
  !packageJson.dependencies || !packageJson.dependencies["better-sqlite3"];

if (needsInstall) {
  console.log("Adding better-sqlite3 to package.json...");

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  packageJson.dependencies["better-sqlite3"] = "^8.6.0";

  // Write the updated package.json
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));

  // Install dependencies
  console.log("Installing dependencies with npm...");
  try {
    execSync("npm install", { cwd: CURSOR_DIR, stdio: "inherit" });
    console.log("✅ Dependency installation successful");
  } catch (error) {
    console.error("❌ Error installing dependencies:", error.message);
    console.log('Please run "npm install" manually in the .cursor directory');
  }
} else {
  console.log("✅ Dependencies already in package.json");

  // Check if node_modules exists and contains better-sqlite3
  const nodeModulesPath = path.join(CURSOR_DIR, "node_modules");
  const sqliteModulePath = path.join(nodeModulesPath, "better-sqlite3");

  if (!fs.existsSync(sqliteModulePath)) {
    console.log("Node modules not installed, running npm install...");
    try {
      execSync("npm install", { cwd: CURSOR_DIR, stdio: "inherit" });
      console.log("✅ Dependency installation successful");
    } catch (error) {
      console.error("❌ Error installing dependencies:", error.message);
      console.log('Please run "npm install" manually in the .cursor directory');
    }
  } else {
    console.log("✅ All dependencies installed and ready to use");
  }
}

console.log("📦 Dependency check complete");
