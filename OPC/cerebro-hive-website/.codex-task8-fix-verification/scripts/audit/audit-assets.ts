import * as fs from 'fs';
import * as path from 'path';

function getPublicAssets(dir: string, basePath = ''): string[] {
  let assets: string[] = [];
  if (!fs.existsSync(dir)) return assets;
  
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const nextPath = basePath === '' ? `/${file}` : `${basePath}/${file}`;
      assets = assets.concat(getPublicAssets(fullPath, nextPath));
    } else {
      assets.push(basePath === '' ? `/${file}` : `${basePath}/${file}`);
    }
  }
  return assets;
}

function run() {
  console.log('Building Public Assets Map from public/ directory...');
  const publicDir = path.join(process.cwd(), 'public');
  const publicAssets = getPublicAssets(publicDir);
  
  // Find all file downloads inside the inventory
  const inventoryPath = path.join(process.cwd(), 'audit', 'interaction-inventory.csv');
  let brokenAssets = 0;
  const assetResults: any[] = [];

  if (fs.existsSync(inventoryPath)) {
    const inventory = fs.readFileSync(inventoryPath, 'utf8').split('\n');

    for (let i = 1; i < inventory.length; i++) {
      if (!inventory[i].trim()) continue;
      
      const cols = inventory[i].split(',');
      const destination = cols[5]; // Destination
      
      // Look for asset extensions
      if (destination.match(/\.(pdf|zip|docx|xlsx|pptx)$/i)) {
        // Does it exist in public assets?
        // Strip any query strings
        const cleanDest = destination.split('?')[0];
        const exists = publicAssets.includes(cleanDest);
        
        if (!exists) brokenAssets++;

        assetResults.push({
          File: cols[1], // source file
          Label: cols[4], // CTA Label
          Asset: cleanDest,
          Status: exists ? 'Verified' : 'Missing (404)'
        });
      }
    }
  }

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, 'download-assets-audit.csv');
  const header = ['SourceFile', 'CTALabel', 'AssetPath', 'Status'].join(',');
  const rows = assetResults.map(r => `${r.File},${r.Label},${r.Asset},${r.Status}`);
  
  fs.writeFileSync(csvPath, [header, ...rows].join('\n'));
  console.log(`Asset audit complete. Found ${assetResults.length} download links (${brokenAssets} broken). Saved to audit/download-assets-audit.csv`);
}

run();
