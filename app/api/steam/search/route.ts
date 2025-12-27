import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Utiliser l'API Steam Community qui fonctionne mieux
    const response = await fetch(
      `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      // Fallback: utiliser l'API Steam Store
      return await searchSteamStore(query);
    }

    const data = await response.json();

    if (data && Array.isArray(data) && data.length > 0) {
      const results = data.slice(0, 10).map((item: any) => ({
        appid: parseInt(item.appid) || 0,
        name: item.name || '',
        header_image: item.logo || `https://cdn.akamai.steamstatic.com/steam/apps/${item.appid}/header.jpg`
      })).filter((item: any) => item.appid > 0);

      return NextResponse.json({ results });
    }

    return await searchSteamStore(query);
  } catch (error) {
    console.error('Error searching Steam:', error);
    return await searchSteamStore(query);
  }
}

async function searchSteamStore(query: string) {
  try {
    // Utiliser l'API Steam Store GetAppList
    const response = await fetch(
      `https://api.steampowered.com/ISteamApps/GetAppList/v2/`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    const apps = data.applist?.apps || [];

    const queryLower = query.toLowerCase().trim();
    const exactMatches: any[] = [];
    const startsWithMatches: any[] = [];
    const containsMatches: any[] = [];

    apps.forEach((app: any) => {
      const appNameLower = app.name.toLowerCase();

      if (appNameLower === queryLower) {
        exactMatches.push(app);
      } else if (appNameLower.startsWith(queryLower)) {
        startsWithMatches.push(app);
      } else if (appNameLower.includes(queryLower)) {
        containsMatches.push(app);
      }
    });

    const allMatches = [
      ...exactMatches,
      ...startsWithMatches,
      ...containsMatches
    ].slice(0, 10);

    const results = allMatches.map((app: any) => ({
      appid: app.appid,
      name: app.name,
      header_image: `https://cdn.akamai.steamstatic.com/steam/apps/${app.appid}/header.jpg`
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in Steam Store search:', error);
    return NextResponse.json({ results: [] });
  }
}

