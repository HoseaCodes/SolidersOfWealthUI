# User Story: CommandCenter Action Selection Improvements

## Overview
**As a** game player  
**I want** to be able to select multiple actions from any category (Strategic Deployment, Offensive Operations, or Defensive Measures)  
**So that** I can have more strategic flexibility in how I use my limited actions each week

## Current Issues
- When making a selection under STRATEGIC DEPLOYMENT, OFFENSIVE OPERATIONS, or DEFENSIVE MEASURES on the COMMAND tab, the selection doesn't appear under WEEKLY MOVES
- The "WEEK 1 ACTIONS REMAINING" indicator doesn't update properly when actions are used
- The player's soldier count is hardcoded instead of being pulled from Firebase

## Acceptance Criteria
1. Players should be able to use their 3 weekly actions in any combination across categories:
   - All 3 actions in one category (e.g., 3 defensive moves)
   - Any other distribution (e.g., 2 offensive + 1 strategic)
2. Each selected action should immediately appear in the WEEKLY MOVES section
3. The "ACTIONS REMAINING" counter should properly decrement with each action selected
4. Player soldier count should be pulled from the database instead of hardcoded values
5. All moves should be properly saved to Firebase when submitted

## Technical Requirements
Modify the addWeeklyMove function to:
- Allow multiple actions of the same type
- Properly update the state when moves are selected
- Remove any validation logic that restricts players to one action per category
- Ensure data synchronization between Firebase and UI components
- Fix the relationship between action selections and the weekly moves dashboard
- Maintain the overall limit of 3 total actions per week

See issue [here](https://github.com/HoseaCodes/SolidersOfWealthUI/issues/1)