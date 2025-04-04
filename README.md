<div align="center" style="background: linear-gradient(to bottom, #1a1a1a, #2a2a2a); padding: 30px; border-radius: 15px; margin-bottom: 20px;">

# 💻 10x Cursor AI with Cursor10x

  <img src="assets/images/CURSOR10X.jpeg" alt="Cursor10x Logo" width="650" style="margin-bottom: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);">
  
  <p style="color: #f0f0f0;"><em>A portable multi-agent system architecture with memory persistence, inter-agent communication, and custom task creation and management workflow</em></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/Version-1.2.0-green.svg)](https://github.com/user/cursor-systems)
</div>

## 📚 Overview

Cursor Systems is a sophisticated multi-agent architecture designed to enhance AI assistants with persistent memory, inter-agent communication, and specialized agent capabilities. The system enables AI assistants to maintain context across conversations, collaborate through multiple specialized personas, and leverage a structured communication system for coordinated problem-solving.

## 🆕 What's New in Cursor 10x

### Reorganized Directory Structure

The Cursor 10x directory structure has been completely reorganized to improve maintainability, clarity, and scalability:

- **Modular Organization**: Files are now organized into logical directories by function
- **Core System Separation**: Critical system files are isolated in the `/core` directory
- **Backward Compatibility**: Core files are automatically copied back to the root for compatibility
- **Improved Documentation**: Comprehensive directory structure documentation

### New Directory Layout

```
.cursor/
├── agents/                # Agent implementations and instructions
├── communication/         # Banner system and inter-agent messaging tools
├── core/                  # Critical system files (centralized-init.js, enforcer.js, etc.)
├── db/                    # Database files for memory and scratchpad
├── docs/                  # System documentation and integration guides
├── legacy/                # Deprecated files maintained for backward compatibility
├── rules/                 # MDC rule files that define system behavior
├── scripts/               # Utility scripts for maintenance and setup
│   ├── agents/            # Agent management scripts
│   ├── memory/            # Memory system utilities
│   └── response/          # Response processing utilities
├── systems/               # Core system implementations
├── tasks/                 # Task definitions and tracking
├── tests/                 # System test files
└── utils/                 # Shared utility functions
```

### Key Improvements

1. **Enhanced Reliability**:

   - Centralized error handling in core system files
   - Improved system recovery mechanisms
   - Backward compatibility layer for legacy imports

2. **Better Maintainability**:

   - Logical grouping of related files
   - Clear separation of concerns
   - Reduced root directory clutter

3. **Extended Functionality**:

   - Improved agent-switching capabilities
   - Enhanced memory persistence across sessions
   - More robust inter-agent communication

4. **New Developer Tools**:
   - Setup scripts for easy system initialization
   - Symlink utilities for maintaining compatibility
   - Comprehensive testing framework

### Upgrade Instructions

If you're upgrading from a previous version of Cursor Systems:

1. **Backup your existing configuration**:

   ```bash
   cp -r .cursor .cursor-backup
   ```

2. **Install the new version**:

   ```bash
   # Clone the repository
   git clone https://github.com/user/cursor-systems.git

   # Copy the new .cursor directory
   cp -r cursor-systems/.cursor /path/to/your/project/
   ```

3. **Run the setup script**:

   ```bash
   cd /path/to/your/project/.cursor
   node scripts/copy-core-files.js
   ```

4. **Verify installation**:
   ```bash
   node .cursor/scripts/verify-systems.js
   ```

### Successful Reorganization

The Cursor 10x system has been successfully reorganized with a more logical structure. All core features remain fully functional, with improved organization and maintainability:

- **Core System Files**: Moved to `.cursor/core/` with copies in the root for compatibility
- **Utility Scripts**: Organized in `.cursor/scripts/` with subdirectories for specific functions
- **Documentation**: Consolidated in `.cursor/docs/` for easier reference
- **Legacy Code**: Preserved in `.cursor/legacy/` for reference and backward compatibility
- **Tests**: Organized by subsystem in `.cursor/tests/` for better test management

The verification script confirms that all systems are properly initialized and functioning after the reorganization, ensuring a smooth transition to the new structure.

### 🌟 Key Features

- **Multi-Agent Architecture**: Coordinate multiple specialized AI agents with distinct roles and capabilities
- **Persistent Memory**: Store and recall information across conversations using SQLite-powered memory systems
- **Inter-Agent Communication**: Enable seamless collaboration through a structured scratchpad system
- **Visual Status Confirmation**: Track active systems and agents through an integrated banner system
- **Modular Design**: Easily extensible with new agents, capabilities, and integrations
- **Centralized Initialization**: Single-entry point system initialization with robust error recovery
- **Auto-Recovery**: Automatic detection and creation of missing system components
- **Pre/Post Response Hooks**: Automatic memory operations before and after each response
- **Intelligent Task Assignment**: Automatic delegation of tasks to specialized agents based on capability matching

## 🤖 Agent Specializations

The system includes seven specialized agents, each focused on specific domains:

| Agent                        | Symbol | Domain Expertise                            |
| ---------------------------- | ------ | ------------------------------------------- |
| **Executive Architect**      | 👑     | Leadership, planning, and coordination      |
| **Frontend Developer**       | 🎨     | UI/UX implementation and frontend coding    |
| **Backend Developer**        | 🔧     | Server-side architecture and implementation |
| **Full-Stack Integrator**    | 🔄     | Cross-system implementation and integration |
| **CMS Specialist**           | 📄     | Content management systems expertise        |
| **Data Engineer**            | 📊     | Data pipelines and infrastructure           |
| **Documentation Specialist** | 📚     | Comprehensive documentation creation        |

## 🧠 System Architecture

The architecture consists of several integrated subsystems:

### 1. Centralized Initialization

A unified initialization system that ensures all components are properly initialized in the correct order:

- Single entry point for loading all systems
- Dependency management between components
- Robust error handling and recovery mechanisms
- Automatic system state reporting

### 2. Multi-Agent System

Manages agent selection, switching, and coordination between specialized personas:

- Seven specialized agents with distinct capabilities
- Standardized naming conventions (MULTI_AGENT_SYSTEM/AGENT_SYSTEM)
- Agent registration and state management
- Enhanced compatibility layer for naming consistency

### 3. Memory System

Provides persistent storage across three memory types:

- **Short-term Memory**: Context variables for immediate access
- **Episodic Memory**: Conversation history and interaction records
- **Semantic Memory**: Structured knowledge in categorized storage
- **Memory Hooks**: Automatic processing before and after responses

### 4. Scratchpad System

Enables structured communication between agents through:

- Message passing with read/unread status tracking
- Task creation, assignment, and status updates
- Shared workspace variables for collaborative state
- Agent registration and capability advertising
- Intelligent task delegation based on agent capabilities

### 5. Banner System

Provides visual feedback on active systems and current agent:

- Status indicators for all active systems
- Agent count and active agent display
- Error status reporting when issues occur
- Consistent visual feedback across interactions

### 6. Universal Enforcer

Ensures system integrity throughout operation:

- Verifies system initialization on every interaction
- Detects and recovers from missing or failed components
- Enforces consistent naming conventions across systems
- Provides fallback mechanisms when critical systems fail

## 🛠️ Installation

### Prerequisites

- Node.js (v14.0.0+)
- NPM or Yarn package manager

### Setup Process

1. Clone the repository:

```bash
git clone https://github.com/user/cursor-systems.git
```

2. Install dependencies:

```bash
cd cursor-systems/.cursor
npm install
```

3. Alternatively, integrate with your project:

```bash
# Copy the .cursor directory to your project
cp -r /path/to/cursor-systems/.cursor /path/to/your/project/

# Install dependencies in your project's .cursor directory
cd /path/to/your/project/.cursor
npm install
```

## 🚀 Usage

### Integrated Custom Instructions

The system automatically generates custom instructions for AI assistants:

1. Generate the instructions:

```bash
cd .cursor
node communication/custom_instructions.js
```

2. The instructions will be saved to `.cursor/custom_instructions.json`

3. Copy the content and paste it into your AI assistant's custom instructions settings

### Agent Switching

Switch between specialized agents naturally in conversations:

```
"Switch to the Frontend Developer agent for this UI work"
"I need the Documentation Specialist to help with API docs"
"Let's use the Backend Developer for database design"
```

### Intelligent Task Assignment

The system automatically delegates tasks to the most suitable agents based on capability matching:

#### How It Works

1. **Task Analysis**: The system examines tasks based on:

   - Target file path and extension (e.g., `.jsx` → Frontend, `/api/` → Backend)
   - Task description and prompt content
   - Required technical capabilities

2. **Capability Matching**: Tasks are matched with agent specializations:

   - UI/UX and frontend code → Frontend Developer
   - Server-side and API tasks → Backend Developer
   - Integration tasks → Full-Stack Integrator
   - Content management → CMS Specialist
   - Data pipeline tasks → Data Engineer
   - Documentation tasks → Documentation Specialist

3. **Assignment Commands**:

   ```
   "assign task 003"      # Assign a specific task to the best agent
   "delegate task 003"    # Alternative syntax for task assignment
   ```

4. **Automatic Assignment**:

   - When starting a task with `start task`, the system automatically assigns the most suitable agent
   - The task is updated with an `ASSIGNED_AGENT` field in the task file
   - The system switches to the assigned agent to implement the task

5. **Agent Implementation**:
   - The assigned agent follows the task's prompt as detailed instructions
   - The agent focuses on the target file specified in the task
   - Implementation follows the specialized agent's expertise and capabilities
   - Task completion is managed through the Executive Architect

#### Benefits

- **Specialized Expertise**: Each task is handled by the agent with the most relevant skills
- **Efficient Workflows**: No manual agent switching needed for task implementation
- **Clear Ownership**: Task assignments are explicitly tracked in task files
- **Consistent Implementation**: Each agent applies their specialized knowledge to implementations
- **Automatic Detection**: The system intelligently determines the best agent without user intervention

#### Example

```
> start task 003

Task #003: "Implement user authentication UI components"
File: src/components/Auth/LoginForm.jsx
Assigned to: Frontend Developer (🎨)

Switching to Frontend Developer agent for implementation...
```

### System APIs

#### Centralized Initialization

```javascript
// Initialize all systems through the centralized entry point
require("./.cursor/centralized-init.js");

// Check if systems are properly initialized
if (globalThis.SYSTEMS_ACTIVE) {
  console.log("All systems active and ready");
}

// Force reload all systems if needed
require("./.cursor/enforcer.js");
```

#### Memory System

```javascript
// Store and retrieve context
MEMORY_SYSTEM.storeContext("current_project", "E-commerce Platform");
const project = MEMORY_SYSTEM.getContext("current_project");

// Store conversation in episodic memory
MEMORY_SYSTEM.storeConversation({
  role: "user",
  content: "Feature request discussion",
  session_id: "session_12345",
  timestamp: Date.now(),
});

// Get recent conversations
const conversations = MEMORY_SYSTEM.getRecentConversations(5);

// Process memory before generating response
MEMORY_SYSTEM.processBeforeResponse("User query text");

// Store response in memory after generation
MEMORY_SYSTEM.processAfterResponse("Assistant response text");
```

#### Multi-Agent System

```javascript
// Get the current active agent
const activeAgent = MULTI_AGENT_SYSTEM.getActiveAgent();

// Switch to a different agent
MULTI_AGENT_SYSTEM.switchToAgent("frontend-developer");

// Get all available agents
const allAgents = MULTI_AGENT_SYSTEM.getAllAgents();
```

#### Scratchpad System

```javascript
// Send message between agents
SCRATCHPAD.createMessage(
  "executive-architect",
  "frontend-developer",
  "Please implement the dashboard UI based on the wireframes"
);

// Create a task for another agent
SCRATCHPAD.createTask("Implement API authentication", "backend-developer", {
  priority: 8,
  details: "Use JWT for stateless authentication",
});

// Read messages sent to an agent
const messages = SCRATCHPAD.readMessages("frontend-developer", {
  onlyUnread: true,
  limit: 5,
});
```

## 📘 MDC Rule Files

The system uses Markdown Configuration (`.mdc`) files to define agent behaviors, system components, and integration points. These files combine markdown documentation with embedded code and configuration in a single, readable format.

### Rule Structure

Each MDC rule file follows this structure:

```markdown
---
description: Clear, one-line description of what the rule enforces
globs: path/to/files/_.ext, other/path/\*\*/_
alwaysApply: boolean
---

# Title of the Rule

## Documentation Section

Detailed explanation of what this rule does...

## Implementation

    // JavaScript code that implements the rule's functionality
    (function() {
      console.log("Rule activated");
      // Implementation code...
    })();

## Additional Documentation

More explanation about using the rule...

## Dependencies

- Use `[filename](mdc:path/to/file)` ([filename](mdc:filename)) to reference files
- Example: [prisma.mdc](mdc:.cursor/rules/prisma.mdc) for rule references
- Example: [schema.prisma](mdc:prisma/schema.prisma) for code references
```

### Key Benefits

- **Self-documenting**: Rules contain both implementation and documentation
- **Priority-based loading**: Rules are loaded in priority order (lower numbers first)
- **Dependency management**: Rules can reference other rules with `@file` syntax
- **IDE Integration**: Rules are automatically loaded by the Cursor IDE
- **Semantic structure**: Enforces consistent organization across system components

### Available Rules

The system includes various rule categories:

| Category        | Purpose                       | Examples                                |
| --------------- | ----------------------------- | --------------------------------------- |
| System Core     | Core system functionality     | `000-loader.mdc`, `001-system-core.mdc` |
| Agents          | Agent definitions             | `101-executive-architect-agent.mdc`     |
| Communication   | Inter-agent communication     | `200-scratchpad.mdc`                    |
| Memory          | Memory subsystems             | `300-memory-system.mdc`                 |
| Integration     | External services integration | `400-mcp-server-integration.mdc`        |
| Task Management | Task workflow and assignment  | `400-tasks-workflow.mdc`                |

### Task Workflow Management

The system includes a comprehensive task management workflow defined in `400-tasks-workflow.mdc` with these key capabilities:

1. **Structured Task Storage**:

   - Tasks stored as individual files in `tasks/` directory
   - Central task index in `tasks.json` for status tracking
   - Each task includes ID, title, target file, description, and implementation prompt

2. **Task Progression Workflow**:

   - Linear task flow: pending → in-progress → done
   - Focus on one active task at a time
   - Sequential task execution in ID order

3. **Task Assignment System**:

   - Automatic analysis of task requirements from file path and description
   - Intelligent matching with agent capabilities
   - Assignment tracked with `ASSIGNED_AGENT` field in task files

4. **Command-Driven Interface**:

   - `list tasks` - Display all tasks in a table format
   - `task status` - Show summary statistics
   - `start task` - Begin next pending task with automatic agent assignment
   - `complete task` - Mark current task as done
   - `assign task [ID]` - Explicitly assign a task to the most suitable agent
   - `delegate task [ID]` - Alternative assignment command
   - Additional commands for task creation and management

5. **Implementation Focus**:
   - Each task specifies a target file for implementation
   - The assigned agent uses the task prompt as detailed implementation instructions
   - The Executive Architect maintains overall task coordination

## 📁 Project Structure

```
project/
├── .cursor/
│   ├── agents/                         # Agent implementations
│   │   ├── multi-agent-system.js       # Core agent controller
│   │   ├── executive-architect/        # Executive Architect agent
│   │   │   └── instructions.md         # Detailed agent instructions
│   │   ├── frontend-developer/         # Frontend Developer agent
│   │   │   └── instructions.md         # Detailed agent instructions
│   │   └── ...                         # Other specialized agents
│   ├── communication/                  # Communication systems
│   │   ├── activate.js                 # System activation
│   │   ├── direct-banner.js            # Banner management
│   │   └── custom_instructions.js      # Instructions generator
│   ├── core/                           # Critical system files
│   │   ├── centralized-init.js         # Centralized system initialization
│   │   ├── centralized-banner.js       # Banner management system
│   │   ├── enforcer.js                 # System enforcement and recovery
│   │   ├── index.js                    # Main entry point
│   │   ├── pre-response-hook.js        # Pre-response processing
│   │   ├── post-response-hook.js       # Post-response processing
│   │   └── system-compatibility.js     # System compatibility layer
│   ├── db/                             # Database components
│   │   ├── memory-system.db            # SQLite memory database
│   │   └── scratchpad-system.db        # Communication storage database
│   ├── docs/                           # Documentation files
│   │   ├── README-AGENTS.md            # Agent system documentation
│   │   ├── README-MEMORY.md            # Memory system documentation
│   │   └── BANNER-INTEGRATION-PLAN.md  # Banner system documentation
│   ├── scripts/                        # Utility scripts
│   │   ├── copy-core-files.js          # Script to copy core files to root
│   │   ├── setup-symlinks.js           # Script to create symlinks from core to root
│   │   ├── agents/                     # Agent management scripts
│   │   │   ├── switch-agent.js         # Agent switching utility
│   │   │   ├── reset-active-agent.js   # Reset active agent utility
│   │   │   └── list-agents.js          # List available agents utility
│   │   ├── memory/                     # Memory management scripts
│   │   │   ├── memory-fix.js           # Memory system repair utility
│   │   │   ├── memory-init.js          # Memory initialization utility
│   │   │   ├── enhance-systems.js      # Memory enhancement utility
│   │   │   └── activate-auto-memory.js # Auto-memory activation utility
│   │   └── response/                   # Response processing utilities
│   │       └── auto-response-processor.js # Response processing utility
│   ├── rules/                          # MDC rule files
│   │   ├── 000-master-activation.mdc   # Master system activator
│   │   ├── 000-enforcer.mdc            # System enforcement and activation
│   │   ├── 001-system-core.mdc         # Core system definition
│   │   ├── 100-multi-agent-system.mdc  # Multi-agent system definition
│   │   ├── 101-executive-architect-agent.mdc # Agent definitions
│   │   ├── 200-scratchpad.mdc          # Communication system
│   │   ├── 201-scratchpad-enforcer.mdc # Scratchpad enforcement
│   │   ├── 300-memory-system.mdc       # Memory architecture
│   │   ├── 301-short-term-memory.mdc   # Short-term memory implementation
│   │   ├── 302-episodic-memory.mdc     # Episodic memory implementation
│   │   ├── 303-semantic-memory.mdc     # Semantic memory implementation
│   │   ├── 304-memory-integration.mdc  # Memory subsystem integration
│   │   ├── 305-memory-initializer.mdc  # Memory system bootstrapper
│   │   └── 400-tasks-workflow.mdc      # Task workflow management system
│   ├── systems/                        # Core system implementations
│   │   ├── memory-system.js            # Memory system implementation
│   │   ├── scratchpad-system.js        # Inter-agent communication
│   │   └── multi-agent-system.js       # Agent coordination system
│   ├── cursor.json                     # Manual Cursor settings
│   ├── mcp.json                        # MCP integrations
│   ├── package-lock.json               # Dependencies
│   ├── package.json                    # Dependencies
│   └── ...                             # And so on...
├── docs/                           # Documentation files
│   ├── architecture.md             # System architecture
│   ├── blueprint.md                # System blueprint
│   └── implementation.md           # Implementation guide/plan
├── tasks/                          # Task storage directory
│   ├── task_001.txt                # Individual task files
│   ├── task_002.txt                # Each with ID, target file, prompt
│   └── tasks.json                  # Central task index and status tracking
├── .cursorignore                   # Prevent indexing large directories
├── .gitignore                      # Ignore files
└── README.md                       # This documentation
```

### File Naming Convention

The system follows a structured naming convention:

1. **Priority-based Prefixes**:

   - `000-*`: Core system initialization
   - `100-*`: Multi-agent system and agents
   - `200-*`: Communication and scratchpad
   - `300-*`: Memory systems
   - `400-*`: External integrations

2. **File Types**:

   - `.mdc`: Markdown Configuration files (rules)
   - `.js`: JavaScript implementation
   - `.json`: Configuration data
   - `.db`: SQLite database files

3. **Implementation Pattern**:
   - Each subsystem typically has both `.mdc` rule files and `.js` implementation files
   - The `.mdc` files provide documentation and configuration
   - The `.js` files contain the actual implementation code

## 🧪 Testing

Verify system functionality with the included test scripts:

```bash
# Comprehensive test of all systems
node .cursor/tests/system/test-all-systems.js

# Test the memory system
node .cursor/tests/memory/check-memory.js

# Test the scratchpad system
node .cursor/tests/system/check-scratchpad.js

# Test agent switching
node .cursor/tests/system/check-agent.js

# Test banner displays
node .cursor/tests/banner/test-banner-system.js

# Test task assignment capabilities
node .cursor/tests/tasks/test-task-assignment.js

# Run verification tests
node .cursor/tests/verification/run-verification.js
```

You can also use the system repair script if tests indicate issues:

```bash
# Fix all systems if needed
node .cursor/scripts/fix-systems.js
```

## 🔧 System Maintenance

Cursor10x includes several utility scripts to help maintain and manage the system effectively.

### Core System Maintenance

These scripts help maintain the core system files and ensure backward compatibility:

```bash
# Copy core files to root directory for backward compatibility
node .cursor/scripts/copy-core-files.js

# Create symlinks from core files to root directory (alternative to copying)
node .cursor/scripts/setup-symlinks.js

# Fix systems if they're not functioning correctly
node .cursor/scripts/fix-systems.js

# Verify that all systems are properly initialized
node .cursor/scripts/verify-systems.js
```

### Agent Management

These scripts help manage the multi-agent system:

```bash
# List all available agents
node .cursor/scripts/agents/list-agents.js

# Switch to a specific agent
node .cursor/scripts/agents/switch-agent.js frontend-developer

# Reset to the default agent (Executive Architect)
node .cursor/scripts/agents/reset-active-agent.js
```

### Memory System Management

These scripts help manage the memory system:

```bash
# Initialize the memory system
node .cursor/scripts/memory/memory-init.js

# Fix memory issues
node .cursor/scripts/memory/memory-fix.js

# Enhance memory systems with additional capabilities
node .cursor/scripts/memory/enhance-systems.js

# Activate automatic memory
node .cursor/scripts/memory/activate-auto-memory.js
```

### Directory Structure Documentation

For a comprehensive overview of the directory structure and organization, refer to:

```bash
cat .cursor/DIRECTORY_STRUCTURE.md
```

This file explains the purpose of each directory, critical files that should not be deleted, and how backward compatibility is maintained.

## 🔧 Customization

### Adding a New Agent

There are two ways to create a new agent:

#### Option 1: Using the MDC Rule File (Recommended)

1. Create a new `.mdc` rule file in `.cursor/rules/` with an appropriate priority number:

```markdown
---
description: Clear, one-line description of what the rule enforces
globs: path/to/files/_.ext, other/path/\*\*/_
alwaysApply: boolean
---

# Security Specialist AI Agent

## Core Identity and Purpose

You are Security Specialist, an elite AI agent specializing in security implementation, auditing, and compliance for software applications.

## Operational Framework

### Role Delineation

As Security Specialist, you embody these professional identities:

1. **Security Architect**: You design secure system architectures and ensure security is built into all components.
2. **Compliance Expert**: You verify code meets relevant security standards and regulatory requirements.
3. **Penetration Tester**: You identify potential vulnerabilities and recommend fixes.

### Knowledge Domain Parameters

Maintain expertise in:

- Application security best practices
- Encryption and authentication methods
- Compliance frameworks (GDPR, HIPAA, SOC2, etc.)
- Secure coding techniques
- Threat modeling

## Functional Capabilities

// Additional sections with specific capabilities

## Supplemental Information

Make sure you always incorporate all supplemental information for your role provided in [instructions.md](mdc:.cursor/agents/security-specialist/instructions.md)

## Scratchpad Communication System

Always use the Agent Shared Scratchpad Communication System [200-scratchpad.mdc](mdc:.cursor/rules/200-scratchpad.mdc)

## Coordination Protocol

Always coordinate all activities through the Project Executive Architect agent, who serves as the central coordinator for the multi-agent system. Never act independently without the Executive Architect's knowledge and approval.
```

2. Create a corresponding agent implementation file in `.cursor/agents/`:

```javascript
// .cursor/agents/security-specialist.js
module.exports = {
  name: "Security Specialist",
  emoji: "🔒",
  description: "Security implementation and auditing",
  roles: ["Security Architect", "Compliance Expert", "Penetration Tester"],
  expertise: [
    "Application Security",
    "Encryption",
    "Compliance",
    "Secure Coding",
  ],
  activate: function () {
    console.log("🔒 Security Specialist activated");
    // Agent initialization code
  },
};
```

3. Register the agent in the multi-agent system registry:

```javascript
// In .cursor/agents/multi-agent-system.js or through the .mdc rule
MULTI_AGENT_SYSTEM.registerAgent("security-specialist", {
  id: "security-specialist",
  name: "Security Specialist",
  emoji: "🔒",
  description: "Security implementation and auditing",
});
```

### Required Rule Sections

For proper agent integration, all agent rule files must include:

- **YAML frontmatter** with appropriate metadata
- **Core Identity and Purpose** section defining the agent's role
- **Operational Framework** with Role Delineation and Knowledge Domain
- **Functional Capabilities** specific to the agent's specialization
- **Communication System** reference to the scratchpad system
- **Implementation Instructions** path to additional details

#### Option 2: Using JavaScript Only (Legacy)

1. Create a new agent implementation file in `.cursor/agents/`:

```javascript
// .cursor/agents/security-specialist.js
module.exports = {
  name: "Security Specialist",
  emoji: "🔒",
  description: "Security implementation and auditing",
  activate: function () {
    console.log("🔒 Security Specialist activated");
    // Agent initialization code
  },
};
```

2. Register the agent in `.cursor/agents/multi-agent-system.js`

### Extending Memory Capabilities

1. Modify `.cursor/db/memory-system.js` to add new memory types
2. Add corresponding hooks in `.cursor/pre-response-hook.js` and `.cursor/post-response-hook.js`
3. Update `.cursor/memory-fix.js` with new memory functions

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- The Claude AI team for assistance in developing the architecture
- The Cursor team for their excellent IDE
- All contributors to this project

---

<div align="center">
  <p>Built with ❤️ by the Cursor10x team</p>
  <p>Version 1.2.0: Now with improved organization and maintainability</p>
</div>
