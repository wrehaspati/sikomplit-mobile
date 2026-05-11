import { api } from '@/api/api-client';
import { loginUser } from '@/api/auth-api';
import { ICredentials, ISession } from '@/types/session';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useReducer } from 'react';

interface IAuthState {
  user: ISession | null;
  token: string | null;
  isLoading: boolean;
}

interface IAuthAction {
  type: 'RESTORE_TOKEN' | 'SIGN_IN' | 'SIGN_OUT';
  token?: string | null;
  user?: ISession | null;
}

interface IAuthContext {
  state: IAuthState;
  signIn: (credentials: ICredentials) => Promise<{ token: string; user: ISession }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

const initialState: IAuthState = { user: null, token: null, isLoading: true };

function authReducer(state: IAuthState, action: IAuthAction) {
  switch (action.type) {
    case 'RESTORE_TOKEN': return { ...state, token: action.token || null, isLoading: false, user: action.user || null };
    case 'SIGN_IN': return { ...state, user: action.user || null, token: action.token || null };
    case 'SIGN_OUT': return { ...state, user: null, token: null };
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
        if (!token) {
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
          return;
        }
        // Restore user info using the token
        const user = await api.get('/user/auth/check');
        dispatch({ type: 'RESTORE_TOKEN', token, user: user.data.data });
      } catch {
        console.warn('Failed to restore session, clearing stored token.');
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    }
    restoreSession();
  }, []);

  const authActions = {
    signIn: async (credentials: ICredentials) => {
      const { token, user } = await loginUser(credentials);
      await SecureStore.setItemAsync('access_token', token);
      dispatch({ type: 'SIGN_IN', user, token });
      return { token, user };
    },
    signOut: async () => {
      await SecureStore.deleteItemAsync('access_token');
      dispatch({ type: 'SIGN_OUT' });
    },
  };

  return (
    <AuthContext.Provider value={{ state, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);