# Cursor Systems

<div align="center">
  <p><em>A portable multi-agent system architecture with memory persistence and inter-agent communication</em></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/Version-1.1.0-green.svg)](https://github.com/user/cursor-systems)
</div>

## 📚 Overview

Cursor Systems is a sophisticated multi-agent architecture designed to enhance AI assistants with persistent memory, inter-agent communication, and specialized agent capabilities. The system enables AI assistants to maintain context across conversations, collaborate through multiple specialized personas, and leverage a structured communication system for coordinated problem-solving.

### 🌟 Key Features

- **Multi-Agent Architecture**: Coordinate multiple specialized AI agents with distinct roles and capabilities
- **Persistent Memory**: Store and recall information across conversations using SQLite-powered memory systems
- **Inter-Agent Communication**: Enable seamless collaboration through a structured scratchpad system
- **Visual Status Confirmation**: Track active systems and agents through an integrated banner system
- **Modular Design**: Easily extensible with new agents, capabilities, and integrations
- **Centralized Initialization**: Single-entry point system initialization with robust error recovery
- **Auto-Recovery**: Automatic detection and creation of missing system components
- **Pre/Post Response Hooks**: Automatic memory operations before and after each response

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
├── agents/                         # Agent implementations
│   ├── multi-agent-system.js       # Core agent controller
│   ├── executive-architect/        # Executive Architect agent
│   │   └── instructions.md         # Detailed agent instructions
│   ├── frontend-developer/         # Frontend Developer agent
│   │   └── instructions.md         # Detailed agent instructions
│   └── ...                         # Other specialized agents
├── communication/                  # Communication systems
│   ├── activate.js                 # System activation
│   ├── direct-banner.js            # Banner management
│   └── custom_instructions.js      # Instructions generator
├── db/                             # Database components
│   ├── memory-system.db            # SQLite memory database
│   └── scratchpad-system.db        # Communication storage database
├── centralized-init.js             # Centralized system initialization
├── enforcer.js                     # System enforcement and recovery
├── fix-systems.js                  # Automatic system repair
├── memory-fix.js                   # Memory system enhancements
├── pre-response-hook.js            # Pre-response processing
├── post-response-hook.js           # Post-response processing
├── test-all-systems.js             # Comprehensive system test
├── quick-test.js                   # Fast system verification
├── rules/                          # MDC rule files
│   ├── 000-master-activation.mdc   # Master system activator
│   ├── 000-enforcer.mdc            # System enforcement and activation
│   ├── 001-system-core.mdc         # Core system definition
│   ├── 100-multi-agent-system.mdc  # Multi-agent system definition
│   ├── 101-executive-architect-agent.mdc # Agent definitions
│   ├── 200-scratchpad.mdc          # Communication system
│   ├── 201-scratchpad-enforcer.mdc # Scratchpad enforcement
│   ├── 300-memory-system.mdc       # Memory architecture
│   ├── 301-short-term-memory.mdc   # Short-term memory implementation
│   ├── 302-episodic-memory.mdc     # Episodic memory implementation
│   ├── 303-semantic-memory.mdc     # Semantic memory implementation
│   ├── 304-memory-integration.mdc  # Memory subsystem integration
│   ├── 305-memory-initializer.mdc  # Memory system bootstrapper
│   └── 400-*.mdc                   # Integration modules
├── systems/                        # Core system implementations
│   ├── memory-system.js            # Memory system implementation
│   ├── scratchpad-system.js        # Inter-agent communication
│   └── multi-agent-system.js       # Agent coordination system
├── package.json                    # Dependencies
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
node .cursor/test-all-systems.js

# Quick test for scratchpad and banner systems
node .cursor/quick-test.js

# Test the memory system
node .cursor/check-memory.js

# Test the scratchpad system
node .cursor/check-scratchpad.js

# Test agent switching
node .cursor/check-agent.js

# Test banner displays
node .cursor/test-banner-system.js

# Fix all systems if needed
node .cursor/fix-systems.js
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
  <p>Built with ❤️ by the Cursor Systems team</p>
</div>
