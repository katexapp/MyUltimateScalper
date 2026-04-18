export default {
    name: "Jamie_Ultimate_Scalper",
    description: "MACD + EMA + ZigZag",
    parameters: {
        emaFast: { type: "number", default: 50 },
        emaSlow: { type: "number", default: 100 }
    },
    init(context: any) {
        context.addSeries("buy", { color: "#00ff00", style: "points" });
        context.addSeries("sell", { color: "#ff0000", style: "points" });
    },
    async calculate(context: any) {
        const { bars, index, series, parameters } = context;
        if (index < 100) return;
        
        const e50 = context.indicators.ema(bars.close, parameters.emaFast)[index];
        const e100 = context.indicators.ema(bars.close, parameters.emaSlow)[index];

        if (e50 > e100) context.setBarBackgroundColor(index, "#00ff0015");
        else context.setBarBackgroundColor(index, "#ff000015");
        
        if (bars.close[index] > e50 && bars.close[index-1] <= e50) {
            series.buy[index] = bars.low[index] - 5;
        }
    }
};
