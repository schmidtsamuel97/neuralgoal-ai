import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Colors } from '@/constants/theme';

const MENU_ITEMS = [
  { icon: 'wallet-outline', label: 'Balance', value: '€245.50', color: Colors.primary },
  { icon: 'stats-chart-outline', label: 'Estadísticas', value: 'Ver detalles', color: Colors.info },
  { icon: 'notifications-outline', label: 'Notificaciones', value: 'Activadas', color: Colors.warning },
  { icon: 'shield-checkmark-outline', label: 'Seguridad', value: 'Configurar', color: Colors.success },
  { icon: 'help-circle-outline', label: 'Ayuda', value: 'FAQ & Soporte', color: Colors.gray },
  { icon: 'information-circle-outline', label: 'Acerca de', value: 'v1.0.0', color: Colors.gray },
];

export default function Profile() {
  const { 
    data, 
    loading, 
    error, 
    refreshing, 
    refetch 
  } = useUserProfile();

  const user = data?.data;

  if (loading && !refreshing) return <LoadingSpinner />;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error al cargar perfil</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={refetch}
          tintColor={Colors.primary}
        />
      }>
      {/* Header Profile */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.statusDot} />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.badge}>
              <Ionicons name="diamond" size={12} color={Colors.warning} />
              <Text style={styles.badgeText}>{user.membership}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.totalPredictions}</Text>
            <Text style={styles.statLabel}>Predicciones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.winRate}%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logros</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsContainer}>
          {user.achievements.map((achievement: any, index: number) => (
            <View 
              key={index} 
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementLocked
              ]}>
              <View style={[
                styles.achievementIcon,
                !achievement.unlocked && styles.achievementIconLocked
              ]}>
                <Ionicons 
                  name={achievement.unlocked ? 'trophy' : 'lock-closed'} 
                  size={24} 
                  color={achievement.unlocked ? Colors.primary : Colors.gray} 
                />
              </View>
              <Text style={[
                styles.achievementLabel,
                !achievement.unlocked && styles.textMuted
              ]}>
                {achievement.name}
              </Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
              {!achievement.unlocked && achievement.progress && (
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${achievement.progress}%` }]} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuValue}>{item.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NeuralGoal AI v1.0.0</Text>
        <Text style={styles.footerSubtext}>Hecho con ⚽ y 🤖</Text>
      </View>
    </ScrollView>
  );
}

// ... (styles se mantienen igual que antes)
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.dark,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.darkSecondary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    color: Colors.gray,
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: 'bold',
  },
  editBtn: {
    padding: 10,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.dark,
    borderRadius: 16,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
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
  achievementsContainer: {
    gap: 10,
  },
  achievementCard: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 16,
    padding: 15,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementIconLocked: {
    backgroundColor: Colors.gray + '20',
  },
  achievementLabel: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementDesc: {
    color: Colors.gray,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  textMuted: {
    color: Colors.gray,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.dark,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  menuContainer: {
    backgroundColor: Colors.darkSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  menuValue: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 16,
    backgroundColor: Colors.danger + '10',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  footerText: {
    color: Colors.gray,
    fontSize: 12,
  },
  footerSubtext: {
    color: Colors.gray,
    fontSize: 11,
    marginTop: 4,
  },
  errorText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});