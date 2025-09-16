import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradingChartProps {
  symbol?: string;
  interval?: string;
  height?: number;
}

export const TradingChart = ({ 
  symbol = "BTCUSDT", 
  interval = "1m", 
  height = 400 
}: TradingChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real-time price data
    const fetchPriceData = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        const data = await response.json();
        setPriceData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch price data:', error);
        setLoading(false);
      }
    };

    fetchPriceData();

    // Update price every 5 seconds
    const interval_id = setInterval(fetchPriceData, 5000);

    return () => clearInterval(interval_id);
  }, [symbol]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": `BINANCE:${symbol}`,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "container_id": "tradingview_chart"
    });

    const container = chartContainerRef.current;
    container.innerHTML = '';
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, interval]);

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  const formatPercentage = (percent: string) => {
    const num = parseFloat(percent);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>{symbol.replace('USDT', '/USDT')}</span>
            {!loading && priceData && (
              <Badge 
                variant={parseFloat(priceData.priceChangePercent) >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {parseFloat(priceData.priceChangePercent) >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatPercentage(priceData.priceChangePercent)}
              </Badge>
            )}
          </CardTitle>
          {!loading && priceData && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${formatPrice(priceData.lastPrice)}
              </div>
              <div className={`text-sm ${
                parseFloat(priceData.priceChangePercent) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {parseFloat(priceData.priceChange) >= 0 ? '+' : ''}
                ${formatPrice(priceData.priceChange)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          id="tradingview_chart"
          ref={chartContainerRef}
          style={{ height: `${height}px` }}
          className="w-full"
        />
        
        {!loading && priceData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">24h High</div>
              <div className="font-semibold">${formatPrice(priceData.highPrice)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">24h Low</div>
              <div className="font-semibold">${formatPrice(priceData.lowPrice)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">24h Volume</div>
              <div className="font-semibold">{parseFloat(priceData.volume).toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Market Cap</div>
              <div className="font-semibold">
                ${(parseFloat(priceData.lastPrice) * parseFloat(priceData.count) / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};