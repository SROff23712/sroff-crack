const fs = require('fs');
const path = require('path');

// Note: Ce script nécessite sharp pour créer une icône ronde
// Pour l'installer: npm install --save-dev sharp

async function createRoundIcon() {
  try {
    const sharp = require('sharp');
    const logoPath = path.join(__dirname, '../public/logo.png');
    const outputPath = path.join(__dirname, '../app/icon.png');
    
    // Créer un masque circulaire
    const size = 512;
    const radius = size / 2;
    
    // Créer le masque SVG pour le cercle
    const maskSvg = `
      <svg width="${size}" height="${size}">
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/>
      </svg>
    `;
    
    // Charger le logo, le redimensionner et appliquer le masque rond
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .composite([
        {
          input: Buffer.from(maskSvg),
          blend: 'dest-in'
        }
      ])
      .png()
      .toFile(outputPath);
    
    console.log('✅ Icône ronde créée avec succès : app/icon.png');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  Le module "sharp" n\'est pas installé.');
      console.log('📦 Installez-le avec: npm install --save-dev sharp');
      console.log('💡 Ou créez manuellement une version ronde de logo.png et placez-la dans app/icon.png');
    } else {
      console.error('❌ Erreur lors de la création de l\'icône:', error.message);
    }
  }
}

createRoundIcon();

