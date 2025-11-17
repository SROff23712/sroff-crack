'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFiles, FileItem } from '@/lib/firestore';
import { getSteamGameDetails, SteamGame } from '@/lib/steam';
import { logout } from '@/lib/auth';

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<FileItem | null>(null);
  const [steamDetails, setSteamDetails] = useState<SteamGame | null>(null);
  const [loading, setLoading] = useState(true);

  // Générer les positions des étoiles une seule fois
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2
    }));
  }, []);

  useEffect(() => {
    if (params.id) {
      loadGame();
    }
  }, [params.id]);

  const loadGame = async () => {
    try {
      const files = await getFiles();
      const gameId = Array.isArray(params.id) ? params.id[0] : params.id;
      const foundGame = files.find(f => f.id === gameId);
      
      if (foundGame) {
        setGame(foundGame);
        
        if (foundGame.steamAppId) {
          const details = await getSteamGameDetails(foundGame.steamAppId);
          setSteamDetails(details);
        }
      }
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center midnight-card p-8">
          <h1 className="text-2xl font-semibold text-[#e0e0e8] mb-4">Jeu non trouvé</h1>
          <button
            onClick={() => router.push('/')}
            className="midnight-button px-6 py-3"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const displayImage = steamDetails?.header_image || game.imageUrl;
  const displayDescription = steamDetails?.short_description || game.description || 'Aucune description disponible.';
  const displayGenres = steamDetails?.genres?.map(g => g.description).join(', ') || game.genres?.join(', ') || 'Non spécifié';
  const displayDevelopers = steamDetails?.developers?.join(', ') || game.developers?.join(', ') || 'Non spécifié';
  const displayPublishers = steamDetails?.publishers?.join(', ') || game.publishers?.join(', ') || 'Non spécifié';

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4 relative overflow-hidden">
      {/* Effet d'étoiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-0.5 h-0.5 bg-purple-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            className="midnight-button-secondary px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="midnight-button-secondary px-4 py-2 text-sm font-medium"
            >
              Accueil
            </button>
            <button
              onClick={logout}
              className="midnight-button-danger px-4 py-2 text-sm font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Game Content */}
        <div className="midnight-card overflow-hidden">
          {/* Hero Image */}
          <div className="relative aspect-[460/215] overflow-hidden bg-[#0a0a0f]">
            <img
              src={displayImage}
              alt={game.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x400/0a0a0f/e0e0e8?text=Image+du+jeu';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-4xl font-bold text-[#e0e0e8] mb-2">{game.title}</h1>
              {game.isMultiplayer && (
                <span className="inline-block bg-gradient-to-r from-purple-600 to-violet-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  🎮 Multijoueur
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 mb-3">
                Description
              </h2>
              <p className="text-[#b0b0c0] leading-relaxed whitespace-pre-line">{displayDescription}</p>
            </div>

            {/* Informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="midnight-card p-4">
                <h3 className="text-sm font-semibold text-[#b0b0c0] mb-2 uppercase tracking-wide">Genres</h3>
                <p className="text-[#e0e0e8]">{displayGenres}</p>
              </div>
              <div className="midnight-card p-4">
                <h3 className="text-sm font-semibold text-[#b0b0c0] mb-2 uppercase tracking-wide">Développeurs</h3>
                <p className="text-[#e0e0e8]">{displayDevelopers}</p>
              </div>
              <div className="midnight-card p-4">
                <h3 className="text-sm font-semibold text-[#b0b0c0] mb-2 uppercase tracking-wide">Éditeurs</h3>
                <p className="text-[#e0e0e8]">{displayPublishers}</p>
              </div>
              {steamDetails?.platforms && (
                <div className="midnight-card p-4">
                  <h3 className="text-sm font-semibold text-[#b0b0c0] mb-2 uppercase tracking-wide">Plateformes</h3>
                  <div className="flex gap-4">
                    {steamDetails.platforms.windows && (
                      <span className="text-[#e0e0e8]">🪟 Windows</span>
                    )}
                    {steamDetails.platforms.mac && (
                      <span className="text-[#e0e0e8]">🍎 Mac</span>
                    )}
                    {steamDetails.platforms.linux && (
                      <span className="text-[#e0e0e8]">🐧 Linux</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="text-center">
              <button
                onClick={() => window.open(game.downloadLink, '_blank')}
                className="midnight-button py-4 px-12 text-lg font-medium"
              >
                Télécharger maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
