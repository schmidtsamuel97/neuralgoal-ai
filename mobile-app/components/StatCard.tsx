import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.card, { borderColor: color + '30' }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '23%',
    backgroundColor: Colors.darkSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: Colors.gray,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
