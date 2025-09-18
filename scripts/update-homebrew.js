#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Read package.json to get current version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Path to the DMG file
const dmgPath = `dist/Rolodex-${version}.dmg`;

// Check if DMG exists
if (!fs.existsSync(dmgPath)) {
  console.error(`❌ DMG file not found: ${dmgPath}`);
  console.log('Run "npm run build:mac" first to create the DMG');
  process.exit(1);
}

// Calculate SHA256
const fileBuffer = fs.readFileSync(dmgPath);
const hashSum = crypto.createHash('sha256');
hashSum.update(fileBuffer);
const sha256 = hashSum.digest('hex');

// Read current cask formula
const caskPath = 'rolodex.rb';
let caskContent = fs.readFileSync(caskPath, 'utf8');

// Update version and SHA256
caskContent = caskContent.replace(
  /version\s+"[^"]+"/,
  `version "${version}"`
);

caskContent = caskContent.replace(
  /sha256\s+"[^"]+"/,
  `sha256 "${sha256}"`
);

// Write updated cask formula
fs.writeFileSync(caskPath, caskContent);

// Also update the tap version
const tapCaskPath = 'homebrew-tap/Casks/rolodex.rb';
if (fs.existsSync(tapCaskPath)) {
  fs.writeFileSync(tapCaskPath, caskContent);
}

console.log(`✅ Updated HomeBrew cask formula:`);
console.log(`   Version: ${version}`);
console.log(`   SHA256: ${sha256}`);
console.log(`   DMG: ${dmgPath}`);
console.log('');
console.log('Next steps:');
console.log('1. git add . && git commit -m "Release v' + version + '"');
console.log('2. git tag v' + version);
console.log('3. git push origin main --tags');
console.log('4. Upload DMG to GitHub releases');
console.log('5. Push tap repository changes');