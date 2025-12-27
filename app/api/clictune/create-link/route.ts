import { NextResponse } from 'next/server';

interface RequestBody {
  url: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.url) {
      return NextResponse.json({ error: 'URL requise.' }, { status: 400 });
    }

    // Créer l'URL avec les paramètres de l'API ClicTune
    const endpoint = new URL('https://www.clictune.com/Links_api/create_link');
    endpoint.searchParams.set('user_id', '146418');
    endpoint.searchParams.set('api_key', 'zcpZkbou7gve9C6Aj13TXDtlSJMyIFRB');
    endpoint.searchParams.set('url', body.url);
    if (body.name) {
      endpoint.searchParams.set('name', body.name);
    }

    // Faire l'appel à l'API ClicTune depuis le serveur
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API ClicTune:', errorText);
      return NextResponse.json(
        { error: 'Impossible de générer le lien Clictune (erreur réseau).' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.status || !data.shortenedUrl) {
      return NextResponse.json(
        { error: data.message || 'La création du lien Clictune a échoué.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ shortenedUrl: data.shortenedUrl });
  } catch (error) {
    console.error('Erreur API clictune/create-link:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du lien.' },
      { status: 500 }
    );
  }
}

