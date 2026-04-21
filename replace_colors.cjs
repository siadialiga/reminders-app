const fs = require('fs');
const glob = require('glob');
// Wait I don't have glob if it's not installed in root, but I can just use fs.readdirSync recursively.

function findFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = dir + '/' + file;
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    }
    return results;
}

const files = findFiles('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Modernize hardcoded dark background hex codes to use tailwind classes where possible, or replace hex with new beautiful dark theme hexes
    // Old very black/greenish black: #0F1116, #121215, #141417, #16181D, #1C1D24, #1a1c23
    // Replace with apple native slate darks:
    // Main background: #1C1C1E
    // Sidebar/Elevated: #2C2C2E
    // Floating/Modal: #3A3A3C
    
    // Very dark bg map:
    const replacements = {
        '#0F1116': '#1C1C1E',
        '#121215': '#1C1C1E', // MainArea bg
        '#1a1c23': '#2C2C2E', // App gradient
        '#16181D': '#2C2C2E', // Sidebar bg
        '#141417': '#2C2C2E', // TaskDetail bg
        '#1C1D24': '#3A3A3C', // Modal bg
        '#000000': '#1C1C1E', // Context menu / modals
        '#0a0a0a': '#2C2C2E'  // Title bar
    };

    let modified = false;
    for (const [oldHex, newHex] of Object.entries(replacements)) {
        if (content.includes(oldHex)) {
            content = content.split(oldHex).join(newHex);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
