import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import * as storage from '../services/storage.service';
import { User as UserProfile } from '../services/users.service';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  has2FAEnabled?: boolean;
  country?: string | null;
  currency?: string | null;
}

interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: User | null;
  requires2FA: boolean;
  tempUserId: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user: User | null }
  | { type: 'SIGN_IN'; token: string; user: User }
  | { type: 'SIGN_OUT' }
  | { type: 'REQUIRE_2FA'; userId: string }
  | { type: 'CLEAR_2FA_REQUIREMENT' }
  | { type: 'UPDATE_USER'; user: User };

interface AuthContextType {
  state: AuthState;
  signIn: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  signUp: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  require2FA: (userId: string) => void;
  clear2FARequirement: () => void;
  setUser: (user: User) => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (prevState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        userToken: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.token,
        user: action.user,
        requires2FA: false,
        tempUserId: null,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        user: null,
        requires2FA: false,
        tempUserId: null,
      };
    case 'REQUIRE_2FA':
      return {
        ...prevState,
        requires2FA: true,
        tempUserId: action.userId,
      };
    case 'CLEAR_2FA_REQUIREMENT':
      return {
        ...prevState,
        requires2FA: false,
        tempUserId: null,
      };
    case 'UPDATE_USER':
      return {
        ...prevState,
        user: action.user,
      };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
    requires2FA: false,
    tempUserId: null,
  });

  useEffect(() => {
    // Restore token from secure storage on app launch
    const bootstrapAsync = async () => {
      let userToken: string | null = null;
      let user: User | null = null;

      try {
        userToken = await storage.getAccessToken();
        user = (await storage.getUser()) as User | null;
      } catch (e) {
        // Restoring token failed
        console.error('Failed to restore token:', e);
      }

      // After restoring token, dispatch RESTORE_TOKEN to update state
      dispatch({ type: 'RESTORE_TOKEN', token: userToken, user });
    };

    bootstrapAsync();
  }, []);

  const authContext: AuthContextType = {
    state,
    user: state.user,
    signIn: async (accessToken: string, refreshToken: string, user: User) => {
      try {
        await storage.saveTokens(accessToken, refreshToken);
        await storage.saveUser(user);
        dispatch({ type: 'SIGN_IN', token: accessToken, user });
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    },
    signUp: async (accessToken: string, refreshToken: string, user: User) => {
      // Sign up is the same as sign in - both store tokens and update state
      try {
        await storage.saveTokens(accessToken, refreshToken);
        await storage.saveUser(user);
        dispatch({ type: 'SIGN_IN', token: accessToken, user });
      } catch (error) {
        console.error('Sign up error:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        await storage.clearTokens();
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    },
    restoreSession: async () => {
      try {
        const accessToken = await storage.getAccessToken();
        const user = (await storage.getUser()) as User | null;

        if (accessToken && user) {
          dispatch({ type: 'SIGN_IN', token: accessToken, user });
        } else {
          throw new Error('No session to restore');
        }
      } catch (error) {
        console.error('Restore session error:', error);
        throw error;
      }
    },
    require2FA: (userId: string) => {
      dispatch({ type: 'REQUIRE_2FA', userId });
    },
    clear2FARequirement: () => {
      dispatch({ type: 'CLEAR_2FA_REQUIREMENT' });
    },
    setUser: async (user: User) => {
      try {
        await storage.saveUser(user);
        dispatch({ type: 'UPDATE_USER', user });
      } catch (error) {
        console.error('Update user error:', error);
        throw error;
      }
    },
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
