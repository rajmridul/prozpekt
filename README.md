# YouTube Music Player (TypeScript)

A music player that uses YouTube as the source for playing songs from a specified playlist.

## Features

- Loads and plays videos from a YouTube playlist
- Custom player controls (play/pause, next, previous)
- Album-based filtering
- Responsive design

## TypeScript Implementation

This project has been implemented using TypeScript for improved code quality, better developer experience, and type safety.

## Project Structure

```
├── src/                  # TypeScript source files
│   └── script.ts         # Main TypeScript file
├── js/                   # Compiled JavaScript (generated)
│   ├── script.js         # Compiled script
│   └── script.js.map     # Source map for debugging
├── music.html            # Main HTML file
├── styles.css            # CSS styles
├── .env                  # Environment variables (not committed to Git)
├── .gitignore            # Git ignore file
├── build.js              # Script to inject environment variables
├── tsconfig.json         # TypeScript configuration
├── package.json          # NPM package configuration
└── README.md             # This file
```

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/youtube-music-player.git
   cd youtube-music-player
   ```

2. Create a `.env` file in the root directory with your YouTube API key:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Compile TypeScript and inject environment variables:
   ```
   npm run build
   ```

5. For development with auto-recompilation:
   ```
   npm run watch
   ```
   Note: After using watch, you'll need to run `node build.js` to inject the latest API key.

6. To serve the site locally:
   ```
   npm start
   ```

## API Key Configuration

The player uses the YouTube Data API to fetch playlist data. For security reasons, API keys are stored in the `.env` file which is not committed to the repository.

1. Create a `.env` file in the project root with your YouTube API key:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

2. You can get an API key from the [Google Cloud Console](https://console.cloud.google.com/) by enabling the YouTube Data API v3.

3. The build process will automatically inject your API key from the `.env` file into the compiled JavaScript.

## Deployment

When deploying this application:

1. Never commit your `.env` file to version control
2. For hosting platforms (like Netlify, Vercel, etc.), set the `YOUTUBE_API_KEY` as an environment variable in your deployment settings
3. Run the build process before deployment to ensure the API key is properly injected

## Notes

- The volume control has been removed as requested
- The progress bar has been hidden as requested
- YouTube iframe API is used for controlling video playback

## License

MIT 