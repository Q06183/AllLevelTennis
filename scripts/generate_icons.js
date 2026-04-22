const sharp = require('sharp');

// Main app icon (1024x1024) - Dark blue background with neon yellow tennis ball
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#2C3E50"/>
  <circle cx="512" cy="512" r="380" fill="#DFFF00" stroke="#FFFFFF" stroke-width="20"/>
  <path d="M 340 170 Q 550 512 340 854" fill="none" stroke="#FFFFFF" stroke-width="30" stroke-linecap="round"/>
  <path d="M 684 170 Q 474 512 684 854" fill="none" stroke="#FFFFFF" stroke-width="30" stroke-linecap="round"/>
</svg>
`;

// Splash screen (2048x2048) - Dark blue background, tennis ball, and text
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
  <rect width="2048" height="2048" fill="#2C3E50"/>
  <circle cx="1024" cy="900" r="380" fill="#DFFF00" stroke="#FFFFFF" stroke-width="20"/>
  <path d="M 852 558 Q 1062 900 852 1242" fill="none" stroke="#FFFFFF" stroke-width="30" stroke-linecap="round"/>
  <path d="M 1196 558 Q 986 900 1196 1242" fill="none" stroke="#FFFFFF" stroke-width="30" stroke-linecap="round"/>
  <text x="1024" y="1450" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#FFFFFF" text-anchor="middle">All Level Tennis</text>
</svg>
`;

// Adaptive icon for Android (1024x1024) - Transparent background
const adaptiveSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <circle cx="512" cy="512" r="380" fill="#DFFF00" stroke="#FFFFFF" stroke-width="20"/>
  <path d="M 340 170 Q 550 512 340 854" fill="none" stroke="#FFFFFF" stroke-width="30" stroke-linecap="round"/>
  <path d="M 684 170 Q 474 512 684 854" fill="none" stroke="#FFFFFF" stroke-width="30" stroke-linecap="round"/>
</svg>
`;

async function generateIcons() {
  try {
    await sharp(Buffer.from(iconSvg)).png().toFile('./assets/icon.png');
    await sharp(Buffer.from(splashSvg)).png().toFile('./assets/splash-icon.png');
    await sharp(Buffer.from(adaptiveSvg)).png().toFile('./assets/adaptive-icon.png');
    console.log('Successfully generated icon.png, splash-icon.png, and adaptive-icon.png');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
