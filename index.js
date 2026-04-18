var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { defineIndicator } from '@fto/indicator-sdk';
export default defineIndicator({
    name: "JamieScalper",
    description: "MACD MTF + EMA + ZigZag",
    parameters: {
        macdFast: { type: 'number', default: 12 },
        macdSlow: { type: 'number', default: 26 },
        macdSignal: { type: 'number', default: 9 },
        emaFast: { type: 'number', default: 50 },
        emaSlow: { type: 'number', default: 100 },
        zzDepth: { type: 'number', default: 10 }
    },
    init(context) {
        context.addSeries('buySignal', { color: '#00ff00', style: 'points' });
        context.addSeries('sellSignal', { color: '#ff0000', style: 'points' });
    },
    calculate(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bars, index, series, parameters } = context;
            if (index < parameters.emaSlow)
                return;
            const close = bars.close;
            const high = bars.high;
            const low = bars.low;
            // 1. EMA Calculations
            const e50 = context.indicators.ema(close, parameters.emaFast);
            const e100 = context.indicators.ema(close, parameters.emaSlow);
            // 2. Set Background for EMA Trend
            if (e50[index] > e100[index]) {
                context.setBarBackgroundColor(index, '#00ff0015');
            }
            else {
                context.setBarBackgroundColor(index, '#ff000015');
            }
            // 3. Multi-Timeframe MACD
            const tf15 = yield context.requestHistory(context.symbol, '15');
            const tf60 = yield context.requestHistory(context.symbol, '60');
            const m15 = context.indicators.macd(tf15.close, parameters.macdFast, parameters.macdSlow, parameters.macdSignal);
            const m60 = context.indicators.macd(tf60.close, parameters.macdFast, parameters.macdSlow, parameters.macdSignal);
            const isBull = m60.macdLine[index] > 0 && m15.macdLine[index] > 0;
            const isBear = m60.macdLine[index] < 0 && m15.macdLine[index] < 0;
            if (isBull)
                context.setBarBackgroundColor(index, '#00808030');
            if (isBear)
                context.setBarBackgroundColor(index, '#ff000030');
            // 4. ZigZag Breakout Logic
            let pHigh = 0;
            let pLow = 999999;
            const depth = parameters.zzDepth;
            for (let i = index - 1; i > index - 50; i--) {
                if (high[i] > high[i - 1] && high[i] > high[i + 1]) {
                    pHigh = high[i];
                    break;
                }
            }
            for (let i = index - 1; i > index - 50; i--) {
                if (low[i] < low[i - 1] && low[i] < low[i + 1]) {
                    pLow = low[i];
                    break;
                }
            }
            // 5. Signal Trigger
            if (isBull && e50[index] > e100[index] && close[index] > pHigh && close[index - 1] <= pHigh) {
                series.buySignal[index] = low[index] - 5;
            }
            if (isBear && e50[index] < e100[index] && close[index] < pLow && close[index - 1] >= pLow) {
                series.sellSignal[index] = high[index] + 5;
            }
        });
    }
});
