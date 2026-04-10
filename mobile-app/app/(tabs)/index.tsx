import { 
  Text, 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MatchCard } from '@/components/MatchCard';
import { LeagueFilter } from '@/components/LeagueFilter';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { matchesService, useLiveMatches } from '@/services/api';
import { Colors } from '@/constants/theme';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMatches = async () => {
    try {
      setError(null);
      const data = await matchesService.getLiveMatches();
      
      if (data.success) {
        setMatches(data.matches);
        setFilteredMatches(data.matches);
        
        // Extraer ligas únicas
        const uniqueLeagues = [...new Set(data.matches.map(m => m.league.name))];
        setLeagues(uniqueLeagues);
      } else {
        throw new Error(data.error || 'Error fetching matches');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
      Alert.alert('Error', 'No se pudieron cargar los partidos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchMatches();
    
    // Auto-refresh cada 60 segundos
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedLeague === 'all') {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter(m => m.league.name === selectedLeague));
    }
  }, [selectedLeague, matches]);

  if (loading) return <LoadingSpinner />;
  
  if (error && matches.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.danger} />
        <Text style={styles.errorText}>Error de conexión</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMatches}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>¡Hola! 👋</Text>
            <Text style={styles.title}>NeuralGoal AI</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{matches.length}</Text>
            <Text style={styles.statLabel}>En Vivo</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.statNumber}>87%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Aciertos</Text>
          </View>
        </View>
      </View>

      {/* League Filter */}
      <LeagueFilter 
        leagues={leagues} 
        selected={selectedLeague}
        onSelect={setSelectedLeague}
      />

      {/* Matches List */}
      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MatchCard 
            match={item} 
            onPress={() => router.push(`/match/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="football" size={64} color={Colors.gray} />
            <Text style={styles.emptyText}>No hay partidos en vivo</Text>
            <Text style={styles.emptySubtext}>Intenta más tarde o revisa los próximos partidos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    backgroundColor: Colors.darkSecondary,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: Colors.gray,
    fontSize: 14,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationBtn: {
    padding: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: Colors.danger,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: Colors.gray,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorSubtext: {
    color: Colors.gray,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryText: {
    color: Colors.dark,
    fontWeight: 'bold',
    fontSize: 16,
  },
});