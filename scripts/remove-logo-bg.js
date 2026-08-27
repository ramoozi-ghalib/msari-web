const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/G.B/.gemini/antigravity/brain/2d60795d-9f1e-4e98-8a65-b10906720508/.user_uploaded/media_1787073763073.png';
const outputPngPath = path.join(__dirname, '../public/images/logo-icon.png');
const outputDarkPath = path.join(__dirname, '../public/images/logo-dark.png');

async function processLogo() {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Create an RGBA buffer
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check if it's part of the red square (r > 160, g < 80, b < 80)
      const isRed = r > 150 && g < 80 && b < 80;

      // Check if it's part of the white lettermark (r > 180, g > 180, b > 180)
      const isWhite = r > 180 && g > 180 && b > 180;

      // Check if it's the inner shadow / soft edge of the white mark
      const isSoftEdge = (r > 100 && g > 90 && b > 140) && !(r < 60 && g < 30 && b > 120);

      // Background purple is typically: r < 60, g < 30, b > 100
      const isPurpleBg = (r < 60 && g < 35 && b > 100) || (r < 80 && g < 40 && b > 140);

      if (isRed) {
        rgbaBuffer[outIdx] = r;
        rgbaBuffer[outIdx + 1] = g;
        rgbaBuffer[outIdx + 2] = b;
        rgbaBuffer[outIdx + 3] = 255;
      } else if (isWhite) {
        rgbaBuffer[outIdx] = r;
        rgbaBuffer[outIdx + 1] = g;
        rgbaBuffer[outIdx + 2] = b;
        rgbaBuffer[outIdx + 3] = 255;
      } else if (isPurpleBg) {
        rgbaBuffer[outIdx] = 0;
        rgbaBuffer[outIdx + 1] = 0;
        rgbaBuffer[outIdx + 2] = 0;
        rgbaBuffer[outIdx + 3] = 0;
      } else {
        // Semi-transparent smooth edge
        // Calculate distance from white
        const distToWhite = Math.sqrt(Math.pow(255 - r, 2) + Math.pow(255 - g, 2) + Math.pow(255 - b, 2));
        if (distToWhite < 180) {
          const alpha = Math.max(0, Math.min(255, Math.round(255 - (distToWhite * 1.2))));
          rgbaBuffer[outIdx] = 255;
          rgbaBuffer[outIdx + 1] = 255;
          rgbaBuffer[outIdx + 2] = 255;
          rgbaBuffer[outIdx + 3] = alpha;
        } else {
          rgbaBuffer[outIdx] = 0;
          rgbaBuffer[outIdx + 1] = 0;
          rgbaBuffer[outIdx + 2] = 0;
          rgbaBuffer[outIdx + 3] = 0;
        }
      }
    }
  }

  // Trim transparent pixels and save
  const cleanImageBuffer = await sharp(rgbaBuffer, {
    raw: { width, height, channels: 4 }
  })
  .trim()
  .png()
  .toBuffer();

  fs.writeFileSync(outputPngPath, cleanImageBuffer);
  fs.writeFileSync(outputDarkPath, cleanImageBuffer);

  console.log('Successfully extracted clean transparent logo to:', outputPngPath);
}

processLogo().catch(console.error);
