import { create } from 'zustand';

interface Workout {
  type: string;
  duration: number;
  points: number;
  date: Date;
}

interface FastingProtocol {
  name: string;
  duration: number;
  description: string;
  points: number;
  premium: boolean;
}

interface UserState {
  user: {
    name: string;
    email: string;
    joinDate: Date;
  };
  points: number;
  currentStreak: number;
  subscriptionStatus: 'free' | 'monthly' | 'yearly';
  subscriptionExpiry: Date | null;
  workoutHistory: Workout[];
  activeFast: FastingProtocol | null;
  temporaryPremium: {
    active: boolean;
    expiresAt: Date | null;
  };
  gameStats: {
    highScore: number;
    gamesPlayed: number;
    premiumUnlocks: number;
  };
  
  // Actions
  addPoints: (points: number) => void;
  addWorkout: (workout: Workout) => void;
  setActiveFast: (fast: FastingProtocol | null) => void;
  setSubscription: (type: 'monthly' | 'yearly') => void;
  activateTemporaryPremium: (duration: number) => void;
  updateGameStats: (score: number) => void;
  isUserPremium: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    name: 'Alex',
    email: 'alex@example.com',
    joinDate: new Date('2024-01-15'),
  },
  points: 145,
  currentStreak: 3,
  subscriptionStatus: 'free',
  subscriptionExpiry: null,
  workoutHistory: [
    {
      type: 'Strength Training',
      duration: 45,
      points: 25,
      date: new Date('2024-12-15'),
    },
    {
      type: 'Cardio',
      duration: 30,
      points: 20,
      date: new Date('2024-12-14'),
    },
  ],
  activeFast: null,
  temporaryPremium: {
    active: false,
    expiresAt: null,
  },
  gameStats: {
    highScore: 0,
    gamesPlayed: 0,
    premiumUnlocks: 0,
  },

  addPoints: (points) => set((state) => ({ 
    points: state.points + points,
    currentStreak: points >= 30 ? state.currentStreak + 1 : state.currentStreak 
  })),
  
  addWorkout: (workout) => set((state) => ({
    workoutHistory: [workout, ...state.workoutHistory.slice(0, 19)], // Keep last 20 workouts
  })),
  
  setActiveFast: (fast) => set({ activeFast: fast }),
  
  setSubscription: (type) => {
    const expiryDate = new Date();
    if (type === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    set({
      subscriptionStatus: type,
      subscriptionExpiry: expiryDate,
      temporaryPremium: { active: false, expiresAt: null },
    });
  },
  
  activateTemporaryPremium: (duration) => {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + duration);
    
    set((state) => ({
      temporaryPremium: {
        active: true,
        expiresAt: expiryDate,
      },
      gameStats: {
        ...state.gameStats,
        premiumUnlocks: state.gameStats.premiumUnlocks + 1,
      },
    }));
  },
  
  updateGameStats: (score) => set((state) => ({
    gameStats: {
      ...state.gameStats,
      highScore: Math.max(state.gameStats.highScore, score),
      gamesPlayed: state.gameStats.gamesPlayed + 1,
    },
  })),
  
  isUserPremium: () => {
    const state = get();
    const now = new Date();
    
    // Check if user has active subscription
    if (state.subscriptionStatus !== 'free' && state.subscriptionExpiry && state.subscriptionExpiry > now) {
      return true;
    }
    
    // Check if user has temporary premium access
    if (state.temporaryPremium.active && state.temporaryPremium.expiresAt && state.temporaryPremium.expiresAt > now) {
      return true;
    }
    
    return false;
  },
}));

export { useUserStore }