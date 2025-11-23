import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  doc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface FileItem {
  id?: string;
  title: string;
  downloadLink: string;
  imageUrl: string;
  isMultiplayer: boolean;
  isTorrent?: boolean;
  createdAt?: Timestamp;
  // Informations Steam
  steamAppId?: number;
  description?: string;
  developers?: string[];
  publishers?: string[];
  genres?: string[];
  releaseDate?: string;
  platforms?: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
}

export const addFile = async (file: Omit<FileItem, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'files'), {
      ...file,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding file:', error);
    throw error;
  }
};

export const getFiles = async (): Promise<FileItem[]> => {
  try {
    const q = query(collection(db, 'files'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FileItem[];
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'files', fileId));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

