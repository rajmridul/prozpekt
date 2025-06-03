"use strict";
// Load configuration
function loadConfig() {
    return {
        youtubeApiKey: 'AIzaSyDU-gK1k0bYot1TgkfBmBHavZCk1kl0Fi0' // This will be replaced when building
    };
}
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const startBtn = document.getElementById('startBtn');
    const introContainer = document.querySelector('.intro-container');
    const playerWrapper = document.getElementById('playerWrapper');
    const logo = document.getElementById('logo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const trackTitle = document.getElementById('trackTitle');
    const albumName = document.getElementById('albumName');
    const albumArt = document.getElementById('albumArt');
    const playlistEl = document.getElementById('playlist');
    const albumListEl = document.getElementById('albumList');
    const currentAlbumTitle = document.getElementById('currentAlbumTitle');
    const listenerCountEl = document.getElementById('listenerCount');
    const socialListenerCountEl = document.getElementById('socialListenerCount');
    const albumArtContainer = document.getElementById('albumArtContainer');
    // YouTube API
    const YOUTUBE_PLAYLIST_ITEMS_API = 'https://www.googleapis.com/youtube/v3/playlistItems';
    const PLAYLIST_ID = 'PLqZaUljTEMRrDl7UH2M7Ootg9iQwFTpCL';
    // Load configuration
    const config = loadConfig();
    const API_KEY = config.youtubeApiKey;
    // Validate API key
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
        console.error('Invalid YouTube API key. Please set a valid API key in the configuration.');
        alert('Please set a valid YouTube API key in the configuration before using this application.');
    }
    else {
        console.log('YouTube API key loaded successfully.');
    }
    // State
    let isPlaying = false;
    let currentTrackIndex = 0;
    let currentAlbum = 'All'; // Default to show all songs
    let filteredPlaylist = [];
    let playlistData = []; // Will hold the YouTube playlist data
    // Create YouTube iframe player
    function createYouTubePlayer() {
        // Create the iframe element
        const youtubeIframe = document.createElement('iframe');
        youtubeIframe.id = 'youtubePlayer';
        youtubeIframe.width = '100%';
        youtubeIframe.height = '100%';
        youtubeIframe.frameBorder = '0';
        youtubeIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        youtubeIframe.allowFullscreen = true;
        youtubeIframe.style.position = 'absolute';
        youtubeIframe.style.top = '0';
        youtubeIframe.style.left = '0';
        youtubeIframe.style.borderRadius = '15px';
        // Add YouTube iframe API parameters
        // enablejsapi=1 is required for controlling the player with JavaScript
        youtubeIframe.src = 'about:blank'; // Will be set when loading a track
        // Remove any existing player
        const existingPlayer = document.getElementById('youtubePlayer');
        if (existingPlayer) {
            existingPlayer.remove();
        }
        // Append to albumArtContainer
        albumArtContainer.appendChild(youtubeIframe);
        return youtubeIframe;
    }
    // Show loading indicator in album art
    function showLoadingIndicator(message) {
        // Update album art to show loading state
        albumArt.style.opacity = '0.5';
        // Create or update loading overlay
        let loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.style.position = 'absolute';
            loadingOverlay.style.top = '0';
            loadingOverlay.style.left = '0';
            loadingOverlay.style.width = '100%';
            loadingOverlay.style.height = '100%';
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.flexDirection = 'column';
            loadingOverlay.style.alignItems = 'center';
            loadingOverlay.style.justifyContent = 'center';
            loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loadingOverlay.style.zIndex = '10';
            loadingOverlay.style.borderRadius = '15px';
            albumArtContainer.appendChild(loadingOverlay);
        }
        // Add loading spinner and message
        loadingOverlay.innerHTML = `
            <div style="width: 50px; height: 50px; border: 5px solid #333; 
                 border-radius: 50%; border-top-color: #fff; 
                 animation: spin 1s linear infinite;"></div>
            <div style="margin-top: 15px; color: white; font-weight: bold;">${message}</div>
        `;
        // Add the animation style
        if (!document.getElementById('loadingSpinStyle')) {
            const style = document.createElement('style');
            style.id = 'loadingSpinStyle';
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    // Hide loading indicator
    function hideLoadingIndicator() {
        albumArt.style.opacity = '1';
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    // Fetch YouTube playlist data
    async function fetchPlaylist() {
        try {
            showLoadingIndicator('Loading playlist...');
            console.log("Starting to fetch playlist data...");
            let allItems = [];
            let nextPageToken = undefined;
            let pageCount = 0;
            // Loop to fetch all pages
            do {
                // Update loading message to show progress
                if (pageCount > 0) {
                    showLoadingIndicator(`Loading page ${pageCount + 1}...`);
                    trackTitle.textContent = `Loading YouTube Playlist... (page ${pageCount + 1})`;
                }
                // Construct URL with page token if available
                const pageParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
                const url = `${YOUTUBE_PLAYLIST_ITEMS_API}?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}${pageParam}`;
                console.log(`Fetching page ${pageCount + 1}, URL: ${url}`);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Received data for page ${pageCount + 1}:`, {
                    items: data.items.length,
                    nextPageToken: data.nextPageToken,
                    totalResults: data.pageInfo.totalResults,
                    resultsPerPage: data.pageInfo.resultsPerPage
                });
                // Add items from this page to our collection
                allItems = [...allItems, ...data.items];
                // Get token for the next page (if any)
                nextPageToken = data.nextPageToken;
                pageCount++;
                // Update loading message with track count
                showLoadingIndicator(`Loaded ${allItems.length} tracks so far...`);
                console.log(`Total tracks loaded so far: ${allItems.length}`);
                // Add a small delay to avoid hitting API rate limits
                if (nextPageToken) {
                    console.log(`Next page token found: ${nextPageToken}. Continuing to next page after delay.`);
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                else {
                    console.log('No next page token. All pages fetched.');
                }
            } while (nextPageToken);
            // Update UI to show how many tracks were loaded
            trackTitle.textContent = `Loaded ${allItems.length} tracks`;
            hideLoadingIndicator();
            console.log(`Finished fetching all playlist data. Total tracks: ${allItems.length}`);
            // Map the items to our Track format
            const tracks = allItems.map(item => ({
                id: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                artist: item.snippet.videoOwnerChannelTitle || 'YouTube Artist',
                album: 'YouTube Playlist',
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || ''
            }));
            console.log('Final mapped tracks:', tracks.length);
            return tracks;
        }
        catch (error) {
            console.error('Error fetching playlist:', error);
            // Show error message
            trackTitle.textContent = 'Error loading playlist';
            albumName.textContent = 'Please check your API key or try again later';
            hideLoadingIndicator();
            // Return some mock data to avoid breaking the app
            return [
                {
                    id: 'dQw4w9WgXcQ', // Just a placeholder video ID
                    title: 'Error Loading Playlist',
                    artist: 'Please check console for details',
                    album: 'YouTube Playlist',
                    thumbnail: albumArt.src // Keep current image
                }
            ];
        }
    }
    // Initialize playlist
    async function initializePlaylist() {
        // Show loading message
        trackTitle.textContent = 'Loading YouTube Playlist...';
        albumName.textContent = 'This may take a moment if the playlist is large';
        console.log('Initializing playlist...');
        playlistData = await fetchPlaylist();
        console.log(`Fetch complete. Got ${playlistData.length} tracks.`);
        filteredPlaylist = playlistData;
        console.log('Initial filteredPlaylist set to all tracks.');
        // Show how many tracks were loaded in total
        albumName.textContent = `${playlistData.length} tracks loaded successfully`;
        renderAlbumList();
        filterAndRenderPlaylist();
        // Create the YouTube player
        createYouTubePlayer();
        // Load the first track but don't play it yet
        loadTrack(0);
        console.log('Playlist initialization complete.');
    }
    // Get unique albums
    function getUniqueAlbums() {
        const albums = ['All', ...new Set(playlistData.map(track => track.album))];
        return albums;
    }
    // Render album list
    function renderAlbumList() {
        const albums = getUniqueAlbums();
        albumListEl.innerHTML = '';
        albums.forEach(album => {
            const li = document.createElement('li');
            li.textContent = album;
            li.className = album === currentAlbum ? 'active' : '';
            li.addEventListener('click', () => {
                currentAlbum = album;
                filterAndRenderPlaylist();
                document.querySelectorAll('.album-list li').forEach(item => {
                    item.className = item.textContent === currentAlbum ? 'active' : '';
                });
            });
            albumListEl.appendChild(li);
        });
    }
    // Filter and render playlist
    function filterAndRenderPlaylist() {
        console.log(`Filtering playlist. Current album: ${currentAlbum}, Total tracks in playlistData: ${playlistData.length}`);
        filteredPlaylist = currentAlbum === 'All' ?
            playlistData : playlistData.filter(track => track.album === currentAlbum);
        console.log(`Filtered playlist now contains ${filteredPlaylist.length} tracks`);
        currentAlbumTitle.textContent = currentAlbum === 'All' ? 'All Tracks' : currentAlbum;
        playlistEl.innerHTML = '';
        console.log(`Rendering ${filteredPlaylist.length} tracks in the playlist UI`);
        filteredPlaylist.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = index === currentTrackIndex ? 'active' : '';
            li.innerHTML = `
                <div class="song-info">
                    <span class="song-title">${track.title}</span>
                    <span class="song-artist">${track.artist}</span>
                </div>
                <span class="song-duration">YouTube</span>
            `;
            li.addEventListener('click', () => loadAndPlay(index));
            playlistEl.appendChild(li);
        });
        console.log(`Playlist UI rendering complete. ${playlistEl.childElementCount} items in the DOM.`);
    }
    // Load track
    function loadTrack(index) {
        if (!filteredPlaylist.length)
            return;
        currentTrackIndex = (index < 0) ? filteredPlaylist.length - 1 :
            (index >= filteredPlaylist.length) ? 0 : index;
        const track = filteredPlaylist[currentTrackIndex];
        // Update player iframe with the video
        const youtubePlayer = document.getElementById('youtubePlayer');
        if (youtubePlayer) {
            // enablejsapi=1 allows JavaScript control
            // autoplay=0 prevents autoplay (we'll control this manually)
            // rel=0 prevents related videos
            youtubePlayer.src = `https://www.youtube.com/embed/${track.id}?enablejsapi=1&autoplay=0&rel=0`;
        }
        // Update UI
        trackTitle.textContent = track.title;
        albumName.textContent = `${track.artist} - ${track.album}`;
        // Set album art to video thumbnail
        albumArt.src = track.thumbnail;
        // Update playlist UI
        document.querySelectorAll('.playlist li').forEach((item, i) => {
            item.className = i === currentTrackIndex ? 'active' : '';
        });
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        document.querySelector('.music-card')?.classList.remove('is-playing');
    }
    // Play track
    function playTrack() {
        const youtubePlayer = document.getElementById('youtubePlayer');
        if (youtubePlayer && youtubePlayer.contentWindow) {
            // Use postMessage to control the YouTube player
            youtubePlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            document.querySelector('.music-card')?.classList.add('is-playing');
        }
    }
    // Pause track
    function pauseTrack() {
        const youtubePlayer = document.getElementById('youtubePlayer');
        if (youtubePlayer && youtubePlayer.contentWindow) {
            // Use postMessage to control the YouTube player
            youtubePlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            document.querySelector('.music-card')?.classList.remove('is-playing');
        }
    }
    // Load and play
    function loadAndPlay(index) {
        loadTrack(index);
        // Short delay to ensure the iframe is loaded before we try to play
        setTimeout(playTrack, 300);
    }
    // Simulate listener count
    let fakeListeners = 42;
    function updateListenerCount() {
        fakeListeners += Math.floor(Math.random() * 3) - 1;
        fakeListeners = Math.max(10, Math.min(100, fakeListeners));
        if (listenerCountEl)
            listenerCountEl.textContent = fakeListeners.toString();
        if (socialListenerCountEl)
            socialListenerCountEl.textContent = fakeListeners.toString();
    }
    setInterval(updateListenerCount, 5000);
    // Intro animation and player reveal
    startBtn.addEventListener('click', () => {
        logo.classList.add('moved');
        introContainer.classList.add('hidden');
        playerWrapper.classList.add('active');
        // Initialize the playlist and player
        initializePlaylist();
    });
    // Event Listeners
    playPauseBtn.addEventListener('click', () => isPlaying ? pauseTrack() : playTrack());
    prevBtn.addEventListener('click', () => loadAndPlay(currentTrackIndex - 1));
    nextBtn.addEventListener('click', () => loadAndPlay(currentTrackIndex + 1));
    // Initialize YouTube API for postMessage communication
    function onYouTubeIframeAPIReady() {
        // This is called when the YouTube iframe API is ready
        console.log('YouTube iframe API ready');
    }
    // Load the YouTube iframe API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    // Make the onYouTubeIframeAPIReady function available globally
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
});
//# sourceMappingURL=script.js.map