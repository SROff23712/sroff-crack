import { 
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from './firebase';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    throw error;
  }
};

export const signInWithGitHub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: any) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw error;
  }
};

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  const adminEmails = ['sroff2371222@gmail.com', 'calebmayongo8@gmail.com'];
  return adminEmails.includes(user.email || '');
};

