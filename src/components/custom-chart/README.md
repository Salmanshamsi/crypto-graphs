# CustomChart Component

A production-ready, responsive D3.js chart component for cryptocurrency price visualization with multiple configurable lines.

## Features

- **Four Configurable Lines:**
  - **Current Line** (Price) - Always visible (main price trend)
  - **Profit Line** - Optional, visible by default
  - **Loss Line** - Optional, visible by default
  - **Average Line** - Optional, hidden by default
  
- **Redux Integration:** Manage chart configuration through Redux store
- **Responsive Design:** Works across all screen sizes
- **Interactive Features:**
  - Zoom and pan functionality
  - Hover tooltips with detailed information
  - Crosshair indicators
  - Dynamic legends
  
- **Optional Features:**
  - Colored dots based on multiplier
  - Screen capture/download as PNG
  - Configurable Y-axis position (left/right)

## Usage

### Basic Usage

```tsx
import CustomChart, { ChartData } from '@/components/custom-chart';

const MyComponent = () => {
  const data: ChartData[] = [
    {
      date: new Date('2024-01-01'),
      price: 45000,
      ma2Year: 42000,
      multiplier: 1.07,
      profitLine: 50000,
      lossLine: 40000,
      avgLine: 46000,
    },
    // ... more data points
  ];

  return (
    <CustomChart 
      data={data}
      width={1400}
      height={600}
    />
  );
};
```

### With Redux Configuration

```tsx
import CustomChart from '@/components/custom-chart';
import { useChartConfig } from '@/hooks/useChartConfig';

const MyChartPage = () => {
  const { 
    lineVisibility, 
    toggleProfitLine, 
    toggleLossLine, 
    toggleAvgLine 
  } = useChartConfig();

  return (
    <div>
      {/* Line visibility controls */}
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={lineVisibility.showProfitLine}
            onChange={toggleProfitLine}
          />
          Show Profit Line
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={lineVisibility.showLossLine}
            onChange={toggleLossLine}
          />
          Show Loss Line
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={lineVisibility.showAvgLine}
            onChange={toggleAvgLine}
          />
          Show Average Line
        </label>
      </div>

      {/* Chart will use Redux state automatically */}
      <CustomChart data={data} />
    </div>
  );
};
```

### With Props Override

```tsx
import CustomChart from '@/components/custom-chart';

const MyComponent = () => {
  return (
    <CustomChart 
      data={data}
      // These props override Redux state
      showProfitLine={true}
      showLossLine={true}
      showAvgLine={false}
      showDots={true}
      enableScreenCapture={true}
      yAxisPosition="right"
      width={1400}
      height={600}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ChartData[]` | **Required** | Array of chart data points |
| `width` | `number` | `1400` | Chart width in pixels |
| `height` | `number` | `600` | Chart height in pixels |
| `showDots` | `boolean` | Redux state | Show colored dots on price line |
| `enableScreenCapture` | `boolean` | Redux state | Enable screen capture button |
| `yAxisPosition` | `"left" \| "right"` | Redux state | Y-axis position |
| `showProfitLine` | `boolean` | Redux state | Show profit line |
| `showLossLine` | `boolean` | Redux state | Show loss line |
| `showAvgLine` | `boolean` | Redux state | Show average line |

## ChartData Interface

```typescript
interface ChartData {
  date: Date;              // Data point date
  price: number;           // Current price (always shown)
  ma2Year: number;         // 200-week moving average (always shown)
  multiplier: number;      // Price/MA ratio
  profitLine?: number;     // Optional profit line value
  lossLine?: number;       // Optional loss line value
  avgLine?: number;        // Optional average line value
}
```

## Line Visibility Logic

### Default State
- Current Line (Price): ✅ Always visible
- 200W MA: ✅ Always visible
- Profit Line: ✅ Visible by default
- Loss Line: ✅ Visible by default
- Average Line: ❌ Hidden by default

### When Average Line is Enabled
- Current Line (Price): ✅ Visible
- 200W MA: ✅ Visible
- Profit Line: ❌ Hidden
- Loss Line: ❌ Hidden
- Average Line: ✅ Visible

This ensures that when the average line is shown, it's displayed alongside the current line for clear comparison.

## Redux Store Configuration

The chart configuration is managed through Redux. To use it:

1. The Redux store is already configured in `src/store/index.ts`
2. Use the `useChartConfig` hook to access and modify configuration
3. Props passed to the component override Redux state

## Styling

All styles are in `CustomChart.module.css` - no inline styles used.

### Customizing Styles

Edit `src/components/custom-chart/CustomChart.module.css` to customize:
- Tooltip appearance
- Button styles
- Responsive breakpoints
- Colors and spacing

## Responsive Design

The chart is fully responsive:
- **Desktop (>768px):** Full features and larger tooltips
- **Tablet (768px - 480px):** Adjusted font sizes and spacing
- **Mobile (<480px):** Single column tooltip layout, smaller controls

## Examples

### Example 1: Default Configuration

```tsx
// Shows current, profit, and loss lines
<CustomChart data={data} />
```

### Example 2: Only Current and Average Lines

```tsx
// Shows only current and average lines
<CustomChart 
  data={data} 
  showAvgLine={true}
/>
```

### Example 3: With Screen Capture

```tsx
<CustomChart 
  data={data} 
  enableScreenCapture={true}
/>
```

### Example 4: Complete Custom Configuration

```tsx
<CustomChart 
  data={data}
  width={1600}
  height={700}
  showProfitLine={false}
  showLossLine={false}
  showAvgLine={true}
  showDots={false}
  enableScreenCapture={true}
  yAxisPosition="right"
/>
```

## Best Practices

1. **Data Preparation:** Ensure all data points have valid `date`, `price`, `ma2Year`, and `multiplier` values
2. **Optional Fields:** Only include `profitLine`, `lossLine`, or `avgLine` if you want those lines visible
3. **Performance:** For large datasets (>1000 points), consider data sampling
4. **Redux vs Props:** Use Redux for global chart settings, props for page-specific configurations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- D3.js 7+
- Redux Toolkit
- React Redux

