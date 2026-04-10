import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface H2HStatsProps {
  data: {
    played: number;
    homeWins: number;
    draws: number;
    awayWins: number;
    lastMatches: any[];
  };
}

export function H2HStats({ data }: H2HStatsProps) {
  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{data.homeWins}</Text>
          <Text style={styles.summaryLabel}>Local</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{data.draws}</Text>
          <Text style={styles.summaryLabel}>Empates</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{data.awayWins}</Text>
          <Text style={styles.summaryLabel}>Visitante</Text>
        </View>
      </View>

      {/* Last Matches */}
      <View style={styles.matchesContainer}>
        <Text style={styles.matchesTitle}>Últimos enfrentamientos</Text>
        {data.lastMatches.map((match, index) => (
          <View key={index} style={styles.matchRow}>
            <Text style={styles.matchDate}>{match.date}</Text>
            <View style={styles.matchTeams}>
              <Text style={styles.matchTeam} numberOfLines={1}>{match.home}</Text>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreText}>{match.score}</Text>
              </View>
              <Text style={styles.matchTeam} numberOfLines={1}>{match.away}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 16,
    padding: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  matchesContainer: {
    gap: 12,
  },
  matchesTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  matchDate: {
    color: Colors.gray,
    fontSize: 11,
    width: 70,
  },
  matchTeams: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  matchTeam: {
    color: Colors.white,
    fontSize: 13,
    flex: 1,
  },
  scoreBox: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
