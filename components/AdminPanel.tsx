'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addFile, getFiles, deleteFile, FileItem } from '@/lib/firestore';
import { searchSteamGames, getSteamGameDetails, SteamSearchResult } from '@/lib/steam';
import { logout } from '@/lib/auth';

export default function AdminPanel() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isTorrent, setIsTorrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  
  // Recherche Steam
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocked, setSearchLocked] = useState(false);
  const [searchResults, setSearchResults] = useState<SteamSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SteamSearchResult | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (searchLocked) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSteamSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchLocked]);

  const loadFiles = async () => {
    try {
      const filesList = await getFiles();
      setFiles(filesList);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${fileName}" ?`)) {
      return;
    }

    try {
      await deleteFile(fileId);
      setSuccess(`Jeu "${fileName}" supprimé avec succès !`);
      loadFiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du jeu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSteamSearch = async () => {
    setSearching(true);
    try {
      const results = await searchSteamGames(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching Steam:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectGame = async (game: SteamSearchResult) => {
    setSelectedGame(game);
    setTitle(game.name);
    setImageUrl(game.header_image || '');
    setSearchQuery(game.name);
    setSearchResults([]);
    setSearchLocked(true);

    try {
      const details = await getSteamGameDetails(game.appid);
      if (details) {
        setImageUrl(details.header_image || game.header_image || '');
      }
    } catch (err) {
      console.error('Error loading game details:', err);
    }
  };

  const createClictuneLink = async (originalUrl: string, gameName: string) => {
    const response = await fetch('/api/clictune/create-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: originalUrl,
        name: gameName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Impossible de générer le lien Clictune (erreur réseau).');
    }

    const data = await response.json();
    if (!data.shortenedUrl) {
      throw new Error(data.error || 'La création du lien Clictune a échoué.');
    }

    return data.shortenedUrl as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let steamData: any = {};
      
      if (selectedGame) {
        const details = await getSteamGameDetails(selectedGame.appid);
        if (details) {
          steamData = {
            steamAppId: details.appid,
            description: details.short_description,
            developers: details.developers,
            publishers: details.publishers,
            genres: details.genres?.map(g => g.description),
            releaseDate: details.release_date?.date,
            platforms: details.platforms
          };
        }
      }

      const shortenedDownloadLink = await createClictuneLink(downloadLink, title);

      await addFile({
        title,
        downloadLink: shortenedDownloadLink,
        imageUrl,
        isMultiplayer,
        isTorrent,
        ...steamData
      });
      
      setSuccess('Jeu ajouté avec succès !');
      setTitle('');
      setDownloadLink('');
      setImageUrl('');
      setIsMultiplayer(false);
      setIsTorrent(false);
      setSelectedGame(null);
      setSearchQuery('');
      loadFiles();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du jeu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4 relative overflow-hidden">
      {/* Effet d'étoiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-purple-400 rounded-full opacity-30 animate-pulse"
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
        <div className="midnight-card p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
              Panneau d'administration
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="midnight-button-secondary px-4 py-2 text-sm font-medium"
              >
                Accueil
              </button>
              <button
                onClick={() => router.push('/games')}
                className="midnight-button-secondary px-4 py-2 text-sm font-medium"
              >
                Jeux
              </button>
              <button
                onClick={logout}
                className="midnight-button-danger px-4 py-2 text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded text-sm backdrop-blur-sm">
                {success}
              </div>
            )}

            {/* Recherche SteamDB */}
            <div>
              <label className="block text-[#b0b0c0] text-xs font-semibold mb-2 uppercase tracking-wide">
                🔍 Rechercher un jeu via SteamDB
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchLocked(false);
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full px-4 py-3 midnight-input text-sm"
                  placeholder="Tapez le nom du jeu (ex: Counter-Strike, GTA V...)"
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto midnight-card border border-purple-500/20">
                  {searchResults.map((game) => (
                    <button
                      key={game.appid}
                      type="button"
                      onClick={() => handleSelectGame(game)}
                      className="w-full px-4 py-3 hover:bg-purple-900/20 transition-all flex items-center gap-3 text-left border-b border-purple-500/10 last:border-0"
                    >
                      {game.header_image && (
                        <img
                          src={game.header_image}
                          alt={game.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <span className="text-[#e0e0e8] text-sm font-medium">{game.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedGame && (
                <div className="mt-2 midnight-card p-3 border border-green-500/30 flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-[#e0e0e8] text-sm">Jeu sélectionné: <strong>{selectedGame.name}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGame(null);
                      setSearchQuery('');
                    }}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[#b0b0c0] text-xs font-semibold mb-2 uppercase tracking-wide">
                Titre du jeu
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 midnight-input text-sm"
                placeholder="Nom du jeu"
              />
            </div>

            <div>
              <label className="block text-[#b0b0c0] text-xs font-semibold mb-2 uppercase tracking-wide">
                Lien de téléchargement
              </label>
              <input
                type="url"
                value={downloadLink}
                onChange={(e) => setDownloadLink(e.target.value)}
                required
                className="w-full px-4 py-3 midnight-input text-sm"
                placeholder="https://example.com/game.zip"
              />
              <p className="text-xs text-[#b0b0c0]/70 mt-1">
                Ce lien sera automatiquement converti en URL Clictune finale.
              </p>
            </div>

            <div>
              <label className="block text-[#b0b0c0] text-xs font-semibold mb-2 uppercase tracking-wide">
                URL de l'image
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="w-full px-4 py-3 midnight-input text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="multiplayer"
                checked={isMultiplayer}
                onChange={(e) => setIsMultiplayer(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-[#0a0a0f] border-purple-500/30 rounded focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="multiplayer" className="ml-2 text-[#e0e0e8] text-sm font-medium cursor-pointer">
                🎮 Mode multijoueur
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="torrent"
                checked={isTorrent}
                onChange={(e) => setIsTorrent(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-[#0a0a0f] border-purple-500/30 rounded focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="torrent" className="ml-2 text-[#e0e0e8] text-sm font-medium cursor-pointer">
                🌊 Torrent
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full midnight-button py-3 px-4 font-medium disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter le jeu'}
            </button>
          </form>
        </div>

        <div className="midnight-card p-6">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 mb-4">
            Jeux existants ({files.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div
                key={file.id}
                className="midnight-card-hover p-4 relative group animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => file.id && handleDelete(file.id, file.title)}
                  className="absolute top-2 right-2 midnight-button-danger p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Supprimer ce jeu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="relative overflow-hidden aspect-[460/215] rounded mb-2 bg-[#0a0a0f]">
                  <img
                    src={file.imageUrl}
                    alt={file.title}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/0a0a0f/e0e0e8?text=Image';
                    }}
                  />
                </div>
                <h3 className="font-semibold text-[#e0e0e8] text-sm mb-1 pr-8">{file.title}</h3>
                <p className="text-xs text-[#b0b0c0]">
                  {file.isMultiplayer ? '✅ Multijoueur' : '❌ Solo'} | {file.isTorrent ? '✅ Torrent' : '❌ Direct'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
