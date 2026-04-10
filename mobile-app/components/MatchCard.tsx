import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface MatchCardProps {
  match: any;
  onPress: () => void;
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const { teams, league, goals, fixture } = match;
  
  const isLive = fixture.status.short === '1H' || 
                 fixture.status.short === '2H' || 
                 fixture.status.short === 'HT';
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* League Info */}
      <View style={styles.leagueRow}>
        <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
        <Text style={styles.leagueName}>{league.name}</Text>
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <Text style={styles.time}>{fixture.status.elapsed}'</Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsContainer}>
        {/* Home Team */}
        <View style={styles.teamSide}>
          <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName} numberOfLines={1}>{teams.home.name}</Text>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>
            {goals.home ?? 0} - {goals.away ?? 0}
          </Text>
          <Text style={styles.vs}>VS</Text>
        </View>

        {/* Away Team */}
        <View style={styles.teamSide}>
          <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName} numberOfLines={1}>{teams.away.name}</Text>
        </View>
      </View>

      {/* Prediction Preview */}
      <View style={styles.predictionRow}>
        <View style={styles.predictionItem}>
          <Text style={styles.predictionLabel}>1</Text>
          <Text style={styles.predictionValue}>45%</Text>
        </View>
        <View style={styles.predictionItem}>
          <Text style={styles.predictionLabel}>X</Text>
          <Text style={styles.predictionValue}>25%</Text>
        </View>
        <View style={styles.predictionItem}>
          <Text style={styles.predictionLabel}>2</Text>
          <Text style={styles.predictionValue}>30%</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  leagueName: {
    color: Colors.gray,
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.danger,
    borderRadius: 3,
    marginRight: 4,
  },
  liveText: {
    color: Colors.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  time: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  teamName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  score: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  vs: {
    color: Colors.gray,
    fontSize: 10,
    marginTop: 4,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  predictionItem: {
    alignItems: 'center',
    flex: 1,
  },
  predictionLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginBottom: 4,
  },
  predictionValue: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
