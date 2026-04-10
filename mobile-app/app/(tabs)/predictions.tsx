import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ScrollView,
  RefreshControl 
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTodayPredictions } from '@/hooks/useApi';
import { PredictionCard } from '@/components/PredictionCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors } from '@/constants/theme';

const FILTERS = [
  { key: 'all', label: 'Todas', icon: 'apps' },
  { key: 'high', label: 'Alta Confianza', icon: 'trending-up' },
  { key: 'medium', label: 'Media', icon: 'remove' },
  { key: 'low', label: 'Baja', icon: 'trending-down' },
];

export default function Predictions() {
  const [filter, setFilter] = useState('all');
  
  const { 
    data, 
    loading, 
    error, 
    refreshing, 
    refetch 
  } = useTodayPredictions();

  const predictions = data?.data || [];

  const filteredPredictions = predictions.filter((p: any) => {
    if (filter === 'high') return p.confidence >= 80;
    if (filter === 'medium') return p.confidence >= 60 && p.confidence < 80;
    if (filter === 'low') return p.confidence < 60;
    return true;
  });

  // Calcular stats
  const stats = {
    total: predictions.length,
    avgConfidence: predictions.length > 0 
      ? Math.round(predictions.reduce((acc: number, p: any) => acc + p.confidence, 0) / predictions.length)
      : 0,
    highConfidence: predictions.filter((p: any) => p.confidence >= 80).length,
  };

  if (loading && !refreshing) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Predicciones del Día</Text>
        <Text style={styles.subtitle}>Basadas en nuestro modelo de IA</Text>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}>
            <Ionicons 
              name={f.icon} 
              size={16} 
              color={filter === f.key ? Colors.dark : Colors.gray} 
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{stats.total}</Text>
          <Text style={styles.summaryLabel}>Predicciones</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{stats.avgConfidence}%</Text>
          <Text style={styles.summaryLabel}>Confianza Prom</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{stats.highConfidence}</Text>
          <Text style={styles.summaryLabel}>Alta Confianza</Text>
        </View>
      </View>

      {/* Predictions List */}
      <FlatList
        data={filteredPredictions}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <PredictionCard prediction={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyText}>No hay predicciones disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

// ... (styles se mantienen igual que antes)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 14,
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.gray,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.dark,
    fontWeight: 'bold',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.darkSecondary,
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  listContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 16,
    marginTop: 16,
  },
});