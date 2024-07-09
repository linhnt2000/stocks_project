import math

def calculate_moving_average_series_data(candle_data, ma_length):
    ma_data = []
    
    for i in range(len(candle_data)):
        if i < ma_length - 1:
            # Provide placeholder data points until enough data for MA calculation
            ma_data.append({'time': candle_data[i]['time']})
        else:
            # Calculate the moving average
            sum_close = sum(candle_data[i - j]['close'] for j in range(ma_length))
            ma_value = sum_close / ma_length
            ma_data.append({'time': candle_data[i]['time'], 'value': ma_value})
    
    return ma_data

def calculate_moving_average_volume_data(candle_data, ma_length):
    ma_data = []
    
    for i in range(len(candle_data)):
        if i < ma_length - 1:
            # Provide placeholder data points until enough data for MA calculation
            ma_data.append({'time': candle_data[i]['time']})
        else:
            # Calculate the moving average
            sum_close = sum(candle_data[i - j]['volume'] for j in range(ma_length))
            ma_value = sum_close / ma_length
            ma_data.append({'time': candle_data[i]['time'], 'value': ma_value})
    
    return ma_data



def calculate_rsi_series_data(candle_data, rsi_length):
    rsi_data = []
    avg_gain = 0
    avg_loss = 0
    
    for i in range(len(candle_data)):
        if i < rsi_length:
            # Provide whitespace data points until the RSI can be calculated
            rsi_data.append({"time": candle_data[i]["time"]})

            # Calculate the initial average gain and loss for the first period
            if i > 0:
                change = candle_data[i]["close"] - candle_data[i - 1]["close"]
                if change > 0:
                    avg_gain += change
                else:
                    avg_loss -= change

            if i == rsi_length - 1:
                avg_gain /= rsi_length
                avg_loss /= rsi_length
        else:
            # Calculate the change for the current day
            change = candle_data[i]["close"] - candle_data[i - 1]["close"]
            gain = 0
            loss = 0
            if change > 0:
                gain = change
            else:
                loss = -change

            # Calculate the average gain and loss using SMA
            avg_gain = ((avg_gain * (rsi_length - 1)) + gain) / rsi_length
            avg_loss = ((avg_loss * (rsi_length - 1)) + loss) / rsi_length

            # Calculate the RSI
            rs = avg_gain / avg_loss
            rsi = 100 - 100 / (1 + rs)
            rsi_data.append({"time": candle_data[i]["time"], "value": rsi})

    return rsi_data

def calculate_ema_series_data(candle_data, ema_length):
    ema_data = []

    # Smoothing factor for EMA
    alpha = 2 / (ema_length + 1)

    for i in range(len(candle_data)):
        if i < ema_length - 1:
            # Provide whitespace data points until the EMA can be calculated
            ema_data.append({'time': candle_data[i]['time'], 'value': float('nan')})
        elif i == ema_length - 1:
            # Calculate the initial EMA for the first period
            sum_val = sum(candle['close'] for candle in candle_data[i - ema_length + 1:i + 1])
            ema_value = sum_val / ema_length
            ema_data.append({'time': candle_data[i]['time'], 'value': ema_value})
        else:
            # Calculate the EMA
            ema_value = candle_data[i]['close'] * alpha + ema_data[i - 1]['value'] * (1 - alpha)
            ema_data.append({'time': candle_data[i]['time'], 'value': ema_value})

    return ema_data

def calculate_macd_series_data(candle_data, short_length, long_length, signal_smoothing):
    macd_data = []
    short_ema = calculate_ema_series_data(candle_data, short_length)
    long_ema = calculate_ema_series_data(candle_data, long_length)

    for i in range(len(candle_data)):
        if i < long_length - 1:
            # Provide whitespace data points until the MACD can be calculated
            macd_data.append({'time': candle_data[i]['time'], 'MACD': float('nan'), 'SignalLine': float('nan'),
                              'Histogram': float('nan')})
        else:
            # Calculate the MACD line
            macd_value = short_ema[i]['value'] - long_ema[i]['value']
            macd_data.append({'time': candle_data[i]['time'], 'MACD': macd_value})

    # Filter out data points without a MACD value before calculating the Signal Line
    valid_macd_data = [d for d in macd_data if not math.isnan(d['MACD'])]

    # Calculate the Signal Line
    signal_line = calculate_ema_series_data([{'time': d['time'], 'close': d['MACD']} for d in valid_macd_data],
                                            signal_smoothing)

    # Combine MACD, Signal Line, and Histogram
    for i in range(len(macd_data)):
        if i >= long_length - 1 + signal_smoothing - 1:
            signal_value = signal_line[i - (long_length - 1)]['value']
            histogram_value = macd_data[i]['MACD'] - signal_value
            macd_data[i]['SignalLine'] = signal_value
            macd_data[i]['Histogram'] = histogram_value
        else:
            macd_data[i]['SignalLine'] = float('nan')
            macd_data[i]['Histogram'] = float('nan')

    return macd_data