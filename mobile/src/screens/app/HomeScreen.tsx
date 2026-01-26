import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { signOut, state } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Dynastia</Text>
        <Text style={styles.subtitle}>
          {state.user?.firstName
            ? `Hi ${state.user.firstName}! Your wealth journey starts here.`
            : 'Your wealth journey starts here.'}
        </Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('SecuritySettings')}
        >
          <Text style={styles.settingsButtonText}>Security Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center',
  },
  settingsButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
});
