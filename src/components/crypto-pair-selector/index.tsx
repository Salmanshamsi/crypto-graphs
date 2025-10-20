import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setBaseSymbol, setDestinationSymbol } from "@/store/chart";

const CRYPTO_PAIRS = [
  { base: "BTC", destination: "USD", label: "BTC / USDT (Tether)" },
  { base: "BNB", destination: "USD", label: "BNB / USDT (Tether)" },
  { base: "ETH", destination: "USD", label: "ETH / USDT (Tether)" },
];

const CryptoPairSelector: React.FC = () => {
  const dispatch = useDispatch();
  const baseSymbol = useSelector((state: RootState) => state.chart.baseSymbol);
  const destinationSymbol = useSelector((state: RootState) => state.chart.destinationSymbol);

  const handlePairChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPair = CRYPTO_PAIRS.find(
      (pair) => pair.base === e.target.value
    );
    if (selectedPair) {
      dispatch(setBaseSymbol(selectedPair.base));
      dispatch(setDestinationSymbol(selectedPair.destination));
    }
  };

  const currentPair = CRYPTO_PAIRS.find(
    (pair) => pair.base === baseSymbol && pair.destination === destinationSymbol
  );

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px 20px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      marginBottom: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label 
          htmlFor="crypto-pair" 
          style={{ 
            fontSize: "14px", 
            fontWeight: "600", 
            color: "#495057",
            minWidth: "100px"
          }}
        >
          Select Pair:
        </label>
        <select
          id="crypto-pair"
          value={baseSymbol}
          onChange={handlePairChange}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            border: "1px solid #ced4da",
            borderRadius: "6px",
            backgroundColor: "white",
            cursor: "pointer",
            minWidth: "240px",
            outline: "none",
            transition: "border-color 0.15s ease-in-out"
          }}
          onFocus={(e) => e.target.style.borderColor = "#80bdff"}
          onBlur={(e) => e.target.style.borderColor = "#ced4da"}
        >
          {CRYPTO_PAIRS.map((pair) => (
            <option key={pair.base} value={pair.base}>
              {pair.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        marginLeft: "auto",
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "white",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "600"
      }}>
        {currentPair ? currentPair.label.split(" ")[0] + "/" + "USDT" : "Loading..."}
      </div>
      
      <div style={{
        padding: "6px 12px",
        backgroundColor: "#28a745",
        color: "white",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "500"
      }}>
        Binance Live
      </div>
    </div>
  );
};

export default CryptoPairSelector;

