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
import { useHistory } from '@/hooks/useApi';
import { HistoryCard } from '@/components/HistoryCard';
import { StatCard } from '@/components/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors } from '@/constants/theme';

const FILTERS = [
  { key: 'all', label: 'Todas', icon: 'list' },
  { key: 'win', label: 'Ganadas', icon: 'checkmark-circle' },
  { key: 'loss', label: 'Perdidas', icon: 'close-circle' },
  { key: 'pending', label: 'Pendientes', icon: 'time' },
];

export default function History() {
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'pending'>('all');
  
  const { 
    data, 
    loading, 
    error, 
    refreshing, 
    refetch 
  } = useHistory(filter);

  const history = data?.data || [];
  const stats = data?.stats || { 
    total: 0, 
    wins: 0, 
    losses: 0, 
    winRate: 0, 
    totalProfit: 0 
  };

  if (loading && !refreshing) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.subtitle}>Tus predicciones y resultados</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <StatCard 
          title="Total" 
          value={stats.total.toString()} 
          icon="list" 
          color={Colors.primary}
        />
        <StatCard 
          title="Ganadas" 
          value={stats.wins.toString()} 
          icon="trending-up" 
          color={Colors.success}
        />
        <StatCard 
          title="Win Rate" 
          value={`${stats.winRate}%`} 
          icon="pie-chart" 
          color={Colors.warning}
        />
        <StatCard 
          title="Profit" 
          value={`${stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit}€`} 
          icon="cash" 
          color={stats.totalProfit >= 0 ? Colors.success : Colors.danger}
        />
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
            onPress={() => setFilter(f.key as any)}>
            <Ionicons 
              name={f.icon} 
              size={18} 
              color={filter === f.key ? Colors.dark : Colors.gray} 
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* History List */}
      <FlatList
        data={history}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <HistoryCard item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={64} color={Colors.gray} />
            <Text style={styles.emptyText}>No hay predicciones en esta categoría</Text>
          </View>
        }
      />
    </View>
  );
}

// ... (styles se mantienen igual)
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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