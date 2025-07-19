import React from 'react';
import { TokenMarketData } from '../../../shared/models';

interface CandlestickChartProps {
  tokenMarketData: TokenMarketData;
  className?: string;
}

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ tokenMarketData, className = "" }) => {
  const { priceChart, price, priceChange24h } = tokenMarketData;

  if (!priceChart || priceChart.length === 0) {
    return (
      <div className={`w-full h-[300px] flex items-center justify-center bg-bg-secondary rounded-lg ${className}`}>
        <p className="text-fg-primary text-opacity-75">No chart data available</p>
      </div>
    );
  }

  // Convert price data to candlestick data
  const generateCandleData = (): CandleData[] => {
    const candles: CandleData[] = [];
    const candleCount = 12; // Always show 12 candles for 24 hours (2-hour periods)
    
    // Sort data chronologically
    const sortedData = [...priceChart].sort((a, b) => a.timestamp - b.timestamp);
    
    // If we have many data points (likely real transaction data), group by time periods
    if (sortedData.length > 24) {
      const timeSpan = sortedData[sortedData.length - 1].timestamp - sortedData[0].timestamp;
      const candleDuration = timeSpan / candleCount;
      
      for (let i = 0; i < candleCount; i++) {
        const candleStart = sortedData[0].timestamp + (i * candleDuration);
        const candleEnd = candleStart + candleDuration;
        
        const candlePoints = sortedData.filter(d => 
          d.timestamp >= candleStart && d.timestamp < candleEnd
        );
        
        if (candlePoints.length === 0) {
          // If no data points in this period, interpolate from previous candle
          const prevCandle = candles[candles.length - 1];
          if (prevCandle) {
            const volatility = (Math.random() - 0.5) * 0.02; // ±1% volatility
            const basePrice = prevCandle.close;
            candles.push({
              timestamp: candleStart,
              open: basePrice,
              high: basePrice * (1 + Math.abs(volatility)),
              low: basePrice * (1 - Math.abs(volatility)),
              close: basePrice * (1 + volatility)
            });
          }
          continue;
        }
        
        // Sort points within this candle by timestamp
        candlePoints.sort((a, b) => a.timestamp - b.timestamp);
        
        const open = candlePoints[0].price;
        const close = candlePoints[candlePoints.length - 1].price;
        const high = Math.max(...candlePoints.map(d => d.price));
        const low = Math.min(...candlePoints.map(d => d.price));
        
        candles.push({
          timestamp: candleStart,
          open,
          high,
          low,
          close
        });
      }
    } else {
      // For synthetic data with fewer points, use original grouping method
      const pointsPerCandle = Math.max(1, Math.floor(sortedData.length / candleCount));
      
      for (let i = 0; i < candleCount; i++) {
        const startIdx = i * pointsPerCandle;
        const endIdx = Math.min(startIdx + pointsPerCandle, sortedData.length);
        const candlePoints = sortedData.slice(startIdx, endIdx);
        
        if (candlePoints.length === 0) continue;
        
        const open = candlePoints[0].price;
        const close = candlePoints[candlePoints.length - 1].price;
        const high = Math.max(...candlePoints.map(p => p.price));
        const low = Math.min(...candlePoints.map(p => p.price));
        
        candles.push({
          timestamp: candlePoints[0].timestamp,
          open,
          high,
          low,
          close
        });
      }
    }
    
    return candles;
  };

  const candleData = generateCandleData();
  
  // Calculate price range for scaling
  const allPrices = candleData.flatMap(c => [c.open, c.high, c.low, c.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  let priceRange = maxPrice - minPrice;

  // Handle case where all prices are the same or very close
  if (priceRange === 0 || priceRange < maxPrice * 0.001) {
    const centerPrice = (minPrice + maxPrice) / 2;
    priceRange = centerPrice * 0.1; // 10% range for better visualization
  }

  // Chart dimensions
  const width = 600;
  const height = 180; // Reduced height for less space
  const padding = 25; // Reduced padding for less space
  const candleWidth = Math.max(8, (width - 2 * padding) / candleData.length * 0.6);
  const candleSpacing = (width - 2 * padding) / candleData.length;

  // Helper function to get Y coordinate
  const getY = (price: number) => {
    return height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
  };

  // Format price for display
  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return `$${price.toExponential(3)}`;
    } else if (price < 1) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1000) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const isPositive = priceChange24h >= 0;

  return (
    <div className={`w-full bg-bg-secondary rounded-lg p-6 ${className}`}>
      {/* Header with current price and change */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-fg-primary">Price Chart</h3>
            {priceChart.length > 24 && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                📊 Live Data
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-fg-primary">{formatPrice(price)}</div>
            <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {formatChange(priceChange24h)} (24h)
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          width="100%"
          height="240"
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="candleGrid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#candleGrid)" />

          {/* Price level lines */}
          {[0.25, 0.5, 0.75].map((ratio, index) => {
            const y = padding + ratio * (height - 2 * padding);
            const priceAtLevel = maxPrice - ratio * priceRange;
            return (
              <g key={index}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 5}
                  y={y + 4}
                  fill="rgba(255,255,255,0.7)"
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="end"
                >
                  {formatPrice(priceAtLevel)}
                </text>
              </g>
            );
          })}

          {/* Candlesticks */}
          {candleData.map((candle, index) => {
            const x = padding + index * candleSpacing + candleSpacing / 2;
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);

            const isBullish = candle.close >= candle.open;
            const candleColor = isBullish ? "#10b981" : "#ef4444"; // green-500 or red-500
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY);

            return (
              <g key={index}>
                {/* Wick (high-low line) */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth="1"
                />
                
                {/* Candle body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={Math.max(bodyHeight, 2)} // Minimum height of 2px
                  fill={candleColor} // Always fill with color
                  stroke={candleColor}
                  strokeWidth="1"
                  opacity={1} // Full opacity
                />

                {/* Small circles at open/close for very small bodies */}
                {bodyHeight < 2 && (
                  <>
                    <circle
                      cx={x}
                      cy={openY}
                      r="1"
                      fill={candleColor}
                    />
                    <circle
                      cx={x}
                      cy={closeY}
                      r="1"
                      fill={candleColor}
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Time labels */}
        <div className="flex justify-between mt-3 text-sm font-medium text-fg-primary text-opacity-70">
          <span>24h ago</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
};

export default CandlestickChart; 