import React from 'react'
import { formatTimestamp } from '../../utils';

export default function IntelligenceBriefing({
    weeklyIntelligence,
    currentWeek,
}) {
  // If no intelligence data, show placeholder
  if (weeklyIntelligence.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">INTELLIGENCE BRIEFING</h3>
        <div className="notification p-4 rounded-lg">
          <p className="text-gray-400">No intelligence reports available for Week {currentWeek}.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">INTELLIGENCE BRIEFING</h3>
      <div className="space-y-4">
        {weeklyIntelligence.map(intel => (
          <div key={intel.id} className={`notification ${intel.type === 'attack' ? 'notification-danger' : intel.type === 'market' ? 'notification-warning' : 'notification-info'} p-4 rounded-lg`}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold">{intel.title || intel.type.toUpperCase()}</h4>
              <span className="text-sm text-gray-500">{formatTimestamp(intel.timestamp)}</span>
            </div>
            <p className="text-gray-400">{intel.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
