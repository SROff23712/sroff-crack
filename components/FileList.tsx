'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFiles, FileItem } from '@/lib/firestore';
import { logout } from '@/lib/auth';

export default function FileList() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    router.push(`/game/${game.id}`);
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4 relative overflow-hidden">
      {/* Effet d'étoiles en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-purple-400 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 mb-2">
              🎮 Jeux Gratuits
            </h1>
            <p className="text-[#b0b0c0]">Découvrez notre liste complète de jeux gratuits</p>
          </div>
          <button
            onClick={logout}
            className="midnight-button-secondary px-4 py-2 text-sm font-medium"
          >
            Déconnexion
          </button>
        </div>

        {files.length === 0 ? (
          <div className="midnight-card p-12 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-[#b0b0c0] text-lg">Aucun jeu disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file, index) => (
              <div
                key={file.id}
                onClick={() => handleGameClick(file)}
                className="midnight-card-hover overflow-hidden cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative overflow-hidden aspect-[460/215] bg-[#0a0a0f]">
                  <img
                    src={file.imageUrl}
                    alt={file.title}
                    className="w-full h-full object-cover object-center"
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
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-[#0a0a0f]/90 text-purple-300 px-2 py-1 rounded text-xs backdrop-blur-sm">
                        {file.genres[0]}
                      </span>
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
        )}
      </div>
    </div>
  );
}
