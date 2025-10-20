import React, { useRef, useEffect, useState } from 'react';
import { ParsedBinanceKline } from '@/types/general.types';
import * as d3 from 'd3';

interface MAGraph2Props {
  data: ParsedBinanceKline[] | null;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  yAxisPosition?: "left" | "right";
  enableScreenCapture?: boolean;
}

interface MADataPoint {
  date: Date;
  timestamp: number;
  price: number;
  ma2y: number;
  ma2yMultiplier: number;
}

const MAGraph2: React.FC<MAGraph2Props> = ({
  data,
  title = "Bitcoin Investor Tool: 2-Year MA Multiplier",
  subtitle = "Long timeframe investor tool to identify under/oversold price periods",
  width = 1400,
  height = 600,
  yAxisPosition = "left",
  enableScreenCapture = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setTooltipData] = useState<{
    x: number;
    y: number;
    data: MADataPoint;
    visible: boolean;
  } | null>(null);

  // Process data to calculate 2-year moving average
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort data by time
    const sortedData = [...data].sort((a, b) => a.openTime - b.openTime);

    // 2 years = 730 days. If we have daily data, use 730 points. If weekly, use ~104 weeks.
    // We'll calculate based on actual time difference to be flexible
    const MA_DAYS = 730;
    const result: MADataPoint[] = [];

    sortedData.forEach((kline, index) => {
      const date = new Date(kline.openTime);
      const price = kline.close;

      // Calculate 2-year moving average
      let ma2y = price;

      if (index > 0) {
        const currentTime = kline.openTime;
        const twoYearsAgo = currentTime - (MA_DAYS * 24 * 60 * 60 * 1000);

        // Find all data points within the 2-year window
        let sum = 0;
        let count = 0;
        for (let i = index; i >= 0; i--) {
          if (sortedData[i].openTime >= twoYearsAgo) {
            sum += sortedData[i].close;
            count++;
          } else {
            break;
          }
        }

        if (count > 0) {
          ma2y = sum / count;
        }
      }

      result.push({
        date,
        timestamp: kline.openTime,
        price,
        ma2y,
        ma2yMultiplier: ma2y * 5
      });
    });

    return result;
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || processedData.length === 0) return;

    const margin = yAxisPosition === "left"
      ? { top: 40, right: 40, bottom: 50, left: 80 }
      : { top: 40, right: 80, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', 'white');

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add clip path to constrain lines within graph boundaries
    g.append('defs')
      .append('clipPath')
      .attr('id', 'magraph2-clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('x', 0)
      .attr('y', 0);

    // Get data ranges
    const priceMin = d3.min(processedData, d => d.price) || 1;
    const priceMax = d3.max(processedData, d => d.price) || 10;
    const ma2yMin = d3.min(processedData, d => d.ma2y) || 1;
    const ma2yMax = d3.max(processedData, d => d.ma2y) || 10;
    const multiplierMin = d3.min(processedData, d => d.ma2yMultiplier) || 1;
    const multiplierMax = d3.max(processedData, d => d.ma2yMultiplier) || 10;

    // Calculate min/max across ALL three lines
    const overallMin = Math.min(priceMin, ma2yMin, multiplierMin);
    const overallMax = Math.max(priceMax, ma2yMax, multiplierMax);

    // Add modest padding (10%) to ensure values don't touch edges
    const yMin = overallMin * 0.9;
    const yMax = overallMax * 1.1;

    // Create scales
    const extent = d3.extent(processedData, d => d.date) as [Date, Date];
    // Add minimal padding to ensure ticks don't get cut off at edges
    const totalTimeSpan = extent[1].getTime() - extent[0].getTime();
    const domainPadding = Math.max(totalTimeSpan * 0.01, 30 * 24 * 60 * 60 * 1000); // 1% or 30 days minimum
    const paddedExtent: [Date, Date] = [
      new Date(extent[0].getTime() - domainPadding),
      new Date(extent[1].getTime() + domainPadding)
    ];

    const x = d3.scaleTime()
      .domain(paddedExtent)
      .range([0, innerWidth]);

    const y = d3.scaleLog()
      .domain([Math.max(1, yMin), yMax])
      .range([innerHeight, 0]);

    // Helper functions for formatting based on zoom level
    const getTimeFormat = (scale: number) => {
      if (scale <= 1) return d3.timeFormat('%Y');
      if (scale <= 2) return d3.timeFormat('%b %Y');
      if (scale <= 4) return d3.timeFormat('%b %d');
      return d3.timeFormat('%b %d');
    };

    const formatYAxis = (value: number): string => {
      if (value >= 1000) {
        const kValue = value / 1000;
        if (kValue >= 10) {
          return '$' + kValue.toFixed(1) + 'K';
        }
        return '$' + kValue.toFixed(2) + 'K';
      }
      return '$' + value.toFixed(2);
    };

    // Create line generators
    const createLinePath = (xScale: d3.ScaleTime<number, number>, yScale: d3.ScaleLogarithmic<number, number>) => {
      return {
        priceLine: d3.line<MADataPoint>()
          .x(d => xScale(d.date))
          .y(d => yScale(d.price)),
        maLine: d3.line<MADataPoint>()
          .x(d => xScale(d.date))
          .y(d => yScale(d.ma2y)),
        multiplierLine: d3.line<MADataPoint>()
          .x(d => xScale(d.date))
          .y(d => yScale(d.ma2yMultiplier))
      };
    };

    // Add X axis
    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`);

    // Generate tick values for every 2 years, aligned with data
    const generateYearlyTicks = (startDate: Date, endDate: Date) => {
      const ticks = [];
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      // Generate ticks for every 2 years, starting from the actual start year
      for (let year = startYear; year <= endYear; year += 2) {
        // Use the start of the year, but ensure it's within our data range
        const tickDate = new Date(year, 0, 1);
        if (tickDate >= startDate && tickDate <= endDate) {
          ticks.push(tickDate);
        }
      }

      // Always include the end date if it's not already included
      if (ticks.length > 0 && ticks[ticks.length - 1] < endDate) {
        ticks.push(endDate);
      }

      return ticks;
    };

    const yearlyTicks = generateYearlyTicks(extent[0], extent[1]);

    const xAxis = d3.axisBottom(x)
      .tickValues(yearlyTicks)
      .tickFormat(getTimeFormat(1) as any);

    xAxisGroup.call(xAxis)
      .style('color', '#666')
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dy', '1em');

    xAxisGroup.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '400')
      .text('');

    // Add Y axis (log scale with custom ticks)
    const logTicks = [1, 6, 10, 60, 100, 600, 1000, 6000, 10000, 60000, 100000];
    const yAxisGroup = g.append('g');

    const yAxisGenerator = yAxisPosition === "left" ? d3.axisLeft(y) : d3.axisRight(y);
    const yAxis = yAxisGenerator
      .tickValues(logTicks.filter(t => t >= Math.max(1, yMin) && t <= yMax))
      .tickFormat(formatYAxis as any);

    yAxisGroup.call(yAxis)
      .style('color', '#999');

    // Position Y-axis label based on axis position
    if (yAxisPosition === "left") {
      yAxisGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - innerHeight / 2)
        .attr('dy', '1em')
        .attr('fill', '#333')
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .text('BTC Price (USD)');
    } else {
      yAxisGroup.attr('transform', `translate(${innerWidth},0)`)
        .append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', 0 - margin.right + 15)
        .attr('x', 0 - innerHeight / 2)
        .attr('dy', '1em')
        .attr('fill', '#333')
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .text('BTC Price (USD)');
    }

    // Create line paths
    const lines = createLinePath(x, y);

    // Add shaded area between BTC Price and 2Y MA when BTC Price is below 2Y MA
    const areaBelowMA = d3.area<MADataPoint>()
      .x(d => x(d.date))
      .y0(d => y(d.price))
      .y1(d => y(d.ma2y))
      .defined(d => d.price < d.ma2y); // Only shade when price is below MA

    const shadedArea = g.append('path')
      .datum(processedData)
      .attr('class', 'shaded-area')
      .attr('fill', '#00CED1')
      .attr('fill-opacity', 0.15)
      .attr('d', areaBelowMA)
      .attr('clip-path', 'url(#magraph2-clip)')
      .attr('pointer-events', 'none');

    const pricePath = g.append('path')
      .datum(processedData)
      .attr('class', 'price-line')
      .attr('fill', 'none')
      .attr('stroke', '#000000')
      .attr('stroke-width', 1.8)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lines.priceLine)
      .attr('clip-path', 'url(#magraph2-clip)');

    const maPath = g.append('path')
      .datum(processedData)
      .attr('class', 'ma-line')
      .attr('fill', 'none')
      .attr('stroke', '#00CED1')
      .attr('stroke-width', 2.2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lines.maLine)
      .attr('clip-path', 'url(#magraph2-clip)');

    const multiplierPath = g.append('path')
      .datum(processedData)
      .attr('class', 'multiplier-line')
      .attr('fill', 'none')
      .attr('stroke', '#FF1493')
      .attr('stroke-width', 2.2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lines.multiplierLine)
      .attr('clip-path', 'url(#magraph2-clip)');

    // Add legend - positioned at top right matching Blockchain.com
    const legendX = yAxisPosition === "left" ? innerWidth - 280 : 20;
    const legendY = -25;

    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX},${legendY})`);

    const legendItems = [
      { label: 'BTC Price', color: '#000000' },
      { label: '2 Year MA', color: '#00CED1' },
      { label: '2 Year MA * 5', color: '#FF1493' }
    ];

    legendItems.forEach((item, i) => {
      const legendGroup = legend.append('g')
        .attr('transform', `translate(${i * 110},0)`);

      // Colored dot
      legendGroup.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', item.color);

      // Legend text
      legendGroup.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .attr('font-size', '12px')
        .attr('font-family', 'system-ui, -apple-system, sans-serif')
        .attr('fill', '#333')
        .text(item.label);
    });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', '600')
      .attr('fill', '#000')
      .text(title);

    // Add subtitle
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#999')
      .attr('font-weight', '400')
      .text(subtitle);

    // Add watermark (DecenTrader)
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '48px')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('fill', 'rgba(128, 128, 128, 0.1)')
      .attr('font-weight', '300')
      .attr('pointer-events', 'none')
      .text('DecenTrader');

    // Store current zoom transform to use in mousemove handler
    let currentZoomTransform = d3.zoomIdentity;

    // Add interactive elements
    const bisectDate = d3.bisector((d: MADataPoint) => d.date).left;

    // Vertical line for mouse tracking (visible on hover)
    const verticalLine = g.append('line')
      .attr('class', 'vertical-line')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .attr('y1', 0)
      .attr('y2', innerHeight);

    // Horizontal line for mouse tracking (visible on hover)
    const horizontalLine = g.append('line')
      .attr('class', 'horizontal-line')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .attr('x1', 0)
      .attr('x2', innerWidth);

    // Create circles for dots on each line
    const priceCircle = g.append('circle')
      .attr('class', 'price-dot')
      .attr('fill', '#000000')
      .attr('r', 4)
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    const maCircle = g.append('circle')
      .attr('class', 'ma-dot')
      .attr('fill', '#00CED1')
      .attr('r', 4)
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    const multiplierCircle = g.append('circle')
      .attr('class', 'multiplier-dot')
      .attr('fill', '#FF1493')
      .attr('r', 4)
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Tooltip background - styled like Blockchain.com
    const tooltipBg = g.append('rect')
      .attr('class', 'tooltip-bg')
      .attr('fill', 'rgba(255, 255, 255, 0.98)')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('rx', 6)
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Tooltip text group
    const tooltipGroup = g.append('g')
      .attr('class', 'tooltip-group')
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Mouse move handler
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function(event) {
        const mouseX = d3.pointer(event)[0];
        const mouseY = d3.pointer(event)[1];

        // Apply current zoom transform to scales for accurate tracking
        const xScaled = currentZoomTransform.rescaleX(x);
        const yScaled = currentZoomTransform.rescaleY(y);

        const date0 = xScaled.invert(mouseX);
        const index = bisectDate(processedData, date0, 1);
        const d = processedData[index - 1];

        if (d) {
          const xPos = mouseX;
          const priceYPos = yScaled(d.price);
          const maYPos = yScaled(d.ma2y);
          const multiplierYPos = yScaled(d.ma2yMultiplier);

          // Show vertical and horizontal lines
          verticalLine
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('opacity', 0.5);

          horizontalLine
            .attr('y1', mouseY)
            .attr('y2', mouseY)
            .attr('opacity', 0.5);

          // Update circles (dots on lines)
          priceCircle
            .attr('cx', xPos)
            .attr('cy', priceYPos)
            .attr('opacity', 1);

          maCircle
            .attr('cx', xPos)
            .attr('cy', maYPos)
            .attr('opacity', 1);

          multiplierCircle
            .attr('cx', xPos)
            .attr('cy', multiplierYPos)
            .attr('opacity', 1);

          // Format date like in the image: "27 Apr 2017"
          const dateStr = d.date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          // Clear previous tooltip content
          tooltipGroup.selectAll('*').remove();

          // Create tooltip text with proper formatting
          const lines = [
            dateStr,
            `● ${d.price.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`,
            `● ${d.ma2y.toLocaleString('en-US', { maximumFractionDigits: 3 })} USD`,
            `● ${d.ma2yMultiplier.toLocaleString('en-US', { maximumFractionDigits: 3 })} USD`
          ];

          let maxWidth = 0;
          lines.forEach((line, i) => {
            const text = tooltipGroup.append('text')
              .attr('x', 0)
              .attr('y', i * 18)
              .attr('font-size', '12px')
              .attr('font-family', 'system-ui, -apple-system, sans-serif')
              .attr('fill', '#333')
              .attr('font-weight', i === 0 ? '600' : '400')
              .text(line);

            const bbox = (text.node() as SVGTextElement)?.getBBox();
            if (bbox && bbox.width > maxWidth) {
              maxWidth = bbox.width;
            }
          });

          // Position tooltip in 3rd quadrant (bottom-right of intersection)
          const tooltipX = xPos + 12;
          const tooltipY = mouseY + 12;
          const tooltipWidth = maxWidth + 16;
          const tooltipHeight = 14 + lines.length * 18;

          // Update tooltip background position
          tooltipBg
            .attr('x', tooltipX)
            .attr('y', tooltipY)
            .attr('width', tooltipWidth)
            .attr('height', tooltipHeight)
            .attr('opacity', 1);

          // Update tooltip group position
          tooltipGroup
            .attr('transform', `translate(${tooltipX + 8},${tooltipY + 8})`)
            .attr('opacity', 1);

          setTooltipData({
            x: xPos,
            y: mouseY,
            data: d,
            visible: true
          });
        }
      })
      .on('mouseleave', function() {
        verticalLine.attr('opacity', 0);
        horizontalLine.attr('opacity', 0);
        priceCircle.attr('opacity', 0);
        maCircle.attr('opacity', 0);
        multiplierCircle.attr('opacity', 0);
        tooltipBg.attr('opacity', 0);
        tooltipGroup.attr('opacity', 0);
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

        // Generate dynamic tick values based on zoom level
        const getDynamicTicks = (scale: number, domain: [Date, Date]) => {
          const startYear = domain[0].getFullYear();
          const endYear = domain[1].getFullYear();

          if (scale <= 1.5) {
            // Zoomed out: 2-year intervals
            const ticks = [];
            for (let year = startYear; year <= endYear; year += 2) {
              const tickDate = new Date(year, 0, 1);
              if (tickDate >= domain[0] && tickDate <= domain[1]) {
                ticks.push(tickDate);
              }
            }
            if (ticks.length > 0 && ticks[ticks.length - 1] < domain[1]) {
              ticks.push(domain[1]);
            }
            return ticks;
          } else if (scale <= 3) {
            // Medium zoom: yearly intervals
            const ticks = [];
            for (let year = startYear; year <= endYear; year += 1) {
              const tickDate = new Date(year, 0, 1);
              if (tickDate >= domain[0] && tickDate <= domain[1]) {
                ticks.push(tickDate);
              }
            }
            return ticks;
          } else {
            // Zoomed in: monthly intervals
            const ticks = [];
            let currentDate = new Date(domain[0]);
            while (currentDate <= domain[1]) {
              ticks.push(new Date(currentDate));
              currentDate.setMonth(currentDate.getMonth() + 1);
            }
            return ticks;
          }
        };

        const dynamicTicks = getDynamicTicks(currentScale, xScaled.domain() as [Date, Date]);

        // Update X axis with appropriate formatting based on zoom level
        xAxisGroup.call(
          d3
            .axisBottom(xScaled)
            .tickValues(dynamicTicks)
            .tickFormat(getTimeFormat(currentScale) as any)
        );

        xAxisGroup
          .selectAll('text')
          .style('text-anchor', 'middle');

        // Update Y axis
        yAxisGroup.call(
          d3
            .axisLeft(yScaled)
            .tickValues(
              logTicks.filter(
                (tick) => tick >= yScaled.domain()[0] && tick <= yScaled.domain()[1]
              )
            )
            .tickFormat(formatYAxis as any)
        );

        // Update line paths with scaled coordinates
        const scaledLines = createLinePath(xScaled, yScaled);
        pricePath.datum(processedData).attr('d', scaledLines.priceLine);
        maPath.datum(processedData).attr('d', scaledLines.maLine);
        multiplierPath.datum(processedData).attr('d', scaledLines.multiplierLine);

        // Update shaded area with scaled coordinates
        const scaledAreaBelowMA = d3.area<MADataPoint>()
          .x(d => xScaled(d.date))
          .y0(d => yScaled(d.price))
          .y1(d => yScaled(d.ma2y))
          .defined(d => d.price < d.ma2y);

        shadedArea.datum(processedData).attr('d', scaledAreaBelowMA);

        // Update overlay rect to maintain hover functionality
        overlay
          .attr('width', innerWidth)
          .attr('height', innerHeight);
      });

    svg.call(zoom as any);

  }, [processedData, width, height, title, subtitle, yAxisPosition]);

  // Function to capture and download the chart as PNG
  const captureChart = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = svgElement.clientWidth || width;
      canvas.height = svgElement.clientHeight || height;

      // Fill white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the SVG image
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Download the image
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.download = `bitcoin-investor-tool-${new Date().getTime()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });
    };

    img.src = url;
  };

  return (
    <div ref={containerRef} style={{ width: '100%', overflow: 'auto', position: 'relative' }}>
      {/* Screen Capture Button */}
      {enableScreenCapture && (
        <button
          onClick={captureChart}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Capture Chart"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Capture
        </button>
      )}

      <svg ref={svgRef}></svg>
    </div>
  );
};

export default MAGraph2;
