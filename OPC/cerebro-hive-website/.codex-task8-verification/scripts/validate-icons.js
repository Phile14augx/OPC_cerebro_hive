const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../components/ui/icons');
const iconMapPath = path.join(__dirname, 'icon-map.json');

// 1. File Naming & Export Consistency
function checkFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  let errors = [];

  // PascalCase check
  if (!/^[A-Z][a-zA-Z0-9]+(\.tsx)$/.test(fileName) && fileName !== 'index.ts' && fileName !== 'BaseIcon.tsx' && fileName !== 'Icon.tsx' && fileName !== 'types.ts' && fileName !== 'tokens.ts' && fileName !== 'animations.ts' && fileName !== 'IconRegistry.ts') {
    errors.push(`File name ${fileName} is not PascalCase.`);
  }

  // Export consistency (export const ComponentName)
  if (fileName.endsWith('.tsx') && !['BaseIcon.tsx', 'Icon.tsx'].includes(fileName)) {
    const componentName = fileName.replace('.tsx', '');
    if (!content.includes(`export const ${componentName}`)) {
      errors.push(`File must use 'export const ${componentName}' convention.`);
    }

    const isBranding = filePath.includes('branding');

    // Geometry & Complexity checks (simple regex parsing)
    if (!isBranding && content.includes('transform=')) errors.push('SVG contains forbidden transform attribute.');
    if (!isBranding && content.includes('mask=')) errors.push('SVG contains forbidden mask attribute.');
    if (!isBranding && content.includes('filter=')) errors.push('SVG contains forbidden filter attribute.');
    if (!isBranding && content.includes('<image')) errors.push('SVG contains forbidden raster image.');
    
    if (content.match(/stroke=['"](?!var\(--color-icon-|none['"])/)) errors.push('SVG contains hardcoded stroke color.');
    if (!isBranding && content.match(/strokeWidth=/)) errors.push('SVG contains hardcoded strokeWidth (should be handled by BaseIcon).');

    const pathCount = (content.match(/<path/g) || []).length;
    if (pathCount > 10 && !isBranding) errors.push(`SVG has too many paths (${pathCount} > 10).`);
    
    const nodeCount = (content.match(/<[a-z]+/g) || []).length;
    if (nodeCount > 100) errors.push(`SVG has too many nodes (${nodeCount} > 100).`);

    const stat = fs.statSync(filePath);
    if (stat.size > 5120) errors.push(`File size exceeds 5KB (${stat.size} bytes).`);
  }

  return errors;
}

// 2. Metadata Completeness & Duplicates
function validateMetadata() {
  if (!fs.existsSync(iconMapPath)) return { errors: ['icon-map.json missing'] };
  
  const iconMap = JSON.parse(fs.readFileSync(iconMapPath, 'utf8'));
  let errors = [];
  
  const ids = new Set();
  const names = new Set();
  const allAliases = new Set();

  iconMap.forEach(icon => {
    // Required fields
    ['id', 'category', 'keywords', 'aliases'].forEach(field => {
      if (icon[field] === undefined || icon[field] === null) {
        errors.push(`Icon ${icon.id || 'unknown'} missing required field: ${field}`);
      }
    });

    // Duplicates
    if (ids.has(icon.id)) errors.push(`Duplicate ID found: ${icon.id}`);
    ids.add(icon.id);

    const componentName = icon.id.replace(/(^\\w|-\\w)/g, clearAndUpper => clearAndUpper.replace(/-/, '').toUpperCase());
    if (names.has(componentName)) errors.push(`Duplicate Component Name found: ${componentName}`);
    names.add(componentName);

    if (icon.aliases) {
      icon.aliases.forEach(alias => {
        if (allAliases.has(alias)) errors.push(`Duplicate alias found across icons: ${alias}`);
        allAliases.add(alias);
      });
    }
  });

  return errors;
}

console.log("Starting Icon Validation Pipeline...");

// Run file checks
let fileErrors = [];
function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const errs = checkFile(fullPath, file);
      if (errs.length) {
        fileErrors.push({ file: fullPath.replace(baseDir, ''), errors: errs });
      }
    }
  });
}

walkDir(baseDir);

const metaErrors = validateMetadata();

let passed = true;

if (fileErrors.length > 0) {
  console.log("\\n[FAIL] File Validation Errors:");
  fileErrors.forEach(f => {
    console.log(`- ${f.file}:`);
    f.errors.forEach(e => console.log(`    ❌ ${e}`));
  });
  passed = false;
}

if (metaErrors.length > 0) {
  console.log("\\n[FAIL] Metadata Validation Errors:");
  metaErrors.forEach(e => console.log(`  ❌ ${e}`));
  passed = false;
}

if (passed) {
  console.log("\\n✅ All icon validation checks passed successfully!");
  process.exit(0);
} else {
  console.error("\\n❌ Icon validation failed.");
  process.exit(1);
}
