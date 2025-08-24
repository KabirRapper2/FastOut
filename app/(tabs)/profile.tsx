import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Crown, Trophy, Calendar, Settings, Star, Clock, LogOut } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';

export default function ProfileScreen() {
  const { 
    user, 
    points, 
    currentStreak, 
    subscriptionStatus, 
    subscriptionExpiry,
    temporaryPremium,
    gameStats,
    workoutHistory,
    setSubscription,
    isUserPremium
  } = useUserStore();

  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const isPremium = isUserPremium();
  const daysSinceJoin = Math.floor((new Date().getTime() - user.joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalWorkouts = workoutHistory.length;

  const handleSubscribe = (type: 'monthly' | 'yearly') => {
    Alert.alert(
      'Subscription Activated',
      `Your ${type} subscription has been activated! You now have access to all premium features.`,
      [
        {
          text: 'Great!',
          onPress: () => {
            setSubscription(type);
            setShowSubscriptions(false);
          }
        }
      ]
    );
  };

  const formatExpiryDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={isPremium ? ['#8B5CF6', '#7C3AED'] : ['#374151', '#4B5563']}
              style={styles.profileGradient}
            >
              <View style={styles.avatarContainer}>
                <User size={32} color="white" />
                {isPremium && (
                  <View style={styles.crownBadge}>
                    <Crown size={16} color="#F59E0B" />
                  </View>
                )}
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.memberSince}>
                Member for {daysSinceJoin} days
              </Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Trophy size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{points}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#10B981" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Settings size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts Logged</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{gameStats.highScore}</Text>
              <Text style={styles.statLabel}>Game High Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.subscriptionSection}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          {isPremium ? (
            <View style={styles.premiumCard}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.premiumGradient}
              >
                <Crown size={24} color="white" />
                <Text style={styles.premiumTitle}>
                  {temporaryPremium.active ? 'Temporary Premium Active' : `${subscriptionStatus} Premium`}
                </Text>
                <Text style={styles.premiumExpiry}>
                  {temporaryPremium.active && temporaryPremium.expiresAt
                    ? `Expires: ${formatExpiryDate(temporaryPremium.expiresAt)}`
                    : subscriptionExpiry
                    ? `Renews: ${formatExpiryDate(subscriptionExpiry)}`
                    : ''
                  }
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.subscriptionPrompt}
                onPress={() => setShowSubscriptions(!showSubscriptions)}
              >
                <Text style={styles.subscriptionPromptText}>Upgrade to Premium</Text>
                <Text style={styles.subscriptionPromptSubtext}>
                  Unlock all fasting protocols and advanced features
                </Text>
              </TouchableOpacity>

              {showSubscriptions && (
                <View style={styles.subscriptionOptions}>
                  <TouchableOpacity
                    style={styles.subscriptionOption}
                    onPress={() => handleSubscribe('monthly')}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#2563EB']}
                      style={styles.subscriptionGradient}
                    >
                      <Text style={styles.subscriptionTitle}>Monthly</Text>
                      <Text style={styles.subscriptionPrice}>$9.99/month</Text>
                      <Text style={styles.subscriptionFeatures}>
                        • All fasting protocols{'\n'}
                        • Advanced workout tracking{'\n'}
                        • Detailed analytics
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subscriptionOption}
                    onPress={() => handleSubscribe('yearly')}
                  >
                    <LinearGradient
                      colors={['#8B5CF6', '#7C3AED']}
                      style={styles.subscriptionGradient}
                    >
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>MOST POPULAR</Text>
                      </View>
                      <Text style={styles.subscriptionTitle}>Yearly</Text>
                      <Text style={styles.subscriptionPrice}>$99.99/year</Text>
                      <Text style={styles.subscriptionSavings}>Save 17%</Text>
                      <Text style={styles.subscriptionFeatures}>
                        • All fasting protocols{'\n'}
                        • Advanced workout tracking{'\n'}
                        • Detailed analytics{'\n'}
                        • Priority support
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.gameSection}>
          <Text style={styles.sectionTitle}>Game Stats</Text>
          <View style={styles.gameStatsCard}>
            <View style={styles.gameStatRow}>
              <Text style={styles.gameStatLabel}>Games Played</Text>
              <Text style={styles.gameStatValue}>{gameStats.gamesPlayed}</Text>
            </View>
            <View style={styles.gameStatRow}>
              <Text style={styles.gameStatLabel}>High Score</Text>
              <Text style={styles.gameStatValue}>{gameStats.highScore}</Text>
            </View>
            <View style={styles.gameStatRow}>
              <Text style={styles.gameStatLabel}>Premium Unlocks</Text>
              <Text style={styles.gameStatValue}>{gameStats.premiumUnlocks}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Settings size={20} color="#9CA3AF" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.6)',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  subscriptionSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  premiumCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 20,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 8,
  },
  premiumExpiry: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  subscriptionPrompt: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  subscriptionPromptText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 4,
  },
  subscriptionPromptSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  subscriptionOptions: {
    marginTop: 16,
    gap: 12,
  },
  subscriptionOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscriptionGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  subscriptionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  subscriptionSavings: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginBottom: 12,
  },
  subscriptionFeatures: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  gameSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  gameStatsCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
  },
  gameStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameStatLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
  },
  gameStatValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#D1D5DB',
    marginLeft: 12,
  },
});