import React from 'react'

export default function EconomicStatusAlert({
    marketStatus
}) {
  return (
    <div className="economy-downturn px-6 py-4 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-1">ECONOMIC DOWNTURN</h3>
        <p className="text-gray-400">
            Markets are unstable. Proceed with caution. Stocks {marketStatus.stocks}%, 
            Real Estate {marketStatus.realEstate}%, Crypto {marketStatus.crypto}%, 
            Business {marketStatus.business}%
        </p>
    </div>
  )
}
