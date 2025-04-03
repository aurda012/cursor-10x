/**
 * Rule Loader Utility
 * Version: 1.0.0
 *
 * This module handles loading rule files (.mdc) for each agent
 * while preserving their raw content and providing only minimal parsing.
 * It focuses on making the complete rule content available to agents
 * rather than parsing into structured data.
 */

const fs = require("fs");
const path = require("path");

// Base directory for rule files
const RULES_DIR = path.resolve(__dirname, "..", "rules");

/**
 * Extract basic metadata from rule content (name, description, priority)
 * This provides a convenience but is not meant to be a full parser
 */
function parseMetadata(content) {
  try {
    const metadata = {};

    // Basic metadata extraction
    const nameMatch = content.match(/^# (.+?)$/m);
    if (nameMatch) metadata.name = nameMatch[1].trim();

    const descriptionMatch = content.match(/^## Description\s*\n\s*(.+?)$/m);
    if (descriptionMatch) metadata.description = descriptionMatch[1].trim();

    const priorityMatch = content.match(/^Priority: (.+?)$/m);
    if (priorityMatch) metadata.priority = priorityMatch[1].trim();

    return metadata;
  } catch (error) {
    console.error(`Error parsing rule metadata: ${error.message}`);
    return {};
  }
}

/**
 * Extract file references from rule content
 * This identifies referenced files using @file directives in the MDC format
 */
function extractFileReferences(content) {
  const references = [];
  try {
    // Match @file directives in the format @file:/path/to/file
    const fileRegex = /@file:(.+?)(?:\s|$)/g;
    let match;

    while ((match = fileRegex.exec(content)) !== null) {
      if (match[1] && !references.includes(match[1])) {
        references.push(match[1].trim());
      }
    }

    return references;
  } catch (error) {
    console.error(`Error extracting file references: ${error.message}`);
    return references;
  }
}

/**
 * Load a rule file and return its content with minimal metadata
 * Focuses on preserving the raw content rather than parsing it
 */
function loadRule(rulePath) {
  try {
    const absolutePath = path.isAbsolute(rulePath)
      ? rulePath
      : path.join(process.cwd(), rulePath);

    if (!fs.existsSync(absolutePath)) {
      console.error(`Rule file not found: ${absolutePath}`);
      return null;
    }

    // Read the complete file content
    const content = fs.readFileSync(absolutePath, "utf8");

    // Extract basic metadata for convenience
    const metadata = parseMetadata(content);

    // Extract file references
    const fileReferences = extractFileReferences(content);

    // Return the rule object with complete content
    return {
      path: absolutePath,
      content: content,
      metadata: metadata,
      fileReferences: fileReferences,
    };
  } catch (error) {
    console.error(`Error loading rule file ${rulePath}: ${error.message}`);
    return null;
  }
}

/**
 * Get the absolute path for a rule file
 * @param {string} ruleId - The rule ID or path
 * @returns {string} - The absolute path to the rule file
 */
function getRulePath(ruleId) {
  // Handle different rule ID formats
  if (ruleId.endsWith(".mdc")) {
    // Direct path to .mdc file
    if (ruleId.startsWith(".cursor/")) {
      return path.resolve(process.cwd(), ruleId);
    } else {
      return path.resolve(RULES_DIR, ruleId);
    }
  } else {
    // Rule ID without extension
    return path.resolve(RULES_DIR, `${ruleId}.mdc`);
  }
}

/**
 * Load referenced files from a rule
 * @param {Object} rule - The rule object containing fileReferences
 * @returns {Object} Object mapping file paths to their content
 */
function loadReferencedFiles(rule) {
  const referencedFiles = {};

  if (!rule || !rule.fileReferences || !Array.isArray(rule.fileReferences)) {
    return referencedFiles;
  }

  // Get the base directory of the rule file for relative paths
  const ruleDir = path.dirname(rule.path);

  rule.fileReferences.forEach((filePath) => {
    try {
      // Resolve path relative to the rule file if not absolute
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(ruleDir, filePath);

      if (fs.existsSync(absolutePath)) {
        referencedFiles[filePath] = {
          path: absolutePath,
          content: fs.readFileSync(absolutePath, "utf8"),
        };
      } else {
        console.warn(`Referenced file not found: ${absolutePath}`);
      }
    } catch (error) {
      console.error(
        `Error loading referenced file ${filePath}: ${error.message}`
      );
    }
  });

  return referencedFiles;
}

/**
 * Load all available rules in the rules directory
 * @returns {object} - Map of rule ID to rule data
 */
function loadAllRules() {
  try {
    const rules = {};

    // Check if rules directory exists
    if (!fs.existsSync(RULES_DIR)) {
      console.error(`Rules directory not found: ${RULES_DIR}`);
      return rules;
    }

    // Read all .mdc files in the rules directory
    const files = fs
      .readdirSync(RULES_DIR)
      .filter((file) => file.endsWith(".mdc"));

    files.forEach((file) => {
      const ruleId = file.replace(/\.mdc$/, "");
      const rulePath = path.join(RULES_DIR, file);
      const rule = loadRule(rulePath);

      if (rule) {
        rules[ruleId] = rule;
      }
    });

    return rules;
  } catch (error) {
    console.error(`Error loading rules: ${error.message}`);
    return {};
  }
}

// Export functions
module.exports = {
  loadRule,
  loadAllRules,
  getRulePath,
  loadReferencedFiles,
  parseMetadata,
  extractFileReferences,
};
