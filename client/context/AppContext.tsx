import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { User, Research, Collaboration, AcademicCentre, Researcher, Section } from '../types';
import api from '../utils/api';

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
  const [loading, setLoading] = useState(true);
  
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [notification, setNotification] = useState<NotificationState>({ message: '', type: 'info' });

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [academicCentres, setAcademicCentres] = useState<AcademicCentre[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);

  const showNotification = (message: string, type: NotificationState['type']) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'info' }), 5000);
  };

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    setActiveSection('dashboard');
    // Clear data
    setUsers([]);
    setResearch([]);
    setCollaborations([]);
    setAcademicCentres([]);
    setResearchers([]);
  }, []);

  const fetchData = useCallback(async () => {
    // Guest users don't have a token and can't fetch data.
    if (!sessionStorage.getItem('token')) {
        setLoading(false);
        return;
    }
    try {
        setLoading(true);
        const [usersData, researchData, collaborationsData, centresData, researchersData] = await Promise.all([
            api('/api/users'),
            api('/api/research'),
            api('/api/collaborations'),
            api('/api/academicCentres'),
            api('/api/researchers')
        ]);
        setUsers(usersData);
        setResearch(researchData);
        setCollaborations(collaborationsData);
        setAcademicCentres(centresData);
        setResearchers(researchersData);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        showNotification('Failed to load application data. You may be logged out.', 'error');
        // Handle token expiration by logging out
        if (error instanceof Error && (error.message === 'Invalid Token' || error.message.includes('401'))) {
            logout();
        }
    } finally {
        setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userJson = sessionStorage.getItem('currentUser');
    if (token && userJson) {
      setCurrentUser(JSON.parse(userJson));
      fetchData();
    } else {
       // Check for guest user
      const guestUserJson = sessionStorage.getItem('guestUser');
      if (guestUserJson) {
        setCurrentUser(JSON.parse(guestUserJson));
      }
      setLoading(false);
    }
  }, [fetchData]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const { user, token } = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.removeItem('guestUser');
      setCurrentUser(user);
      await fetchData();
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
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
    sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
    // Guest has no token, will have read-only access (enforced by API)
  };
  
  // --- CRUD Functions ---
  const addResearch = async (data: Omit<Research, 'id'>) => {
    const newResearch = await api('/api/research', { method: 'POST', body: JSON.stringify(data) });
    setResearch(prev => [...prev, newResearch]);
    return newResearch;
  };
  const updateResearch = async (id: string, data: Partial<Omit<Research, 'id'>>) => {
    const updated = await api(`/api/research/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setResearch(prev => prev.map(r => r.id === id ? {...r, ...updated} : r));
  };
  const deleteResearch = async (id: string) => {
    await api(`/api/research/${id}`, { method: 'DELETE' });
    setResearch(prev => prev.filter(r => r.id !== id));
  };
  
  const addCollaboration = async (data: Omit<Collaboration, 'id'>) => {
    const newCollab = await api('/api/collaborations', { method: 'POST', body: JSON.stringify(data) });
    setCollaborations(prev => [...prev, newCollab]);
    return newCollab;
  };
  const updateCollaboration = async (id: string, data: Partial<Omit<Collaboration, 'id'>>) => {
    const updated = await api(`/api/collaborations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setCollaborations(prev => prev.map(c => c.id === id ? {...c, ...updated} : c));
  };
  const deleteCollaboration = async (id: string) => {
    await api(`/api/collaborations/${id}`, { method: 'DELETE' });
    setCollaborations(prev => prev.filter(c => c.id !== id));
  };

  const addCentre = async (data: Omit<AcademicCentre, 'id'>) => {
    const newCentre = await api('/api/academicCentres', { method: 'POST', body: JSON.stringify(data) });
    setAcademicCentres(prev => [...prev, newCentre]);
    return newCentre;
  };
  const updateCentre = async (id: string, data: Partial<Omit<AcademicCentre, 'id'>>) => {
    const updated = await api(`/api/academicCentres/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setAcademicCentres(prev => prev.map(c => c.id === id ? {...c, ...updated} : c));
  };
  const deleteCentre = async (id: string) => {
    await api(`/api/academicCentres/${id}`, { method: 'DELETE' });
    setAcademicCentres(prev => prev.filter(c => c.id !== id));
  };

  const addResearcher = async (data: Omit<Researcher, 'id'>) => {
    const newResearcher = await api('/api/researchers', { method: 'POST', body: JSON.stringify(data) });
    setResearchers(prev => [...prev, newResearcher]);
    return newResearcher;
  };
  const updateResearcher = async (id: string, data: Partial<Omit<Researcher, 'id'>>) => {
    const updated = await api(`/api/researchers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setResearchers(prev => prev.map(r => r.id === id ? {...r, ...updated} : r));
  };
  const deleteResearcher = async (id: string) => {
    await api(`/api/researchers/${id}`, { method: 'DELETE' });
    setResearchers(prev => prev.filter(r => r.id !== id));
  };
  
  const updateUser = async (id: string, data: Partial<Omit<User, 'id'>>) => {
    const updated = await api(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setUsers(prev => prev.map(u => u.id === id ? {...u, ...updated} : u));
  };
  const deleteUser = async (id: string) => {
    await api(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Auth-related user actions might need special endpoints in a real app
  const signup = async (userData: Omit<User, 'id' | 'role' | 'approved'>): Promise<User | null> => { return null; };
  const addCoHost = async (userData: Omit<User, 'id' | 'role' | 'approved'>, password: string): Promise<boolean> => { return false; };
  const resetPasswordForUser = async (email: string): Promise<boolean> => { return false; };

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
