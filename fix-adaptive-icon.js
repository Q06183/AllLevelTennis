const fs = require('fs');
const path = require('path');

// We will use the existing sharp package to generate a smaller foreground icon for Android
// Android adaptive icons require the foreground image to be smaller (usually around 432x432 inside a 1080x1080 transparent canvas)
// to leave room for the OS to apply masks (circle, squircle, rounded rect).

const adaptiveSvg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <!-- Transparent background for adaptive foreground -->
  <rect width="1080" height="1080" fill="transparent" />
  
  <!-- Scale down the main tennis ball icon so it fits within the safe zone (usually central 66 dp / 108 dp -> ~61%) -->
  <!-- Let's make the ball about 500x500 centered -->
  <g transform="translate(290, 290) scale(1)">
    <circle cx="250" cy="250" r="250" fill="#DFFF00" />
    <path d="M 50 150 Q 250 250 150 450" fill="none" stroke="#2C3E50" stroke-width="25" stroke-linecap="round" />
    <path d="M 450 350 Q 250 250 350 50" fill="none" stroke="#2C3E50" stroke-width="25" stroke-linecap="round" />
    <path d="M 120 120 L 380 380" fill="none" stroke="#2C3E50" stroke-width="15" stroke-linecap="round" />
    <path d="M 120 380 L 380 120" fill="none" stroke="#2C3E50" stroke-width="15" stroke-linecap="round" />
  </g>
</svg>
`;

async function generateAdaptiveIcon() {
  const sharp = require('sharp');
  const assetsDir = path.join(__dirname, 'assets');
  
  console.log('Generating smaller adaptive foreground icon for Android...');
  await sharp(Buffer.from(adaptiveSvg))
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    
  console.log('Done!');
}

generateAdaptiveIcon().catch(console.error);