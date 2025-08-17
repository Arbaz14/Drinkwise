import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Clock, Target, Volume2, Vibrate, Moon, Plus, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { useHydration } from '@/contexts/HydrationContext';
import { formatAmount, convertAmount, getRecommendedDailyIntake } from '@/utils/unitConversion';

export default function SettingsScreen() {
  const { state, dispatch } = useHydration();
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [customGoal, setCustomGoal] = useState(state.dailyGoal.toString());
  const [customInterval, setCustomInterval] = useState(state.reminderSettings.interval.toString());

  const toggleUnit = () => {
    const newUnit = state.unit === 'ml' ? 'oz' : 'ml';
    dispatch({ type: 'SET_UNIT', unit: newUnit });
  };

  const updateDailyGoal = () => {
    const goal = parseFloat(customGoal);
    if (goal > 0) {
      const goalInMl = state.unit === 'oz' ? convertAmount(goal, 'oz', 'ml') : goal;
      dispatch({ type: 'SET_DAILY_GOAL', goal: goalInMl });
      setGoalModalVisible(false);
    }
  };

  const updateReminderInterval = () => {
    const interval = parseInt(customInterval);
    if (interval >= 15 && interval <= 240) {
      dispatch({
        type: 'UPDATE_REMINDER_SETTINGS',
        settings: { interval }
      });
      setReminderModalVisible(false);
    } else {
      Alert.alert('Invalid Interval', 'Please enter a value between 15 and 240 minutes.');
    }
  };

  const getRecommendedGoal = () => {
    const recommended = getRecommendedDailyIntake(
      state.userProfile.weight,
      state.userProfile.activityLevel,
      state.userProfile.age
    );
    const displayAmount = state.unit === 'oz' ? convertAmount(recommended, 'ml', 'oz') : recommended;
    return Math.round(displayAmount);
  };

  const useRecommendedGoal = () => {
    const recommended = getRecommendedDailyIntake(
      state.userProfile.weight,
      state.userProfile.activityLevel,
      state.userProfile.age
    );
    dispatch({ type: 'SET_DAILY_GOAL', goal: recommended });
    setGoalModalVisible(false);
  };

  const deleteMessage = (index: number) => {
    const newMessages = state.reminderSettings.customMessages.filter((_, i) => i !== index);
    dispatch({
      type: 'UPDATE_REMINDER_SETTINGS',
      settings: { customMessages: newMessages }
    });
  };

  const formatTime = (hour: number) => {
    return hour.toString().padStart(2, '0') + ':00';
  };

  const presetIntervals = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 },
  ];

  return (
    <LinearGradient
      colors={['#4A90E2', '#7BB3F0', '#F0F9FF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your hydration experience</Text>
        </View>

        {/* Goal Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goal</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Target size={24} color="#4A90E2" />
              <Text style={styles.settingTitle}>Water Target</Text>
            </View>
            <View style={styles.goalDisplay}>
              <Text style={styles.goalValue}>
                {formatAmount(
                  state.unit === 'oz' ? convertAmount(state.dailyGoal, 'ml', 'oz') : state.dailyGoal,
                  state.unit
                )}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setCustomGoal(
                    (state.unit === 'oz'
                      ? convertAmount(state.dailyGoal, 'ml', 'oz')
                      : state.dailyGoal
                    ).toString()
                  );
                  setGoalModalVisible(true);
                }}
              >
                <Edit3 size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingTitle}>Unit</Text>
              <TouchableOpacity
                style={styles.unitToggle}
                onPress={toggleUnit}
              >
                <Text style={[
                  styles.unitOption,
                  state.unit === 'ml' && styles.unitOptionActive
                ]}>
                  ml
                </Text>
                <Text style={[
                  styles.unitOption,
                  state.unit === 'oz' && styles.unitOptionActive
                ]}>
                  oz
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Bell size={24} color="#4A90E2" />
              <Text style={styles.settingTitle}>Enable Reminders</Text>
              <Switch
                value={state.reminderSettings.enabled}
                onValueChange={(value) =>
                  dispatch({
                    type: 'UPDATE_REMINDER_SETTINGS',
                    settings: { enabled: value }
                  })
                }
                trackColor={{ false: '#E2E8F0', true: '#7BB3F0' }}
                thumbColor={state.reminderSettings.enabled ? '#4A90E2' : '#CBD5E0'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Clock size={24} color="#4A90E2" />
              <Text style={styles.settingTitle}>Interval</Text>
              <TouchableOpacity
                style={styles.valueButton}
                onPress={() => {
                  setCustomInterval(state.reminderSettings.interval.toString());
                  setReminderModalVisible(true);
                }}
              >
                <Text style={styles.valueButtonText}>
                  {state.reminderSettings.interval} min
                </Text>
                <Edit3 size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingTitle}>Active Hours</Text>
              <Text style={styles.settingValue}>
                {formatTime(state.reminderSettings.activeHours.start)} - {formatTime(state.reminderSettings.activeHours.end)}
              </Text>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Volume2 size={24} color="#4A90E2" />
              <Text style={styles.settingTitle}>Sound</Text>
              <Switch
                value={state.reminderSettings.soundEnabled}
                onValueChange={(value) =>
                  dispatch({
                    type: 'UPDATE_REMINDER_SETTINGS',
                    settings: { soundEnabled: value }
                  })
                }
                trackColor={{ false: '#E2E8F0', true: '#7BB3F0' }}
                thumbColor={state.reminderSettings.soundEnabled ? '#4A90E2' : '#CBD5E0'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Vibrate size={24} color="#4A90E2" />
              <Text style={styles.settingTitle}>Vibration</Text>
              <Switch
                value={state.reminderSettings.vibrationEnabled}
                onValueChange={(value) =>
                  dispatch({
                    type: 'UPDATE_REMINDER_SETTINGS',
                    settings: { vibrationEnabled: value }
                  })
                }
                trackColor={{ false: '#E2E8F0', true: '#7BB3F0' }}
                thumbColor={state.reminderSettings.vibrationEnabled ? '#4A90E2' : '#CBD5E0'}
              />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Moon size={24} color="#4A90E2" />
              <Text style={styles.settingTitle}>Do Not Disturb</Text>
              <Switch
                value={state.reminderSettings.dndEnabled}
                onValueChange={(value) =>
                  dispatch({
                    type: 'UPDATE_REMINDER_SETTINGS',
                    settings: { dndEnabled: value }
                  })
                }
                trackColor={{ false: '#E2E8F0', true: '#7BB3F0' }}
                thumbColor={state.reminderSettings.dndEnabled ? '#4A90E2' : '#CBD5E0'}
              />
            </View>
          </View>
        </View>

        {/* Custom Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Messages</Text>
          {state.reminderSettings.customMessages.map((message, index) => (
            <View key={index} style={styles.messageCard}>
              <Text style={styles.messageText} numberOfLines={2}>
                {message}
              </Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteMessage(index)}
              >
                <Trash2 size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addMessageButton}>
            <Plus size={20} color="#4A90E2" />
            <Text style={styles.addMessageText}>Add Custom Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Goal Modal */}
      <Modal
        visible={goalModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Goal</Text>

            {state.userProfile.weight && (
              <TouchableOpacity
                style={styles.recommendedButton}
                onPress={useRecommendedGoal}
              >
                <Text style={styles.recommendedText}>
                  Use Recommended: {formatAmount(getRecommendedGoal(), state.unit)}
                </Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.goalInput}
              value={customGoal}
              onChangeText={setCustomGoal}
              placeholder={`Enter goal in ${state.unit}`}
              keyboardType="numeric"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={updateDailyGoal}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Save Goal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reminder Interval Modal */}
      <Modal
        visible={reminderModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reminder Interval</Text>

            <View style={styles.presetOptions}>
              {presetIntervals.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    styles.presetOption,
                    state.reminderSettings.interval === preset.value && styles.presetOptionActive
                  ]}
                  onPress={() => {
                    dispatch({
                      type: 'UPDATE_REMINDER_SETTINGS',
                      settings: { interval: preset.value }
                    });
                    setReminderModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.presetOptionText,
                    state.reminderSettings.interval === preset.value && styles.presetOptionTextActive
                  ]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.customLabel}>Or set custom interval:</Text>
            <TextInput
              style={styles.goalInput}
              value={customInterval}
              onChangeText={setCustomInterval}
              placeholder="Minutes (15-240)"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setReminderModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={updateReminderInterval}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Save
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#2D3748',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#718096',
  },
  goalDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 36,
    gap: 12,
  },
  goalValue: {
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
  valueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  valueButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4A90E2',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 4,
  },
  unitOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#718096',
    borderRadius: 8,
  },
  unitOptionActive: {
    backgroundColor: '#4A90E2',
    color: '#FFFFFF',
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: '#2D3748',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  addMessageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  addMessageText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4A90E2',
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
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 24,
  },
  recommendedButton: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  recommendedText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#4A90E2',
    textAlign: 'center',
  },
  goalInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  presetOptions: {
    marginBottom: 24,
  },
  presetOption: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  presetOptionActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F9FF',
  },
  presetOptionText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#718096',
    textAlign: 'center',
  },
  presetOptionTextActive: {
    color: '#4A90E2',
  },
  customLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#718096',
    marginBottom: 12,
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