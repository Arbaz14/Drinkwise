import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HydrationState {
  dailyGoal: number; // in ml
  currentIntake: number;
  unit: 'ml' | 'oz';
  streakCount: number;
  lastLogDate: string;
  weeklyData: number[];
  monthlyData: { date: string; amount: number }[];
  achievements: string[];
  reminderSettings: {
    enabled: boolean;
    interval: number; // in minutes
    activeHours: { start: number; end: number };
    dndEnabled: boolean;
    dndPeriods: { start: number; end: number }[];
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    customMessages: string[];
  };
  userProfile: {
    age?: number;
    weight?: number;
    activityLevel?: 'low' | 'moderate' | 'high';
    gender?: 'male' | 'female' | 'other';
  };
}

type HydrationAction =
  | { type: 'ADD_WATER'; amount: number }
  | { type: 'SET_DAILY_GOAL'; goal: number }
  | { type: 'SET_UNIT'; unit: 'ml' | 'oz' }
  | { type: 'UPDATE_REMINDER_SETTINGS'; settings: Partial<HydrationState['reminderSettings']> }
  | { type: 'UPDATE_PROFILE'; profile: Partial<HydrationState['userProfile']> }
  | { type: 'RESET_DAILY_INTAKE' }
  | { type: 'UPDATE_STREAK' }
  | { type: 'ADD_ACHIEVEMENT'; achievement: string }
  | { type: 'LOAD_STATE'; state: HydrationState };

const initialState: HydrationState = {
  dailyGoal: 2000, // 2L default
  currentIntake: 0,
  unit: 'ml',
  streakCount: 0,
  lastLogDate: '',
  weeklyData: Array(7).fill(0),
  monthlyData: [],
  achievements: [],
  reminderSettings: {
    enabled: true,
    interval: 60, // 1 hour
    activeHours: { start: 8, end: 22 },
    dndEnabled: false,
    dndPeriods: [],
    soundEnabled: true,
    vibrationEnabled: true,
    customMessages: [
      "💧 Hydration check! You're doing great - keep flowing!",
      "🌊 Time for a water break! Your body will thank you!",
      "💙 Stay hydrated, stay healthy! Time for some H2O!",
      "✨ Water reminder: You're {progress}% toward your daily goal!"
    ]
  },
  userProfile: {}
};

function hydrationReducer(state: HydrationState, action: HydrationAction): HydrationState {
  switch (action.type) {
    case 'ADD_WATER':
      const newIntake = state.currentIntake + action.amount;
      const today = new Date().toDateString();
      
      // Update weekly data (today is index 6, yesterday is 5, etc.)
      const newWeeklyData = [...state.weeklyData];
      newWeeklyData[6] = newIntake;
      
      // Update monthly data
      const monthlyIndex = state.monthlyData.findIndex(d => d.date === today);
      const newMonthlyData = [...state.monthlyData];
      if (monthlyIndex >= 0) {
        newMonthlyData[monthlyIndex] = { date: today, amount: newIntake };
      } else {
        newMonthlyData.push({ date: today, amount: newIntake });
        // Keep only last 30 days
        if (newMonthlyData.length > 30) {
          newMonthlyData.shift();
        }
      }

      return {
        ...state,
        currentIntake: newIntake,
        weeklyData: newWeeklyData,
        monthlyData: newMonthlyData,
        lastLogDate: today
      };
    
    case 'SET_DAILY_GOAL':
      return { ...state, dailyGoal: action.goal };
    
    case 'SET_UNIT':
      return { ...state, unit: action.unit };
    
    case 'UPDATE_REMINDER_SETTINGS':
      return {
        ...state,
        reminderSettings: { ...state.reminderSettings, ...action.settings }
      };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.profile }
      };
    
    case 'RESET_DAILY_INTAKE':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      // Shift weekly data
      const shiftedWeeklyData = [...state.weeklyData.slice(1), 0];
      
      return {
        ...state,
        currentIntake: 0,
        weeklyData: shiftedWeeklyData
      };
    
    case 'UPDATE_STREAK':
      const todayStr = new Date().toDateString();
      const yesterday2 = new Date();
      yesterday2.setDate(yesterday2.getDate() - 1);
      const yesterdayStr2 = yesterday2.toDateString();
      
      // Check if goal was met yesterday
      if (state.lastLogDate === yesterdayStr2 && state.currentIntake >= state.dailyGoal) {
        return { ...state, streakCount: state.streakCount + 1 };
      } else if (state.lastLogDate !== todayStr && state.lastLogDate !== yesterdayStr2) {
        return { ...state, streakCount: 0 };
      }
      
      return state;
    
    case 'ADD_ACHIEVEMENT':
      if (!state.achievements.includes(action.achievement)) {
        return {
          ...state,
          achievements: [...state.achievements, action.achievement]
        };
      }
      return state;
    
    case 'LOAD_STATE':
      return action.state;
    
    default:
      return state;
  }
}

const HydrationContext = createContext<{
  state: HydrationState;
  dispatch: React.Dispatch<HydrationAction>;
} | undefined>(undefined);

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(hydrationReducer, initialState);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('hydrationState');
        if (savedState) {
          dispatch({ type: 'LOAD_STATE', state: JSON.parse(savedState) });
        }
      } catch (error) {
        console.error('Error loading hydration state:', error);
      }
    };

    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('hydrationState', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving hydration state:', error);
      }
    };

    saveState();
  }, [state]);

  return (
    <HydrationContext.Provider value={{ state, dispatch }}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydration() {
  const context = useContext(HydrationContext);
  if (context === undefined) {
    throw new Error('useHydration must be used within a HydrationProvider');
  }
  return context;
}