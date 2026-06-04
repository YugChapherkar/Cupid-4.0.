import React, { createContext } from 'react';
import { User, Match } from '../types';

export interface AppState {
  user: User | null;
  session: any | null; // using any since it is supabase session
  activeMatches: Match[];
  proposalUnlocked: boolean;
}

export interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);
