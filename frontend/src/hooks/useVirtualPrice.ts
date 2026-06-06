// hooks/useVirtualPrice.ts
import { useState, useEffect } from "react";

export function useVirtualPrice(initialPrice = 1000) {
  const [price, setPrice] = useState(initialPrice);
  const [history, setHistory] = useState<{ time: number; price: number }[]>([
    // eslint-disable-next-line react-hooks/purity
    { time: Date.now(), price: initialPrice },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = prev * (Math.random() * 0.04 - 0.02); // ±2% 波动
        const newPrice = Math.max(prev + change, 0);
        setHistory((prevHistory) =>
          [...prevHistory, { time: Date.now(), price: newPrice }].slice(-50),
        ); // 保存最近50条
        return newPrice;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { price, history };
}
