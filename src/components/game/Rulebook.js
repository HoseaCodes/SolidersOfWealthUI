import React from 'react';

export default function Rulebook() {
  return (
    <div className="text-gray-300 space-y-6">
      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Game Overview</h3>
        <p>Soldiers of Wealth is a strategic financial warfare game where commanders compete to build the strongest economic empire while defending against market threats and rival commanders.</p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Basic Mechanics</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Each commander starts with a base number of soldiers and initial wealth.</li>
          <li>Use your wealth to recruit more soldiers or invest in market positions.</li>
          <li>Deploy soldiers to protect your investments or launch strategic market operations.</li>
          <li>Monitor market conditions and adapt your strategy accordingly.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Command Center</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your central hub for managing troops and resources</li>
          <li>View real-time market intelligence and threat assessments</li>
          <li>Issue orders to your soldiers and manage defensive positions</li>
          <li>Track your empire's growth and performance metrics</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Market Operations</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Invest in various market sectors to generate wealth</li>
          <li>Launch market offensives to gain strategic advantages</li>
          <li>Defend against market volatility and competitor actions</li>
          <li>Form alliances with other commanders for mutual benefit</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Victory Conditions</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Accumulate the highest total wealth by the end of the season</li>
          <li>Control key market sectors</li>
          <li>Build the largest and most efficient army</li>
          <li>Complete special mission objectives</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Special Operations</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Intelligence Gathering: Deploy spies to gather market intel</li>
          <li>Market Raids: Quick, targeted operations for immediate gains</li>
          <li>Defensive Fortification: Strengthen your market positions</li>
          <li>Alliance Operations: Coordinate with allies for complex missions</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Resource Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="game-card p-4">
            <h4 className="font-bold mb-2">Soldiers</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Recruit new soldiers with wealth</li>
              <li>Train soldiers for specialized operations</li>
              <li>Deploy strategically for maximum effect</li>
              <li>Maintain morale and efficiency</li>
            </ul>
          </div>
          <div className="game-card p-4">
            <h4 className="font-bold mb-2">Wealth</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Generate through market operations</li>
              <li>Invest in infrastructure and training</li>
              <li>Fund special operations and missions</li>
              <li>Build and maintain alliances</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gold-300 mb-3">Seasonal Events</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Market crashes and booms affect all players</li>
          <li>Special missions and opportunities appear randomly</li>
          <li>Global events impact market conditions</li>
          <li>Season-end tournaments for bonus rewards</li>
        </ul>
      </section>

      <div className="mt-8 p-4 game-card">
        <h3 className="text-xl font-bold text-gold-300 mb-3">Commander's Note</h3>
        <p className="italic">
          Remember, Commander: Victory in Soldiers of Wealth requires a perfect balance of strategic planning, 
          resource management, and tactical execution. Study these rules well, but know that true mastery 
          comes from battlefield experience. Good luck in your campaign for economic dominance.
        </p>
      </div>
    </div>
  );
}
