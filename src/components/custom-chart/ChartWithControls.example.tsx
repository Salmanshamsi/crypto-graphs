/**
 * Example component demonstrating CustomChart usage with controls
 * 
 * This file shows how to:
 * 1. Use the useChartConfig hook
 * 2. Create interactive controls for line visibility
 * 3. Toggle chart features
 * 4. Manage chart configuration through Redux
 */

import React from 'react';
import CustomChart, { ChartData } from './index';
import { useChartConfig } from '@/hooks/useChartConfig';

// Example data generator - replace with your actual data source
const generateSampleData = (): ChartData[] => {
  const data: ChartData[] = [];
  const startDate = new Date('2020-01-01');
  const basePrice = 10000;
  
  for (let i = 0; i < 365 * 4; i += 7) { // Weekly data for 4 years
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const price = basePrice * (1 + Math.sin(i / 100) * 0.5 + i / 1000);
    const ma2Year = price * 0.85;
    const multiplier = price / ma2Year;
    
    data.push({
      date,
      price,
      ma2Year,
      multiplier,
      profitLine: price * 1.2, // 20% above current price
      lossLine: price * 0.8,   // 20% below current price
      avgLine: (price + ma2Year) / 2, // Average of price and MA
    });
  }
  
  return data;
};

const ChartWithControls: React.FC = () => {
  const {
    lineVisibility,
    showDots,
    enableScreenCapture,
    yAxisPosition,
    toggleProfitLine,
    toggleLossLine,
    toggleAvgLine,
    toggleDots,
    toggleScreenCapture,
    switchYAxisPosition,
    resetConfig,
  } = useChartConfig();

  const sampleData = generateSampleData();

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Crypto Chart - Interactive Example</h1>
      
      {/* Control Panel */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Chart Controls</h2>
        
        {/* Line Visibility Controls */}
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500 }}>
            Line Visibility
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={lineVisibility.showProfitLine}
                onChange={toggleProfitLine}
                disabled={lineVisibility.showAvgLine}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Profit Line</span>
              <span style={{ 
                width: '20px', 
                height: '3px', 
                backgroundColor: '#4CAF50',
                display: 'inline-block'
              }} />
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={lineVisibility.showLossLine}
                onChange={toggleLossLine}
                disabled={lineVisibility.showAvgLine}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Loss Line</span>
              <span style={{ 
                width: '20px', 
                height: '3px', 
                backgroundColor: '#F44336',
                display: 'inline-block'
              }} />
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={lineVisibility.showAvgLine}
                onChange={toggleAvgLine}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Average Line</span>
              <span style={{ 
                width: '20px', 
                height: '3px', 
                backgroundColor: '#FF9800',
                display: 'inline-block'
              }} />
            </label>
          </div>
          
          {lineVisibility.showAvgLine && (
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '12px', 
              color: '#666',
              fontStyle: 'italic' 
            }}>
              ℹ️ When Average Line is enabled, Profit and Loss lines are automatically hidden
            </p>
          )}
        </div>
        
        {/* Other Features */}
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500 }}>
            Features
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showDots}
                onChange={toggleDots}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Show Multiplier Dots</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={enableScreenCapture}
                onChange={toggleScreenCapture}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Enable Screen Capture</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={yAxisPosition === 'right'}
                onChange={switchYAxisPosition}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Y-Axis on Right</span>
            </label>
          </div>
        </div>
        
        {/* Reset Button */}
        <div>
          <button 
            onClick={resetConfig}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2E73C3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
      
      {/* Chart */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <CustomChart 
          data={sampleData}
          width={1400}
          height={600}
        />
      </div>
      
      {/* Info Panel */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e8f4f8', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 600 }}>
          💡 Usage Tips
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Use mouse wheel to zoom in/out on the chart</li>
          <li>Click and drag to pan across time periods</li>
          <li>Hover over the chart to see detailed tooltips</li>
          <li>Toggle lines to compare different metrics</li>
          <li>Enable screen capture to download the chart as an image</li>
        </ul>
      </div>
    </div>
  );
};

export default ChartWithControls;

