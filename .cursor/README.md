# Cursor Systems

<div align="center">
  <p><em>A portable multi-agent system architecture with memory persistence and inter-agent communication</em></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)](https://github.com/user/cursor-systems)
</div>

## 📚 Overview

Cursor Systems is a sophisticated multi-agent architecture designed to enhance AI assistants with persistent memory, inter-agent communication, and specialized agent capabilities. The system enables AI assistants to maintain context across conversations, collaborate through multiple specialized personas, and leverage a structured communication system for coordinated problem-solving.

### 🌟 Key Features

- **Multi-Agent Architecture**: Coordinate multiple specialized AI agents with distinct roles and capabilities
- **Persistent Memory**: Store and recall information across conversations using SQLite-powered memory systems
- **Inter-Agent Communication**: Enable seamless collaboration through a structured scratchpad system
- **Visual Status Confirmation**: Track active systems and agents through an integrated banner system
- **Modular Design**: Easily extensible with new agents, capabilities, and integrations

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

The architecture consists of four primary subsystems:

### 1. Multi-Agent System

Manages agent selection, switching, and coordination between specialized personas.

### 2. Memory System

Provides persistent storage across three memory types:

- **Short-term Memory**: Context variables for immediate access
- **Episodic Memory**: Conversation history and interaction records
- **Semantic Memory**: Structured knowledge in categorized storage

### 3. Scratchpad System

Enables structured communication between agents through:

- Message passing with read/unread status tracking
- Task creation, assignment, and status updates
- Shared workspace variables for collaborative state
- Agent registration and capability advertising

### 4. Banner System

Provides visual feedback on active systems and current agent.

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

### System APIs

#### Multi-Agent System

```javascript
// Get the current active agent
const activeAgent = MULTI_AGENT_SYSTEM.getActiveAgent();

// Switch to a different agent
MULTI_AGENT_SYSTEM.switchToAgent("frontend-developer");

// Get all available agents
const allAgents = MULTI_AGENT_SYSTEM.getAllAgents();
```

#### Memory System

```javascript
// Store and retrieve context
MEMORY_SYSTEM.storeContext("current_project", "E-commerce Platform");
const project = MEMORY_SYSTEM.getContext("current_project");

// Store episodic memory
MEMORY_SYSTEM.storeEpisode("user_request", "Feature request discussion", {
  importance: 2,
  metadata: { category: "requirements" },
});

// Retrieve semantic knowledge
const apiDocs = MEMORY_SYSTEM.getKnowledge("documentation", "api_endpoints");
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
name: "Rule Name"
description: "Brief description of the rule's purpose"
version: "1.0.0"
priority: 123 # Determines loading order
date: "2025-04-01"
author: "Author Name"
category: "agent|system|memory|etc"
tags: ["tag1", "tag2", "tag3"]
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

@file .cursor/path/to/dependency.mdc # Reference to other rule files
```

### Key Benefits

- **Self-documenting**: Rules contain both implementation and documentation
- **Priority-based loading**: Rules are loaded in priority order (lower numbers first)
- **Dependency management**: Rules can reference other rules with `@file` syntax
- **IDE Integration**: Rules are automatically loaded by the Cursor IDE
- **Semantic structure**: Enforces consistent organization across system components

### Available Rules

The system includes various rule categories:

| Category      | Purpose                       | Examples                                |
| ------------- | ----------------------------- | --------------------------------------- |
| System Core   | Core system functionality     | `000-loader.mdc`, `001-system-core.mdc` |
| Agents        | Agent definitions             | `101-executive-architect-agent.mdc`     |
| Communication | Inter-agent communication     | `200-scratchpad.mdc`                    |
| Memory        | Memory subsystems             | `300-memory-system.mdc`                 |
| Integration   | External services integration | `400-mcp-server-integration.mdc`        |

## 📁 Project Structure

```

.cursor/
├── agents/ # Agent implementations
│ ├── multi-agent-system.js # Core agent controller
│ ├── executive-architect.js # Leadership agent
│ ├── frontend-developer.js # UI/UX specialist
│ └── ... # Other specialized agents
├── communication/ # Communication systems
│ ├── activate.js # System activation
│ ├── direct-banner.js # Banner management
│ └── custom_instructions.js # Instructions generator
├── db/ # Database components
│ ├── memory-system.js # SQLite memory implementation
│ └── scratchpad-system.js # Communication storage
├── memory-hooks/ # Memory interaction components
│ ├── conversation-capture.js # Message recording
│ ├── context-retrieval.js # Context access
│ └── auto-memory-system.js # Automatic memory integration
├── rules/ # MDC rule files
│ ├── 000-loader.mdc # System loader and initialization
│ ├── 000-enforcer.mdc # System enforcement and activation
│ ├── 100-multi-agent-system.mdc # Multi-agent system definition
│ ├── 101-executive-architect-agent.mdc # Agent definitions
│ ├── 200-scratchpad.mdc # Communication system
│ ├── 300-memory-system.mdc # Memory architecture
│ └── 400-\*.mdc # Integration modules
├── systems/ # Core system implementations
│ ├── memory-system.js # Memory system implementation
│ ├── memory-initializer.js # Memory system bootstrapper
│ ├── multi-agent-system.js # Agent coordination system
│ └── scratchpad-system.js # Inter-agent communication
├── package.json # Dependencies
└── README.md # This documentation

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

3. **Implementation Pattern**:
   - Each subsystem typically has both `.mdc` rule files and `.js` implementation files
   - The `.mdc` files provide documentation and configuration
   - The `.js` files contain the actual implementation code

## 🧪 Testing

Verify system functionality with the included test scripts:

```bash
# Test the memory system
node .cursor/check-memory.js

# Test the scratchpad system
node .cursor/check-scratchpad.js

# Test agent switching
node .cursor/check-agent.js

# Test banner displays
node .cursor/test-banner-system.js

# Fix system banners if needed
node .cursor/fix-banners.js
```

## 🔧 Customization

### Adding a New Agent

There are two ways to create a new agent:

#### Option 1: Using the MDC Rule File (Recommended)

1. Create a new `.mdc` rule file in `.cursor/rules/` with an appropriate priority number:

```markdown
---
name: "Security Specialist Agent"
description: "Core rules and capabilities for the Security Specialist agent focusing on secure implementation"
version: "1.0.0"
priority: 108
date: "2025-04-01"
author: "Your Name"
category: "agent"
tags: ["security", "penetration-testing", "compliance", "encryption"]
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

## Implementation Instructions

Make sure you always follow the detailed implementation instructions and incorporate all supplemental data provided therein.

@file .cursor/agents/security-specialist/instructions.md

## Communication System

Always use the Agent Shared Scratchpad Communication System with the following specifications:

@file .cursor/rules/200-scratchpad.mdc
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

### Using Existing Rules as Templates

When creating a new agent, you can reference existing rule files as templates:

1. **View existing agent rules** in the `.cursor/rules/` directory (e.g., `101-executive-architect-agent.mdc`)
2. **Use the `fetch_rules` tool** in Cursor to retrieve a specific rule structure:
   ```
   // Example: Fetch the Frontend Developer agent rule as reference
   fetch_rules("102-frontend-developer-agent")
   ```
3. **Copy and adapt** the structure, replacing agent-specific details
4. **Maintain consistency** with existing agent structure for seamless integration
5. **Reference common subsystems** like the scratchpad and memory systems using the `@file` syntax

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

Modify `.cursor/db/memory-system.js` to add new memory types or enhance existing ones.

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
  <p>Built with ❤️ by the Cursor Systems team</p>
</div>

# Cursor System Architecture

## Initialization

The system uses a centralized initialization approach with the following components:

### Core Files

- **`centralized-init.js`**: The SINGLE source of truth for system initialization
- **`enforcer.js`**: Fallback safety mechanism that delegates to `centralized-init.js`
- **`init.js`**: Entry point that delegates to `centralized-init.js`

### System Components

- **Memory System** (`systems/memory-system.js`): Short-term, episodic, and semantic memory
- **Scratchpad System** (`systems/scratchpad-system.js`): Agent communication
- **Multi-Agent System** (`systems/multi-agent-system.js`): Agent coordination and switching
- **Banner System** (`communication/direct-banner.js`): Status display

## Initialization Flow

1. The system is initialized through one of these entry points:

   - Claude loading `.cursor/init.js`
   - Rule loading `.cursor/enforcer.js`
   - MDC rule inline JavaScript trying to initialize systems

2. All entry points delegate to the centralized `centralized-init.js`, which:
   - Initializes each system in a specific order
   - Performs verification tests to ensure proper functionality
   - Sets accurate status banners based on test results
   - Creates fallback implementations if system files fail to load

## Banners

Status banners are generated based on actual runtime tests:

```
🧠 [MEMORY SYSTEM: ACTIVE]
💬 [SCRATCHPAD SYSTEM: ACTIVE]
👑 [AGENT: EXECUTIVE ARCHITECT]
🤖 [MULTI-AGENT SYSTEM: ACTIVE]
```

## System Requirements

For a system to be considered fully initialized and functional:

1. **Memory System**:

   - `globalThis.MEMORY_SYSTEM` must exist
   - `storeContext()` and `getContext()` functions must work properly

2. **Scratchpad System**:

   - `globalThis.SCRATCHPAD` or `globalThis.SCRATCHPAD_SYSTEM` must exist
   - `createMessage()` function must be available

3. **Multi-Agent System**:
   - `globalThis.MULTI_AGENT_SYSTEM` or `globalThis.AGENT_SYSTEM` must exist
   - Agent definitions must be present

## Troubleshooting

If the system fails to initialize:

1. Check the console logs for error messages
2. Verify that the core system files exist:
   - `.cursor/centralized-init.js`
   - `.cursor/systems/memory-system.js`
   - `.cursor/systems/scratchpad-system.js`
   - `.cursor/systems/multi-agent-system.js`
3. Look for emergency recovery banners that indicate specific failures

## Legacy Files

Many files in the `.cursor` directory are from older initialization approaches and are no longer needed:

- `.cursor/master-activation.js` (replaced by `centralized-init.js`)
- `.cursor/communication/activate.js` (replaced by `centralized-init.js`)
- Multiple `test-*.js` and `check-*.js` files (used for testing)

## Recent Updates

### Enhanced Compatibility Layer (v1.0.0)

Added an enhanced compatibility layer to ensure all systems show as ACTIVE in banners and have the necessary functionality:

- **Memory System**: Fixed implementation of `storeContext` and `getContext` methods
- **Scratchpad System**: Implemented robust `createMessage` function
- **Banner System**: Improved status detection and handling of partial system states
- **Centralized Init**: Updated to automatically load and apply the enhanced compatibility layer

To verify the enhanced compatibility is working, run:

```
node .cursor/test-enhanced-compatibility.js
```

### System Compatibility Layer (v1.1.0)

Added standardized naming conventions and improved global object aliasing:

- Standardized `SCRATCHPAD_SYSTEM` and `SCRATCHPAD` naming
- Standardized `MULTI_AGENT_SYSTEM` and `AGENT_SYSTEM` naming
- Added system validation function to check consistency between global objects
- Improved error handling and graceful fallbacks

To verify the compatibility layer is working correctly, run:

```
node .cursor/verify-compatibility.js
```

## System Enhancement

If you're seeing "PARTIAL" status on any system banners, you can use the new enhancement script to apply fixes:

```bash
node .cursor/enhance-systems.js
```

This script will:

1. Check the current status of all systems
2. Load and apply the compatibility and enhanced compatibility layers
3. Fix missing methods on Memory and Scratchpad systems
4. Refresh banners to show updated status
5. Show a before/after comparison of system status

Example output:

```
🚀 SYSTEM ENHANCEMENT SCRIPT

📊 Capturing initial system state...

Initial System Status:
- Memory System:     PARTIAL
- Scratchpad System: PARTIAL
- Multi-Agent System: ACTIVE
- Banner System:     ACTIVE

🔧 Loading enhanced compatibility layer...
✅ Base compatibility layer loaded
✅ Enhanced compatibility layer loaded
✅ Applied enhanced compatibility fixes
✅ Refreshed system banners

📊 Final System Status:
- Memory System:      ACTIVE (improved)
- Scratchpad System:  ACTIVE (improved)
- Multi-Agent System: ACTIVE
- Banner System:      ACTIVE

📢 Current System Banners:
  🧠 [MEMORY SYSTEM: ACTIVE]
  📝 [SCRATCHPAD SYSTEM: ACTIVE]
  🤖 [MULTI-AGENT SYSTEM: ACTIVE]
  👤 [AGENT: EXECUTIVE-ARCHITECT]
  ✅ [ENHANCED COMPATIBILITY ACTIVE]
  🚩 [BANNER SYSTEM: ACTIVE]
  ⚙️ [ACTIVE SYSTEMS: 4/4]

✅ SUCCESS: System enhancements were applied successfully!
```

If you continue to see issues after running the enhancement script, try running the centralized initialization:

```bash
node .cursor/centralized-init.js
```

# Cursor Extensions System

This repository contains the extensions and enhancements for the Cursor AI assistant.

## Core Systems

The Cursor extensions system consists of several core components:

1. **Centralized Initialization System** - Manages the initialization of all system components in a coordinated manner.
2. **Enhanced Compatibility Layer** - Ensures consistent naming conventions and object synchronization across systems.
3. **Memory System** - Provides short-term, episodic, and semantic memory capabilities.
4. **Scratchpad System** - Enables communication between AI agents.
5. **Multi-Agent System** - Coordinates specialized AI agents for different tasks.
6. **Banner System** - Provides visual feedback about system status.

## Centralized Initialization

The centralized initialization system ensures that all components are properly initialized and configured. It is responsible for:

- Loading necessary dependencies
- Initializing core systems in the correct order
- Ensuring compatibility between systems
- Displaying system status

## Enhanced Compatibility Layer (v2.2.0)

The compatibility layer provides standardized naming conventions and synchronized references across all systems, addressing issues with inconsistent global object names. Key features include:

1. **Proxy-Based Synchronization** - Ensures that global objects with different names (like `SCRATCHPAD` and `SCRATCHPAD_SYSTEM`) remain synchronized even after initialization.
2. **Continuous Monitoring** - Periodically checks and fixes any desynchronization.
3. **Improved Object Merging** - When systems diverge, properly merges properties to preserve functionality.
4. **Validation Functions** - Provides tools to verify system consistency.

For more information, see [README-system-compatibility.md](.cursor/README-system-compatibility.md).

## Memory System

The memory system provides:

- **Short-Term Memory** - Stores context and information for the current session
- **Episodic Memory** - Stores conversation history for retrieval
- **Semantic Memory** - Stores structured knowledge for reasoning

## Scratchpad System

The scratchpad system enables communication between AI agents, providing:

- Message passing between agents
- Thread management
- Context sharing

## Multi-Agent System

The multi-agent system coordinates specialized AI agents, including:

- Executive Architect
- Frontend Developer
- Backend Developer
- Full-Stack Integrator
- CMS Specialist
- Data Engineer
- Documentation Specialist

## Banner System

The banner system provides visual feedback about system status, displaying banners indicating:

- Active systems
- Active agent
- System status

## File Organization

- `centralized-init.js` - Centralized initialization script
- `system-compatibility.js` - Enhanced compatibility layer
- `systems/` - Core system implementations
  - `memory-system.js` - Memory system implementation
  - `scratchpad-system.js` - Scratchpad system implementation
  - `multi-agent-system.js` - Multi-agent system implementation
- `db/` - Database files for persistent storage
- `rules/` - Rules for AI agents
- `agents/` - Agent implementations
- `communication/` - Communication utilities
- `tests/` - Test scripts and utilities
- `README-*.md` - Documentation for specific systems
