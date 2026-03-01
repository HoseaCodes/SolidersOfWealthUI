# AI System Design Document

## AI System Overview

Based on the current codebase analysis, Soldiers of Wealth implements AI/ML primarily through its economic simulation and market prediction systems. The core AI components are:

1. **Market Simulation Engine**
   - Implemented in `EconomicProvider.js`
   - Handles market cycle predictions
   - Manages economic event generation
   - Controls market volatility

2. **Player Action Analysis**
   - Tracks player behavior patterns
   - Analyzes investment strategies
   - Monitors combat effectiveness

### Current AI Implementation

```javascript
// From EconomicProvider.js
const generateRandomEvent = () => {
  const events = ['boom', 'stable', 'downturn', 'crisis'];
  const weights = [0.15, 0.45, 0.30, 0.10]; // Probability weights
  
  let random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < events.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      setCycle(events[i]);
      break;
    }
  }
};
```

## Model Integration

### Current Models

1. **Economic Simulation Model**
```javascript
// Market state management
const [economicState, setEconomicState] = useState({
  currentCycle: 'stable',
  markets: {
    stocks: {
      risk: 'High',
      sensitivity: 'High',
      baseReturn: { min: -15, max: 15 },
      modifiers: {
        boom: 20,
        stable: 0,
        downturn: -15,
        crisis: -30
      }
    }
    // Other markets...
  }
});
```

2. **Player Behavior Model**
```javascript
// From validateAction.js
export const validateAction = (actionData, soldiers) => {
  // Action validation logic
  if (actionData.investment) {
    const { type, amount, market } = actionData.investment;
    // Investment validation
  } else if (actionData.offensive) {
    const { type, targetPlayer } = actionData.offensive;
    // Combat validation
  }
};
```

### Planned Model Integrations

1. **OpenAI GPT Integration**
```javascript
// Proposed implementation for dynamic NPC responses
const generateNPCResponse = async (context) => {
  const response = await openai.createCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a strategic military commander." },
      { role: "user", content: context }
    ],
    max_tokens: 150
  });
  return response.choices[0].message.content;
};
```

2. **Market Prediction Model**
```python
# Proposed TensorFlow.js implementation
const predictMarketTrend = async (marketData) => {
  const model = await tf.loadLayersModel('market-prediction-model');
  const prediction = model.predict(tf.tensor(marketData));
  return prediction.dataSync();
};
```

## Data Pipeline

### Current Data Flow

1. **Market Data Collection**
```javascript
// From EconomyManagement.js
const loadEconomyData = async () => {
  const economyRef = collection(db, `games/${selectedGame.id}/economy`);
  const weekQuery = query(economyRef, where('week', '==', selectedWeek));
  const querySnapshot = await getDocs(weekQuery);
  // Process and store market data
};
```

2. **Player Action Processing**
```javascript
// From PlayerActions.js
const handleExecuteAction = async (action, category) => {
  // Validate and process player actions
  const actionData = {
    type: action.id,
    timestamp: Date.now(),
    category: category
  };
  // Store action data for analysis
};
```

### Data Storage

1. **Firebase Collections**
```javascript
// Collection structure
const collections = {
  'market_data': {
    // Historical market performance
    // Market cycle transitions
    // Economic events
  },
  'player_actions': {
    // Investment decisions
    // Combat actions
    // Training progress
  }
};
```

## RAG Implementation

Currently, the application does not implement RAG (Retrieval Augmented Generation). Here's a proposed implementation:

```javascript
// Proposed RAG system for training content
const TrainingRAG = {
  // Vector store for training content
  vectorStore: {
    initialize: async () => {
      // Initialize vector database
    },
    addDocument: async (doc) => {
      // Add and embed document
    },
    search: async (query) => {
      // Semantic search
    }
  },
  
  // Knowledge retrieval
  retrieveKnowledge: async (query) => {
    const relevant = await vectorStore.search(query);
    return formatResponse(relevant);
  }
};
```

## Prompt Engineering

### Current System Prompts

1. **Training Module Prompts**
```javascript
// From initializeTrainings.js
const trainingPrompts = [
  {
    title: "Alliance Building",
    description: "Strategies for forming and maintaining powerful alliances.",
    content: [
      "Alliance negotiation tactics",
      "Resource sharing strategies",
      "Joint operation planning",
      "Diplomatic conflict resolution"
    ]
  }
];
```

### Proposed Prompt Templates

```javascript
const promptTemplates = {
  marketAnalysis: `Analyze the current market conditions:
    - Market: {{market}}
    - Current Value: {{value}}
    - Trend: {{trend}}
    Provide strategic investment advice.`,
    
  combatStrategy: `Given the following battlefield conditions:
    - Your Forces: {{playerForces}}
    - Enemy Forces: {{enemyForces}}
    - Terrain: {{terrain}}
    Recommend tactical options.`
};
```

## Performance & Cost

### Current System

1. **Computational Costs**
- Market simulation: O(n) where n = number of markets
- Action validation: O(1) per action
- Economic cycle generation: O(1)

2. **Storage Costs**
```javascript
// Average document sizes
const storageCosts = {
  playerProfile: '2KB',
  marketData: '1KB per cycle',
  actionLog: '0.5KB per action'
};
```

### Proposed AI Integration Costs

1. **API Costs (Estimated)**
```javascript
const apiCosts = {
  openai: {
    modelName: 'gpt-3.5-turbo',
    costPer1kTokens: '$0.002',
    averageTokensPerRequest: 500,
    estimatedMonthlyRequests: 10000,
    totalMonthlyCost: '$10'
  }
};
```

2. **Vector Database Costs**
```javascript
const vectorDBCosts = {
  storage: '$0.25/GB/month',
  estimatedSize: '1GB',
  monthlyQueries: 100000,
  queryCost: '$0.001/query'
};
```

## Quality Assurance

### Current Testing

1. **Action Validation**
```javascript
// From validateAction.js
const validateAction = (actionData, soldiers) => {
  if (!actionData) {
    return { valid: false, message: "No action selected" };
  }
  // Validation logic
};
```

### Proposed AI Testing

```javascript
const aiTestSuite = {
  marketPredictions: {
    accuracy: async (predictions, actual) => {
      // Calculate prediction accuracy
    },
    latency: async (modelFunction) => {
      // Measure response time
    }
  },
  
  promptTests: {
    consistency: async (prompt, variations) => {
      // Test prompt consistency
    },
    quality: async (response) => {
      // Evaluate response quality
    }
  }
};
```

## User Experience

### Current AI-UX Integration

1. **Market Interface**
```javascript
// From MarketDashboard.js
const MarketDashboard = ({ marketStatus }) => {
  return (
    <div className="market-card">
      <div className="market-status">
        {marketStatus.map(market => (
          // Market display logic
        ))}
      </div>
    </div>
  );
};
```

### Proposed AI-UX Enhancements

```javascript
const AIEnhancements = {
  dynamicTutorials: {
    // Personalized learning paths
    // Adaptive difficulty
  },
  
  marketInsights: {
    // Real-time analysis
    // Predictive alerts
  },
  
  combatAssistant: {
    // Tactical suggestions
    // Risk assessment
  }
};
```

## Implementation Roadmap

1. **Phase 1: Core AI Integration**
   - Implement market prediction model
   - Set up data pipeline
   - Basic prompt engineering

2. **Phase 2: Advanced Features**
   - RAG implementation
   - OpenAI integration
   - Enhanced UX features

3. **Phase 3: Optimization**
   - Performance tuning
   - Cost optimization
   - Quality assurance
