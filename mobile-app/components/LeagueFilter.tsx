import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface LeagueFilterProps {
  leagues: string[];
  selected: string;
  onSelect: (league: string) => void;
}

export function LeagueFilter({ leagues, selected, onSelect }: LeagueFilterProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={[styles.chip, selected === 'all' && styles.chipActive]}
        onPress={() => onSelect('all')}>
        <Text style={[styles.text, selected === 'all' && styles.textActive]}>
          Todas
        </Text>
      </TouchableOpacity>
      
      {leagues.map((league) => (
        <TouchableOpacity
          key={league}
          style={[styles.chip, selected === league && styles.chipActive]}
          onPress={() => onSelect(league)}>
          <Text style={[styles.text, selected === league && styles.textActive]}>
            {league}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.darkSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    color: Colors.gray,
    fontSize: 13,
    fontWeight: '500',
  },
  textActive: {
    color: Colors.dark,
    fontWeight: 'bold',
  },
});
