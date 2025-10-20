import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  setLineVisibility, 
  setShowDots, 
  setEnableScreenCapture, 
  setYAxisPosition,
  resetChartConfig,
  ChartLineVisibility 
} from '@/store/chart';

/**
 * Custom hook for managing chart configuration from Redux store
 * @returns Chart configuration state and setter functions
 */
export const useChartConfig = () => {
  const dispatch = useDispatch();
  const chartConfig = useSelector((state: RootState) => state.chart);

  const updateLineVisibility = (visibility: Partial<ChartLineVisibility>) => {
    dispatch(setLineVisibility(visibility));
  };

  const toggleProfitLine = () => {
    dispatch(setLineVisibility({ 
      showProfitLine: !chartConfig.lineVisibility.showProfitLine 
    }));
  };

  const toggleLossLine = () => {
    dispatch(setLineVisibility({ 
      showLossLine: !chartConfig.lineVisibility.showLossLine 
    }));
  };

  const toggleAvgLine = () => {
    dispatch(setLineVisibility({ 
      showAvgLine: !chartConfig.lineVisibility.showAvgLine 
    }));
  };

  const toggleDots = () => {
    dispatch(setShowDots(!chartConfig.showDots));
  };

  const toggleScreenCapture = () => {
    dispatch(setEnableScreenCapture(!chartConfig.enableScreenCapture));
  };

  const switchYAxisPosition = () => {
    dispatch(setYAxisPosition(
      chartConfig.yAxisPosition === 'left' ? 'right' : 'left'
    ));
  };

  const resetConfig = () => {
    dispatch(resetChartConfig());
  };

  return {
    // State
    lineVisibility: chartConfig.lineVisibility,
    showDots: chartConfig.showDots,
    enableScreenCapture: chartConfig.enableScreenCapture,
    yAxisPosition: chartConfig.yAxisPosition,
    
    // Actions
    updateLineVisibility,
    toggleProfitLine,
    toggleLossLine,
    toggleAvgLine,
    toggleDots,
    toggleScreenCapture,
    switchYAxisPosition,
    resetConfig,
  };
};

