// Remove crossorigin attribute from built HTML so Electron file:// loading works
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Remove crossorigin from script/link tags (breaks file:// protocol in Electron)
html = html.replace(/\s+crossorigin(="[^"]*")?/g, '');

fs.writeFileSync(htmlPath, html);
console.log('Fixed HTML for Electron');
