import fs from 'fs';
import sharp from 'sharp';

async function generate() {
  const iconBuffer = fs.readFileSync('assets/icon.png');
  
  // Make a robust square icon and resize the logo to fit.
  // Capacitor assets requires minimum 1024x1024 for icon.png, splash.png, etc.

  const bg = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();

  const resizedLogo = await sharp(iconBuffer)
    .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  const finalIcon = await sharp(bg)
    .composite([{ input: resizedLogo }])
    .png()
    .toBuffer();

  fs.writeFileSync('assets/icon.png', finalIcon);
  fs.writeFileSync('assets/icon-only.png', finalIcon);
  fs.writeFileSync('assets/icon-foreground.png', resizedLogo);
  fs.writeFileSync('assets/icon-background.png', bg);
  fs.writeFileSync('assets/splash.png', finalIcon);
  fs.writeFileSync('assets/splash-dark.png', finalIcon);

  console.log('Fixed assets created.');
}

generate().catch(console.error);
