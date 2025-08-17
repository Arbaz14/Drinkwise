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
import { Plus, Droplets, Clock, Target, Pause, RotateCcw } from 'lucide-react-native';
import { useHydration } from '@/contexts/HydrationContext';
import { useNotification } from '@/contexts/NotificationContext';
import { CircularProgress } from '@/components/CircularProgress';
import { formatAmount, convertAmount } from '@/utils/unitConversion';

const quickAmounts = [250, 500, 750, 1000]; // in ml

export default function HomeScreen() {
  const { state, dispatch } = useHydration();
  const { pauseReminders } = useNotification();
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const progress = Math.min((state.currentIntake / state.dailyGoal) * 100, 100);
  const remainingAmount = Math.max(state.dailyGoal - state.currentIntake, 0);

  const getDisplayAmount = (amount: number) => {
    return state.unit === 'oz' ? convertAmount(amount, 'ml', 'oz') : amount;
  };

  const addWater = (amount: number) => {
    const amountInMl = state.unit === 'oz' ? convertAmount(amount, 'oz', 'ml') : amount;
    dispatch({ type: 'ADD_WATER', amount: amountInMl });
    
    // Check for achievements
    const newTotal = state.currentIntake + amountInMl;
    if (newTotal >= state.dailyGoal && state.currentIntake < state.dailyGoal) {
      dispatch({ type: 'ADD_ACHIEVEMENT', achievement: 'Daily Goal Achieved!' });
      // Could trigger celebration animation here
    }
  };

  const addCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      addWater(amount);
      setCustomAmount('');
      setCustomModalVisible(false);
    }
  };

  const resetDailyIntake = () => {
    Alert.alert(
      'Reset Today\'s Intake',
      'Are you sure you want to reset your water intake for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => dispatch({ type: 'RESET_DAILY_INTAKE' })
        }
      ]
    );
  };

  const getNextReminderTime = () => {
    const now = new Date();
    const nextReminder = new Date(now.getTime() + state.reminderSettings.interval * 60 * 1000);
    return nextReminder.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <LinearGradient
      colors={['#4A90E2', '#7BB3F0', '#F0F9FF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Stay Hydrated</Text>
          <Text style={styles.subtitle}>Keep your body flowing with H₂O</Text>
        </View>

        {/* Main Progress Circle */}
        <View style={styles.progressSection}>
          <CircularProgress size={240} strokeWidth={16} progress={progress}>
            <View style={styles.progressContent}>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
              <View style={styles.intakeInfo}>
                <Text style={styles.intakeAmount}>
                  {formatAmount(getDisplayAmount(state.currentIntake), state.unit)}
                </Text>
                <Text style={styles.intakeGoal}>
                  of {formatAmount(getDisplayAmount(state.dailyGoal), state.unit)}
                </Text>
              </View>
            </View>
          </CircularProgress>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Target size={24} color="#4A90E2" />
            <Text style={styles.statValue}>
              {formatAmount(getDisplayAmount(remainingAmount), state.unit)}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          
          <View style={styles.statCard}>
            <Droplets size={24} color="#40E0D0" />
            <Text style={styles.statValue}>{state.streakCount}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Clock size={24} color="#7BB3F0" />
            <Text style={styles.statValue}>{getNextReminderTime()}</Text>
            <Text style={styles.statLabel}>Next Reminder</Text>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickAddButton}
                onPress={() => addWater(getDisplayAmount(amount))}
              >
                <Droplets size={20} color="#4A90E2" />
                <Text style={styles.quickAddText}>
                  {formatAmount(getDisplayAmount(amount), state.unit)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setCustomModalVisible(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.customButtonText}>Custom Amount</Text>
          </TouchableOpacity>
        </View>

        {/* Reminder Controls */}
        <View style={styles.reminderSection}>
          <Text style={styles.sectionTitle}>Reminder Controls</Text>
          <View style={styles.reminderButtonsRow}>
            <TouchableOpacity
              style={styles.reminderButton}
              onPress={() => pauseReminders('short')}
            >
              <Pause size={18} color="#4A90E2" />
              <Text style={styles.reminderButtonText}>15 min</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.reminderButton}
              onPress={() => pauseReminders('hour')}
            >
              <Pause size={18} color="#4A90E2" />
              <Text style={styles.reminderButtonText}>1 hour</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.reminderButton}
              onPress={() => pauseReminders('day')}
            >
              <Pause size={18} color="#4A90E2" />
              <Text style={styles.reminderButtonText}>Rest of day</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={resetDailyIntake}>
          <RotateCcw size={18} color="#FF6B6B" />
          <Text style={styles.resetButtonText}>Reset Today's Intake</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={customModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Amount</Text>
            <TextInput
              style={styles.customInput}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder={`Enter amount in ${state.unit}`}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={addCustomAmount}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Add Water
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
  greeting: {
    fontSize: 32,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontFamily: 'Nunito_700Bold',
    color: '#4A90E2',
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#7BB3F0',
    marginTop: 4,
  },
  intakeInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  intakeAmount: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
  },
  intakeGoal: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  quickAddSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  quickAddButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  quickAddText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#2D3748',
  },
  customButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  customButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#FFFFFF',
  },
  reminderSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  reminderButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reminderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reminderButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4A90E2',
  },
  resetButton: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#FF6B6B',
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
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 24,
  },
  customInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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