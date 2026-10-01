import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const srcDir = 'c:\\Users\\PRIYARENJAN\\Downloads\\ezgif-1d5b677d5e177b6e-png-split';
const destDir = 'c:\\Users\\PRIYARENJAN\\OneDrive\\Desktop\\personal portfolio\\portfolio\\public\\frames';

async function run() {
  await fs.mkdir(destDir, { recursive: true });
  
  // optionally clear existing frames
  const oldFiles = await fs.readdir(destDir);
  for (const f of oldFiles) {
    if (f.endsWith('.webp')) {
      await fs.unlink(path.join(destDir, f));
    }
  }

  const files = await fs.readdir(srcDir);
  const pngs = files.filter(f => f.endsWith('.png')).sort();
  console.log(`Found ${pngs.length} PNGs.`);
  
  let converted = 0;
  for (let i = 0; i < pngs.length; i++) {
    const srcFile = path.join(srcDir, pngs[i]);
    const numStr = String(i + 1).padStart(3, '0');
    const destFile = path.join(destDir, `f${numStr}.webp`);
    
    await sharp(srcFile)
      .webp({ quality: 80 }) // keeping quality high for "very clear and smooth"
      .toFile(destFile);
    
    converted++;
    if (converted % 20 === 0) console.log(`Processed ${converted} frames...`);
  }
  console.log('Done converting frames!');
}
run().catch(console.error);
