import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, CreditCard as Edit3, Scale, Calendar, Activity, Award, Target, TrendingUp } from 'lucide-react-native';
import { useHydration } from '@/contexts/HydrationContext';
import { formatAmount, convertAmount, getRecommendedDailyIntake } from '@/utils/unitConversion';

export default function ProfileScreen() {
  const { state, dispatch } = useHydration();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileForm, setProfileForm] = useState({
    age: state.userProfile.age?.toString() || '',
    weight: state.userProfile.weight?.toString() || '',
    activityLevel: state.userProfile.activityLevel || 'moderate',
    gender: state.userProfile.gender || 'other',
  });

  const updateProfile = () => {
    const updatedProfile = {
      age: profileForm.age ? parseInt(profileForm.age) : undefined,
      weight: profileForm.weight ? parseFloat(profileForm.weight) : undefined,
      activityLevel: profileForm.activityLevel as 'low' | 'moderate' | 'high',
      gender: profileForm.gender as 'male' | 'female' | 'other',
    };

    dispatch({ type: 'UPDATE_PROFILE', profile: updatedProfile });
    setProfileModalVisible(false);
  };

  const getRecommendedGoalForProfile = () => {
    if (!state.userProfile.weight) return null;
    return getRecommendedDailyIntake(
      state.userProfile.weight,
      state.userProfile.activityLevel,
      state.userProfile.age
    );
  };

  const getStreakText = () => {
    if (state.streakCount === 0) return "Start your streak today!";
    if (state.streakCount === 1) return "Great start! Keep it going!";
    if (state.streakCount < 7) return `${state.streakCount} days strong!`;
    if (state.streakCount < 30) return `${state.streakCount} days - Amazing!`;
    return `${state.streakCount} days - Hydration champion!`;
  };

  const getTodayProgress = () => {
    return Math.min((state.currentIntake / state.dailyGoal) * 100, 100);
  };

  const weeklyAverage = state.weeklyData.reduce((sum, day) => sum + day, 0) / 7;
  const goalsAchieved = state.weeklyData.filter(day => day >= state.dailyGoal).length;

  const profileStats = [
    {
      icon: Target,
      label: 'Today\'s Progress',
      value: `${Math.round(getTodayProgress())}%`,
      color: '#4A90E2',
    },
    {
      icon: Award,
      label: 'Current Streak',
      value: `${state.streakCount} days`,
      color: '#40E0D0',
    },
    {
      icon: TrendingUp,
      label: 'Weekly Average',
      value: formatAmount(
        state.unit === 'oz' ? convertAmount(weeklyAverage, 'ml', 'oz') : weeklyAverage,
        state.unit
      ),
      color: '#7BB3F0',
    },
    {
      icon: Activity,
      label: 'Goals This Week',
      value: `${goalsAchieved}/7`,
      color: '#FF6B6B',
    },
  ];

  return (
    <LinearGradient
      colors={['#4A90E2', '#7BB3F0', '#F0F9FF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileAvatar}>
            <User size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Track your hydration journey</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Personal Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setProfileModalVisible(true)}
            >
              <Edit3 size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Calendar size={20} color="#718096" />
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {state.userProfile.age ? `${state.userProfile.age} years` : 'Not set'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Scale size={20} color="#718096" />
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {state.userProfile.weight ? `${state.userProfile.weight} kg` : 'Not set'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Activity size={20} color="#718096" />
              <Text style={styles.infoLabel}>Activity Level</Text>
              <Text style={styles.infoValue}>
                {state.userProfile.activityLevel
                  ? state.userProfile.activityLevel.charAt(0).toUpperCase() + 
                    state.userProfile.activityLevel.slice(1)
                  : 'Not set'}
              </Text>
            </View>
          </View>

          {getRecommendedGoalForProfile() && (
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>Recommended Daily Goal</Text>
              <Text style={styles.recommendationValue}>
                {formatAmount(
                  state.unit === 'oz' 
                    ? convertAmount(getRecommendedGoalForProfile()!, 'ml', 'oz')
                    : getRecommendedGoalForProfile()!,
                  state.unit
                )}
              </Text>
              <Text style={styles.recommendationNote}>
                Based on your personal information
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <stat.icon size={24} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Motivation Section */}
        <View style={styles.motivationSection}>
          <Text style={styles.sectionTitle}>Motivation</Text>
          
          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>Current Streak</Text>
            <Text style={styles.streakText}>{getStreakText()}</Text>
            <View style={styles.streakVisual}>
              {Array.from({ length: Math.min(state.streakCount, 30) }, (_, i) => (
                <View key={i} style={styles.streakDot} />
              ))}
            </View>
          </View>

          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>Daily Goal Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(getTodayProgress(), 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {formatAmount(
                state.unit === 'oz' ? convertAmount(state.currentIntake, 'ml', 'oz') : state.currentIntake,
                state.unit
              )} of {formatAmount(
                state.unit === 'oz' ? convertAmount(state.dailyGoal, 'ml', 'oz') : state.dailyGoal,
                state.unit
              )}
            </Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {state.achievements.length > 0 ? (
            state.achievements.slice(-3).map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>🏆</Text>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noAchievements}>
              <Text style={styles.noAchievementsText}>
                Complete your daily goal to earn your first achievement!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Age (years)</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.age}
                onChangeText={(value) => setProfileForm({ ...profileForm, age: value })}
                placeholder="Enter your age"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.weight}
                onChangeText={(value) => setProfileForm({ ...profileForm, weight: value })}
                placeholder="Enter your weight"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Activity Level</Text>
              <View style={styles.optionsRow}>
                {['low', 'moderate', 'high'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionButton,
                      profileForm.activityLevel === level && styles.optionButtonActive
                    ]}
                    onPress={() => setProfileForm({ ...profileForm, activityLevel: level })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      profileForm.activityLevel === level && styles.optionButtonTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gender</Text>
              <View style={styles.optionsRow}>
                {['male', 'female', 'other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.optionButton,
                      profileForm.gender === gender && styles.optionButtonActive
                    ]}
                    onPress={() => setProfileForm({ ...profileForm, gender })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      profileForm.gender === gender && styles.optionButtonTextActive
                    ]}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={updateProfile}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Save Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  profileInfo: {
    gap: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#2D3748',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
  },
  recommendationCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  recommendationTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  recommendationValue: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  recommendationNote: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
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
    textAlign: 'center',
  },
  motivationSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  motivationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
    marginBottom: 12,
  },
  streakVisual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#40E0D0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
    textAlign: 'center',
  },
  achievementsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#2D3748',
    flex: 1,
  },
  noAchievements: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  noAchievementsText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#2D3748',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F9FF',
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#718096',
  },
  optionButtonTextActive: {
    color: '#4A90E2',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  modalButtonPrimary: {
    backgroundColor: '#4A90E2',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4A90E2',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
});