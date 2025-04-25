export const validateAction = (actionData, soldiers) => {
    if (!actionData) {
      return { valid: false, message: "No action selected" };
    }
    
    // Ensure proper structure to prevent undefined fields later
    if (!actionData.investment && !actionData.offensive) {
      return { valid: false, message: "Action must contain either an investment or offensive operation" };
    }
    
    // Validate investment actions
    if (actionData.investment) {
      const { type, amount, market } = actionData.investment;
      
      if (!amount || amount <= 0) {
        return { valid: false, message: "Investment amount must be positive" };
      }
      
      if (amount > soldiers) {
        return { valid: false, message: `Cannot invest ${amount} soldiers when you only have ${soldiers}` };
      }
      
      if (!market) {
        return { valid: false, message: "No market selected for investment" };
      }
      
      // Clean up structure to ensure no undefined fields
      const cleanInvestment = {
        type: type || 'invest',
        amount: amount,
        market: market
      };
      
      // Return the cleaned action data
      return { 
        valid: true, 
        cleanedData: {
          ...actionData,
          investment: cleanInvestment,
          // Remove any potential undefined offensive field
          offensive: null
        }
      };
    }
    
    // Validate offensive actions
    if (actionData.offensive) {
      const { type, targetPlayer, targetName } = actionData.offensive;
      
      if (!type) {
        return { valid: false, message: "No offensive action type specified" };
      }
      
      if (!targetPlayer) {
        return { valid: false, message: "No target selected for offensive action" };
      }
      
      if (!targetName) {
        return { valid: false, message: "Target name is missing" };
      }
      
      // Additional validation for attack actions
      if (type === 'attack') {
        // Check if player has enough soldiers for an attack
        if (soldiers < 25) {
          return { valid: false, message: "Need at least 25 soldiers to launch an attack" };
        }
      }
      
      // Additional validation for spy actions
      if (type === 'spy') {
        // Check if player has enough soldiers for a spy mission
        if (soldiers < 10) {
          return { valid: false, message: "Need at least 10 soldiers to deploy a spy" };
        }
      }
      
      // Clean up structure to ensure no undefined fields
      const cleanOffensive = {
        type: type,
        targetPlayer: targetPlayer,
        targetName: targetName || 'Unknown Commander'
      };
      
      // Return the cleaned action data
      return { 
        valid: true, 
        cleanedData: {
          ...actionData,
          offensive: cleanOffensive,
          // Remove any potential undefined investment field
          investment: null
        }
      };
    }
    
    // Should never reach here due to structure checks above, but just in case
    return { valid: false, message: "Invalid action structure" };
};
  
export const calculateSuccessChance = (attacker, defender) => {
    const defenseRating = {
      'Weak': 0.25,
      'Moderate': 0.5,
      'Strong': 0.75,
      'Very Strong': 0.9
    };
    
    const attackerStrength = attacker.soldiers;
    const defenderDefense = defenseRating[defender.defense];
    return Math.min(Math.round((attackerStrength / (defender.soldiers * defenderDefense)) * 100), 90);
};
  
export const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)} days ago`;
    }
};

export   const calculatePotentialReturn = (market, investment, marketStatus) => {
    const rates = {
      stocks: (100 + marketStatus.stocks) / 100,
      realEstate: (100 + marketStatus.realEstate) / 100,
      crypto: (100 + marketStatus.crypto) / 100,
      business: (100 + marketStatus.business) / 100
    };
    return Math.round(investment * rates[market]);
};
  
  