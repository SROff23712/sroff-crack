'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';
import Login from '@/components/Login';

export default function AdminPage() {
  const { user, loading, admin } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-[#b0b0c0]">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center midnight-card p-8">
          <h1 className="text-2xl font-semibold text-[#e0e0e8] mb-4">Accès refusé</h1>
          <p className="text-[#b0b0c0] mb-6">Vous n'avez pas les permissions nécessaires.</p>
          <button
            onClick={() => router.push('/')}
            className="midnight-button px-6 py-3"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}

