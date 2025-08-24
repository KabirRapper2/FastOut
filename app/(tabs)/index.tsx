import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Dumbbell, Trophy, Flame, Target, Calendar } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';

export default function HomeScreen() {
  const { user, points, currentStreak, subscriptionStatus } = useUserStore();

  const quickStats = [
    { icon: Flame, label: 'Current Streak', value: `${currentStreak} days`, color: '#F97316' },
    { icon: Trophy, label: 'Total Points', value: points.toString(), color: '#10B981' },
    { icon: Target, label: 'Plan', value: subscriptionStatus, color: '#8B5CF6' },
  ];

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, {user.name}!</Text>
          <Text style={styles.subtitle}>Ready to crush your goals today?</Text>
        </View>

        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <stat.icon size={24} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.actionGradient}
            >
              <Clock size={28} color="white" />
              <Text style={styles.actionTitle}>Start Fast</Text>
              <Text style={styles.actionSubtitle}>Begin your fasting journey</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.actionGradient}
            >
              <Dumbbell size={28} color="white" />
              <Text style={styles.actionTitle}>Quick Workout</Text>
              <Text style={styles.actionSubtitle}>Log your exercise</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {subscriptionStatus === 'free' && (
          <TouchableOpacity style={styles.upgradeCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.upgradeGradient}
            >
              <Trophy size={24} color="white" />
              <Text style={styles.upgradeTitle}>Unlock Premium Features</Text>
              <Text style={styles.upgradeSubtitle}>
                Get unlimited fasting protocols and advanced analytics
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Calendar size={20} color="#8B5CF6" />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>18-hour fast completed</Text>
              <Text style={styles.activityTime}>2 hours ago • +50 points</Text>
            </View>
          </View>
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
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
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
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  upgradeCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  upgradeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 8,
  },
  upgradeSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  recentActivity: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
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