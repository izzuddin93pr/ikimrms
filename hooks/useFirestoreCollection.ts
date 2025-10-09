import { useState, useEffect } from 'react';
import type { User, AcademicCentre } from '../types';

export interface FirestoreDocument {
    id: string;
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

function useFirestoreCollection<T extends FirestoreDocument>(collectionName: string, initialData: (Omit<T, 'id'> | Omit<User, 'id'> | Omit<AcademicCentre, 'id'>)[] = []) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => { // Simulate async loading
            try {
                const item = window.localStorage.getItem(collectionName);
                if (item) {
                    setData(JSON.parse(item));
                } else if (initialData.length > 0) {
                    const initialDataWithIds = initialData.map(d => ({ ...d, id: generateId() } as T));
                    window.localStorage.setItem(collectionName, JSON.stringify(initialDataWithIds));
                    setData(initialDataWithIds);
                } else {
                    setData([]);
                }
            } catch (error) {
                console.error(`Error reading from localStorage for ${collectionName}:`, error);
                setData([]);
            }
            setLoading(false);
        }, 300);
    }, [collectionName]);

    const addDocument = async (newData: Omit<T, 'id'>): Promise<T> => {
        const newDoc = { ...newData, id: generateId() } as T;
        const currentData = JSON.parse(window.localStorage.getItem(collectionName) || '[]');
        const updatedData = [...currentData, newDoc];
        window.localStorage.setItem(collectionName, JSON.stringify(updatedData));
        setData(updatedData);
        return newDoc;
    };

    const setDocument = async (id: string, newData: Omit<T, 'id'>) => {
        const docWithId = { ...newData, id } as T;
        const currentData: T[] = JSON.parse(window.localStorage.getItem(collectionName) || '[]');
        const existingIndex = currentData.findIndex((doc: T) => doc.id === id);
        let updatedData;
        if (existingIndex > -1) {
            updatedData = [...currentData];
            updatedData[existingIndex] = docWithId;
        } else {
            updatedData = [...currentData, docWithId];
        }
        window.localStorage.setItem(collectionName, JSON.stringify(updatedData));
        setData(updatedData);
    };

    const updateDocument = async (id: string, updatedFields: Partial<Omit<T, 'id'>>) => {
        const currentData: T[] = JSON.parse(window.localStorage.getItem(collectionName) || '[]');
        const updatedData = currentData.map((doc: T) =>
            doc.id === id ? { ...doc, ...updatedFields } : doc
        );
        window.localStorage.setItem(collectionName, JSON.stringify(updatedData));
        setData(updatedData);
    };

    const deleteDocument = async (id: string) => {
        const currentData: T[] = JSON.parse(window.localStorage.getItem(collectionName) || '[]');
        const updatedData = currentData.filter((doc: T) => doc.id !== id);
        window.localStorage.setItem(collectionName, JSON.stringify(updatedData));
        setData(updatedData);
    };
    
    return { data, loading, addDocument, setDocument, updateDocument, deleteDocument };
}

export default useFirestoreCollection;