import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface HistoryCardProps {
  item: {
    homeTeam: string;
    awayTeam: string;
    prediction: string;
    result: string;
    score: string;
    odds: number;
    date: string;
    profit: number;
  };
}

export function HistoryCard({ item }: HistoryCardProps) {
  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return Colors.success;
      case 'loss': return Colors.danger;
      default: return Colors.warning;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return 'checkmark-circle';
      case 'loss': return 'close-circle';
      default: return 'time';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.teams}>
          <Text style={styles.teamName} numberOfLines={1}>{item.homeTeam}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.teamName} numberOfLines={1}>{item.awayTeam}</Text>
        </View>
        <View style={[styles.resultBadge, { backgroundColor: getResultColor(item.result) + '20' }]}>
          <Ionicons name={getResultIcon(item.result)} size={16} color={getResultColor(item.result)} />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Predicción</Text>
          <Text style={styles.detailValue}>{item.prediction}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Resultado</Text>
          <Text style={styles.detailValue}>{item.score}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Cuota</Text>
          <Text style={styles.detailValue}>@{item.odds}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Profit</Text>
          <Text style={[
            styles.profitValue,
            { color: item.profit >= 0 ? Colors.success : Colors.danger }
          ]}>
            {item.profit > 0 ? '+' : ''}{item.profit}€
          </Text>
        </View>
      </View>

      <Text style={styles.date}>{item.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teams: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  vs: {
    color: Colors.gray,
    fontSize: 12,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flexDirection: 'row',
    backgroundColor: Colors.dark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    color: Colors.gray,
    fontSize: 11,
    marginBottom: 4,
  },
  detailValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  profitValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  date: {
    color: Colors.gray,
    fontSize: 11,
    textAlign: 'right',
  },
});
