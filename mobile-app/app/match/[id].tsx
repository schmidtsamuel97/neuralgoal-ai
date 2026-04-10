import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ProbabilityBar } from '@/components/ProbabilityBar';
import { TeamForm } from '@/components/TeamForm';
import { H2HStats } from '@/components/H2HStats';
import { matchesService, predictionsService } from '@/services/api';
import { Colors } from '@/constants/theme';

export default function MatchDetail() {
  const { id } = useLocalSearchParams();
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    loadMatchData();
  }, [id]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del partido y predicción en paralelo
      const [matchData, predictionData] = await Promise.all([
        matchesService.getMatchDetails(id as string),
        predictionsService.getPrediction(id as string)
      ]);

      if (matchData.success) {
        setMatch(matchData.match);
      }
      
      if (predictionData.success) {
        setPrediction(predictionData.prediction);
      }
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del partido');
    } finally {
      setLoading(false);
    }
  };

  const refreshPrediction = async () => {
    try {
      setPredicting(true);
      const data = await predictionsService.getPrediction(id as string);
      if (data.success) {
        setPrediction(data.prediction);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la predicción');
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando análisis...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.danger} />
        <Text style={styles.errorText}>Partido no encontrado</Text>
      </View>
    );
  }

  const predictions = prediction?.predictions || {};
  const analysis = prediction?.analysis || {};
  const stats = prediction?.stats || {};

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leagueRow}>
          <Text style={styles.leagueName}>{match.league?.name}</Text>
          {match.status?.short === '1H' || match.status?.short === '2H' ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>EN VIVO</Text>
            </View>
          ) : (
            <Text style={styles.time}>
              {new Date(match.fixture?.date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
        </View>

        {/* Teams */}
        <View style={styles.teamsContainer}>
          <View style={styles.teamSide}>
            <View style={styles.teamLogoPlaceholder}>
              <Text style={styles.teamInitial}>
                {match.teams?.home?.name?.[0] || '?'}
              </Text>
            </View>
            <Text style={styles.teamName}>{match.teams?.home?.name}</Text>
            {match.standings && (
              <Text style={styles.teamPosition}>
                #{match.standings.find(s => s.team.id === match.teams.home.id)?.rank || '-'}
              </Text>
            )}
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.score}>
              {match.goals?.home ?? '-'} - {match.goals?.away ?? '-'}
            </Text>
            <Text style={styles.status}>{match.status?.elapsed}'</Text>
          </View>

          <View style={styles.teamSide}>
            <View style={styles.teamLogoPlaceholder}>
              <Text style={styles.teamInitial}>
                {match.teams?.away?.name?.[0] || '?'}
              </Text>
            </View>
            <Text style={styles.teamName}>{match.teams?.away?.name}</Text>
            {match.standings && (
              <Text style={styles.teamPosition}>
                #{match.standings.find(s => s.team.id === match.teams.away.id)?.rank || '-'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* AI Prediction */}
      {prediction ? (
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="analytics" size={24} color={Colors.primary} />
            <Text style={styles.aiTitle}>Predicción IA</Text>
            <TouchableOpacity onPress={refreshPrediction} disabled={predicting}>
              <Ionicons 
                name="refresh" 
                size={20} 
                color={predicting ? Colors.gray : Colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationLabel}>Recomendación Principal</Text>
            <Text style={styles.recommendationValue}>
              {analysis.recommendation || 'Análisis en curso'}
            </Text>
            <View style={[styles.confidenceBadge, { 
              backgroundColor: getConfidenceColor(analysis.riskLevel) + '20' 
            }]}>
              <Text style={[styles.confidenceText, { 
                color: getConfidenceColor(analysis.riskLevel) 
              }]}>
                {prediction.predictions?.['1']?.confidence === 'high' ? 'Alta' : 
                 prediction.predictions?.['1']?.confidence === 'medium' ? 'Media' : 'Baja'} Confianza
              </Text>
            </View>
          </View>

          {analysis.reasons && (
            <View style={styles.reasonsList}>
              {analysis.reasons.map((reason, idx) => (
                <View key={idx} style={styles.reasonItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          {analysis.keyFactors && (
            <View style={styles.factorsList}>
              <Text style={styles.factorsTitle}>Factores Clave:</Text>
              {analysis.keyFactors.map((factor, idx) => (
                <Text key={idx} style={styles.factorText}>• {factor}</Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.aiCard}>
          <Text style={styles.noPrediction}>Predicción no disponible</Text>
          <TouchableOpacity style={styles.generateBtn} onPress={refreshPrediction}>
            <Text style={styles.generateBtnText}>Generar Predicción</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Probabilities */}
      {predictions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Probabilidades 1X2</Text>
          <View style={styles.probabilitiesCard}>
            <ProbabilityBar 
              label="Local" 
              percentage={Math.round((predictions['1']?.probability || 0) * 100)} 
              color={Colors.primary}
              odds={predictions['1']?.odds || '-'}
            />
            <ProbabilityBar 
              label="Empate" 
              percentage={Math.round((predictions['X']?.probability || 0) * 100)} 
              color={Colors.warning}
              odds={predictions['X']?.odds || '-'}
            />
            <ProbabilityBar 
              label="Visitante" 
              percentage={Math.round((predictions['2']?.probability || 0) * 100)} 
              color={Colors.info}
              odds={predictions['2']?.odds || '-'}
            />
          </View>
        </View>
      )}

      {/* Alternative Markets */}
      {prediction?.alternativeMarkets && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mercados Alternativos</Text>
          <View style={styles.marketsGrid}>
            <View style={styles.marketCard}>
              <Text style={styles.marketLabel}>Over 2.5</Text>
              <Text style={styles.marketValue}>
                {Math.round(prediction.alternativeMarkets.over25?.probability * 100)}%
              </Text>
              <Text style={styles.marketOdds}>
                @ {prediction.alternativeMarkets.over25?.odds}
              </Text>
            </View>
            <View style={styles.marketCard}>
              <Text style={styles.marketLabel}>BTTS</Text>
              <Text style={styles.marketValue}>
                {Math.round(prediction.alternativeMarkets.btts?.probability * 100)}%
              </Text>
              <Text style={styles.marketOdds}>
                @ {prediction.alternativeMarkets.btts?.odds}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Team Form */}
      {match.form && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma Reciente</Text>
          <View style={styles.formContainer}>
            <TeamForm 
              team={match.teams?.home?.name} 
              form={match.form?.home || []}
              position="left"
            />
            <TeamForm 
              team={match.teams?.away?.name} 
              form={match.form?.away || []}
              position="right"
            />
          </View>
        </View>
      )}

      {/* H2H */}
      {match.h2h && match.h2h.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cara a Cara</Text>
          <H2HStats data={{
            played: match.h2h.length,
            homeWins: match.h2h.filter(m => m.teams?.home?.winner).length,
            draws: match.h2h.filter(m => m.goals?.home === m.goals?.away).length,
            awayWins: match.h2h.filter(m => m.teams?.away?.winner).length,
            lastMatches: match.h2h.slice(0, 5)
          }} />
        </View>
      )}

      {/* Stats */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas de Temporada</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{stats.home?.goalsFor?.average || '-'}</Text>
              <Text style={styles.statLabel}>Goles Marcados (Prom)</Text>
              <Text style={styles.statValue}>{stats.away?.goalsFor?.average || '-'}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{stats.home?.goalsAgainst?.average || '-'}</Text>
              <Text style={styles.statLabel}>Goles Recibidos (Prom)</Text>
              <Text style={styles.statValue}>{stats.away?.goalsAgainst?.average || '-'}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{stats.home?.cleanSheet || '-'}</Text>
              <Text style={styles.statLabel}>Porterías a Cero</Text>
              <Text style={styles.statValue}>{stats.away?.cleanSheet || '-'}</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.betButton}>
        <Text style={styles.betButtonText}>Ver en Casa de Apuestas</Text>
        <Ionicons name="open-outline" size={20} color={Colors.dark} />
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function getConfidenceColor(riskLevel: string) {
  switch (riskLevel) {
    case 'low': return Colors.success;
    case 'medium': return Colors.warning;
    case 'high': return Colors.danger;
    default: return Colors.gray;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.gray,
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.white,
    fontSize: 18,
    marginTop: 16,
  },
  header: {
    backgroundColor: Colors.darkSecondary,
    padding: 20,
    paddingTop: 60,
  },
  leagueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leagueName: {
    color: Colors.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.danger,
    borderRadius: 4,
  },
  liveText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  time: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamInitial: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  teamName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamPosition: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  score: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: 'bold',
  },
  status: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  aiCard: {
    backgroundColor: Colors.primary + '15',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  recommendationBox: {
    backgroundColor: Colors.dark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  recommendationLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginBottom: 4,
  },
  recommendationValue: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reasonsList: {
    gap: 8,
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonText: {
    color: Colors.lightGray,
    fontSize: 13,
  },
  factorsList: {
    backgroundColor: Colors.dark,
    borderRadius: 12,
    padding: 12,
  },
  factorsTitle: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  factorText: {
    color: Colors.gray,
    fontSize: 12,
    marginBottom: 4,
  },
  noPrediction: {
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 12,
  },
  generateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateBtnText: {
    color: Colors.dark,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  probabilitiesCard: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  marketsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  marketCard: {
    flex: 1,
    backgroundColor: Colors.darkSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  marketLabel: {
    color: Colors.gray,
    fontSize: 12,
  },
  marketValue: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  marketOdds: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.darkSecondary,
    borderRadius: 16,
    padding: 16,
  },
  statsCard: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  statLabel: {
    color: Colors.gray,
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },
  betButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    margin: 20,
    marginTop: 30,
    padding: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  betButtonText: {
    color: Colors.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});