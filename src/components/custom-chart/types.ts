/**
 * Type definitions for CustomChart component
 */

export interface ChartData {
  date: Date;
  price: number;
  ma2Year: number;
  multiplier: number;
  profitLine?: number;
  lossLine?: number;
  avgLine?: number;
}

export interface CustomChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  showDots?: boolean;
  enableScreenCapture?: boolean;
  yAxisPosition?: "left" | "right";
  showProfitLine?: boolean;
  showLossLine?: boolean;
  showAvgLine?: boolean;
}

export interface ChartLineVisibility {
  showProfitLine: boolean;
  showLossLine: boolean;
  showAvgLine: boolean;
}

export interface TooltipData {
  x: number;
  y: number;
  data: ChartData;
  visible: boolean;
}

