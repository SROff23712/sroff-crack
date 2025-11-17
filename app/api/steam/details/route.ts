import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const appId = searchParams.get('appid');

  if (!appId) {
    return NextResponse.json({ error: 'App ID required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=french`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
    }

    const data = await response.json();
    const gameData = data[appId];

    if (gameData && gameData.success && gameData.data) {
      const game = {
        appid: gameData.data.steam_appid,
        name: gameData.data.name,
        header_image: gameData.data.header_image,
        short_description: gameData.data.short_description,
        developers: gameData.data.developers || [],
        publishers: gameData.data.publishers || [],
        genres: gameData.data.genres || [],
        release_date: gameData.data.release_date,
        price_overview: gameData.data.price_overview,
        platforms: gameData.data.platforms
      };

      return NextResponse.json({ game });
    }

    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  } catch (error) {
    console.error('Error getting Steam game details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

