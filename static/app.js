// Update current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// --- Hero Section Elements ---
const heroSection = document.getElementById('hero-section');
const youtubeUrlInput = document.getElementById('youtube-url');
const generateButton = document.getElementById('generate-button');
const toggleOptionalInput = document.getElementById('toggle-optional-input');
const optionalInputContent = document.getElementById('optional-input-content');
const optionalInputArrow = document.getElementById('optional-input-arrow');

// --- App View Section Elements ---
const appViewSection = document.getElementById('app-view-section');
const collapsedInputSection = document.getElementById('collapsed-input-section');
const toggleCollapsedInput = document.getElementById('toggle-collapsed-input');
const collapsedInputContent = document.getElementById('collapsed-input-content');
const collapsedInputArrow = document.getElementById('collapsed-input-arrow');
const youtubeUrlCollapsedInput = document.getElementById('youtube-url-collapsed');
const generateButtonCollapsed = document.getElementById('generate-button-collapsed');
const youtubeVideoPlayer = document.getElementById('youtube-video-player');
const displayModeBtn = document.getElementById('display-mode-btn');
const editModeBtn = document.getElementById('edit-mode-btn');
const copyTimestampBtn = document.getElementById('copy-timestamp-btn');
const timestampDisplayContent = document.getElementById('timestamp-display-content');
const timestampEditContent = document.getElementById('timestamp-edit-content');

// --- Collapsible Optional Input in Hero Section ---
toggleOptionalInput.addEventListener('click', () => {
    optionalInputContent.classList.toggle('hidden');
    optionalInputArrow.classList.toggle('rotate-180');
});

// --- Collapsible Input in App View Section ---
toggleCollapsedInput.addEventListener('click', () => {
    collapsedInputContent.classList.toggle('hidden');
    collapsedInputArrow.classList.toggle('rotate-180');
});

// --- Function to show App View and hide Hero Section ---
function showAppView() {
    heroSection.classList.add('hidden');
    appViewSection.classList.remove('hidden');
    // Force reflow to ensure transition plays
    void appViewSection.offsetWidth;
    appViewSection.style.opacity = '1';
}

// --- Handle Generate Button Click (Hero Section) ---
generateButton.addEventListener('click', () => {
    const youtubeUrl = youtubeUrlInput.value;
    if (youtubeUrl) {
        // Placeholder for actual API call
        console.log('Generating timestamps for:', youtubeUrl);
        youtubeVideoPlayer.src = `https://www.youtube.com/embed/${extractVideoId(youtubeUrl)}?autoplay=1`;
        youtubeUrlCollapsedInput.value = youtubeUrl; // Sync URL to collapsed input
        showAppView();
    } else {
        alert('Please enter a YouTube URL.');
    }
});

// --- Handle Generate Button Click (Collapsed Input in App View) ---
generateButtonCollapsed.addEventListener('click', () => {
    const youtubeUrl = youtubeUrlCollapsedInput.value;
    if (youtubeUrl) {
        console.log('Regenerating timestamps for:', youtubeUrl);
        youtubeVideoPlayer.src = `https://www.youtube.com/embed/${extractVideoId(youtubeUrl)}?autoplay=1`;
        // Placeholder for actual API call
    } else {
        alert('Please enter a YouTube URL.');
    }
});

// --- Helper to extract YouTube Video ID ---
function extractVideoId(url) {
    const regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
}

// --- Timestamp Display/Edit Mode Toggle ---
displayModeBtn.addEventListener('click', () => {
    timestampDisplayContent.classList.remove('hidden');
    timestampEditContent.classList.add('hidden');
    displayModeBtn.classList.add('btn-primary');
    displayModeBtn.classList.remove('btn-secondary');
    editModeBtn.classList.add('btn-secondary');
    editModeBtn.classList.remove('btn-primary');
});

editModeBtn.addEventListener('click', () => {
    // Copy current display content to edit area before switching
    timestampEditContent.value = timestampDisplayContent.innerText;
    timestampEditContent.classList.remove('hidden');
    timestampDisplayContent.classList.add('hidden');
    editModeBtn.classList.add('btn-primary');
    editModeBtn.classList.remove('btn-secondary');
    displayModeBtn.classList.add('btn-secondary');
    displayModeBtn.classList.remove('btn-primary');
});

// --- Copy Timestamp Button ---
copyTimestampBtn.addEventListener('click', () => {
    const textToCopy = timestampDisplayContent.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Timestamps copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

// --- Video Seeking from Timestamps ---
timestampDisplayContent.addEventListener('click', (event) => {
    if (event.target.classList.contains('timestamp-link')) {
        const timeInSeconds = event.target.dataset.time;
        if (youtubeVideoPlayer && timeInSeconds !== undefined) {
            // YouTube iframe API would be needed for precise seeking.
            // For now, we'll just update the src with a start time.
            // This will reload the video, which is not ideal for UX.
            // A full YouTube Iframe API integration would be better.
            const currentSrc = youtubeVideoPlayer.src;
            const videoId = extractVideoId(currentSrc);
            if (videoId) {
                youtubeVideoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${timeInSeconds}`;
            }
        }
    }
});