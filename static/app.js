// static/app.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-controller');
    const heroSection = document.getElementById('hero-section');
    const appViewSection = document.getElementById('app-view-section');
    const youtubeVideoPlayer = document.getElementById('youtube-video-player');
    const displayModeBtn = document.getElementById('display-mode-btn');
    const editModeBtn = document.getElementById('edit-mode-btn');
    const copyTimestampBtn = document.getElementById('copy-timestamp-btn');
    const timestampDisplayContent = document.getElementById('timestamp-display-content');
    const timestampEditContent = document.getElementById('timestamp-edit-content');
    const currentYearSpan = document.getElementById('current-year');

    /**
     * @param {HTMLElement} element 
     * @param {string} classOnTrue - Class ที่ต้องการให้มีเมื่อเงื่อนไขเป็นจริง
     * @param {string} classOnFalse - Class ที่ต้องการให้มีเมื่อเงื่อนไขเป็นเท็จ
     * @param {boolean} condition - เงื่อนไขที่ใช้ในการสลับ
     */
    const toggleClassPair = (element, classOnTrue, classOnFalse, condition) => {
        element.classList.toggle(classOnTrue, condition);
        element.classList.toggle(classOnFalse, !condition);
    };

    // Set current year in footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    // URL Validation
    const validateUrl = (url) => {
        const youtubeRegex = /^(https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|playlist\?list=)([a-zA-Z0-9_-]+)(?:[?&].*)?)$/;
        return youtubeRegex.test(url);
    };

    // Debounce utility function
    const debounce = (func, delay) => {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const getVideoIdFromUrl = (url) => {
        const videoIdMatch = url.match(/(?:v=|embed\/|youtu\.be\/)([^&?]+)/);
        return videoIdMatch ? videoIdMatch[1] : null;
    }


    // Function to fetch video details using YouTube oEmbed API
    const fetchVideoDetails = async (videoId) => {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

        try {
            const response = await fetch(oembedUrl);
            if (!response.ok) {
                return
            }
            const data = await response.json();
            return {
                thumbnail: data.thumbnail_url,
                title: data.title,
                author: data.author_name
            };
        } catch (error) {
            return
        }
    };

    // Handle URL input and preview card for all input sections
    document.querySelectorAll('[input-section]').forEach(inputSection => {
        const youtubeUrlInput = inputSection.querySelector('[data-youtube-url-input]');
        const urlInput = inputSection.querySelector('.url-input');
        const generateButton = inputSection.querySelector('[data-generate-button]');
        const previewCard = inputSection.querySelector('.preview-card');
        const closePreviewBtn = previewCard ? previewCard.querySelector('.btn-close') : null;
        const videoThumbnail = previewCard ? previewCard.querySelector('[data-video-thumbnail]') : null;
        const videoTitle = previewCard ? previewCard.querySelector('[data-video-title]') : null;
        const videoAuthor = previewCard ? previewCard.querySelector('[data-video-author]') : null;

        if (youtubeUrlInput) {
            const handleUrlChange = async () => {
                const url = youtubeUrlInput.value.trim();
                if (validateUrl(url)) {

                    const videoId = getVideoIdFromUrl(url);

                    // Only proceed if videoId is valid and has a reasonable length
                    if (videoId && videoId.length === 11 && previewCard) { // YouTube video IDs are typically 11 characters long
                        const details = await fetchVideoDetails(videoId);
                        if (!details) {
                            toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', false);
                            toggleClassPair(urlInput, 'input-primary', 'input-error', false);
                            urlInput.classList.toggle('animate-shake', true);
                            return;
                        }
                        if (videoThumbnail) { videoThumbnail.src = details.thumbnail };
                        if (videoTitle) { 
                            videoTitle.textContent = details.title 
                            videoTitle.setAttribute('data-tip', details.title);
                        };
                        if (videoAuthor) videoAuthor.textContent = details.author;
                        toggleClassPair(urlInput, 'input-primary', 'input-error', true);
                        toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', true);
                        urlInput.classList.toggle('animate-shake', false);

                    } else if (previewCard) {
                        // If videoId is invalid or not 11 characters, hide the preview card
                        toggleClassPair(urlInput, 'input-primary', 'input-error', false);
                        toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', false);
                        urlInput.classList.toggle('animate-shake', true);

                    }
                } else {
                    if (previewCard) {
                        toggleClassPair(urlInput, 'input-primary', 'input-error', false);
                        toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', false);
                        urlInput.classList.toggle('animate-shake', true);
                    }
                }
            };

            youtubeUrlInput.addEventListener('input', debounce(handleUrlChange, 500)); // Debounce with 500ms delay
            youtubeUrlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission
                    if (generateButton) {
                        generateButton.click(); // Simulate click on generate button
                    }
                }
            });
            // Initial check in case there's a pre-filled URL
            handleUrlChange();
        }

        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => {
                if (previewCard) {
                    toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', false);

                }
            });
        }

        if (generateButton) {
            generateButton.addEventListener('click', () => {
                const url = youtubeUrlInput.value.trim();
                if (!validateUrl(url)) {
                    return;
                }

                const videoId = getVideoIdFromUrl(url);
                if (videoId) {
                    youtubeVideoPlayer.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                }

                // Transition to App View
                heroSection.classList.add('opacity-0');
                heroSection.classList.add('hidden');
                appViewSection.classList.remove('hidden');
                setTimeout(() => {
                    appViewSection.classList.remove('opacity-0');
                }, 50);
            });
        }
    });

    const additionalDetailsTextarea = document.querySelector('[data-additional-details]');

    // Timestamp Display/Edit Mode
    let isEditMode = false;

    const enterEditMode = () => {
        isEditMode = true;
        timestampDisplayContent.classList.add('hidden');
        timestampEditContent.value = timestampDisplayContent.innerText;
        timestampEditContent.classList.remove('hidden');
        displayModeBtn.classList.remove('btn-primary');
        displayModeBtn.classList.add('btn-outline');
        editModeBtn.classList.add('btn-primary');
        editModeBtn.classList.remove('btn-outline');
    };

    const exitEditMode = () => {
        isEditMode = false;
        timestampEditContent.classList.add('hidden');
        // Process edited text back to clickable timestamps
        const editedText = timestampEditContent.value;
        timestampDisplayContent.innerHTML = convertTextToClickableTimestamps(editedText);
        timestampDisplayContent.classList.remove('hidden');
        displayModeBtn.classList.add('btn-primary');
        displayModeBtn.classList.remove('btn-outline');
        editModeBtn.classList.remove('btn-primary');
        editModeBtn.classList.add('btn-outline');
        attachTimestampClickHandlers();
    };

    if (displayModeBtn) {
        displayModeBtn.addEventListener('click', exitEditMode);
    }

    if (editModeBtn) {
        editModeBtn.addEventListener('click', enterEditMode);
    }

    // Convert plain text timestamps to clickable HTML
    const convertTextToClickableTimestamps = (text) => {
        const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)/g;
        return text.replace(timestampRegex, (match) => {
            const parts = match.split(':').map(Number);
            let seconds = 0;
            if (parts.length === 3) {
                seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                seconds = parts[0] * 60 + parts[1];
            }
            return `<span class="timestamp-link link link-primary cursor-pointer" data-time="${seconds}">${match}</span>`;
        });
    };

    // Attach click handlers to timestamps
    const attachTimestampClickHandlers = () => {
        document.querySelectorAll('.timestamp-link').forEach(span => {
            span.addEventListener('click', (e) => {
                const time = e.target.dataset.time;
                if (youtubeVideoPlayer && time !== undefined) {
                    const player = youtubeVideoPlayer.contentWindow;
                    player.postMessage(`{"event":"command","func":"seekTo","args":[${time},true]}`, '*');
                }
            });
        });
    };

    // Initial attachment of handlers
    attachTimestampClickHandlers();

    // Copy Timestamp Button
    if (copyTimestampBtn) {
        copyTimestampBtn.addEventListener('click', () => {
            const textToCopy = isEditMode ? timestampEditContent.value : timestampDisplayContent.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Optional: Show a tooltip or temporary message
                console.log('Timestamps copied to clipboard!');
                copyTimestampBtn.textContent = 'คัดลอกแล้ว!';
                setTimeout(() => {
                    copyTimestampBtn.textContent = 'คัดลอก';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy timestamps: ', err);
            });
        });
    }

    // Smart Hide Navbar (Responsive)
    let lastScrollTop = 0;
    const navbar = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });

});