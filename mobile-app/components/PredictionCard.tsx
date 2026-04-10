import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface PredictionCardProps {
  prediction: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    confidence: number;
    prediction: string;
    odds: number;
    reason: string;
  };
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return Colors.success;
    if (conf >= 60) return Colors.warning;
    return Colors.danger;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leagueBadge}>
          <Text style={styles.leagueText}>{prediction.league}</Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(prediction.confidence) + '20' }]}>
          <Text style={[styles.confidenceText, { color: getConfidenceColor(prediction.confidence) }]}>
            {prediction.confidence}% confianza
          </Text>
        </View>
      </View>

      {/* Teams */}
      <View style={styles.teamsRow}>
        <Text style={styles.teamName}>{prediction.homeTeam}</Text>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.teamName}>{prediction.awayTeam}</Text>
      </View>

      {/* Prediction */}
      <View style={styles.predictionBox}>
        <View style={styles.predictionMain}>
          <Ionicons name="analytics" size={24} color={Colors.primary} />
          <View style={styles.predictionInfo}>
            <Text style={styles.predictionLabel}>Predicción</Text>
            <Text style={styles.predictionValue}>{prediction.prediction}</Text>
          </View>
        </View>
        <View style={styles.oddsBox}>
          <Text style={styles.oddsLabel}>Cuota</Text>
          <Text style={styles.oddsValue}>{prediction.odds}</Text>
        </View>
      </View>

      {/* Confidence Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${prediction.confidence}%`,
                backgroundColor: getConfidenceColor(prediction.confidence)
              }
            ]} 
          />
        </View>
      </View>

      {/* Reason */}
      <View style={styles.reasonBox}>
        <Ionicons name="information-circle" size={16} color={Colors.gray} />
        <Text style={styles.reasonText}>{prediction.reason}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="bookmark-outline" size={20} color={Colors.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.betBtn}>
          <Text style={styles.betBtnText}>Ver Apuesta</Text>
          <Ionicons name="open-outline" size={16} color={Colors.dark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkSecondary,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leagueBadge: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  leagueText: {
    color: Colors.gray,
    fontSize: 11,
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  teamName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  vs: {
    color: Colors.gray,
    fontSize: 12,
    marginHorizontal: 10,
  },
  predictionBox: {
    flexDirection: 'row',
    backgroundColor: Colors.dark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  predictionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  predictionInfo: {
    marginLeft: 12,
  },
  predictionLabel: {
    color: Colors.gray,
    fontSize: 12,
  },
  predictionValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  oddsBox: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  oddsLabel: {
    color: Colors.gray,
    fontSize: 10,
  },
  oddsValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.dark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  reasonBox: {
    flexDirection: 'row',
    backgroundColor: Colors.dark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  reasonText: {
    color: Colors.gray,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.dark,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  betBtnText: {
    color: Colors.dark,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
