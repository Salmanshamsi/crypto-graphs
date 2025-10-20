import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import MAGraph2 from "@/components/MAGraph2";
import CryptoPairSelector from "@/components/crypto-pair-selector";
import { AppDispatch, RootState } from "@/store";
import { getCryptoData } from "@/store/chart2";

const ChartThree = () => {
  const dispatch = useDispatch<AppDispatch>();
  const baseSymbol = useSelector((state: RootState) => state.chart.baseSymbol);
  const destinationSymbol = useSelector((state: RootState) => state.chart.destinationSymbol);
  const cryptoData = useSelector((state: RootState) => state.chart2.cryptoData);

  useEffect(() => {
    const symbol = `${baseSymbol}${destinationSymbol === "USD" ? "USDT" : destinationSymbol}`;
    dispatch(getCryptoData({ symbol, interval: "1w", limit: 1000 }));
  }, [dispatch, baseSymbol, destinationSymbol]);
      
  const chartData = cryptoData;

  const dateRange = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    const firstDate = new Date(chartData[0].openTime);
    const lastDate = new Date(chartData[chartData.length - 1].openTime);
    return {
      start: firstDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      end: lastDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    };
  }, [chartData]);

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ 
        backgroundColor: "white", 
        padding: "20px", 
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <CryptoPairSelector />
        {dateRange && (
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#e7f3ff",
            borderLeft: "4px solid #007bff",
            borderRadius: "4px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#004085"
          }}>
            <strong>Date Range:</strong> {dateRange.start} - {dateRange.end} (Real Binance API Data)
          </div>
        )}
        {chartData && chartData.length > 0 ? (
          <MAGraph2
            data={chartData}
            yAxisPosition="right"
            enableScreenCapture={true}
          />
        ) : (
          <div style={{ 
            padding: "40px", 
            textAlign: "center", 
            color: "#666",
            fontSize: "16px"
          }}>
            Loading chart data from Binance API...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartThree;