export interface SteamGame {
  appid: number;
  name: string;
  header_image?: string;
  short_description?: string;
  developers?: string[];
  publishers?: string[];
  genres?: { id: string; description: string }[];
  release_date?: { coming_soon: boolean; date: string };
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
  };
  platforms?: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
}

export interface SteamSearchResult {
  appid: number;
  name: string;
  header_image?: string;
}

// Recherche de jeux Steam via SteamDB (utilise l'API route Next.js pour éviter CORS)
export const searchSteamGames = async (query: string): Promise<SteamSearchResult[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    // Utiliser la route API Next.js pour éviter les problèmes CORS
    const response = await fetch(`/api/steam/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error('API search failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
    
  } catch (error) {
    console.error('Error searching Steam games via SteamDB:', error);
    return [];
  }
};


// Obtenir les détails complets d'un jeu Steam (utilise l'API route Next.js)
export const getSteamGameDetails = async (appId: number): Promise<SteamGame | null> => {
  try {
    // Utiliser la route API Next.js pour éviter les problèmes CORS
    const response = await fetch(`/api/steam/details?appid=${appId}`);
    
    if (!response.ok) {
      console.error('API details failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.game || null;
    
  } catch (error) {
    console.error('Error getting Steam game details:', error);
    return null;
  }
};

