import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import { RootState } from "@/store";
import styles from "./CustomChart.module.css";

export interface ChartData {
  date: Date;
  price: number;
  ma2Year: number;
  multiplier: number;
  profitLine?: number;
  lossLine?: number;
  avgLine?: number;
}

interface CustomChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  // Override Redux state with props if needed
  showDots?: boolean;
  enableScreenCapture?: boolean;
  yAxisPosition?: "left" | "right";
  showProfitLine?: boolean;
  showLossLine?: boolean;
  showAvgLine?: boolean;
}

const CustomChart: React.FC<CustomChartProps> = ({
  data,
  width = 1400,
  height = 600,
  showDots: showDotsProp,
  enableScreenCapture: enableScreenCaptureProp,
  yAxisPosition: yAxisPositionProp,
  showProfitLine: showProfitLineProp,
  showLossLine: showLossLineProp,
  showAvgLine: showAvgLineProp,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    data: ChartData;
    visible: boolean;
  } | null>(null);

  // Get configuration from Redux store
  const chartConfig = useSelector((state: RootState) => state.chart);

  // Props override Redux state
  const showDots = showDotsProp !== undefined ? showDotsProp : chartConfig.showDots;
  const enableScreenCapture = enableScreenCaptureProp !== undefined ? enableScreenCaptureProp : chartConfig.enableScreenCapture;
  const yAxisPosition = yAxisPositionProp || chartConfig.yAxisPosition;
  const showProfitLine = showProfitLineProp !== undefined ? showProfitLineProp : chartConfig.lineVisibility.showProfitLine;
  const showLossLine = showLossLineProp !== undefined ? showLossLineProp : chartConfig.lineVisibility.showLossLine;
  const showAvgLine = showAvgLineProp !== undefined ? showAvgLineProp : chartConfig.lineVisibility.showAvgLine;

  // Determine which lines to show based on the user's requirements
  // When avgLine is enabled, show only current (price) and avgLine
  const visibleLines = {
    current: true, // Always visible
    profit: showAvgLine ? false : showProfitLine,
    loss: showAvgLine ? false : showLossLine,
    avg: showAvgLine,
  };

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
        link.download = `chart-${new Date().getTime()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });
    };

    img.src = url;
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear previous renders

    // Adjust margins based on y-axis position
    const margin = yAxisPosition === "left" 
      ? { top: 20, right: 30, bottom: 30, left: 70 }
      : { top: 20, right: 70, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set background color
    svg.style("background-color", "#ffffff");

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add clip path
    g.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("x", 0)
      .attr("y", 0);

    // X scale (time) - show full data range
    const xDomain = d3.extent(data, (d) => d.date) as [Date, Date];
    const x = d3.scaleTime().domain(xDomain).range([0, innerWidth]);

    // Y scale (log) with dynamic domain based on all visible lines
    const allValues: number[] = [
      ...data.map((d) => d.price),
      ...data.map((d) => d.ma2Year),
    ];
    
    if (visibleLines.profit && data.some((d) => d.profitLine)) {
      allValues.push(...data.filter((d) => d.profitLine).map((d) => d.profitLine!));
    }
    if (visibleLines.loss && data.some((d) => d.lossLine)) {
      allValues.push(...data.filter((d) => d.lossLine).map((d) => d.lossLine!));
    }
    if (visibleLines.avg && data.some((d) => d.avgLine)) {
      allValues.push(...data.filter((d) => d.avgLine).map((d) => d.avgLine!));
    }

    const yDomain = d3.extent(allValues) as [number, number];
    // Optimized padding to ensure lines fill the graph space effectively
    const yMin = Math.max(0.0001, yDomain[0] * 0.7);  // 30% padding below minimum
    const yMax = yDomain[1] * 1.4;  // 40% padding above maximum

    // Generate dynamic tick values based on price range
    const generateYTicks = (min: number, max: number): number[] => {
      const ticks: number[] = [];
      const range = max - min;
      
      // Define tick intervals based on range
      let tickIntervals: number[];
      if (range < 1) {
        tickIntervals = [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];
      } else if (range < 10) {
        tickIntervals = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];
      } else if (range < 100) {
        tickIntervals = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
      } else if (range < 1000) {
        tickIntervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      } else if (range < 10000) {
        tickIntervals = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
      } else {
        tickIntervals = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000];
      }
      
      tickIntervals.forEach(interval => {
        if (interval >= min && interval <= max) {
          ticks.push(interval);
        }
      });
      
      return ticks.length > 0 ? ticks : [min, (min + max) / 2, max];
    };

    const yTicks = generateYTicks(yMin, yMax);

    const y = d3.scaleLog().domain([yMin, yMax]).range([innerHeight, 0]).nice();

    // Line generators with consistent curve type
    const priceLine = d3
      .line<ChartData>()
      .x((d) => x(d.date))
      .y((d) => y(d.price))
      .curve(d3.curveMonotoneX);

    const profitLineGen = d3
      .line<ChartData>()
      .defined((d) => d.profitLine !== undefined && d.profitLine !== null)
      .x((d) => x(d.date))
      .y((d) => y(d.profitLine!))
      .curve(d3.curveMonotoneX);

    const lossLineGen = d3
      .line<ChartData>()
      .defined((d) => d.lossLine !== undefined && d.lossLine !== null)
      .x((d) => x(d.date))
      .y((d) => y(d.lossLine!))
      .curve(d3.curveMonotoneX);

    const avgLineGen = d3
      .line<ChartData>()
      .defined((d) => d.avgLine !== undefined && d.avgLine !== null)
      .x((d) => x(d.date))
      .y((d) => y(d.avgLine!))
      .curve(d3.curveMonotoneX);

    // Add grid (horizontal only)
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#E6E6E6")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Function to determine time format based on zoom scale
    const getTimeFormat = (scale: number) => {
      if (scale <= 1) return d3.timeFormat("%Y");
      if (scale <= 2) return d3.timeFormat("%b %Y");
      return d3.timeFormat("%b %d, %Y");
    };

    // Function to determine number of ticks based on zoom scale
    const getTickCount = (scale: number) => {
      if (scale <= 1) return 6;
      if (scale <= 2) return 12;
      return 15;
    };

    // Add X axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickFormat((d) => getTimeFormat(1)(d as Date))
      );

    // Style X axis
    xAxis.selectAll("line").attr("stroke", "#ccc").attr("stroke-width", 1);
    xAxis.selectAll("path").attr("stroke", "#ccc").attr("stroke-width", 1);
    xAxis
      .selectAll("text")
      .attr("fill", "#666")
      .attr("font-size", "12px")
      .attr(
        "font-family",
        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif"
      );

    // Add Y axis with smart formatting
    const formatYAxis = (value: number): string => {
      if (value >= 1000000) {
        return d3.format(".2f")(value / 1000000) + "M";
      } else if (value >= 1000) {
        return d3.format(",.0f")(value / 1000) + "K";
      } else if (value >= 1) {
        return d3.format(".2f")(value);
      } else if (value >= 0.01) {
        return d3.format(".3f")(value);
      } else if (value >= 0.001) {
        return d3.format(".4f")(value);
      } else {
        return d3.format(".6f")(value);
      }
    };

    const yAxisGenerator = yAxisPosition === "left" ? d3.axisLeft(y) : d3.axisRight(y);
    const yAxis = g.append("g")
      .attr("transform", yAxisPosition === "right" ? `translate(${innerWidth},0)` : null)
      .call(
        yAxisGenerator
          .tickValues(yTicks)
          .tickFormat((d) => formatYAxis(d as number))
      );

    // Style Y axis
    yAxis.selectAll("line").attr("stroke", "#ccc").attr("stroke-width", 1);
    yAxis.selectAll("path").attr("stroke", "#ccc").attr("stroke-width", 1);
    yAxis
      .selectAll("text")
      .attr("fill", "#666")
      .attr("font-size", "12px")
      .attr(
        "font-family",
        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif"
      );

    // Draw lines in order (back to front)
    // 1. MA line (200W MA) - REMOVED per user request

    // 2. Profit line (if visible and data available)
    if (visibleLines.profit && data.some((d) => d.profitLine)) {
      g.append("path")
        .datum(data)
        .attr("class", "line-path profit")
        .attr("fill", "none")
        .attr("stroke", "#4CAF50")
        .attr("stroke-width", 1.5)
        .attr("d", profitLineGen)
        .attr("clip-path", "url(#clip)");
    }

    // 3. Loss line (if visible and data available)
    if (visibleLines.loss && data.some((d) => d.lossLine)) {
      g.append("path")
        .datum(data)
        .attr("class", "line-path loss")
        .attr("fill", "none")
        .attr("stroke", "#F44336")
        .attr("stroke-width", 1.5)
        .attr("d", lossLineGen)
        .attr("clip-path", "url(#clip)");
    }

    // 4. Average line (if visible and data available)
    if (visibleLines.avg && data.some((d) => d.avgLine)) {
      g.append("path")
        .datum(data)
        .attr("class", "line-path avg")
        .attr("fill", "none")
        .attr("stroke", "#FF9800")
        .attr("stroke-width", 2)
        .attr("d", avgLineGen)
        .attr("clip-path", "url(#clip)");
    }

    // 5. Price line (current - always on top)
    g.append("path")
      .datum(data)
      .attr("class", "line-path price")
      .attr("fill", "none")
      .attr("stroke", "#000000")
      .attr("stroke-width", 2)
      .attr("d", priceLine)
      .attr("clip-path", "url(#clip)");

    // Add colored dots on the price line (optional)
    if (showDots) {
      const sampledData = data.filter((d, i) => i % 7 === 0 && d.multiplier >= 1.5);
      
      const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([1.5, 2.5]);
      
      const dotsGroup = g.append("g")
        .attr("class", "dots-group")
        .attr("clip-path", "url(#clip)");
      
      dotsGroup.selectAll("circle")
        .data(sampledData)
        .enter()
        .append("circle")
        .attr("class", "data-dot")
        .attr("cx", (d) => x(d.date))
        .attr("cy", (d) => y(d.price))
        .attr("r", 5)
        .attr("fill", (d) => colorScale(d.multiplier))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .style("opacity", 0.9);
    }

    // Create hover interaction layer
    const hoverGroup = g.append("g")
      .attr("class", "hover-group")
      .attr("clip-path", "url(#clip)")
      .style("display", "none");
    
    // Vertical crosshair line
    const verticalLine = hoverGroup.append("line")
      .attr("class", "crosshair-vertical")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#666")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");
    
    // Hover circles for all visible lines
    const hoverCirclePrice = hoverGroup.append("circle")
      .attr("class", "hover-circle-price")
      .attr("r", 5)
      .attr("fill", "#FF6B6B")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    let hoverCircleProfit: d3.Selection<SVGCircleElement, unknown, null, undefined> | null = null;
    let hoverCircleLoss: d3.Selection<SVGCircleElement, unknown, null, undefined> | null = null;
    let hoverCircleAvg: d3.Selection<SVGCircleElement, unknown, null, undefined> | null = null;

    if (visibleLines.profit) {
      hoverCircleProfit = hoverGroup.append("circle")
        .attr("class", "hover-circle-profit")
        .attr("r", 5)
        .attr("fill", "#4CAF50")
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    }

    if (visibleLines.loss) {
      hoverCircleLoss = hoverGroup.append("circle")
        .attr("class", "hover-circle-loss")
        .attr("r", 5)
        .attr("fill", "#F44336")
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    }

    if (visibleLines.avg) {
      hoverCircleAvg = hoverGroup.append("circle")
        .attr("class", "hover-circle-avg")
        .attr("r", 5)
        .attr("fill", "#FF9800")
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    }

    // Create overlay for mouse interaction
    g.append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const xDate = x.invert(mouseX);
        
        // Find closest data point
        const bisect = d3.bisector((d: ChartData) => d.date).left;
        const index = bisect(data, xDate);
        
        if (index > 0 && index < data.length) {
          const d0 = data[index - 1];
          const d1 = data[index];
          const d = xDate.getTime() - d0.date.getTime() > d1.date.getTime() - xDate.getTime() ? d1 : d0;
          
          const xPos = x(d.date);
          const yPosPrice = y(d.price);
          
          // Update crosshair and circles
          hoverGroup.style("display", null);
          verticalLine.attr("x1", xPos).attr("x2", xPos);
          hoverCirclePrice.attr("cx", xPos).attr("cy", yPosPrice);

          if (visibleLines.profit && hoverCircleProfit && d.profitLine) {
            const yPosProfit = y(d.profitLine);
            hoverCircleProfit.attr("cx", xPos).attr("cy", yPosProfit);
          }

          if (visibleLines.loss && hoverCircleLoss && d.lossLine) {
            const yPosLoss = y(d.lossLine);
            hoverCircleLoss.attr("cx", xPos).attr("cy", yPosLoss);
          }

          if (visibleLines.avg && hoverCircleAvg && d.avgLine) {
            const yPosAvg = y(d.avgLine);
            hoverCircleAvg.attr("cx", xPos).attr("cy", yPosAvg);
          }
          
          // Update tooltip data
          setTooltipData({
            x: xPos + margin.left,
            y: yPosPrice + margin.top,
            data: d,
            visible: true,
          });
        }
      })
      .on("mouseleave", function() {
        hoverGroup.style("display", "none");
        setTooltipData(null);
      });

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.7, 8])
      .translateExtent([
        [0, -margin.top],
        [innerWidth, innerHeight + margin.bottom],
      ])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const t = event.transform;
        const xScaled = t.rescaleX(x);
        const yScaled = t.rescaleY(y);
        const currentScale = t.k;

        // Update X axis
        xAxis.call(
          d3
            .axisBottom(xScaled)
            .ticks(getTickCount(currentScale))
            .tickFormat((d) => getTimeFormat(currentScale)(d as Date))
        );

        // Update Y axis with smart formatting
        const yAxisScaledGenerator = yAxisPosition === "left" 
          ? d3.axisLeft(yScaled) 
          : d3.axisRight(yScaled);
        yAxis.call(
          yAxisScaledGenerator
            .tickValues(
              yTicks.filter(
                (tick) =>
                  tick >= yScaled.domain()[0] && tick <= yScaled.domain()[1]
              )
            )
            .tickFormat((d) => formatYAxis(d as number))
        );

        // Update grid lines
        g.selectAll(".grid line").remove();
        g.select(".grid")
          .selectAll("line")
          .data(
            yTicks.filter(
              (tick) =>
                tick >= yScaled.domain()[0] && tick <= yScaled.domain()[1]
            )
          )
          .enter()
          .append("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", (d) => yScaled(d))
          .attr("y2", (d) => yScaled(d))
          .attr("stroke", "#E6E6E6")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3");

        // Update all visible lines
        const updateLine = d3
          .line<ChartData>()
          .x((d) => xScaled(d.date))
          .y((d) => yScaled(d.price))
          .curve(d3.curveMonotoneX);

        g.select(".line-path.price").datum(data).attr("d", updateLine);

        if (visibleLines.profit) {
          const updateProfitLine = d3
            .line<ChartData>()
            .defined((d) => d.profitLine !== undefined && d.profitLine !== null)
            .x((d) => xScaled(d.date))
            .y((d) => yScaled(d.profitLine!))
            .curve(d3.curveMonotoneX);

          g.select(".line-path.profit").datum(data).attr("d", updateProfitLine);
        }

        if (visibleLines.loss) {
          const updateLossLine = d3
            .line<ChartData>()
            .defined((d) => d.lossLine !== undefined && d.lossLine !== null)
            .x((d) => xScaled(d.date))
            .y((d) => yScaled(d.lossLine!))
            .curve(d3.curveMonotoneX);

          g.select(".line-path.loss").datum(data).attr("d", updateLossLine);
        }

        if (visibleLines.avg) {
          const updateAvgLine = d3
            .line<ChartData>()
            .defined((d) => d.avgLine !== undefined && d.avgLine !== null)
            .x((d) => xScaled(d.date))
            .y((d) => yScaled(d.avgLine!))
            .curve(d3.curveMonotoneX);

          g.select(".line-path.avg").datum(data).attr("d", updateAvgLine);
        }
        
        // Update dots position on zoom
        if (showDots) {
          g.selectAll(".data-dot")
            .attr("cx", (d: any) => xScaled(d.date))
            .attr("cy", (d: any) => yScaled(d.price))
            .attr("r", () => currentScale > 2 ? 6 : 5);
        }
      });

    // Add zoom
    svg.call(zoom as any);

    // Add color scale legend at the bottom (only when dots are shown)
    if (showDots) {
      const legendWidth = 300;
      const legendHeight = 15;
      const legendX = (width - legendWidth) / 2;
      const legendY = height - 10;
      
      const legendGroup = svg.append("g")
        .attr("class", "color-legend")
        .attr("transform", `translate(${legendX},${legendY})`);
      
      // Create gradient for the legend
      const defs = svg.select("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%");
      
      const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([1.5, 2.5]);
      
      for (let i = 0; i <= 10; i++) {
        const value = 1.5 + (i / 10) * (2.5 - 1.5);
        gradient.append("stop")
          .attr("offset", `${i * 10}%`)
          .attr("stop-color", colorScale(value));
      }
      
      // Add legend rectangle
      legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
      
      // Add legend labels
      legendGroup.append("text")
        .attr("x", 0)
        .attr("y", legendHeight + 12)
        .attr("text-anchor", "start")
        .attr("font-size", "11px")
        .attr("fill", "#666")
        .text("1.5x");
      
      legendGroup.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", legendHeight + 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "#666")
        .text("Multiplier");
      
      legendGroup.append("text")
        .attr("x", legendWidth)
        .attr("y", legendHeight + 12)
        .attr("text-anchor", "end")
        .attr("font-size", "11px")
        .attr("fill", "#666")
        .text("2.5x");
    }

    // Add line legend
    const lineLegendY = 40;
    const lineLegendX = margin.left;
    const legendItemWidth = 120;
    let legendItemIndex = 0;

    const lineLegendGroup = svg.append("g")
      .attr("class", "line-legend")
      .attr("transform", `translate(${lineLegendX},${lineLegendY})`);

    // Helper function to add legend item
    const addLegendItem = (label: string, color: string) => {
      const item = lineLegendGroup.append("g")
        .attr("transform", `translate(${legendItemIndex * legendItemWidth},0)`);

      item.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", color)
        .attr("stroke-width", 2);

      item.append("text")
        .attr("x", 25)
        .attr("y", 4)
        .attr("font-size", "11px")
        .attr("fill", "#666")
        .text(label);

      legendItemIndex++;
    };

    // Add legend items for visible lines
    addLegendItem("Current", "#000000");
    
    if (visibleLines.profit) {
      addLegendItem("Profit", "#4CAF50");
    }
    if (visibleLines.loss) {
      addLegendItem("Loss", "#F44336");
    }
    if (visibleLines.avg) {
      addLegendItem("Average", "#FF9800");
    }

  }, [data, width, height, showDots, yAxisPosition, visibleLines.profit, visibleLines.loss, visibleLines.avg]);

  // Smart price formatting for tooltips
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (price >= 1) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
    } else if (price >= 0.01) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      });
    } else {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 8,
      });
    }
  };

  // Render tooltip
  const renderTooltip = () => {
    if (!tooltipData || !tooltipData.visible) return null;

    const margin = yAxisPosition === "left" 
      ? { top: 20, right: 30, bottom: 30, left: 70 }
      : { top: 20, right: 70, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const tooltipWidth = 220;
    const tooltipHeight = visibleLines.avg ? 160 : 140;
    
    // Calculate position constrained to chart area
    let left = tooltipData.x + 15;
    let top = tooltipData.y - 80;
    
    // Keep tooltip within horizontal bounds
    if (left + tooltipWidth > margin.left + innerWidth) {
      left = tooltipData.x - tooltipWidth - 15;
    }
    if (left < margin.left) {
      left = margin.left;
    }
    
    // Keep tooltip within vertical bounds
    if (top < margin.top) {
      top = margin.top;
    }
    if (top + tooltipHeight > margin.top + innerHeight) {
      top = margin.top + innerHeight - tooltipHeight;
    }

    return (
      <div className={styles.tooltip} style={{ left, top }}>
        <div className={styles.tooltipHeader}>
          {tooltipData.data.date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        
        <div className={styles.tooltipGrid}>
          {/* Current Price */}
          <div className={styles.tooltipPanel}>
            <div className={styles.tooltipLabel}>Current Price</div>
            <div className={`${styles.tooltipValue} ${styles.valuePrice}`}>
              ${formatPrice(tooltipData.data.price)}
            </div>
          </div>
          
          {/* Profit Line */}
          {visibleLines.profit && tooltipData.data.profitLine && (
            <div className={styles.tooltipPanel}>
              <div className={styles.tooltipLabel}>Profit Line</div>
              <div className={`${styles.tooltipValue} ${styles.valueProfit}`}>
                ${formatPrice(tooltipData.data.profitLine)}
              </div>
            </div>
          )}
          
          {/* Loss Line */}
          {visibleLines.loss && tooltipData.data.lossLine && (
            <div className={styles.tooltipPanel}>
              <div className={styles.tooltipLabel}>Loss Line</div>
              <div className={`${styles.tooltipValue} ${styles.valueLoss}`}>
                ${formatPrice(tooltipData.data.lossLine)}
              </div>
            </div>
          )}
          
          {/* Average Line */}
          {visibleLines.avg && tooltipData.data.avgLine && (
            <div className={styles.tooltipPanel}>
              <div className={styles.tooltipLabel}>Average Line</div>
              <div className={`${styles.tooltipValue} ${styles.valueAvg}`}>
                ${formatPrice(tooltipData.data.avgLine)}
              </div>
            </div>
          )}
          
          {/* Multiplier */}
          <div className={styles.tooltipPanel}>
            <div className={styles.tooltipLabel}>Multiplier</div>
            <div className={`${styles.tooltipValue} ${styles.valueMultiplier}`}>
              {tooltipData.data.multiplier.toFixed(2)}x
            </div>
          </div>
          
          {/* % vs MA */}
          <div className={styles.tooltipPanel}>
            <div className={styles.tooltipLabel}>% vs MA</div>
            <div className={`${styles.tooltipValue} ${
              tooltipData.data.multiplier > 1 ? styles.valuePositive : styles.valueNegative
            }`}>
              {((tooltipData.data.multiplier - 1) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={styles.chartContainer}>
      {/* Screen Capture Button */}
      {enableScreenCapture && (
        <button
          onClick={captureChart}
          className={styles.captureButton}
          title="Capture Chart"
        >
          <svg
            className={styles.captureIcon}
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
        </button>
      )}
      
      <svg ref={svgRef} className={styles.svgChart} style={{ height }} />
      
      {renderTooltip()}
    </div>
  );
};

export default CustomChart;
