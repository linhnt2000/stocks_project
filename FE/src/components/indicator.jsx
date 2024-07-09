export const calculateMovingAverageSeriesData = (candleData, maLength) => {
    const maData = [];
  
    for (let i = 0; i < candleData.length; i++) {
        if (i < maLength) {
            // Provide whitespace data points until the MA can be calculated
            maData.push({ time: candleData[i].time });
        } else {
            // Calculate the moving average, slow but simple way
            let sum = 0;
            for (let j = 0; j < maLength; j++) {
                sum += candleData[i - j].close;
            }
            const maValue = sum / maLength;
            maData.push({ time: candleData[i].time, value: maValue });
        }
    }
  
    return maData;
  }

  // RSI làm mượt SMA

  export const calculateRSISeriesData = (candleData, rsiLength) => {
    const rsiData = [];
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < candleData.length; i++) {
        if (i < rsiLength) {
            // Provide whitespace data points until the RSI can be calculated
            rsiData.push({ time: candleData[i].time });

            // Calculate the initial average gain and loss for the first period
            if (i > 0) {
                const change = candleData[i].close - candleData[i - 1].close;
                if (change > 0) {
                    avgGain += change;
                } else {
                    avgLoss -= change;
                }
            }

            if (i === rsiLength - 1) {
                avgGain /= rsiLength;
                avgLoss /= rsiLength;
            }
        } else {
            // Calculate the change for the current day
            const change = candleData[i].close - candleData[i - 1].close;
            let gain = 0;
            let loss = 0;
            if (change > 0) {
                gain = change;
            } else {
                loss = -change;
            }

            // Calculate the average gain and loss using SMA
            avgGain = ((avgGain * (rsiLength - 1)) + gain) / rsiLength;
            avgLoss = ((avgLoss * (rsiLength - 1)) + loss) / rsiLength;

            // Calculate the RSI
            const rs = avgGain / avgLoss;
            const rsi = 100 - 100 / (1 + rs);
            rsiData.push({ time: candleData[i].time, value: rsi });
        }
    }

    return rsiData;
};

const calculateEMASeriesData = (candleData, emaLength) => {
    const emaData = [];

    // Smoothing factor for EMA
    const alpha = 2 / (emaLength + 1);

    for (let i = 0; i < candleData.length; i++) {
        if (i < emaLength - 1) {
            // Provide whitespace data points until the EMA can be calculated
            emaData.push({ time: candleData[i].time, value: NaN });
        } else if (i === emaLength - 1) {
            // Calculate the initial EMA for the first period
            let sum = 0;
            for (let j = 0; j < emaLength; j++) {
                sum += candleData[i - j].close;
            }
            const emaValue = sum / emaLength;
            emaData.push({ time: candleData[i].time, value: emaValue });
        } else {
            // Calculate the EMA
            const emaValue = (candleData[i].close * alpha) + (emaData[i - 1].value * (1 - alpha));
            emaData.push({ time: candleData[i].time, value: emaValue });
        }
    }

    return emaData;
}

export const calculateMACDSeriesData = (candleData,shortLength,longLength,signalSmoothing) => {
    const macdData = [];
    const shortEMA = calculateEMASeriesData(candleData, shortLength);
    const longEMA = calculateEMASeriesData(candleData, longLength);

    for (let i = 0; i < candleData.length; i++) {
        if (i < longLength - 1) {
            // Provide whitespace data points until the MACD can be calculated
            macdData.push({ time: candleData[i].time, MACD: NaN, SignalLine: NaN, Histogram: NaN });
        } else {
            // Calculate the MACD line
            const macdValue = shortEMA[i].value - longEMA[i].value;
            macdData.push({ time: candleData[i].time, MACD: macdValue });
        }
    }

    // Filter out data points without a MACD value before calculating the Signal Line
    const validMacdData = macdData.filter(d => !isNaN(d.MACD));

    // Calculate the Signal Line
    const signalLine = calculateEMASeriesData(validMacdData.map(d => ({ time: d.time, close: d.MACD })), signalSmoothing);

    // Combine MACD, Signal Line, and Histogram
    for (let i = 0; i < macdData.length; i++) {
        if (i >= longLength - 1 + signalSmoothing - 1) {
            const signalValue = signalLine[i - (longLength - 1)].value;
            const histogramValue = macdData[i].MACD - signalValue;
            macdData[i].SignalLine = signalValue;
            macdData[i].Histogram = histogramValue;
        } else {
            macdData[i].SignalLine = NaN;
            macdData[i].Histogram = NaN;
        }
    }

    return macdData;
}

// Usage example:
// const result = calculateMACDSeriesData(priceData);



  
