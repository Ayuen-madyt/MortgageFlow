'use client';
import { Contact } from '@/utils/types';

// AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, Dispatch, Reducer } from 'react';

// Define your state type
interface AppState {
  mainTaskId: string;
  boardId: string;
  showLender: boolean;
  showContact: boolean;
  showBroker: boolean;
  showTabs: boolean;
  contactId: number | null;
  lenderId: number | null;
  contactType: string | null;
  showApplicants: boolean;
  refetch_activity_feed: boolean;
  refetch_tasks: boolean;
  refetch_applicants: boolean;
  refetch_contacts: boolean;
  refetch_lender: boolean;
  refetch_broker: boolean;
  // Add more states as needed
}

// Define your actions type
type AppAction =
  | { type: 'SET_SHOW_LENDER'; payload: boolean }
  | { type: 'SET_SHOW_CONTACT'; payload: boolean }
  | { type: 'SET_SHOW_BROKER'; payload: boolean }
  | { type: 'SET_CONTACT_ID'; payload: number | null }
  | { type: 'SET_LENDER_ID'; payload: number | null }
  | { type: 'SET_SHOW_TABS'; payload: boolean }
  | { type: 'SET_CONTACT_TYPE'; payload: string }
  | { type: 'SET_SHOW_APPLICANTS'; payload: boolean }
  | { type: 'SET_MAIN_TASK_ID'; payload: string }
  | { type: 'SET_BOARD_ID'; payload: string }
  | { type: 'SET_REFETCH_ACTIVITY_FEED'; payload: boolean }
  | { type: 'SET_REFETCH_TASKS'; payload: boolean }
  | { type: 'SET_REFETCH_APPLICANTS'; payload: boolean }
  | { type: 'SET_REFETCH_CONTACTS'; payload: boolean }
  | { type: 'SET_REFETCH_BROKER'; payload: boolean }
  | { type: 'SET_REFETCH_LENDER'; payload: boolean };
// Add more action types as needed

// Define initial state
const initialState: AppState = {
  mainTaskId: '',
  boardId: '',
  showLender: false,
  showContact: false,
  showBroker: false,
  showTabs: true,
  contactId: null,
  lenderId: null,
  contactType: null,
  showApplicants: false,
  refetch_activity_feed: false,
  refetch_tasks: false,
  refetch_applicants: false,
  refetch_contacts: false,
  refetch_broker: false,
  refetch_lender: false,
  // Initialize additional states here
};

// Create a reducer function
const appReducer: Reducer<AppState, AppAction> = (state, action) => {
  switch (action.type) {
    case 'SET_SHOW_LENDER':
      return {
        ...state,
        showLender: action.payload,
        showTabs: false,
        showBroker: false,
        showContact: false,
        showApplicants: false,
      };
    case 'SET_SHOW_CONTACT':
      return {
        ...state,
        showContact: action.payload,
        showTabs: false,
        showBroker: false,
        showLender: false,
        showApplicants: false,
      };
    case 'SET_SHOW_BROKER':
      return {
        ...state,
        showBroker: action.payload,
        showTabs: false,
        showContact: false,
        showLender: false,
        showApplicants: false,
      };
    case 'SET_CONTACT_ID':
      return { ...state, contactId: action.payload };
    case 'SET_LENDER_ID':
      return { ...state, lenderId: action.payload };
    case 'SET_CONTACT_TYPE':
      return { ...state, contactType: action.payload };

    case 'SET_SHOW_TABS':
      return {
        ...state,
        showTabs: action.payload,
        showBroker: false,
        showLender: false,
        showContact: false,
        showApplicants: false,
      };

    case 'SET_SHOW_APPLICANTS':
      return {
        ...state,
        showApplicants: action.payload,
        showBroker: false,
        showLender: false,
        showContact: false,
        showTabs: false,
      };
    case 'SET_MAIN_TASK_ID':
      return {
        ...state,
        mainTaskId: action.payload,
      };

    case 'SET_BOARD_ID':
      return {
        ...state,
        boardId: action.payload,
      };
    case 'SET_REFETCH_ACTIVITY_FEED':
      return {
        ...state,
        refetch_activity_feed: action.payload,
      };

    case 'SET_REFETCH_TASKS':
      return {
        ...state,
        refetch_tasks: action.payload,
      };

    case 'SET_REFETCH_APPLICANTS':
      return {
        ...state,
        refetch_applicants: action.payload,
      };
    case 'SET_REFETCH_CONTACTS':
      return {
        ...state,
        refetch_contacts: action.payload,
      };
    case 'SET_REFETCH_BROKER':
      return {
        ...state,
        refetch_broker: action.payload,
      };
    case 'SET_REFETCH_LENDER':
      return {
        ...state,
        refetch_lender: action.payload,
      };
    default:
      return state;
  }
};

// Create context and provider
type AppContextProps = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

// Custom hook for using the store
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
