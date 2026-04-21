/**
 * MiniChart — SVG line chart for OHLCV price data
 * Renders an interactive line chart using react-native-svg.
 * Used in Asset Detail Screen and Watchlist.
 */
import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export interface OHLCVPoint {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

interface MiniChartProps {
  data: OHLCVPoint[];
  color?: string;
  width?: number;
  height?: number;
}

export default function MiniChart({
  data,
  color = Colors.greenBright,
  width = SCREEN_W - 64,
  height = 140,
}: MiniChartProps) {
  if (!data || data.length < 2) {
    return (
      <View style={[styles.container, { width, height, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>No chart data</Text>
      </View>
    );
  }

  const closes = data.map(d => d.c);
  const minVal = Math.min(...closes);
  const maxVal = Math.max(...closes);
  const range = maxVal - minVal || 1;
  
  const padding = 4;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  // Build SVG path
  const points = closes.map((val, i) => {
    const x = padding + (i / (closes.length - 1)) * chartW;
    const y = padding + chartH - ((val - minVal) / range) * chartH;
    return { x, y };
  });

  const linePath = points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  // Area fill path (line + bottom edge)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        
        {/* Area fill */}
        <Path d={areaPath} fill="url(#chartGradient)" />
        
        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  emptyText: {
    fontFamily: 'Inter_400',
    fontSize: 12,
    color: Colors.dim,
  },
});
