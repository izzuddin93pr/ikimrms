import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { User, Research, Collaboration, AcademicCentre, Researcher, Section } from '../types';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { INITIAL_USERS, INITIAL_ACADEMIC_CENTRES } from '../constants';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  users: User[];
  research: Research[];
  collaborations: Collaboration[];
  academicCentres: AcademicCentre[];
  researchers: Researcher[];
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  notification: NotificationState;
  showNotification: (message: string, type: NotificationState['type']) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (userData: Omit<User, 'id' | 'role' | 'approved'>) => Promise<User | null>;
  loginAsGuest: () => void;
  
  // CRUD operations
  addCoHost: (userData: Omit<User, 'id' | 'role' | 'approved'>, password: string) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<Omit<User, 'id'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetPasswordForUser: (email: string) => Promise<boolean>;

  addResearch: (researchData: Omit<Research, 'id'>) => Promise<any>;
  updateResearch: (id: string, researchData: Partial<Omit<Research, 'id'>>) => Promise<void>;
  deleteResearch: (id: string) => Promise<void>;

  addCollaboration: (collabData: Omit<Collaboration, 'id'>) => Promise<any>;
  updateCollaboration: (id: string, collabData: Partial<Omit<Collaboration, 'id'>>) => Promise<void>;
  deleteCollaboration: (id: string) => Promise<void>;

  addCentre: (centreData: Omit<AcademicCentre, 'id'>) => Promise<any>;
  updateCentre: (id: string, centreData: Partial<Omit<AcademicCentre, 'id'>>) => Promise<void>;
  deleteCentre: (id: string) => Promise<void>;

  addResearcher: (researcherData: Omit<Researcher, 'id'>) => Promise<any>;
  updateResearcher: (id: string, researcherData: Partial<Omit<Researcher, 'id'>>) => Promise<void>;
  deleteResearcher: (id: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [notification, setNotification] = useState<NotificationState>({ message: '', type: 'info' });

  // Use localStorage-based hooks for data collections
  const { data: users, loading: usersLoading, setDocument: setUser, updateDocument: updateUser, deleteDocument: deleteUser, addDocument: addUserDoc } = useFirestoreCollection<User>('users', INITIAL_USERS);
  const { data: research, loading: researchLoading, addDocument: addResearch, updateDocument: updateResearch, deleteDocument: deleteResearch } = useFirestoreCollection<Research>('research');
  const { data: collaborations, loading: collabLoading, addDocument: addCollaboration, updateDocument: updateCollaboration, deleteDocument: deleteCollaboration } = useFirestoreCollection<Collaboration>('collaborations');
  const { data: academicCentres, loading: centresLoading, addDocument: addCentre, updateDocument: updateCentre, deleteDocument: deleteCentre } = useFirestoreCollection<AcademicCentre>('academicCentres', INITIAL_ACADEMIC_CENTRES);
  const { data: researchers, loading: researchersLoading, addDocument: addResearcher, updateDocument: updateResearcher, deleteDocument: deleteResearcher } = useFirestoreCollection<Researcher>('researchers');
  
  // Check for logged-in user in session storage on initial load
  useEffect(() => {
    setAuthLoading(true);
    setTimeout(() => { // Simulate async check
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            const user: User = JSON.parse(storedUser);
            // Verify user still exists in our 'users' collection for consistency
            if (user.id === 'guest-user' || users.find(u => u.id === user.id)) {
                setCurrentUser(user);
            } else {
                sessionStorage.removeItem('currentUser');
            }
        }
        setAuthLoading(false);
    }, 500);
  }, [users]);

  const showNotification = (message: string, type: NotificationState['type']) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'info' }), 5000);
  };
  
  const login = async (email: string, password: string): Promise<User | null> => {
    // Mock login: password is not checked
    const user = users.find(u => u.email === email);
    if (user) {
        if (!user.approved) {
            showNotification('Your account is pending approval.', 'warning');
            return null;
        }
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    return null;
  };
  
  const signup = async (userData: Omit<User, 'id' | 'role' | 'approved'>): Promise<User | null> => {
      if (users.some(u => u.email === userData.email)) {
          return null; // User with that email already exists
      }
      const newUser: Omit<User, 'id'> = {
          ...userData,
          role: 'guest',
          approved: true, // Auto-approve guests
      };
      const addedUser = await addUserDoc(newUser);
      return addedUser;
  };

  const loginAsGuest = () => {
      const guestUser: User = {
          id: 'guest-user',
          name: 'Guest',
          email: 'guest@ikim.gov.my',
          role: 'guest',
          approved: true,
          organization: 'Public'
      };
      setCurrentUser(guestUser);
      sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
  };

  const logout = async () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    setActiveSection('dashboard');
  };

  const addCoHost = async (userData: Omit<User, 'id' | 'role' | 'approved'>, password: string): Promise<boolean> => {
    // This is a mock implementation. A real implementation would use Firebase Auth.
    if (users.some(u => u.email === userData.email)) {
      showNotification('Email already exists.', 'error');
      return false;
    }
    const newCoHost: Omit<User, 'id'> = {
      ...userData,
      role: 'co-host',
      approved: true,
    };
    await addUserDoc(newCoHost);
    showNotification('Co-host added successfully!', 'success');
    // In a real app, we would sign out here for security reasons.
    // logout(); 
    return true;
  };

  const resetPasswordForUser = async (email: string): Promise<boolean> => {
    // This is a mock implementation. A real implementation would use Firebase Auth's sendPasswordResetEmail.
    console.log(`Password reset email sent to ${email}`);
    showNotification(`Password reset email sent to ${email}`, 'info');
    return true;
  };

  const loading = authLoading || usersLoading || researchLoading || collabLoading || centresLoading || researchersLoading;

  const value: AppContextType = {
    currentUser,
    loading,
    users,
    research,
    collaborations,
    academicCentres,
    researchers,
    activeSection,
    setActiveSection,
    notification,
    showNotification,
    logout,
    login,
    signup,
    loginAsGuest,
    addCoHost,
    updateUser,
    deleteUser,
    resetPasswordForUser,
    addResearch,
    updateResearch,
    deleteResearch,
    addCollaboration,
    updateCollaboration,
    deleteCollaboration,
    addCentre,
    updateCentre,
    deleteCentre,
    addResearcher,
    updateResearcher,
    deleteResearcher
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};