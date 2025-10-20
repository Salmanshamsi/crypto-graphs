import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeatmapChart from "@/components/heatmap-chart";
import { AppDispatch, RootState } from "@/store";
import { getCryptoData } from "@/store/chart2";

const ChartOne = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cryptoData = useSelector((state: RootState) => state.chart2.cryptoData);

  useEffect(() => {
    console.log("Fetched Crypto Data:", cryptoData);
  }, [cryptoData]);

  useEffect(() => {
    dispatch(getCryptoData({ symbol: "BTCUSDT", interval: "1d", limit: 1400 }));
  }, [dispatch]);

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ 
        backgroundColor: "white", 
        padding: "20px", 
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <HeatmapChart data={cryptoData} />
      </div>
    </div>
  );
};

export default ChartOne;