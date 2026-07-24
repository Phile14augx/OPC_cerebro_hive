const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'apps', 'studio');
const moved = ["AnimatedButton", "BackgroundEngine", "GlassCard", "Logo", "MetricChip", "PrincipleBadge", "SectionHeading", "SectionMetadata", "ThemeToggle", "TrackedButton", "TrackedLink", "icons", "NeuralOrb", "backgrounds", "visualization", "primitives"];

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach((file) => {
    if (file === 'node_modules' || file === '.next' || file === '.venv' || file === '.turbo' || file === 'agentos') return;
    file = path.join(directory, file);
    try {
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          results.push(file);
        }
      }
    } catch(e) {}
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    let changed = false;
    moved.forEach(item => {
      const regex = new RegExp(`components/ui/${item}`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `components/cerebro/${item}`);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log(`Updated ${file}`);
    }
  } catch(e) {}
});
