import * as fs from 'fs';
import * as path from 'path';

function getAppRoutes(dir: string, basePath = ''): string[] {
  let routes: string[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Ignore api routes for the frontend map, or special Next.js folders like (group)
      if (file.startsWith('(') && file.endsWith(')')) {
        routes = routes.concat(getAppRoutes(fullPath, basePath));
      } else if (file !== 'api') {
        const nextPath = basePath === '/' ? `/${file}` : `${basePath}/${file}`;
        routes = routes.concat(getAppRoutes(fullPath, nextPath));
      }
    } else if (file === 'page.tsx' || file === 'page.ts') {
      routes.push(basePath === '' ? '/' : basePath);
    }
  }
  return routes;
}

function run() {
  console.log('Building Route Map from app/ directory...');
  const appDir = path.join(process.cwd(), 'app');
  const validRoutes = getAppRoutes(appDir);
  
  // Create generic ownership and mapping logic
  const routeMap = validRoutes.map(route => {
    // Generate dummy ownership (since we don't have a real db)
    let owner = 'Growth Team';
    if (route.includes('/products')) owner = 'Product Team';
    if (route.includes('/industries')) owner = 'Enterprise Solutions';
    if (route.includes('/legal')) owner = 'Legal & Compliance';
    if (route.includes('/dashboard')) owner = 'Core App Team';
    if (route === '/') owner = 'Marketing Team';

    return {
      Route: route,
      Owner: owner,
      Status: 'Active'
    };
  });

  // Cross-reference with interaction inventory to find broken links
  const inventoryPath = path.join(process.cwd(), 'audit', 'interaction-inventory.csv');
  let missingLinksCount = 0;

  if (fs.existsSync(inventoryPath)) {
    const inventory = fs.readFileSync(inventoryPath, 'utf8').split('\n');
    const header = inventory[0];
    // We append a new column "RouteHealth" to the inventory
    const newInventory = [header + ',RouteHealth'];

    for (let i = 1; i < inventory.length; i++) {
      if (!inventory[i].trim()) continue;
      
      const cols = inventory[i].split(',');
      const destination = cols[5]; // Destination
      
      let health = 'OK';
      
      if (destination.startsWith('http') || destination.startsWith('mailto:') || destination.startsWith('tel:')) {
        health = 'External';
      } else if (destination.startsWith('Handler') || destination.startsWith('onClick')) {
        health = 'Action';
      } else if (destination === 'Empty' || destination.startsWith('#') || destination.includes('javascript')) {
        health = 'Placeholder';
      } else if (destination.startsWith('/')) {
        // Check if route exists
        // Strip query params and hashes for route matching
        const cleanDest = destination.split('?')[0].split('#')[0];
        
        // Handle dynamic routes like /industries/[slug] matching /industries/healthcare
        const isMatch = validRoutes.some(validRoute => {
          if (validRoute === cleanDest) return true;
          // Check dynamic segments
          if (validRoute.includes('[') && validRoute.includes(']')) {
            const regexPattern = validRoute.replace(/\[([^\]]+)\]/g, '([^/]+)');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(cleanDest);
          }
          return false;
        });

        if (!isMatch) {
          health = 'Broken (404)';
          missingLinksCount++;
        }
      } else {
        health = 'Unknown';
      }

      newInventory.push(`${inventory[i]},${health}`);
    }

    fs.writeFileSync(inventoryPath, newInventory.join('\n'));
    console.log(`Cross-referenced inventory. Found ${missingLinksCount} broken internal links.`);
  }

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, 'route-coverage-matrix.csv');
  const header = ['Route', 'Owner', 'Status'].join(',');
  const rows = routeMap.map(r => `${r.Route},${r.Owner},${r.Status}`);
  
  fs.writeFileSync(csvPath, [header, ...rows].join('\n'));
  console.log(`Route audit complete. Mapped ${routeMap.length} valid routes. Saved to audit/route-coverage-matrix.csv`);
}

run();
