import React from 'react';

const Rulebook = () => {
  const rules = [
    {
      category: "Combat",
      items: [
        "Each player starts with 100 soldiers",
        "Weekly income is based on investments and defense level",
        "Attacks can only be performed during active battles",
        "Defense level affects attack success rates"
      ]
    },
    {
      category: "Economy",
      items: [
        "Markets update every week",
        "Investment returns vary by market volatility",
        "Minimum investment is 10 soldiers",
        "Maximum investment is 1000 soldiers per market"
      ]
    },
    {
      category: "Actions",
      items: [
        "3 actions available per week",
        "Actions reset every Monday at 00:00 UTC",
        "Unused actions do not carry over",
        "Each market action counts as one action"
      ]
    },
    {
      category: "Alliances",
      items: [
        "Maximum 5 players per alliance",
        "Alliance members can share market intel",
        "Coordinated attacks require alliance membership",
        "Alliance benefits unlock at different levels"
      ]
    }
  ];

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">COMMANDER'S RULEBOOK</h2>
      
      <div className="space-y-8">
        {rules.map((section, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-green-500">
              {section.category} Rules
            </h3>
            <ul className="space-y-3">
              {section.items.map((rule, ruleIndex) => (
                <li key={ruleIndex} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-300">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Important Notes</h3>
        <ul className="space-y-2 text-gray-300">
          <li>• Rules are subject to change with game updates</li>
          <li>• Violation of rules may result in penalties</li>
          <li>• Contact support for rule clarifications</li>
          <li>• Fair play is enforced by automated systems</li>
        </ul>
      </div>
    </div>
  );
};

export default Rulebook;
