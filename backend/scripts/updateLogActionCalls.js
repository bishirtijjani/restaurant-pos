const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'controllers');

function updateLogActionCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match logAction calls and add req parameter
  // This handles both multiline and single-line calls
  const pattern = /(await logAction\([^)]*\));/g;
  
  content = content.replace(pattern, (match) => {
    // Remove the closing semicolon and add ', req);'
    if (match.endsWith(');')) {
      modified = true;
      return match.slice(0, -2) + ', req);';
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${path.basename(filePath)}`);
  }
}

// Process all JS files in controllers directory
fs.readdirSync(controllersDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(controllersDir, file);
    updateLogActionCalls(filePath);
  }
});

console.log('Done updating logAction calls');
