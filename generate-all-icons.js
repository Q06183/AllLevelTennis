const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1024x1024 iOS Icon SVG (solid #2C3E50 background, 600x600 tennis ball centered)
const iosIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#2C3E50" />
  <g transform="translate(212, 212) scale(1.2)">
    <circle cx="250" cy="250" r="250" fill="#DFFF00" />
    <path d="M 50 150 Q 250 250 150 450" fill="none" stroke="#2C3E50" stroke-width="25" stroke-linecap="round" />
    <path d="M 450 350 Q 250 250 350 50" fill="none" stroke="#2C3E50" stroke-width="25" stroke-linecap="round" />
    <path d="M 120 120 L 380 380" fill="none" stroke="#2C3E50" stroke-width="15" stroke-linecap="round" />
    <path d="M 120 380 L 380 120" fill="none" stroke="#2C3E50" stroke-width="15" stroke-linecap="round" />
  </g>
</svg>
`;

// 1024x1024 Splash Icon SVG (transparent background, 600x600 tennis ball centered)
// The actual background color #2C3E50 is set in app.json for the splash screen
const splashIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="transparent" />
  <g transform="translate(212, 212) scale(1.2)">
    <circle cx="250" cy="250" r="250" fill="#DFFF00" />
    <path d="M 50 150 Q 250 250 150 450" fill="none" stroke="#2C3E50" stroke-width="25" stroke-linecap="round" />
    <path d="M 450 350 Q 250 250 350 50" fill="none" stroke="#2C3E50" stroke-width="25" stroke-linecap="round" />
    <path d="M 120 120 L 380 380" fill="none" stroke="#2C3E50" stroke-width="15" stroke-linecap="round" />
    <path d="M 120 380 L 380 120" fill="none" stroke="#2C3E50" stroke-width="15" stroke-linecap="round" />
  </g>
</svg>
`;

async function generateIcons() {
  const assetsDir = path.join(__dirname, 'assets');
  
  console.log('Generating padded iOS icon (icon.png)...');
  await sharp(Buffer.from(iosIconSvg))
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
    
  console.log('Generating padded Splash icon (splash-icon.png)...');
  await sharp(Buffer.from(splashIconSvg))
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
