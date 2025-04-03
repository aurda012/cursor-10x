#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Path to the loader file
const loaderPath = path.join(__dirname, "..", "rules", "000-loader.mdc");

// Read the file content
fs.readFile(loaderPath, "utf8", (err, content) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Find the Agent System fallback section
  const agentSystemFallbackPattern =
    /\/\/ Agent System fallback[\s\S]+?agents: \{[\s\S]+?\},/;

  // Replacement with new agents
  const newAgentSystem = `// Agent System fallback
    if (!globalThis.AGENT_SYSTEM) {
      globalThis.AGENT_SYSTEM = {
        initialized: true,
        agents: {
          ea: { id: "ea", name: "Executive Architect", role: "Project orchestration and technical architecture design" },
          frontend: { id: "frontend", name: "Frontend Developer", role: "UI implementation and React component development" },
          backend: { id: "backend", name: "Backend Developer", role: "Server-side implementation and API development" },
          fullstack: { id: "fullstack", name: "Full-Stack Integrator", role: "System integration and workflow management" },
          cms: { id: "cms", name: "CMS Specialist", role: "Content management and CMS implementation" },
          data: { id: "data", name: "Data Engineer", role: "Data pipeline and storage management" },
          doc: { id: "doc", name: "Documentation Specialist", role: "Documentation and knowledge management" }
        },`;

  // Replace the section
  const updatedContent = content.replace(
    agentSystemFallbackPattern,
    newAgentSystem
  );

  // Also update the getRecommendedAgents function
  const recommendedAgentsPattern =
    /getRecommendedAgents: function\(task\) \{[\s\S]+?return matches;[\s\S]+?\},/;

  const newRecommendedAgents = `getRecommendedAgents: function(task) {
          // Simple keyword matching
          const taskLower = task.toLowerCase();
          const matches = [];
          
          if (taskLower.includes("plan") || taskLower.includes("project") || taskLower.includes("coordinate")) {
            matches.push("ea");
          }
          if (taskLower.includes("model") || taskLower.includes("analysis") || taskLower.includes("strategy")) {
            matches.push("ea");
          }
          if (taskLower.includes("data") || taskLower.includes("pipeline") || taskLower.includes("database")) {
            matches.push("data");
          }
          if (taskLower.includes("develop") || taskLower.includes("code") || taskLower.includes("implement")) {
            matches.push("frontend");
            matches.push("backend");
            matches.push("fullstack");
          }
          if (taskLower.includes("risk") || taskLower.includes("compliance") || taskLower.includes("security")) {
            matches.push("ea");
          }
          if (taskLower.includes("machine") || taskLower.includes("learning") || taskLower.includes("algorithm")) {
            matches.push("data");
          }
          if (taskLower.includes("document") || taskLower.includes("manual") || taskLower.includes("guide")) {
            matches.push("doc");
          }
          if (taskLower.includes("content") || taskLower.includes("cms") || taskLower.includes("website")) {
            matches.push("cms");
          }
          
          // Ensure at least one agent is recommended
          if (matches.length === 0) {
            matches.push("ea");
          }
          
          return matches;
        },`;

  // Apply the second replacement
  const finalContent = updatedContent.replace(
    recommendedAgentsPattern,
    newRecommendedAgents
  );

  // Write the updated content back to the file
  fs.writeFile(loaderPath, finalContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("Successfully updated agent configuration in", loaderPath);
  });
});
