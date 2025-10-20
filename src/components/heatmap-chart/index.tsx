import React, { useRef, useEffect, useState } from 'react';
import { ParsedBinanceKline } from '@/types/general.types';
import * as d3 from 'd3';

interface HeatmapChartProps {
  data: ParsedBinanceKline[] | null;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
}

interface HeatmapDataPoint {
  date: Date;
  timestamp: number;
  price: number;
  ma200Week: number;
  maPercentIncrease?: number;
  showDot?: boolean;
  dotColor?: string;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ 
  data, 
  title = "200 Week Moving Average Heatmap",
  subtitle = "Monthly heatmap on the percent change of the 200 week moving average",
  width = 1400,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    data: HeatmapDataPoint;
    visible: boolean;
  } | null>(null);

  // Process data to calculate 200-week MA and heatmap colors
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Since we're using weekly data from Binance API
    const MA_PERIOD_WEEKS = 200; // 200-week moving average
    const FOUR_WEEKS = 4; // Show dot every 4 weeks (4 data points)

    // Sort data by time
    const sortedData = [...data].sort((a, b) => a.openTime - b.openTime);

    const result: HeatmapDataPoint[] = [];

    sortedData.forEach((kline, index) => {
      const date = new Date(kline.openTime);
      const price = kline.close;

      // Calculate 200-week moving average
      let ma200Week = price;
      const dataPointsNeeded = MA_PERIOD_WEEKS;

      if (index >= dataPointsNeeded) {
        let sum = 0;
        for (let i = index - dataPointsNeeded; i < index; i++) {
          sum += sortedData[i].close;
        }
        ma200Week = sum / dataPointsNeeded;
      } else if (index > 0) {
        // For early data, use what we have
        let sum = 0;
        for (let i = 0; i <= index; i++) {
          sum += sortedData[i].close;
        }
        ma200Week = sum / (index + 1);
      }

      // Calculate percent increase from previous month (4 weeks ago)
      let maPercentIncrease: number | undefined;
      let showDot = false;
      let dotColor = undefined;

      if (index >= FOUR_WEEKS) {
        const prevMA = result[index - FOUR_WEEKS]?.ma200Week || ma200Week;
        if (prevMA > 0) {
          maPercentIncrease = ((ma200Week - prevMA) / prevMA) * 100;
        }
      }

      // Show dots every 4 weeks (every 4th data point since we have weekly data)
      if (index % FOUR_WEEKS === 0) {
        showDot = true;

        // Color coding based on percent increase in monthly moving average
        // Using continuous color scale matching the gradient bar
        if (maPercentIncrease !== undefined) {
          // Create color scale: maps percentage (0-16%) to gradient colors
          // For values outside 0-16%, extend proportionally to the edges
          const colorScale = d3.scaleLinear<string>()
            .domain([0, 2, 4, 6, 8, 10, 12, 14, 16])
            .range(['#8A2BE2', '#4169E1', '#00CED1', '#ADFF2F', '#FFD700', '#FFA500', '#FF8C00', '#FF4500', '#FF0000'])
            .clamp(true);
          
          // Map the actual percent increase to the color scale (clamped at 0 and 16)
          dotColor = colorScale(Math.min(16, Math.max(0, maPercentIncrease)));
        } else {
          dotColor = '#4169E1'; // Default blue for early data
        }
      }

      result.push({
        date,
        timestamp: kline.openTime,
        price,
        ma200Week,
        maPercentIncrease,
        showDot,
        dotColor,
      });
    });

    return result;
  }, [data]);

  useEffect(() => {
    if (!processedData || processedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    /*
     * Border Configuration:
     * - top: 45px (title + top clearance)
     * - right: 35px (right-side breathing room)
     * - bottom: 55px (x-axis labels + bottom clearance)
     * - left: 75px (y-axis labels + left clearance)
     */
    const margin = { top: 45, right: 35, bottom: 55, left: 75 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.style('background-color', '#ffffff');

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add clip path
    g.append('defs')
      .append('clipPath')
      .attr('id', 'heatmap-clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('x', 0)
      .attr('y', 0);

    /*
     * Date Sequence Configuration:
     * - Extract actual data date range from processedData
     * - Add 5% time buffer on each side for visual balance
     * - Prevents data from touching chart edges
     */
    const dataXDomain = d3.extent(processedData, (d) => d.date) as [Date, Date];

    // Add visual buffers: 5% padding on each side for better visual balance
    const timeRange = dataXDomain[1].getTime() - dataXDomain[0].getTime();
    const bufferTime = timeRange * 0.05; // 5% buffer on each side

    const xDomain: [Date, Date] = [
      new Date(dataXDomain[0].getTime() - bufferTime),
      new Date(dataXDomain[1].getTime() + bufferTime)
    ];

    const x = d3.scaleTime().domain(xDomain).range([0, innerWidth]);

    // Y scale (log) - Optimized padding for better visual balance
    const allPrices = processedData.map(d => d.price);
    const allMAValues = processedData.map(d => d.ma200Week);
    const allYValues = [...allPrices, ...allMAValues];

    const yDomain = d3.extent(allYValues) as [number, number];

    /*
     * Y-Axis Padding Configuration:
     * - 40% padding below minimum value (better data visibility at bottom)
     * - 80% padding above maximum value (adequate headroom for growth)
     * - Ensures data doesn't touch chart edges while maintaining good scale
     */
    const yMin = Math.max(0.1, yDomain[0] * 0.6);  // 40% padding below (reduced from 70%)
    const yMax = yDomain[1] * 1.8;  // 80% padding above (reduced from 150%)

    const y = d3.scaleLog().domain([yMin, yMax]).range([innerHeight, 0]).nice();

    // Generate dynamic Y tick values based on data range (logarithmic scale)
    const generateYTicks = (min: number, max: number): number[] => {
      const ticks: number[] = [];
      const potentialTicks = [
        0.1, 0.2, 0.5,
        1, 2, 3, 5, 
        10, 20, 30, 50, 
        100, 200, 300, 500, 
        1000, 2000, 3000, 5000, 
        10000, 20000, 30000, 50000, 
        100000, 200000, 500000
      ];
      
      potentialTicks.forEach(tick => {
        if (tick >= min && tick <= max) {
          ticks.push(tick);
        }
      });
      
      return ticks.length > 0 ? ticks : [min, (min + max) / 2, max];
    };
    
    const yTicks = generateYTicks(yMin, yMax);

    // Line generators
    const priceLine = d3
      .line<HeatmapDataPoint>()
      .x((d) => x(d.date))
      .y((d) => y(d.price))
      .curve(d3.curveMonotoneX);

    const maLine = d3
      .line<HeatmapDataPoint>()
      .x((d) => x(d.date))
      .y((d) => y(d.ma200Week))
      .curve(d3.curveMonotoneX);

    // Add grid (horizontal only)
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#f0f0f0')
      .attr('stroke-width', 1);

    // Time format functions
    const getTimeFormat = (scale: number) => {
      if (scale <= 1) return d3.timeFormat('%Y');
      if (scale <= 2) return d3.timeFormat('%b %Y');
      return d3.timeFormat('%b %d, %Y');
    };

    const getTickCount = (scale: number) => {
      if (scale <= 1) return 10;  // More ticks for better year distribution
      if (scale <= 2) return 12;
      return 15;
    };
    
    // Helper to get unique year ticks
    const getYearTicks = (domain: [Date, Date]) => {
      const years: Date[] = [];
      const startYear = domain[0].getFullYear();
      const endYear = domain[1].getFullYear();

      // Calculate step size to get about 10-12 evenly distributed years
      const yearSpan = endYear - startYear;
      const step = yearSpan <= 12 ? 1 : Math.ceil(yearSpan / 10);

      for (let year = startYear; year <= endYear; year += step) {
        let tickDate: Date;

        // For the first year, position tick closer to data start if it's not January
        if (year === startYear) {
          const startMonth = domain[0].getMonth();
          // If data starts after March, position tick in middle of year for better visual balance
          // If data starts in Q1, position at start of data, otherwise position at mid-year
          if (startMonth >= 3) {
            tickDate = new Date(year, 5, 15); // Mid-year (June 15th)
          } else {
            tickDate = new Date(domain[0]); // Use actual data start date
          }
        } else {
          // For other years, position at mid-year for consistency
          tickDate = new Date(year, 5, 15);
        }

        years.push(tickDate);
      }

      // Always include the last year if not already included
      if (years[years.length - 1].getFullYear() !== endYear) {
        years.push(new Date(endYear, 5, 15));
      }

      return years;
    };

    // Y axis formatter - Professional formatting
    const formatYAxis = (value: number): string => {
      if (value >= 1000) {
        const kValue = value / 1000;
        // Format like 1.0K, 3.0K, 10.0K, 50.0K, 100.0K
        if (kValue >= 10) {
          return kValue.toFixed(1) + 'K';
        }
        return kValue.toFixed(1) + 'K';
      } else if (value >= 100) {
        // Format like 100.00, 300.00, 500.00
        return value.toFixed(0) + '.00';
      } else if (value >= 10) {
        // Format like 10.00, 30.00, 50.00
        return value.toFixed(2);
      } else {
        // Format like 1.00, 3.00, 5.00
        return value.toFixed(2);
      }
    };

    // Add X axis with unique year ticks
    const yearTicks = getYearTicks(xDomain);

    // Ensure first tick isn't too far from origin by limiting its position
    const firstTick = yearTicks[0];
    const maxFirstTickPosition = innerWidth * 0.15; // Max 15% of chart width
    const firstTickPosition = x(firstTick);

    if (firstTickPosition > maxFirstTickPosition) {
      // If first tick is too far, create a new tick closer to the start
      const adjustedFirstTick = new Date(xDomain[0]);
      yearTicks[0] = adjustedFirstTick;
    }

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(yearTicks)
          .tickFormat((d) => getTimeFormat(1)(d as Date))
      );

    xAxis.selectAll('line').attr('stroke', '#ccc').attr('stroke-width', 1);
    xAxis.selectAll('path').attr('stroke', '#ccc').attr('stroke-width', 1);
    xAxis
      .selectAll('text')
      .attr('fill', '#999')
      .attr('font-size', '12px')
      .style('text-anchor', 'middle');

    // Add Y axis
    const yAxis = g.append('g').call(
      d3
        .axisLeft(y)
        .tickValues(yTicks)
        .tickFormat((d) => formatYAxis(d as number))
    );

    yAxis.selectAll('line').attr('stroke', '#ccc').attr('stroke-width', 1);
    yAxis.selectAll('path').attr('stroke', '#ccc').attr('stroke-width', 1);
    yAxis
      .selectAll('text')
      .attr('fill', '#999')
      .attr('font-size', '12px');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .attr('font-size', '14px')
      .text('USD');

    // Draw 200-week MA line
    g.append('path')
      .datum(processedData)
      .attr('class', 'line-path ma')
      .attr('fill', 'none')
      .attr('stroke', '#5B9BD5')
      .attr('stroke-width', 2.5)
      .attr('d', maLine)
      .attr('clip-path', 'url(#heatmap-clip)');

    // Draw price line connecting the dots
    g.append('path')
      .datum(processedData)
      .attr('class', 'line-path price')
      .attr('fill', 'none')
      .attr('stroke', '#70757a')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5)
      .attr('d', priceLine)
      .attr('clip-path', 'url(#heatmap-clip)');

    // Add colored dots
    const dotsData = processedData.filter((d) => d.showDot);
    const dotsGroup = g
      .append('g')
      .attr('class', 'dots-group')
      .attr('clip-path', 'url(#heatmap-clip)');

    dotsGroup
      .selectAll('circle')
      .data(dotsData)
      .enter()
      .append('circle')
      .attr('class', 'data-dot')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.price))
      .attr('r', 5)
      .attr('fill', (d) => d.dotColor || '#4169E1')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Store current zoom transform to use in mousemove handler
    let currentZoomTransform = d3.zoomIdentity;

    // Create hover interaction layer
    const hoverGroup = g
      .append('g')
      .attr('class', 'hover-group')
      .attr('clip-path', 'url(#heatmap-clip)')
      .style('display', 'none');

    const verticalLine = hoverGroup
      .append('line')
      .attr('class', 'crosshair-vertical')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    const horizontalLine = hoverGroup
      .append('line')
      .attr('class', 'crosshair-horizontal')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    const hoverCircleMA = hoverGroup
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#4169E1')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Overlay for mouse interaction - must be added AFTER hover group
    const overlay = g
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function (event) {
        const [mouseX, mouseY] = d3.pointer(event);
        
        // Apply current zoom transform to scales for accurate tracking
        const xScaled = currentZoomTransform.rescaleX(x);
        const yScaled = currentZoomTransform.rescaleY(y);
        
        const xDate = xScaled.invert(mouseX);

        const bisect = d3.bisector((d: HeatmapDataPoint) => d.date).left;
        const index = bisect(processedData, xDate);

        if (index > 0 && index < processedData.length) {
          const d0 = processedData[index - 1];
          const d1 = processedData[index];
          
          // Find the closest data point for display purposes
          const d = xDate.getTime() - d0.date.getTime() > d1.date.getTime() - xDate.getTime() ? d1 : d0;

          // Interpolate MA value between two surrounding data points for smooth tracking
          const t0 = d0.date.getTime();
          const t1 = d1.date.getTime();
          const tMouse = xDate.getTime();
          
          let interpolatedMA: number;
          if (t0 === t1) {
            interpolatedMA = d0.ma200Week;
          } else {
            // Linear interpolation between the two data points
            const alpha = (tMouse - t0) / (t1 - t0);
            interpolatedMA = d0.ma200Week + (d1.ma200Week - d0.ma200Week) * alpha;
          }

          // Vertical line follows mouse X position (pixel-perfect tracking)
          const xPosPixel = mouseX;
          
          // Horizontal line follows mouse Y position (up/down movement)
          const yPosMouse = mouseY;
          
          // Blue dot constrained to: vertical line (mouseX) AND 200W MA line (interpolatedMA)
          const yPosMA = yScaled(interpolatedMA);

          hoverGroup.style('display', null);
          
          // Vertical line at mouse X
          verticalLine.attr('x1', xPosPixel).attr('x2', xPosPixel);
          
          // Horizontal line at mouse Y (follows up/down movement)
          horizontalLine.attr('y1', yPosMouse).attr('y2', yPosMouse);
          
          // Show blue dot only if this data point doesn't already have a colored dot
          if (d.showDot) {
            hoverCircleMA.style('display', 'none');
          } else {
            hoverCircleMA.style('display', null);
            // Blue dot positioned at intersection of vertical line and MA line
            hoverCircleMA.attr('cx', xPosPixel).attr('cy', yPosMA);
          }

          setTooltipData({
            x: xPosPixel + margin.left,
            y: yPosMA + margin.top,
            data: d,
            visible: true,
          });
        }
      })
      .on('mouseleave', function () {
        hoverGroup.style('display', 'none');
        setTooltipData(null);
      });

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1.0, 8])
      .translateExtent([
        [0, -margin.top],
        [innerWidth, innerHeight + margin.bottom],
      ])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const t = event.transform;
        const xScaled = t.rescaleX(x);
        const yScaled = t.rescaleY(y);
        const currentScale = t.k;

        // Store the current zoom transform for use in mousemove handler
        currentZoomTransform = t;

        // Update X axis
        const scaledDomain = xScaled.domain() as [Date, Date];
        if (currentScale <= 1) {
          // At base zoom level, use unique year ticks to avoid repetition
          const zoomYearTicks = getYearTicks(scaledDomain);

          // Ensure first tick isn't too far from origin by limiting its position
          const firstTick = zoomYearTicks[0];
          const maxFirstTickPosition = innerWidth * 0.15; // Max 15% of chart width
          const firstTickPosition = xScaled(firstTick);

          if (firstTickPosition > maxFirstTickPosition) {
            // If first tick is too far, create a new tick closer to the start
            const adjustedFirstTick = new Date(scaledDomain[0]);
            zoomYearTicks[0] = adjustedFirstTick;
          }

          xAxis.call(
            d3
              .axisBottom(xScaled)
              .tickValues(zoomYearTicks)
              .tickFormat((d) => getTimeFormat(currentScale)(d as Date))
          );
        } else {
          // At zoomed levels, use automatic tick generation
          xAxis.call(
            d3
              .axisBottom(xScaled)
              .ticks(getTickCount(currentScale))
              .tickFormat((d) => getTimeFormat(currentScale)(d as Date))
          );
        }

        xAxis
          .selectAll('text')
          .style('text-anchor', 'middle');

        // Update Y axis
        yAxis.call(
          d3
            .axisLeft(yScaled)
            .tickValues(
              yTicks.filter(
                (tick) => tick >= yScaled.domain()[0] && tick <= yScaled.domain()[1]
              )
            )
            .tickFormat((d) => formatYAxis(d as number))
        );

        // Update grid lines
        g.selectAll('.grid line').remove();
        g.select('.grid')
          .selectAll('line')
          .data(
            yTicks.filter(
              (tick) => tick >= yScaled.domain()[0] && tick <= yScaled.domain()[1]
            )
          )
          .enter()
          .append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', (d) => yScaled(d))
          .attr('y2', (d) => yScaled(d))
          .attr('stroke', '#f0f0f0')
          .attr('stroke-width', 1);

        // Update lines
        const updatePriceLine = d3
          .line<HeatmapDataPoint>()
          .x((d) => xScaled(d.date))
          .y((d) => yScaled(d.price))
          .curve(d3.curveMonotoneX);

        const updateMALine = d3
          .line<HeatmapDataPoint>()
          .x((d) => xScaled(d.date))
          .y((d) => yScaled(d.ma200Week))
          .curve(d3.curveMonotoneX);

        g.select('.line-path.price').datum(processedData).attr('d', updatePriceLine);
        g.select('.line-path.ma').datum(processedData).attr('d', updateMALine);

        // Update dots
        g.selectAll('.data-dot')
          .attr('cx', (d: any) => xScaled(d.date))
          .attr('cy', (d: any) => yScaled(d.price))
          .attr('r', () => (currentScale > 2 ? 6 : 5));

        // Update overlay rect to maintain hover functionality
        overlay
          .attr('width', innerWidth)
          .attr('height', innerHeight);
      });

    svg.call(zoom as any);

    // Add legend
    const legendGroup = svg
      .append('g')
      .attr('class', 'line-legend')
      .attr('transform', `translate(${margin.left}, 15)`);

    // MA legend only
    const maLegend = legendGroup.append('g');
    maLegend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#5B9BD5')
      .attr('stroke-width', 2.5);
    maLegend
      .append('text')
      .attr('x', 25)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .text('200 Week MA');

  }, [processedData, width, height]);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderTooltip = () => {
    if (!tooltipData || !tooltipData.visible) return null;

    // Fixed position: 4th quadrant (bottom-right of the crosshair)
    let left = tooltipData.x + 20;
    let top = tooltipData.y + 20;

    return (
      <div
        style={{
          position: 'absolute',
          left,
          top,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          zIndex: 1000,
          minWidth: '220px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
          {tooltipData.data.date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Price:</span>
            <span style={{ fontWeight: '600', color: '#70757a' }}>
              ${formatPrice(tooltipData.data.price)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>200W MA:</span>
            <span style={{ fontWeight: '600', color: '#5B9BD5' }}>
              ${formatPrice(tooltipData.data.ma200Week)}
            </span>
          </div>
          {tooltipData.data.maPercentIncrease !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>MA Change:</span>
              <span style={{ fontWeight: '600', color: tooltipData.data.dotColor || '#666' }}>
                {tooltipData.data.maPercentIncrease.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          margin: '20px 0',
        }}
      >
        <p style={{ color: '#666', fontSize: '16px' }}>Loading data or no data available...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#1a1a1a',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '16px',
          }}
        >
          {subtitle}
        </p>
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <svg ref={svgRef} style={{ width: '100%', height }} />
        {renderTooltip()}
      </div>

      {/* Color legend */}
      <div
        style={{
          marginTop: '30px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontWeight: 'bold',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#333',
          }}
        >
          Percent Increase In Monthly Moving Average
        </p>
        
        {/* Gradient color scale bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            position: 'relative',
            marginBottom: '8px',
          }}
        >
          {/* Gradient bar */}
          <div
            style={{
              width: '100%',
              height: '30px',
              background: 'linear-gradient(90deg, #8A2BE2 0%, #4169E1 12.5%, #00CED1 25%, #ADFF2F 37.5%, #FFD700 50%, #FFA500 62.5%, #FF8C00 75%, #FF4500 87.5%, #FF0000 100%)',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          
          {/* Labels below the bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
            }}
          >
            {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((value) => (
              <span
                key={value}
                style={{
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: '500',
                  textAlign: 'center',
                  flex: 1,
                }}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
