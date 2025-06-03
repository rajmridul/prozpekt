const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Path to the compiled JavaScript file
const scriptPath = path.join(__dirname, 'js', 'script.js');

// Check if the file exists
if (!fs.existsSync(scriptPath)) {
  console.error('Compiled script.js not found. Run "npm run build" first.');
  process.exit(1);
}

// Read the compiled file
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Replace the API key placeholder with the actual API key from .env
const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  console.error('YOUTUBE_API_KEY not found in .env file');
  process.exit(1);
}

// Replace the placeholder with the actual API key
scriptContent = scriptContent.replace(/youtubeApiKey: ['"]YOUR_API_KEY_HERE['"]/, `youtubeApiKey: '${apiKey}'`);

// Write the updated content back to the file
fs.writeFileSync(scriptPath, scriptContent, 'utf8');

console.log('API key injected successfully into script.js'); 