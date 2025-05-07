![DevContext - The Next Evolution in AI Development Context](https://i.postimg.cc/sghKLKf6/Dev-Context-banner.png)

<div align="center">
  
# 🚀 **Cursor10x is now DevContext** 🚀

### Cursor10x has evolved into DevContext - A more powerful, dedicated context system for developers

<table align="center">
  <tr>
    <td align="center"><b>🧠 Project-Centric</b></td>
    <td align="center"><b>📊 Relationship Graphs</b></td>
    <td align="center"><b>⚡ High Performance</b></td>
  </tr>
  <tr>
    <td align="center">One database per project</td>
    <td align="center">Intelligent code connections</td>
    <td align="center">Minimal resource needs</td>
  </tr>
</table>

### 🔥 **DevContext takes AI development to the next level** 🔥

**🔄 Continuous Context Awareness** - Sophisticated retrieval methods focusing on what matters
**📊 Structured Metadata** - From repository structure down to individual functions
**🧠 Adaptive Learning** - Continuously learns from and adapts to your development patterns
**🤖 Completely Autonomous** - Self-managing context system that works in the background
**📚 External Documentation** - Automatically retrieves and integrates relevant documentation
**📋 Workflow Integration** - Seamless task management workflow built-in

#### 👀 **Be on the lookout** 👀

The DevContext Project Generator is launching in the next couple days and will create a COMPLETE set up for your project to literally 10x your development workflow.

<p align="center">
  <a href="https://github.com/aurda012/devcontext" style="display: inline-block; background-color: rgba(40, 230, 210); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">Visit DevContext Repository</a>
</p>

<i>DevContext is a cutting-edge Model Context Protocol (MCP) server providing developers with continuous, project-centric context awareness that understands your codebase at a deeper level.</i>

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Memory System](#memory-system)
- [Task Management](#task-management)
- [Cursor Rules](#cursor-rules)
- [Installation](#installation)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

Cursor10x bridges the gap between stateless AI interactions and continuous development workflows by providing:

- **Persistent Memory**: Retains context across multiple sessions
- **Task Management**: Standardizes implementation of project tasks
- **Best Practices**: Enforces coding standards and workflows

The system uses the Model Context Protocol (MCP) to register tools that Claude can execute directly, creating a fully autonomous development assistant with memory and structured workflows.

> **Note:** This project is now deprecated in favor of [DevContext](https://github.com/aurda012/devcontext), which provides enhanced capabilities with more advanced context management.

## Memory System

The Cursor10x Memory System creates a persistent memory layer for AI assistants (specifically Claude), enabling them to retain and recall:

- Recent messages and conversation history
- Active files currently being worked on
- Important project milestones and decisions
- Technical requirements and specifications
- Chronological sequences of actions and events (episodes)
- Code snippets and structures from your codebase
- Semantically similar content based on vector embeddings
- Related code fragments through semantic similarity
- File structures with function and variable relationships

This memory system bridges the gap between stateless AI interactions and continuous development workflows, allowing for more productive and contextually aware assistance.

## System Architecture

The memory system is built on four core components:

1. **MCP Server**: Implements the Model Context Protocol to register tools and process requests
2. **Memory Database**: Uses Turso database for persistent storage across sessions
3. **Memory Subsystems**: Organizes memory into specialized systems with distinct purposes
4. **Vector Embeddings**: Transforms text and code into numerical representations for semantic search

### Memory Types

The system implements four complementary memory types:

1. **Short-Term Memory (STM)**

   - Stores recent messages and active files
   - Provides immediate context for current interactions
   - Automatically prioritizes by recency and importance

2. **Long-Term Memory (LTM)**

   - Stores permanent project information like milestones and decisions
   - Maintains architectural and design context
   - Preserves high-importance information indefinitely

3. **Episodic Memory**

   - Records chronological sequences of events
   - Maintains causal relationships between actions
   - Provides temporal context for project history

4. **Semantic Memory**
   - Stores vector embeddings of messages, files, and code snippets
   - Enables retrieval of content based on semantic similarity
   - Automatically indexes code structures for contextual retrieval
   - Tracks relationships between code components
   - Provides similarity-based search across the codebase

## Features

- **Persistent Context**: Maintains conversation and project context across multiple sessions
- **Importance-Based Storage**: Prioritizes information based on configurable importance levels
- **Multi-Dimensional Memory**: Combines short-term, long-term, episodic, and semantic memory systems
- **Comprehensive Retrieval**: Provides unified context from all memory subsystems
- **Health Monitoring**: Includes built-in diagnostics and status reporting
- **Banner Generation**: Creates informative context banners for conversation starts
- **Database Persistence**: Stores all memory data in Turso database with automatic schema creation
- **Vector Embeddings**: Creates numerical representations of text and code for similarity search
- **Code Indexing**: Automatically detects and indexes code structures (functions, classes, variables)
- **Semantic Search**: Finds related content based on meaning rather than exact text matches
- **Relevance Scoring**: Ranks context items by relevance to the current query
- **Code Structure Detection**: Identifies and extracts code components across multiple languages
- **Auto-Embedding Generation**: Automatically creates vector embeddings for indexed content
- **Cross-Reference Retrieval**: Finds related code across different files and components

## Cursor Rules

Cursor rules are enforced through two complementary systems:

1. **MDC (Markdown Configuration) Rules** - Stored in `.cursor/rules/` directory with `.mdc` extension
2. **Global `.cursorrules` File** - Contains ALWAYS rules that must be followed in every interaction

### MDC Rules Structure

Each `.mdc` file follows a standardized format:

```markdown
---
description: Clear, one-line description of what the rule enforces
globs: path/to/files/*.ext, other/path/**/*
alwaysApply: boolean
---

- **Main Points in Bold**
  - Sub-points with details
  - Examples and explanations
```

### Core Rule Categories

- **100-memory-system.mdc**: Core memory architecture
- **101-short-term-memory.mdc**: Message and file tracking
- **102-long-term-memory.mdc**: Milestone, decision, and requirement storage
- **103-episodic-memory.mdc**: Chronological event tracking
- **104-banner-system.mdc**: Memory banner display
- **105-memory-database.mdc**: Database operations
- **200-tasks-workflow.mdc**: Task management workflow

### Implementation Verification

A key rule ensures proper research before starting new implementations:

```
## RULE 11: IMPLEMENTATION VERIFICATION
ALWAYS check if similar or corresponding files/folders already exist:
1. Use search tools to scan the codebase for similar implementations
2. Check existing directory structure to identify appropriate locations
3. Review project documentation for mentions of similar functionality
4. Record findings before proceeding with implementation
```

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Turso database account

### Setup Steps

1. **Configure Turso Database:**

```bash
# Install Turso CLI
curl -sSfL https://get.turso.tech/install.sh | bash

# Login to Turso
turso auth login

# Create a database
turso db create cursor10x-mcp

# Get database URL and token
turso db show cursor10x-mcp --url
turso db tokens create cursor10x-mcp
```

Or you can visit [Turso](https://turso.tech/) and sign up and proceed to create the database and get proper credentials. The free plan will more than cover your project memory.

2. **Configure Cursor MCP:**

Update `.cursor/mcp.json` in your project directory with the database url and turso auth token:

```json
{
  "mcpServers": {
    "cursor10x-mcp": {
      "command": "npx",
      "args": ["cursor10x-mcp"],
      "enabled": true,
      "env": {
        "TURSO_DATABASE_URL": "your-turso-database-url",
        "TURSO_AUTH_TOKEN": "your-turso-auth-token"
      }
    }
  }
}
```

4. **Copy and Paste Cursor Rules:**

Download or copy and paste the .cursor/rules directory into your project. Next, copy and paste the contents of the `.cursorrules` file in your project root and paste it into your cursor settings rules Cursor Settings -> Rules -> User Rules. You can also copy and paste the `.cursorrules` file into your main directory as well.

## Examples

### Memory System in Action

**Example 1: Recalling a Previous Decision**

```
User: "What was our decision about authentication in this project?"

[Memory Banner Generated]
[Comprehensive Context Retrieved]
```

**Example 2: Implementing a New Task**

```
User: "What is the next task in our project?"

[Memory Banner Generated]
[Task Structure Retrieved]
```

## Troubleshooting

### Common Issues

1. **Memory System Not Responding**:

   - Ensure Turso database is running and accessible.
   - Check network connectivity to Turso.
   - Verify that the cursor rules are correctly configured.

2. **Task Management Errors**:

   - Ensure that the task structure is valid and follows the specified format.
   - Verify that the task workflow process is being followed correctly.

3. **Cursor Rules Enforcement**:
   - Ensure that the cursor rules are correctly implemented and enforced.
   - Verify that the cursor rules are being followed in every interaction.

### Debugging Steps

1. **Check Memory System Health**:

   - Use the `mcp_cursor10x_checkHealth` tool to verify memory system functionality.
   - If the system is not responding, check the logs for any errors or warnings.

2. **Review Task Workflow**:

   - Use the `mcp_cursor10x_getMemoryStats` tool to retrieve memory statistics.
   - If the task workflow is not working as expected, review the task structure and task rules.

3. **Verify Cursor Rules**:
   - Use the `mcp_cursor10x_checkHealth` tool to verify cursor rules enforcement.
   - If the cursor rules are not being followed, review the cursor rules and task rules.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
