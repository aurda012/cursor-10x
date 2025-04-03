# URDAFX Multi-Agent System

This directory contains the implementation of the URDAFX Multi-Agent System, which provides a framework for the coordination of specialized agents within the URDAFX Forex Trading System.

## System Overview

The multi-agent system consists of several core components:

- **Date Verification System**: Ensures consistent date handling across all agents
- **Memory System**: Provides short-term, episodic, and semantic memory capabilities
- **Scratchpad System**: Enables communication between agents through persistent messaging
- **Agent System**: Manages the specialized agents and their interactions
- **MCP Integration**: Connects to external Model Context Protocol servers
- **Banner System**: Provides visual feedback about system status

## Core Agents

The system includes seven specialized agents:

1. **Project Manager/Planner**: Strategic planning, coordination, and oversight
2. **Quantitative Analyst**: Model development, data analysis, and strategy optimization
3. **Data Engineer**: Data infrastructure, pipeline development, and data quality
4. **Software Developer**: Platform development, integration, and performance optimization
5. **Risk Specialist**: Risk assessment, mitigation, and compliance monitoring
6. **Machine Learning Engineer**: Machine learning model development, training, and deployment
7. **Documentation Specialist**: Documentation creation, maintenance, and knowledge management

## Quick Start

The simplest way to use the system is through the provided API:

```javascript
const api = require('./.cursor/communication/api');

// Initialize the system
await api.initialize();

// Get all agents
const agents = api.getAgents();
console.log(`Found ${agents.length} agents`);

// Get agent recommendations for a task
const task = 'Develop a trading algorithm';
const recommendedAgents = api.getRecommendedAgents(task);
console.log(`Recommended agents: ${recommendedAgents.join(', ')}`);

// Display a banner
api.displayBanner('minimal', { message: 'System is active!' });
```

## System Initialization

The system can be initialized using the provided launcher:

```javascript
const { initializeAllSystems } = require('./.cursor/communication/launcher.js');

// Initialize all systems
initializeAllSystems().then(result => {
  console.log('Initialization result:', result);
});
```

## File Structure

```
.cursor/communication/
├── api.js                  # Main API interface
├── init.js                 # Automatic initializer
├── launcher.js             # System bootstrapper
├── README.md               # This documentation
├── systems/                # Core system components
│   ├── agent_system.js     # Agent management and coordination
│   ├── banner.js           # Visual feedback system
│   ├── comprehensive_memory.js # Memory subsystem
│   ├── date_verification.js # Date consistency system
│   ├── mcp_integration.js  # Model Context Protocol integration
│   ├── scratchpad.js       # Inter-agent communication system
│   └── state_persistence.js # System state persistence
├── banners/                # Banner templates
├── logs/                   # System logs and databases
├── state/                  # Persisted system state
└── tests/                  # Test scripts
    ├── banner_test.js      # Test for banner system
    ├── showcase.js         # Full system showcase
    └── test_launcher.js    # System initialization test
```

## Testing

Several test scripts are provided to verify system functionality:

```javascript
// Basic initialization test
node .cursor/communication/test_launcher.js

// Banner system test
node .cursor/communication/tests/banner_test.js

// Full system showcase
node .cursor/communication/tests/showcase.js
```

## Multi-Agent Workflow

1. The Project Manager agent acts as the coordinator, assigning tasks to specialized agents.
2. Agents communicate via the Scratchpad system, which maintains persistent threads.
3. The Memory system stores context, conversation history, and domain knowledge.
4. The Agent system tracks agent capabilities and recommends agents for specific tasks.
5. The Banner system provides visual feedback about active agents and system status.

## API Reference

The API provides methods for all key functionality:

- `initialize(force)`: Initialize the system
- `getSystemStatus()`: Get current system status
- `getAgents()`: Get all agents
- `getAgent(agentId)`: Get a specific agent
- `getRecommendedAgents(task)`: Get agent recommendations for a task
- `createThread(threadId, title, creatorId)`: Create a thread
- `createMessage(messageOptions)`: Create a message
- `readThread(threadId)`: Read messages in a thread
- `displayBanner(templateName, variables)`: Display a banner
- `storeContext(key, value)`: Store a context value
- `getContext(key)`: Get a context value
- `getCurrentDate()`: Get the current date
- `formatDate(date, format)`: Format a date
- `createCollaborationSession(agentIds, taskDescription)`: Create a collaboration session

## System Requirements

- Node.js (v14.0.0 or higher)
- SQLite (optional, for enhanced persistence) 