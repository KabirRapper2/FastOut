import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Plus, Timer, Trophy, Target, Lock } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';

const WORKOUT_TYPES = [
  { name: 'Strength Training', icon: Dumbbell, points: 25, premium: false },
  { name: 'Cardio', icon: Target, points: 20, premium: false },
  { name: 'HIIT', icon: Timer, points: 35, premium: true },
  { name: 'Yoga', icon: Target, points: 15, premium: false },
  { name: 'CrossFit', icon: Dumbbell, points: 40, premium: true },
];

export default function WorkoutsScreen() {
  const { subscriptionStatus, addPoints, workoutHistory, addWorkout } = useUserStore();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [duration, setDuration] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const logWorkout = () => {
    if (!selectedType || !duration) {
      Alert.alert('Error', 'Please select workout type and enter duration');
      return;
    }

    const workoutType = WORKOUT_TYPES.find(type => type.name === selectedType);
    if (!workoutType) return;

    if (workoutType.premium && subscriptionStatus === 'free') {
      Alert.alert(
        'Premium Feature',
        'This workout type is available for premium members only. Play our mini-game to unlock premium features temporarily!',
        [{ text: 'OK' }]
      );
      return;
    }

    const durationNum = parseInt(duration);
    const basePoints = workoutType.points;
    const bonusPoints = durationNum >= 45 ? Math.floor(basePoints * 0.5) : 0;
    const totalPoints = basePoints + bonusPoints;

    addWorkout({
      type: selectedType,
      duration: durationNum,
      points: totalPoints,
      date: new Date(),
    });

    addPoints(totalPoints);

    Alert.alert(
      'Workout Logged! 💪',
      `Great job! You earned ${totalPoints} points${bonusPoints > 0 ? ` (${bonusPoints} bonus for 45+ minutes!)` : ''}.`,
      [{ text: 'Awesome!' }]
    );

    setSelectedType(null);
    setDuration('');
    setIsLogging(false);
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
        </View>

        <TouchableOpacity
          style={styles.logButton}
          onPress={() => setIsLogging(!isLogging)}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.logButtonGradient}
          >
            <Plus size={24} color="white" />
            <Text style={styles.logButtonText}>Log Workout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {isLogging && (
          <View style={styles.loggingContainer}>
            <Text style={styles.sectionTitle}>Select Workout Type</Text>
            <View style={styles.workoutTypesGrid}>
              {WORKOUT_TYPES.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.workoutTypeCard,
                    selectedType === type.name && styles.selectedCard,
                    type.premium && subscriptionStatus === 'free' && styles.lockedCard
                  ]}
                  onPress={() => setSelectedType(type.name)}
                >
                  <type.icon size={24} color={selectedType === type.name ? '#8B5CF6' : '#9CA3AF'} />
                  <Text style={[
                    styles.workoutTypeName,
                    selectedType === type.name && styles.selectedText
                  ]}>
                    {type.name}
                    {type.premium && subscriptionStatus === 'free' && (
                      <Lock size={12} color="#9CA3AF" />
                    )}
                  </Text>
                  <View style={styles.pointsBadge}>
                    <Trophy size={12} color="#10B981" />
                    <Text style={styles.pointsText}>{type.points}pts</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.durationContainer}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.durationInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="Enter duration"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={logWorkout}>
              <Text style={styles.submitButtonText}>Log Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {workoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Dumbbell size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No workouts logged yet</Text>
              <Text style={styles.emptyStateSubtext}>Start your fitness journey today!</Text>
            </View>
          ) : (
            workoutHistory.slice(0, 5).map((workout, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyType}>{workout.type}</Text>
                  <Text style={styles.historyPoints}>+{workout.points} pts</Text>
                </View>
                <Text style={styles.historyDetails}>
                  {workout.duration} minutes • {workout.date.toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>

        {subscriptionStatus === 'free' && (
          <View style={styles.upgradePrompt}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.upgradeCard}
            >
              <Trophy size={24} color="white" />
              <Text style={styles.upgradeTitle}>Unlock Premium Workouts</Text>
              <Text style={styles.upgradeText}>
                Access HIIT and CrossFit tracking with advanced analytics
              </Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  logButton: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  logButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  logButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  loggingContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  workoutTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  workoutTypeCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#4B5563',
  },
  lockedCard: {
    opacity: 0.6,
  },
  workoutTypeName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D1D5DB',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedText: {
    color: 'white',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    gap: 2,
  },
  pointsText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  durationContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  durationInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  historyContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyType: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  historyPoints: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  historyDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  upgradePrompt: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  upgradeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});