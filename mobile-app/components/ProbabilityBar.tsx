import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface ProbabilityBarProps {
  label: string;
  percentage: number;
  color: string;
  odds: number;
}

export function ProbabilityBar({ label, percentage, color, odds }: ProbabilityBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.values}>
          <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
          <Text style={styles.odds}>@{odds}</Text>
        </View>
      </View>
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.bar, 
            { 
              width: `${percentage}%`,
              backgroundColor: color,
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  values: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  odds: {
    color: Colors.gray,
    fontSize: 12,
  },
  barContainer: {
    height: 8,
    backgroundColor: Colors.dark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});
