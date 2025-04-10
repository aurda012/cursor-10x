# 10x Cursor with Cursor10x - Advanced AI Agent Memory & Task Management System

Cursor10x is a comprehensive suite of tools that enhances Claude's capabilities within the Cursor IDE, providing persistent memory across sessions, standardized task management, and enforced best practices through cursor rules.

<div align="center">
  
# 🚀 **ANNOUNCING CURSOR10X SYSTEM** 🚀

### Transform Your Development Process with AI-Powered Autonomous Systems

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Active">
  <img src="https://img.shields.io/badge/Version-1.0.1-blue" alt="Version 1.0.1">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</p>

<table align="center">
  <tr>
    <td align="center"><b>🧠 Memory System</b></td>
    <td align="center"><b>📋 Task Management</b></td>
    <td align="center"><b>🕛 Cursor Rules</b></td>
  </tr>
  <tr>
    <td align="center">Persistent context awareness</td>
    <td align="center">Guided implementation</td>
    <td align="center">For top efficiency</td>
  </tr>
</table>

### 🔥 **The Cursor10x Memory System is now part of the complete Cursor10x Platform!** 🔥

- **📋 Task Management System** - Guided implementation with step-by-step tasks
- **🔄 Autonomous Memory** - Context-aware AI that remembers your entire project
- **📊 Project Blueprints** - Complete technical architectures created for your specifications
- **📁 File/Folder Architecture** - Optimized project structure with best practices
- **📘 Implementation Guide** - Comprehensive documentation for all files and components
- **📝 Detailed Tasks** - Complete workflow from project initiation to completion

<p align="center">
  <a href="https://cursor10x.com" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit cursor10x.com</a>
</p>

<i>Generate complete project blueprints with file architecture, implementation guides, and full task sequences along with the entire Cursor10x system already implemented!</i>

</div>

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

## Memory System

### Architecture

The Cursor10x Memory System uses Turso Database for persistent storage of all memory data across sessions, organized into three main components:

1. **Short-Term Memory (STM)**
   - Recent messages and conversation history
   - Active files currently being worked on
   - Immediate conversation context

2. **Long-Term Memory (LTM)** 
   - Project milestones and achievements
   - Important decisions with reasoning
   - Technical requirements and specifications

3. **Episodic Memory**
   - Chronological sequences of events
   - Actions performed by users and the assistant
   - Temporal context for the project history

### Key Memory Tools

| Tool | Description |
|------|-------------|
| `mcp_cursor10x_initConversation` | Initializes a conversation, generating banner and context |
| `mcp_cursor10x_storeAssistantMessage` | Stores an assistant message in memory |
| `mcp_cursor10x_trackActiveFile` | Tracks file activity (viewing, editing) |
| `mcp_cursor10x_storeMilestone` | Records project achievements |
| `mcp_cursor10x_storeDecision` | Records important decisions with reasoning |
| `mcp_cursor10x_storeRequirement` | Documents project requirements |
| `mcp_cursor10x_recordEpisode` | Tracks chronological events |
| `mcp_cursor10x_checkHealth` | Verifies memory system functionality |
| `mcp_cursor10x_getMemoryStats` | Retrieves memory statistics |

### Memory Banner

Every conversation begins with a memory banner that provides context:

```
=== MEMORY SYSTEM STATUS ===
Active Files (3): 
- memory-system.js (edited 5 minutes ago)
- episodic-memory.js (viewed yesterday at 15:30)
- banner-system.js (created Monday at 09:45)

Recent Episodes:
- User requested implementation of episodic memory (10 minutes ago)
- Assistant created the episodic memory module (7 minutes ago)
- User asked for banner enhancement (2 minutes ago)

Memory Stats: 15 messages, 8 files, 12 episodes tracked

Key Project Context:
- Implementing comprehensive memory system (High importance)
- Memory data persistence required (Medium importance)
=== END STATUS ===
```

### Memory Rules Enforcement

The `.cursorrules` file enforces memory tools usage in every interaction:

```
## RULE 1: CONVERSATION INITIALIZATION
The FIRST action in EVERY response MUST be to initialize the conversation:
mcp_cursor10x_initConversation({content: "[user message]", importance: "[level]"})

## RULE 2: ASSISTANT MESSAGE STORAGE
EVERY assistant response containing important information MUST be stored:
mcp_cursor10x_storeAssistantMessage({content: "[response]", importance: "[level]"})
```

## Task Management

Cursor10x implements a structured task management system that standardizes how tasks are created, tracked, and completed.

### Task Structure

Tasks are stored in `tasks/tasks.json` and contain:

```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Implement User Authentication",
      "file": "src/auth/AuthService.js",
      "status": "pending",
      "prompt": "Create a service for handling user authentication using JWT..."
    }
  ],
  "metadata": {
    "totalTasks": 12,
    "pendingCount": 7,
    "completeCount": 4,
    "skippedCount": 1,
    "lastUpdated": "2025-04-10T08:11:33.803Z"
  }
}
```

### Task Workflow Process

The task workflow, enforced by cursor rules, follows these steps:

1. **Find Next Task**: Identify the next pending task or specific task by ID
2. **Mark as In-Progress**: Update status and metadata
3. **Review Project Context**: Read blueprint.md and related files
4. **Implement Task**: Follow instructions in the task prompt
5. **Mark as Complete**: Update status and metadata
6. **Notify Completion**: Provide summary of changes

### Task Rules Enforcement

```
## RULE 12: TASK WORKFLOW MANAGEMENT
ALWAYS follow the task workflow process when implementing tasks:

1. **Task Structure Validation**
   - Ensure tasks contain required fields: id, title, file, status, prompt
   - Tasks MUST be stored in tasks/tasks.json

2. **Task Status Management**
   - Update task status to "in-progress" when starting implementation
   - Update task status to "complete" when implementation is finished
   ...
```

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

Create `.cursor/mcp.json` in your project directory:

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

Copy and paste the contents of the `.cursorrules` file in your project root and paste it into your cursor settings rules Cursor Settings -> Rules -> User Rules

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