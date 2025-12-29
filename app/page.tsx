'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Login from '@/components/Login';
import { getFiles, FileItem } from '@/lib/firestore';
import { logout } from '@/lib/auth';

export default function Home() {
  const { user, loading, admin } = useAuth();
  const router = useRouter();
  const [featuredGames, setFeaturedGames] = useState<FileItem[]>([]);
  const [totalGames, setTotalGames] = useState(0);

  // Générer les positions des étoiles une seule fois
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2
    }));
  }, []);

  const loadFeaturedGames = async () => {
    try {
      const filesList = await getFiles();
      setTotalGames(filesList.length);
      setFeaturedGames(filesList.slice(0, 6)); // Afficher les 6 premiers jeux
    } catch (err) {
      console.error('Error loading games:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadFeaturedGames();
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Effet d'étoiles en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-0.5 h-0.5 bg-purple-400 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header avec navigation */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="sroff-crack"
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/request')}
                className="midnight-button-secondary px-4 py-2 text-sm font-medium"
              >
                Besoin d'ajout ?
              </button>
              {admin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="midnight-button-secondary px-4 py-2 text-sm font-medium"
                >
                  Admin
                </button>
              )}
              <button
                onClick={logout}
                className="midnight-button-secondary px-4 py-2 text-sm font-medium"
              >
                Déconnexion
              </button>
              <button
                onClick={() => window.open('https://www.mediafire.com/file/758b1lfawmr25yp/installer.exe/file', '_blank')}
                className="midnight-button-secondary px-4 py-2 text-sm font-medium"
              >
                Download App For 1500+ games
              </button>
            </div>

          </div>

          {/* Logo sroff-crack en grand au centre */}
          <div className="text-center mb-16">
            <h1 className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 mb-6 animate-fadeIn">
              sroff-crack
            </h1>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-16 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#e0e0e8] mb-6">
              Marre de payer des jeux ?
            </h2>
            <p className="text-2xl md:text-3xl text-[#b0b0c0] mb-4">
              Ici tout est <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 font-bold">gratuit</span> !
            </p>
            <p className="text-xl md:text-2xl text-[#b0b0c0] mb-8">
              Choisissez un jeu, téléchargez, jouez !
            </p>
            <p className="text-3xl md:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 mb-12">
              Y'a pas plus simple
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/games');
                }}
                className="midnight-button py-4 px-12 text-lg font-medium text-xl"
              >
                🎮 Voir tous les jeux
              </button>
              {totalGames > 0 && (
                <div className="midnight-card px-6 py-4 flex items-center justify-center">
                  <p className="text-[#b0b0c0] text-center text-xl">
                    <span className="text-purple-400 font-bold">{totalGames}</span> jeux disponibles
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#e0e0e8] text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="midnight-card p-8 text-center animate-fadeIn hover:scale-105 transition-transform" style={{ animationDelay: '0.1s' }}>
              <div className="text-6xl mb-6 animate-float">🎮</div>
              <h3 className="text-2xl font-semibold text-[#e0e0e8] mb-4">Choisissez</h3>
              <p className="text-[#b0b0c0] text-lg">Parcourez notre catalogue complet de jeux gratuits</p>
            </div>
            <div className="midnight-card p-8 text-center animate-fadeIn hover:scale-105 transition-transform" style={{ animationDelay: '0.2s' }}>
              <div className="text-6xl mb-6 animate-float" style={{ animationDelay: '0.2s' }}>⬇️</div>
              <h3 className="text-2xl font-semibold text-[#e0e0e8] mb-4">Téléchargez</h3>
              <p className="text-[#b0b0c0] text-lg">Téléchargez en un simple clic, sans inscription compliquée</p>
            </div>
            <div className="midnight-card p-8 text-center animate-fadeIn hover:scale-105 transition-transform" style={{ animationDelay: '0.3s' }}>
              <div className="text-6xl mb-6 animate-float" style={{ animationDelay: '0.4s' }}>🎯</div>
              <h3 className="text-2xl font-semibold text-[#e0e0e8] mb-4">Jouez</h3>
              <p className="text-[#b0b0c0] text-lg">Profitez de vos jeux gratuitement, sans limite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jeux en vedette */}
      {featuredGames.length > 0 && (
        <div className="relative z-10 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-[#e0e0e8]">
                Jeux en vedette
              </h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/games');
                }}
                className="midnight-button-secondary px-6 py-2 text-sm font-medium"
              >
                Voir tout →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game, index) => (
                <div
                  key={game.id}
                  onClick={(e) => {
                    e.preventDefault();
                    if (game.id) {
                      router.push(`/game/${game.id}`);
                    }
                  }}
                  className="midnight-card-hover overflow-hidden cursor-pointer animate-fadeIn group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden aspect-[460/215] bg-[#0a0a0f]">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/0a0a0f/e0e0e8?text=Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-70"></div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {game.isMultiplayer && (
                        <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          🎮 Multijoueur
                        </div>
                      )}
                      {game.isTorrent && (
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          🌊 Torrent
                        </div>
                      )}
                    </div>
                    {game.genres && game.genres.length > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-[#0a0a0f]/90 text-purple-300 px-3 py-1 rounded-full text-xs backdrop-blur-sm font-medium">
                          {game.genres[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-[#e0e0e8] mb-3 line-clamp-1">
                      {game.title}
                    </h3>
                    {game.description && (
                      <p className="text-sm text-[#b0b0c0] mb-4 line-clamp-2">
                        {game.description.substring(0, 100)}...
                      </p>
                    )}
                    <button className="w-full midnight-button py-3 px-4 text-sm font-medium">
                      Voir les détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 py-12 px-4 border-t border-purple-500/20 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#b0b0c0] mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 font-bold">sroff-crack</span> - Tous vos jeux gratuits
          </p>
          <p className="text-sm text-[#808080]">
            Marre de payer des jeux ? Ici tout est gratuit ! Choisissez un jeu, téléchargez, jouez ! Y'a pas plus simple
          </p>
        </div>
      </div>
    </div>
  );
}
