# Soldiers of Wealth - Business Model Document

## Revenue Model Breakdown

### 1. Game Entry Fees
- Base entry fee: 100 coins per game (implemented in `GameManagement.js`)
- Tiered entry fees based on game difficulty levels:
  - Beginner: 100 coins
  - Intermediate: 250 coins
  - Advanced: 500 coins

### 2. Premium Features
Based on implemented feature gates in codebase:

1. **Training System**
- Basic training modules (free)
- Advanced military tactics (premium)
- Economic strategy courses (premium)
- Special operations training (premium)

2. **Market Access**
- Basic market view (free)
- Real-time market alerts (premium)
- Market manipulation tools (premium)
- Advanced analytics dashboard (premium)

3. **Military Operations**
- Basic combat (free)
- Special operations (premium)
- Advanced defense systems (premium)
- Elite unit deployment (premium)

## Pricing Tiers & Features

### Free Tier
Implemented features from `PlayerManagement.js` and `Dashboard.js`:
```
- 3 weekly strategic moves
- Basic soldier recruitment (100 initial soldiers)
- Weekly soldier income (50 soldiers)
- Basic market access
- Forum participation
- Basic training modules
- Standard game entry
```

### Premium Commander ($9.99/month)
Features gated in codebase:
```
- 5 weekly strategic moves
- Enhanced soldier recruitment (200 initial soldiers)
- Increased weekly income (75 soldiers)
- Basic market manipulation tools
- Priority game access
- Advanced training modules
- Reduced entry fees
```

### Strategic Command ($19.99/month)
Premium features found in code:
```
- 7 weekly strategic moves
- Elite soldier recruitment (300 initial soldiers)
- Premium weekly income (100 soldiers)
- Full market manipulation suite
- VIP game access
- All training modules
- Free game entries
- Custom titles and badges
```

## Open Core vs Proprietary Features

### Open Core (Free)
Based on `createInitialPlayerProfile` implementation:
```
1. Core Game Mechanics
   - Basic military management
   - Simple market trading
   - 3 weekly moves
   - Forum access
   - Basic alliances

2. Basic Economy
   - Initial 100 coins
   - Basic market access
   - Weekly income
   - Simple investments

3. Military
   - 100 starting soldiers
   - Basic training
   - Standard defense
   - Regular units
```

### Proprietary (Premium)
Features gated in codebase:
```
1. Advanced Game Mechanics
   - Additional weekly moves
   - Priority action execution
   - Special operations
   - Advanced alliances

2. Enhanced Economy
   - Market manipulation
   - Real-time alerts
   - Advanced analytics
   - Priority trading

3. Elite Military
   - Elite units
   - Advanced training
   - Special operations
   - Enhanced defense systems
```

## Target Market Segments

### 1. Casual Strategists (Free Tier)
Profile from `PlayerManagement.js`:
- New to military strategy games
- Limited time investment
- Focuses on basic gameplay
- Price sensitive

### 2. Dedicated Commanders (Premium Commander)
Implementation in `GameManagement.js`:
- Regular players
- Interested in competitive play
- Values enhanced features
- Willing to invest moderately

### 3. Elite Strategists (Strategic Command)
Based on premium features:
- Hardcore players
- Competitive focus
- Maximum game advantage
- High engagement level

## Competitive Positioning

### Unique Features
Implemented differentiators:

1. **Economic Integration**
   - Real market simulation
   - Multiple market types
   - Dynamic economic cycles
   - Market manipulation mechanics

2. **Military Strategy**
   - Weekly action system
   - Territory control
   - Alliance mechanics
   - Training progression

3. **Social Elements**
   - Alliance system
   - Forums
   - Player rankings
   - Community features

### Market Advantages
1. **Hybrid Gameplay**
   - Military + Economic strategy
   - Multiple victory paths
   - Balanced progression

2. **Social Strategy**
   - Alliance-based gameplay
   - Community-driven content
   - Competitive rankings

## Scalability Strategy

### Technical Infrastructure
Based on Firebase implementation:

1. **Database Scaling**
   - Firestore for real-time data
   - Automatic scaling
   - Multi-region support

2. **Game Instance Management**
   - Dynamic game creation
   - Automated matchmaking
   - Load balancing

### Business Scaling
Implemented systems support:

1. **User Growth**
   - Automated onboarding
   - Training progression
   - Community features

2. **Revenue Scaling**
   - Multiple revenue streams
   - Automated billing
   - Dynamic pricing

## Implementation Details

### Payment Processing
Current implementation:

1. **Entry Fee System**
```javascript
- Game entry validation
- Coin balance checks
- Transaction processing
- Receipt generation
```

2. **Subscription Management**
```javascript
- Tier management
- Feature access control
- Automatic renewal
- Payment processing
```

### Feature Access Control
Implemented in codebase:

1. **Authentication**
```javascript
- Firebase Auth integration
- Role-based access
- Premium feature gates
- Subscription validation
```

2. **Premium Features**
```javascript
- Feature flag system
- Tier-based access
- Dynamic enablement
- Usage tracking
```

## Customer Acquisition

### Conversion Funnel
Based on implemented user journey:

1. **Entry Point**
   - Landing page
   - Basic game access
   - Tutorial system
   - Community exposure

2. **Engagement Triggers**
   - Weekly action limits
   - Market opportunities
   - Competition rankings
   - Alliance benefits

3. **Premium Conversion**
   - Feature previews
   - Competitive advantages
   - Social pressure
   - Progress acceleration

### Upgrade Triggers
Implemented conversion points:

1. **Gameplay Triggers**
   - Action limit reached
   - Market opportunities
   - Competition placement
   - Alliance requirements

2. **Progress Triggers**
   - Training completion
   - Rank advancement
   - Achievement unlocks
   - Economic milestones

3. **Social Triggers**
   - Alliance invites
   - Premium player interaction
   - Tournament eligibility
   - Leadership positions
