import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartBar as BarChart3, TrendingUp, Award, Calendar, Droplets } from 'lucide-react-native';
import { useHydration } from '@/contexts/HydrationContext';
import { formatAmount, convertAmount } from '@/utils/unitConversion';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { state } = useHydration();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const getDisplayAmount = (amount: number) => {
    return state.unit === 'oz' ? convertAmount(amount, 'ml', 'oz') : amount;
  };

  const weeklyAverage = state.weeklyData.reduce((sum, day) => sum + day, 0) / 7;
  const monthlyAverage = state.monthlyData.length > 0 
    ? state.monthlyData.reduce((sum, day) => sum + day.amount, 0) / state.monthlyData.length
    : 0;

  const bestDay = Math.max(...state.weeklyData);
  const worstDay = Math.min(...state.weeklyData);
  
  const goalsAchieved = state.weeklyData.filter(day => day >= state.dailyGoal).length;
  const goalPercentage = (goalsAchieved / 7) * 100;

  const achievements = [
    { id: 1, title: '7-Day Streak', icon: '🔥', achieved: state.streakCount >= 7 },
    { id: 2, title: 'Perfect Week', icon: '💯', achieved: goalsAchieved === 7 },
    { id: 3, title: 'Hydration Hero', icon: '🌊', achieved: state.currentIntake >= state.dailyGoal },
    { id: 4, title: '30-Day Challenge', icon: '🏆', achieved: state.streakCount >= 30 },
    { id: 5, title: 'Water Warrior', icon: '⚔️', achieved: weeklyAverage >= state.dailyGoal },
    { id: 6, title: 'Consistent Sipper', icon: '☕', achieved: state.monthlyData.length >= 30 },
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;

  const renderBarChart = () => {
    const data = selectedPeriod === 'week' ? state.weeklyData : 
      state.monthlyData.slice(-7).map(d => d.amount);
    const maxValue = Math.max(...data, state.dailyGoal);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.map((value, index) => {
            const height = (value / maxValue) * 120;
            const isGoalMet = value >= state.dailyGoal;
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: height || 2,
                        backgroundColor: isGoalMet ? '#40E0D0' : '#7BB3F0',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>
                  {selectedPeriod === 'week' 
                    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]
                    : (index + 1).toString()
                  }
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.goalLine} />
        <Text style={styles.goalLineLabel}>Goal</Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#4A90E2', '#7BB3F0', '#F0F9FF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Track your hydration journey</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'week' && styles.periodButtonTextActive
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'month' && styles.periodButtonTextActive
            ]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Progress Chart</Text>
          {renderBarChart()}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#4A90E2" />
            <Text style={styles.statValue}>
              {formatAmount(getDisplayAmount(selectedPeriod === 'week' ? weeklyAverage : monthlyAverage), state.unit)}
            </Text>
            <Text style={styles.statLabel}>Average/Day</Text>
          </View>

          <View style={styles.statCard}>
            <BarChart3 size={24} color="#40E0D0" />
            <Text style={styles.statValue}>
              {formatAmount(getDisplayAmount(bestDay), state.unit)}
            </Text>
            <Text style={styles.statLabel}>Best Day</Text>
          </View>

          <View style={styles.statCard}>
            <Droplets size={24} color="#7BB3F0" />
            <Text style={styles.statValue}>{Math.round(goalPercentage)}%</Text>
            <Text style={styles.statLabel}>Goals Met</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={24} color="#4A90E2" />
            <Text style={styles.statValue}>{state.streakCount}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <Award size={24} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>{achievedCount}/{achievements.length}</Text>
          </View>
          
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  achievement.achieved && styles.achievementCardAchieved
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementTitle,
                  achievement.achieved && styles.achievementTitleAchieved
                ]}>
                  {achievement.title}
                </Text>
                {achievement.achieved && (
                  <View style={styles.achievementBadge}>
                    <Text style={styles.achievementBadgeText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Weekly Performance</Text>
            <Text style={styles.insightText}>
              You achieved your daily goal {goalsAchieved} out of 7 days this week. 
              {goalPercentage >= 80 ? ' Excellent work!' : 
               goalPercentage >= 60 ? ' Good progress, keep it up!' : 
               ' Try setting reminders to improve consistency.'}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Hydration Trend</Text>
            <Text style={styles.insightText}>
              Your average daily intake is{' '}
              {formatAmount(getDisplayAmount(weeklyAverage), state.unit)}.
              {weeklyAverage >= state.dailyGoal ? 
                ' You\'re consistently meeting your goals!' :
                ` Try to add ${formatAmount(
                  getDisplayAmount(state.dailyGoal - weeklyAverage), 
                  state.unit
                )} more per day to reach your target.`
              }
            </Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  periodButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  periodButtonTextActive: {
    color: '#4A90E2',
  },
  chartSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartContainer: {
    position: 'relative',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#718096',
    marginTop: 8,
  },
  goalLine: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF6B6B',
    borderRadius: 1,
  },
  goalLineLabel: {
    position: 'absolute',
    top: 25,
    right: 0,
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
    color: '#FF6B6B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
    marginTop: 4,
  },
  achievementsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  achievementCount: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 'auto',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  achievementCardAchieved: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  achievementTitleAchieved: {
    color: '#2D3748',
  },
  achievementBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    backgroundColor: '#40E0D0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
  },
  insightsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
    lineHeight: 20,
  },
});