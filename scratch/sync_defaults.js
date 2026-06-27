const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.json');
const serverPath = path.join(__dirname, '..', 'server.js');

const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let serverCode = fs.readFileSync(serverPath, 'utf8');

// Format the DB content to match JS object syntax or just stringified JSON
const dbString = JSON.stringify(dbContent, null, 4);

// Locate the defaultDB block
const startMarker = 'const defaultDB = ';
const endMarker = '};\r\n\r\n// Load or initialize database';
const endMarkerAlt = '};\n\n// Load or initialize database';

let startIdx = serverCode.indexOf(startMarker);
if (startIdx === -1) {
    console.error('Could not find start marker');
    process.exit(1);
}

let endIdx = serverCode.indexOf('// Load or initialize database');
if (endIdx === -1) {
    console.error('Could not find end marker');
    process.exit(1);
}

// Back up to the closing brace before the comment
let sliceEnd = endIdx;
while (sliceEnd > startIdx && serverCode[sliceEnd] !== '}') {
    sliceEnd--;
}
sliceEnd++; // Include the brace

const before = serverCode.substring(0, startIdx);
const after = serverCode.substring(sliceEnd);

const newServerCode = before + startMarker + dbString + after;
fs.writeFileSync(serverPath, newServerCode, 'utf8');
console.log('Successfully updated server.js with database.json defaults!');
