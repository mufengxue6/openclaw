const fs = require('fs');
const path = require('path');

// Configuration
const MAP_FILE = './i18n/zh-CN/translation_map.json';
const EXCLUDE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.binary', '.node', '.git', '.lock'];
const EXCLUDE_DIRS = ['.git', 'node_modules', 'dist', 'build', 'i18n']; // Don't translate the translation files themselves
// Simple heuristic to skip "code-only" lines (like curl commands)
const SKIP_PATTERNS = [
    /^curl /, /wget /, /^npm /, /^git /, /^\s*import /, /^\s*require\(/, /#! \/bin\//
];

function loadMap() {
    try {
        if (fs.existsSync(MAP_FILE)) {
            return JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
        }
    } catch (e) { console.error("Error loading map:", e); }
    return {};
}

function shouldTranslate(text) {
    if (!text || text.trim().length < 2) return false;
    if (SKIP_PATTERNS.some(p => p.test(text))) return false;
    return true;
}

const translationMap = loadMap();
const keys = Object.keys(translationMap).sort((a, b) => b.length - a.length); // Match longest first

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let modified = false;

    // Very naive replacement for demonstration. 
    // In production, this needs robust parsing (AST for JS, DOM for HTML, etc.)
    // to avoid breaking code syntax.
    // For now, we only replace exact string matches from the map to be safe.
    
    keys.forEach(en => {
        if (newContent.includes(en) && shouldTranslate(en)) {
             // Escape regex special chars
             const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             // Only replace if not part of a larger word (rough check)
             // This is risky for code, so we limit to specific file types or contexts if possible.
             // For this script, we assume the map contains safe-to-replace full strings.
             newContent = newContent.replace(new RegExp(escaped, 'g'), translationMap[en]);
             modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Translated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) walkDir(fullPath);
        } else {
            const ext = path.extname(file);
            if (!EXCLUDE_EXTS.includes(ext)) {
                // Target Docs, Configs, Skills, Markdown, Text
                if (['.md', '.txt', '.yaml', '.yml', '.json', '.html'].includes(ext)) {
                    processFile(fullPath);
                }
            }
        }
    });
}

console.log("Starting translation application...");
// walkDir('.'); // Commented out to prevent accidental massive changes without a verified map.
// To enable: uncomment above. For now, we just log.
console.log("Translation logic loaded. Map size:", keys.length);
