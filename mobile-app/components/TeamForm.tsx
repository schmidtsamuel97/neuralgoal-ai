import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface TeamFormProps {
  team: string;
  form: string[];
  position: 'left' | 'right';
}

export function TeamForm({ team, form, position }: TeamFormProps) {
  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return Colors.success;
      case 'L': return Colors.danger;
      case 'D': return Colors.warning;
      default: return Colors.gray;
    }
  };

  return (
    <View style={[styles.container, position === 'right' && styles.alignRight]}>
      <Text style={styles.teamName}>{team}</Text>
      <View style={[styles.formRow, position === 'right' && styles.rowReverse]}>
        {form.map((result, index) => (
          <View 
            key={index} 
            style={[styles.formBadge, { backgroundColor: getResultColor(result) }]}>
            <Text style={styles.formText}>{result}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  teamName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  formBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formText: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
