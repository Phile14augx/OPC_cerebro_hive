const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('components'), ...walk('app')];
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/bg-white\/(?:\[.*?\]|\d+)/g, 'bg-surface-elevated');
  content = content.replace(/to-white\/(?:\[.*?\]|\d+)/g, 'to-transparent');
  content = content.replace(/via-white\/(?:\[.*?\]|\d+)/g, 'via-border-subtle');
  content = content.replace(/from-white\/(?:\[.*?\]|\d+)/g, 'from-border-subtle');
  content = content.replace(/text-white\/(?:\[.*?\]|\d+)/g, 'text-text-muted');
  content = content.replace(/border-white\/(?:\[.*?\]|\d+)/g, 'border-border-default');
  
  // also catch stray plain classes that didn't get matched
  content = content.replace(/(?<=[\s"':`])bg-white(?=[\s"':`])/g, 'bg-surface');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
    console.log('Cleaned:', file);
  }
});
console.log(`Cleanup complete. Cleaned ${count} files.`);
