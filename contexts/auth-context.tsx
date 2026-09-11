import { api } from '@/api/api-client';
import { loginUser, logoutUser, registerUser } from '@/api/auth-api';
import { ICredentials, ISession } from '@/types/session';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';
import { createContext, useContext, useEffect, useReducer } from 'react';

interface IAuthState {
  user: ISession | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface IAuthAction {
  type: 'RESTORE_TOKEN' | 'SIGN_IN' | 'SIGN_OUT' | 'REGISTER';
  token?: string | null;
  refreshToken?: string | null;
  user?: ISession | null;
}

interface IAuthContext {
  state: IAuthState;
  signIn: (credentials: ICredentials) => Promise<{ token: string; user: ISession }>;
  signOut: () => Promise<void>;
  register: (credentials: ICredentials & { name: string, phone: string }) => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

const initialState: IAuthState = { user: null, token: null, refreshToken: null, isLoading: true };

function authReducer(state: IAuthState, action: IAuthAction) {
  switch (action.type) {
    case 'RESTORE_TOKEN': return { ...state, token: action.token || null, refreshToken: action.refreshToken || null, isLoading: false, user: action.user || null };
    case 'SIGN_IN': return { ...state, user: action.user || null, token: action.token || null, refreshToken: action.refreshToken || null };
    case 'SIGN_OUT': return { ...state, user: null, token: null, refreshToken: null };
    case 'REGISTER': return { ...state, user: null, token: null, refreshToken: null };
    default: return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        // Check if token exists
        const token = await SecureStore.getItemAsync('access_token');
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!token) {
          dispatch({ type: 'RESTORE_TOKEN', token: null, refreshToken: null, user: null });
          return;
        }
        // Restore user info using the token
        const user = await api.get('/user/auth/check');
        dispatch({ type: 'RESTORE_TOKEN', token, refreshToken, user: user.data.data });
      } catch {
        console.warn('Failed to restore session, clearing stored token.');
        dispatch({ type: 'RESTORE_TOKEN', token: null, refreshToken: null, user: null });
      }
    }
    restoreSession();

    const listener = DeviceEventEmitter.addListener('auth.logout', () => {
      dispatch({ type: 'SIGN_OUT' });
    });

    return () => {
      listener.remove();
    };
  }, []);

  const authActions = {
    signIn: async (credentials: ICredentials) => {
      const { token, refresh_token, user } = await loginUser(credentials);
      await SecureStore.setItemAsync('access_token', token);
      await SecureStore.setItemAsync('refresh_token', refresh_token);
      dispatch({ type: 'SIGN_IN', user, token, refreshToken: refresh_token });
      return { token, user };
    },
    signOut: async () => {
      try {
        await logoutUser();
      } catch (e) {
        console.warn("Logout API failed, proceeding with local logout");
      }
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      dispatch({ type: 'SIGN_OUT' });
    },
    register: async (credentials: ICredentials & { name: string, phone: string }) => {
      await registerUser(credentials);
      dispatch({ type: 'REGISTER' });
    }
  };

  return (
    <AuthContext.Provider value={{ state, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);