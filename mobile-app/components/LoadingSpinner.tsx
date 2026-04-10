import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/theme';

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Cargando partidos...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.gray,
    marginTop: 12,
    fontSize: 14,
  },
});
