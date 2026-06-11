import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

export interface BarChartDataPoint {
  label: string;
  value: number;
}

interface BarChartCustomProps {
  data: BarChartDataPoint[];
  color: string;
  height?: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export const BarChartCustom: React.FC<BarChartCustomProps> = ({
  data,
  color,
  height = 120,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const count = data.length;
  const isCompact = count > 8;

  // For dense charts (year = 12 bars) give each bar more breathing room
  const barGap = isCompact ? 1 : spacing.xs;
  const labelFontSize = isCompact ? 9 : typography.size.xs;
  const valueFontSize = isCompact ? 7 : 8;

  const formatValue = (v: number) => {
    if (isCompact) {
      // Abbreviated: ₹1k / ₹12k so the label fits in a ~26 px column
      if (v >= 1000) return `${prefix}${Math.round(v / 1000)}k`;
      return `${prefix}${Math.round(v)}`;
    }
    return `${prefix}${v.toFixed(decimalPlaces)}${suffix}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.barsRow, { height, gap: barGap }]}>
        {data.map((d, i) => {
          const barH = Math.max((d.value / max) * (height - 24), d.value > 0 ? 4 : 0);
          return (
            <View key={i} style={styles.barCol}>
              {d.value > 0 && (
                <Text style={[styles.valueLabel, { fontSize: valueFontSize }]} numberOfLines={1}>
                  {formatValue(d.value)}
                </Text>
              )}
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: barH, backgroundColor: color }]} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.labelsRow, { gap: barGap }]}>
        {data.map((d, i) => (
          <View key={i} style={styles.labelCol}>
            <Text style={[styles.dayLabel, { fontSize: labelFontSize }]} numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  valueLabel: {
    fontSize: 8,
    color: colors.neutral[200],
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  barTrack: {
    width: '75%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: borderRadius.xs,
    minHeight: 0,
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  labelCol: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
});
