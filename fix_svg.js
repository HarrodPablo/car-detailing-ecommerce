const fs = require('fs');

const svgContent = fs.readFileSync('frontend/src/assets/goodshop_logo.svg', 'utf8');

// The new path without the background rect
// M0 688v688h3060V0H0zm623.2-308.6 -> M 623.2 379.4
let newContent = svgContent.replace('M0 688v688h3060V0H0zm623.2-308.6', 'M623.2 379.4');

// Let's use svg-path-bbox if it's available, otherwise we'll write a simple bounding box estimator
// Wait, we can just render it using puppeteer or something? No, we don't have it.
// We can use a regex to extract all absolute and relative coordinates and roughly estimate the bounding box.
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
let cx = 0, cy = 0;

const paths = newContent.match(/d="([^"]+)"/g);

paths.forEach(p => {
    let d = p.replace('d="', '').replace('"', '');
    // Split into commands
    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
    
    commands.forEach(cmd => {
        const type = cmd[0];
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat);
        
        if (type === 'M' || type === 'L' || type === 'T') {
            for (let i=0; i<args.length; i+=2) {
                if (isNaN(args[i])) continue;
                cx = args[i]; cy = args[i+1];
                updateBounds(cx, cy);
            }
        } else if (type === 'm' || type === 'l' || type === 't') {
            for (let i=0; i<args.length; i+=2) {
                if (isNaN(args[i])) continue;
                cx += args[i]; cy += args[i+1];
                updateBounds(cx, cy);
            }
        } else if (type === 'H') {
            for (let i=0; i<args.length; i++) {
                if (isNaN(args[i])) continue;
                cx = args[i];
                updateBounds(cx, cy);
            }
        } else if (type === 'h') {
            for (let i=0; i<args.length; i++) {
                if (isNaN(args[i])) continue;
                cx += args[i];
                updateBounds(cx, cy);
            }
        } else if (type === 'V') {
            for (let i=0; i<args.length; i++) {
                if (isNaN(args[i])) continue;
                cy = args[i];
                updateBounds(cx, cy);
            }
        } else if (type === 'v') {
            for (let i=0; i<args.length; i++) {
                if (isNaN(args[i])) continue;
                cy += args[i];
                updateBounds(cx, cy);
            }
        } else if (type === 'C') {
            for (let i=0; i<args.length; i+=6) {
                if (isNaN(args[i])) continue;
                cx = args[i+4]; cy = args[i+5];
                updateBounds(cx, cy);
                updateBounds(args[i], args[i+1]);
                updateBounds(args[i+2], args[i+3]);
            }
        } else if (type === 'c') {
            for (let i=0; i<args.length; i+=6) {
                if (isNaN(args[i])) continue;
                updateBounds(cx + args[i], cy + args[i+1]);
                updateBounds(cx + args[i+2], cy + args[i+3]);
                cx += args[i+4]; cy += args[i+5];
                updateBounds(cx, cy);
            }
        } else if (type === 'S' || type === 'Q') {
            for (let i=0; i<args.length; i+=4) {
                if (isNaN(args[i])) continue;
                updateBounds(args[i], args[i+1]);
                cx = args[i+2]; cy = args[i+3];
                updateBounds(cx, cy);
            }
        } else if (type === 's' || type === 'q') {
            for (let i=0; i<args.length; i+=4) {
                if (isNaN(args[i])) continue;
                updateBounds(cx + args[i], cy + args[i+1]);
                cx += args[i+2]; cy += args[i+3];
                updateBounds(cx, cy);
            }
        }
    });
});

function updateBounds(x, y) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
}

console.log(`BBOX: ${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

// Make it a bit padded
const pad = 20;
const newViewBox = `${Math.floor(minX - pad)} ${Math.floor(minY - pad)} ${Math.ceil(maxX - minX + pad*2)} ${Math.ceil(maxY - minY + pad*2)}`;

newContent = newContent.replace(/viewBox="[^"]+"/, `viewBox="${newViewBox}"`);

fs.writeFileSync('frontend/src/assets/goodshop_logo.svg', newContent);
console.log('Done writing! New viewBox: ' + newViewBox);
