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
  
  // catch arbitrary black opacities
  content = content.replace(/bg-black\/(?:\[.*?\]|\d+)/g, 'bg-surface-elevated');
  content = content.replace(/text-black\/(?:\[.*?\]|\d+)/g, 'text-text-muted');
  content = content.replace(/border-black\/(?:\[.*?\]|\d+)/g, 'border-border-default');
  content = content.replace(/from-black\/(?:\[.*?\]|\d+)/g, 'from-background');
  content = content.replace(/to-black\/(?:\[.*?\]|\d+)/g, 'to-background');
  content = content.replace(/via-black\/(?:\[.*?\]|\d+)/g, 'via-background');
  
  // catch plain classes that didn't get matched
  content = content.replace(/(?<=[\s"':`])bg-white(?=[\s"':`])/g, 'bg-surface');
  content = content.replace(/(?<=[\s"':`])text-white(?=[\s"':`])/g, 'text-text-primary');
  content = content.replace(/(?<=[\s"':`])from-white(?=[\s"':`])/g, 'from-text-primary');
  content = content.replace(/(?<=[\s"':`])to-white(?=[\s"':`])/g, 'to-text-primary');
  content = content.replace(/(?<=[\s"':`])via-white(?=[\s"':`])/g, 'via-text-primary');
  content = content.replace(/(?<=[\s"':`])fill-white(?=[\s"':`])/g, 'fill-text-primary');
  content = content.replace(/(?<=[\s"':`])stroke-white(?=[\s"':`])/g, 'stroke-text-primary');

  content = content.replace(/(?<=[\s"':`])bg-black(?=[\s"':`])/g, 'bg-background');
  content = content.replace(/(?<=[\s"':`])text-black(?=[\s"':`])/g, 'text-text-primary');
  content = content.replace(/(?<=[\s"':`])from-black(?=[\s"':`])/g, 'from-background');
  content = content.replace(/(?<=[\s"':`])to-black(?=[\s"':`])/g, 'to-background');
  content = content.replace(/(?<=[\s"':`])via-black(?=[\s"':`])/g, 'via-background');
  content = content.replace(/(?<=[\s"':`])border-black(?=[\s"':`])/g, 'border-border-default');
  content = content.replace(/(?<=[\s"':`])fill-black(?=[\s"':`])/g, 'fill-text-primary');
  content = content.replace(/(?<=[\s"':`])stroke-black(?=[\s"':`])/g, 'stroke-text-primary');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
    console.log('Cleaned:', file);
  }
});
console.log(`Cleanup complete. Cleaned ${count} files.`);
