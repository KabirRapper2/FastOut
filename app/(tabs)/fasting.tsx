import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Play, Pause, Square, Trophy, Lock } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import SubscriptionModal from '@/components/SubscriptionModal';

const FASTING_PROTOCOLS = [
  { name: '16:8', duration: 16, description: 'Most popular protocol', points: 20, premium: false },
  { name: '18:6', duration: 18, description: 'Intermediate level', points: 30, premium: false },
  { name: '20:4', duration: 20, description: 'Advanced protocol', points: 40, premium: true },
  { name: 'OMAD', duration: 23, description: 'One meal a day', points: 60, premium: true },
];

export default function FastingScreen() {
  const { subscriptionStatus, addPoints, activeFast, setActiveFast, isUserPremium } = useUserStore();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsRunning(false);
            completeFast();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const startFast = (protocol: typeof FASTING_PROTOCOLS[0]) => {
    if (protocol.premium && !isUserPremium()) {
      Alert.alert(
        'Premium Feature',
        'This fasting protocol is available for premium members only. You can upgrade to premium or play our mini-game to unlock premium features temporarily!',
        [
          { text: 'Play Game', onPress: () => {} },
          { text: 'Upgrade', onPress: () => setShowSubscriptionModal(true) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setActiveFast(protocol);
    setTimeRemaining(protocol.duration * 3600); // Convert hours to seconds
    setIsRunning(true);
  };

  const pauseFast = () => {
    setIsRunning(false);
  };

  const resumeFast = () => {
    setIsRunning(true);
  };

  const stopFast = () => {
    setIsRunning(false);
    setActiveFast(null);
    setTimeRemaining(0);
  };

  const completeFast = () => {
    if (activeFast) {
      addPoints(activeFast.points);
      Alert.alert(
        'Fast Completed! 🎉',
        `Congratulations! You earned ${activeFast.points} points for completing your ${activeFast.name} fast.`,
        [{ text: 'Awesome!' }]
      );
      setActiveFast(null);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Fasting Timer</Text>
          <Text style={styles.subtitle}>Choose your fasting protocol</Text>
        </View>

        {activeFast && (
          <View style={styles.activeTimerContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.timerCard}
            >
              <Text style={styles.protocolName}>{activeFast.name} Fast</Text>
              <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>
              <View style={styles.timerControls}>
                {!isRunning ? (
                  <TouchableOpacity style={styles.controlButton} onPress={resumeFast}>
                    <Play size={24} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.controlButton} onPress={pauseFast}>
                    <Pause size={24} color="white" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.controlButton} onPress={stopFast}>
                  <Square size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.protocolsContainer}>
          <Text style={styles.sectionTitle}>Fasting Protocols</Text>
          {FASTING_PROTOCOLS.map((protocol, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.protocolCard,
                protocol.premium && !isUserPremium() && styles.lockedCard
              ]}
              onPress={() => startFast(protocol)}
              disabled={activeFast !== null}
            >
              <View style={styles.protocolHeader}>
                <View style={styles.protocolInfo}>
                  <Text style={styles.protocolTitle}>
                    {protocol.name}
                    {protocol.premium && !isUserPremium() && (
                      <Lock size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                    )}
                  </Text>
                  <Text style={styles.protocolDescription}>{protocol.description}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Trophy size={16} color="#10B981" />
                  <Text style={styles.pointsText}>{protocol.points}</Text>
                </View>
              </View>
              <View style={styles.protocolDetails}>
                <Text style={styles.durationText}>{protocol.duration} hours</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {!isUserPremium() && (
          <View style={styles.upgradePrompt}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.upgradeCard}
            >
              <Trophy size={24} color="white" />
              <Text style={styles.upgradeTitle}>Unlock All Protocols</Text>
              <Text style={styles.upgradeText}>
                Get access to advanced fasting protocols and detailed analytics
              </Text>
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => setShowSubscriptionModal(true)}
              >
                <Text style={styles.upgradeButtonText}>View Plans</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        <SubscriptionModal
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
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
  activeTimerContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  timerCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  protocolName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 16,
  },
  timerDisplay: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 24,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 12,
  },
  protocolsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  protocolCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  lockedCard: {
    opacity: 0.6,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  protocolInfo: {
    flex: 1,
  },
  protocolTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 4,
  },
  protocolDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  protocolDetails: {
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
    paddingTop: 12,
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
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
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  recentActivity: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  activityCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  activityTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
});