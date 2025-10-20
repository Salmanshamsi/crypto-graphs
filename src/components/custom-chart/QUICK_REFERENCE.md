# CustomChart - Quick Reference

## 📊 Line Visibility States

### State 1: Default (Most Common)
```tsx
<CustomChart data={data} />
```
**Shows:**
- ✅ Current (Price) - Black
- ✅ 200W MA - Blue
- ✅ Profit Line - Green
- ✅ Loss Line - Red
- ❌ Average Line

---

### State 2: Average Line Mode
```tsx
<CustomChart data={data} showAvgLine={true} />
```
**Shows:**
- ✅ Current (Price) - Black
- ✅ 200W MA - Blue
- ❌ Profit Line
- ❌ Loss Line
- ✅ Average Line - Orange

---

### State 3: Custom Configuration
```tsx
<CustomChart 
  data={data}
  showProfitLine={false}
  showLossLine={true}
  showAvgLine={false}
/>
```
**Shows:**
- ✅ Current (Price) - Black
- ✅ 200W MA - Blue
- ❌ Profit Line
- ✅ Loss Line - Red
- ❌ Average Line

---

## 🎨 Line Colors

| Line | Color | Hex |
|------|-------|-----|
| Current (Price) | Black | #000000 |
| 200W MA | Blue | #2E73C3 |
| Profit Line | Green | #4CAF50 |
| Loss Line | Red | #F44336 |
| Average Line | Orange | #FF9800 |

---

## 🔧 Redux Hook Usage

```typescript
import { useChartConfig } from '@/hooks/useChartConfig';

const MyComponent = () => {
  const {
    // State
    lineVisibility: {
      showProfitLine,
      showLossLine,
      showAvgLine,
    },
    showDots,
    enableScreenCapture,
    yAxisPosition,
    
    // Toggle Actions
    toggleProfitLine,
    toggleLossLine,
    toggleAvgLine,
    toggleDots,
    toggleScreenCapture,
    switchYAxisPosition,
    
    // Other Actions
    updateLineVisibility,
    resetConfig,
  } = useChartConfig();
};
```

---

## 📦 Data Structure

```typescript
const data: ChartData[] = [
  {
    date: new Date('2024-01-01'),  // Required
    price: 45000,                   // Required
    ma2Year: 42000,                 // Required
    multiplier: 1.07,               // Required
    profitLine: 50000,              // Optional
    lossLine: 40000,                // Optional
    avgLine: 46000,                 // Optional
  },
];
```

---

## ⚡ Common Patterns

### Pattern 1: Toggle Line from Button
```tsx
const { toggleAvgLine } = useChartConfig();

<button onClick={toggleAvgLine}>
  Toggle Average Line
</button>
```

### Pattern 2: Show/Hide Multiple Lines
```tsx
const { updateLineVisibility } = useChartConfig();

<button onClick={() => updateLineVisibility({
  showProfitLine: false,
  showLossLine: false,
  showAvgLine: true,
})}>
  Show Only Average
</button>
```

### Pattern 3: Reset to Defaults
```tsx
const { resetConfig } = useChartConfig();

<button onClick={resetConfig}>
  Reset Chart
</button>
```

---

## 🎯 Props vs Redux

| Scenario | Use Props | Use Redux |
|----------|-----------|-----------|
| Page-specific config | ✅ Yes | ❌ No |
| Global user preference | ❌ No | ✅ Yes |
| One-time override | ✅ Yes | ❌ No |
| Persistent settings | ❌ No | ✅ Yes |
| Multiple charts synced | ❌ No | ✅ Yes |

---

## 🐛 Quick Troubleshooting

### Lines Not Showing?
1. Check data has optional fields (`profitLine`, `lossLine`, `avgLine`)
2. Verify Redux state or props
3. Check console for errors

### TypeScript Errors?
1. Ensure `src/vite-env.d.ts` exists
2. Restart TypeScript server
3. Clear build cache

### Styles Not Applied?
1. Check CSS module import
2. Verify class names match
3. Clear browser cache

---

## 📱 Responsive Breakpoints

```css
/* Desktop: Full features */
@media (min-width: 769px) { ... }

/* Tablet: Adjusted sizes */
@media (max-width: 768px) { ... }

/* Mobile: Compact layout */
@media (max-width: 480px) { ... }
```

---

## 🎨 Customization Cheat Sheet

### Change Line Color
File: `src/components/custom-chart/index.tsx`
```typescript
.attr("stroke", "#YourColor")
```

### Change Tooltip Style
File: `src/components/custom-chart/CustomChart.module.css`
```css
.tooltip {
  background-color: your-color;
}
```

### Change Line Width
File: `src/components/custom-chart/index.tsx`
```typescript
.attr("stroke-width", 3)  // Default: 2
```

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| `src/components/custom-chart/index.tsx` | Main component |
| `src/components/custom-chart/CustomChart.module.css` | Styles |
| `src/components/custom-chart/types.ts` | TypeScript types |
| `src/hooks/useChartConfig.ts` | Redux hook |
| `src/store/chart/index.ts` | Redux slice |

---

## ✅ Testing Checklist

- [ ] Default view: Current + Profit + Loss
- [ ] Average view: Current + Average only
- [ ] Tooltip shows correct values
- [ ] Zoom/pan works
- [ ] Mobile responsive
- [ ] No inline styles
- [ ] No TypeScript errors
- [ ] No console errors

---

**Need More Help?**
- See `README.md` for detailed docs
- Check `ChartWithControls.example.tsx` for working example
- Review `CHART_ENHANCEMENT_GUIDE.md` for migration guide

