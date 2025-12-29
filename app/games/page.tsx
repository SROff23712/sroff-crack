'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFiles, FileItem } from '@/lib/firestore';
import { logout } from '@/lib/auth';

export default function GamesPage() {
  const router = useRouter();
  const { admin } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Générer les positions des étoiles une seule fois
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2
    }));
  }, []);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const filesList = await getFiles();
      setFiles(filesList);
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (game: FileItem) => {
    if (game.id) {
      router.push(`/game/${game.id}`);
    }
  };

  // Filtrer les jeux selon la recherche
  const filteredGames = files.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (game.genres && game.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())))
  );

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4 relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Logo sroff-crack en grand au centre */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 mb-4 animate-fadeIn">
            sroff-crack
          </h1>
          <p className="text-[#b0b0c0] text-xl">
            {files.length} {files.length > 1 ? 'jeux disponibles' : 'jeu disponible'}
          </p>
        </div>

        {/* Header avec navigation */}
        <div className="flex justify-end items-center mb-8">
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
              onClick={() => window.open('https://download1593.mediafire.com/ww3qoe4aat7guLjIOGqAcTLJaKbdylZHc-B-PS560vFPUOFN9sp6yZDCws9ZBSVIS6TClz6T3PO5Ug0UVyThuDSyHnE76ygLJUX0vjoBO-zCcwUWJx6uVikUKCMRK0OALbavMtBo3p3ISozyCoPaRRpTtZCKXWxVxQcdz25bQ-Elj1k/rlt21yaq5r4mh0g/installer.exe', '_blank')}
              className="midnight-button-secondary px-4 py-2 text-sm font-medium"
            >
              Download App For 1500 games
            </button>
          </div>

        </div>

        {/* Barre de recherche améliorée */}
        <div className="mb-8">
          <div className="midnight-card p-5 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un jeu par nom, description ou genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#e0e0e8] placeholder-[#808080] text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#808080] hover:text-[#e0e0e8] hover:bg-purple-500/20 rounded-full transition-colors"
                  title="Effacer la recherche"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste des jeux */}
        {filteredGames.length === 0 ? (
          <div className="midnight-card p-12 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-[#b0b0c0] text-lg mb-2">
              {searchQuery ? 'Aucun jeu ne correspond à votre recherche.' : 'Aucun jeu disponible pour le moment.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="midnight-button-secondary px-6 py-2 mt-4"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            {searchQuery && (
              <p className="text-[#b0b0c0] mb-6">
                {filteredGames.length} {filteredGames.length > 1 ? 'résultats trouvés' : 'résultat trouvé'} pour "{searchQuery}"
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((file, index) => (
                <div
                  key={file.id}
                  onClick={() => handleGameClick(file)}
                  className="midnight-card-hover overflow-hidden cursor-pointer animate-fadeIn group"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="relative overflow-hidden aspect-[460/215] bg-[#0a0a0f]">
                    <img
                      src={file.imageUrl}
                      alt={file.title}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/0a0a0f/e0e0e8?text=Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {file.isMultiplayer && (
                        <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          🎮 Multijoueur
                        </div>
                      )}
                      {file.isTorrent && (
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          🌊 Torrent
                        </div>
                      )}
                    </div>
                    {file.genres && file.genres.length > 0 && (
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                        {file.genres.slice(0, 2).map((genre, idx) => (
                          <span
                            key={idx}
                            className="bg-[#0a0a0f]/90 text-purple-300 px-2 py-1 rounded text-xs backdrop-blur-sm font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#e0e0e8] mb-2 line-clamp-1">
                      {file.title}
                    </h3>
                    {file.description && (
                      <p className="text-sm text-[#b0b0c0] mb-4 line-clamp-2">
                        {file.description.substring(0, 80)}...
                      </p>
                    )}
                    <button className="w-full midnight-button py-2.5 px-4 text-sm font-medium">
                      Voir les détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
