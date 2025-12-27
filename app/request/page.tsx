'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchSteamGames, SteamSearchResult } from '@/lib/steam';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';

export default function RequestGamePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SteamSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SteamSearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [searchLocked, setSearchLocked] = useState(false);

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
    if (searchLocked) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      if (query.trim().length > 2) {
        setSearching(true);
        const data = await searchSteamGames(query.trim());
        setResults(data);
        setSearching(false);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query, searchLocked]);

  const handleSelectGame = (game: SteamSearchResult) => {
    setSelectedGame(game);
    setQuery(game.name);
    setResults([]);
    setSearchLocked(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) {
      setError('Sélectionnez un jeu dans la liste.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/game-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game: selectedGame,
          requester: {
            name: user?.displayName || user?.email || 'Utilisateur inconnu'
          }
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Impossible d’envoyer la demande.');
      }

      setSuccess('Demande envoyée sur Discord !');
      setSelectedGame(null);
      setQuery('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
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

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <div className="midnight-card p-8 space-y-6">
          <button
            onClick={() => router.push('/')}
            className="midnight-button-secondary px-4 py-2 text-sm font-medium mb-4"
          >
            ← Retour
          </button>
          <div className="text-center">
            <p className="text-sm text-purple-300 uppercase tracking-[0.3em] mb-2">Besoin d'ajout ?</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#e0e0e8] mb-3">Demander un jeu</h1>
            <p className="text-[#b0b0c0]">
              Choisis ton jeu envoie ta demande et nous recevrons instantanément ta demande sur Discord
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-200 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-500/40 text-green-200 px-4 py-3 rounded text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#b0b0c0] text-xs font-semibold mb-2 uppercase tracking-wide">
                Nom du jeu
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setSearchLocked(false);
                    setQuery(e.target.value);
                  }}
                  className="w-full px-4 py-3 midnight-input text-sm"
                  placeholder="Ex: Grounded 2, FIFA 25..."
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {results.length > 0 && (
              <div className="max-h-64 overflow-y-auto midnight-card border border-purple-500/20">
                {results.map((game) => (
                  <button
                    type="button"
                    key={game.appid}
                    onClick={() => handleSelectGame(game)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-purple-900/20 border-b border-purple-500/10 last:border-0 transition"
                  >
                    {game.header_image && (
                      <img src={game.header_image} alt={game.name} className="w-10 h-10 rounded object-cover" />
                    )}
                    <span className="text-sm text-[#e0e0e8] font-medium">{game.name}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedGame && (
              <div className="midnight-card p-4 border border-purple-500/30 flex items-center gap-4">
                {selectedGame.header_image && (
                  <img
                    src={selectedGame.header_image}
                    alt={selectedGame.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                )}
                <div>
                  <p className="text-[#e0e0e8] font-semibold">{selectedGame.name}</p>
                  <p className="text-xs text-[#b0b0c0]">App ID : {selectedGame.appid}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="ml-auto text-red-400 hover:text-red-300 text-sm"
                >
                  Retirer
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedGame || submitting}
              className="w-full midnight-button py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer la demande sur Discord'}
            </button>
            <p className="text-xs text-center text-[#808080]">
              Nous recevrons ton pseudo ({user.displayName || user.email || 'Utilisateur'}) avec la demande.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}


