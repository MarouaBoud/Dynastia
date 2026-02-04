import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as budgetService from '../services/budget.service';
import { Budget, BudgetProgress, AllocationPreset, RebalanceCheck } from '../services/budget.service';
import { useAuth } from './AuthContext';

/**
 * Budget state interface
 */
interface BudgetState {
  currentBudget: Budget | null;
  progress: BudgetProgress | null;
  presets: AllocationPreset[];
  isLoading: boolean;
  needsSetup: boolean;
  needsRebalance: boolean;
  rebalanceInfo: RebalanceCheck | null;
  error: string | null;
}

/**
 * Budget actions
 */
type BudgetAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BUDGET'; payload: Budget | null }
  | { type: 'SET_PROGRESS'; payload: BudgetProgress | null }
  | { type: 'SET_PRESETS'; payload: AllocationPreset[] }
  | { type: 'SET_NEEDS_SETUP'; payload: boolean }
  | { type: 'SET_REBALANCE'; payload: { needsRebalance: boolean; info: RebalanceCheck | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

/**
 * Budget context interface
 */
interface BudgetContextType {
  state: BudgetState;
  loadCurrentBudget: () => Promise<void>;
  loadPresets: () => Promise<AllocationPreset[]>;
  setupBudget: (totalIncome: number, preset: string) => Promise<Budget>;
  updateAllocations: (savingsPercent: number, billsPercent: number, lifestylePercent: number) => Promise<void>;
  refreshProgress: () => Promise<void>;
  checkForRebalance: () => Promise<void>;
  dismissRebalance: () => void;
}

const initialState: BudgetState = {
  currentBudget: null,
  progress: null,
  presets: [],
  isLoading: false,
  needsSetup: false,
  needsRebalance: false,
  rebalanceInfo: null,
  error: null,
};

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BUDGET':
      return { ...state, currentBudget: action.payload, needsSetup: action.payload === null };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_PRESETS':
      return { ...state, presets: action.payload };
    case 'SET_NEEDS_SETUP':
      return { ...state, needsSetup: action.payload };
    case 'SET_REBALANCE':
      return {
        ...state,
        needsRebalance: action.payload.needsRebalance,
        rebalanceInfo: action.payload.info,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const { state: authState } = useAuth();

  // Load budget when user is authenticated
  useEffect(() => {
    if (authState.userToken) {
      loadCurrentBudget();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [authState.userToken]);

  const loadCurrentBudget = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const budget = await budgetService.getCurrentBudget();
      dispatch({ type: 'SET_BUDGET', payload: budget });

      // Also load progress
      if (budget?.id) {
        const progress = await budgetService.getBudgetProgress(budget.id);
        dispatch({ type: 'SET_PROGRESS', payload: progress });
      }
    } catch (error: any) {
      if (error.response?.data?.needsSetup) {
        dispatch({ type: 'SET_NEEDS_SETUP', payload: true });
        dispatch({ type: 'SET_BUDGET', payload: null });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to load budget' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadPresets = async (): Promise<AllocationPreset[]> => {
    try {
      const { presets } = await budgetService.getPresets();
      dispatch({ type: 'SET_PRESETS', payload: presets });
      return presets;
    } catch (error: any) {
      console.error('Failed to load presets:', error);
      return [];
    }
  };

  const setupBudget = async (totalIncome: number, preset: string): Promise<Budget> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const now = new Date();
      const budget = await budgetService.createBudget({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        totalIncome,
        preset: preset as 'conservative' | 'balanced' | 'growth',
      });

      dispatch({ type: 'SET_BUDGET', payload: budget });
      dispatch({ type: 'SET_NEEDS_SETUP', payload: false });

      // Load progress for new budget
      const progress = await budgetService.getBudgetProgress(budget.id);
      dispatch({ type: 'SET_PROGRESS', payload: progress });

      return budget;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to create budget' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAllocations = async (
    savingsPercent: number,
    billsPercent: number,
    lifestylePercent: number
  ): Promise<void> => {
    if (!state.currentBudget) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updated = await budgetService.updateBudget(state.currentBudget.id, {
        savingsPercent,
        billsPercent,
        lifestylePercent,
      });

      dispatch({ type: 'SET_BUDGET', payload: updated });

      // Refresh progress
      const progress = await budgetService.getBudgetProgress(updated.id);
      dispatch({ type: 'SET_PROGRESS', payload: progress });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to update allocations' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshProgress = async (): Promise<void> => {
    if (!state.currentBudget) return;

    try {
      const progress = await budgetService.getBudgetProgress(state.currentBudget.id);
      dispatch({ type: 'SET_PROGRESS', payload: progress });
    } catch (error: any) {
      console.error('Failed to refresh progress:', error);
    }
  };

  const checkForRebalance = async (): Promise<void> => {
    try {
      const result = await budgetService.checkRebalance();
      dispatch({
        type: 'SET_REBALANCE',
        payload: { needsRebalance: result.needsRebalance, info: result },
      });
    } catch (error: any) {
      console.error('Failed to check rebalance:', error);
    }
  };

  const dismissRebalance = () => {
    dispatch({
      type: 'SET_REBALANCE',
      payload: { needsRebalance: false, info: null },
    });
  };

  return (
    <BudgetContext.Provider
      value={{
        state,
        loadCurrentBudget,
        loadPresets,
        setupBudget,
        updateAllocations,
        refreshProgress,
        checkForRebalance,
        dismissRebalance,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
