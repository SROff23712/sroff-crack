import { NextResponse } from 'next/server';

interface RequestBody {
  game?: {
    appid: number;
    name: string;
    header_image?: string;
  };
  requester?: {
    name: string;
    email?: string | null;
    uid?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('Discord webhook non configuré.');
      return NextResponse.json({ error: 'Webhook Discord non configuré.' }, { status: 500 });
    }

    if (!body.game?.name) {
      return NextResponse.json({ error: 'Nom du jeu requis.' }, { status: 400 });
    }

    if (!body.requester?.name) {
      return NextResponse.json({ error: 'Utilisateur requis.' }, { status: 400 });
    }

    const embed = {
      title: body.game.name,
      description: 'Nouvelle demande de jeu',
      color: 0x8a2be2,
      fields: [
        {
          name: 'App ID',
          value: body.game.appid ? String(body.game.appid) : 'Inconnu',
          inline: true
        },
        {
          name: 'Demandé par',
          value: body.requester.name,
          inline: true
        }
      ],
      thumbnail: body.game.header_image
        ? {
            url: body.game.header_image
          }
        : undefined,
      footer: {
        text: 'Demande envoyée depuis sroff-crack'
      },
      timestamp: new Date().toISOString()
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: `🎮 **Nouvelle demande de jeu**`,
        embeds: [embed]
      })
    });

    if (!discordResponse.ok) {
      console.error('Erreur Discord webhook:', await discordResponse.text());
      return NextResponse.json({ error: 'Erreur lors de l’envoi au webhook.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API game-request:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}


