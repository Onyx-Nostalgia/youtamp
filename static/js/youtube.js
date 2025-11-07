import { updateInputState,initInputState } from './ui.js';

export const validateUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|playlist\?list=)([a-zA-Z0-9_-]+)(?:[?&].*)?)$/;
    return youtubeRegex.test(url);
};

export const getVideoIdFromUrl = (url) => {
    const videoIdMatch = url.match(/(?:v=|embed\/|youtu\.be\/)([^&?]+)/);
    return videoIdMatch ? videoIdMatch[1] : null;
}

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
            author: data.author_name,
            author_url: data.author_url
        };
    } catch (error) {
        return
    }
};

export const handleUrlChangeForSection = async (currentInputSection) => {
    const youtubeUrlInput = currentInputSection.querySelector('[data-youtube-url-input]');
    const urlInput = currentInputSection.querySelector('.url-input');
    const previewCard = currentInputSection.querySelector('.preview-card');
    const videoThumbnail = previewCard ? previewCard.querySelector('[data-video-thumbnail]') : null;
    const videoTitle = previewCard ? previewCard.querySelector('[data-video-title]') : null;
    const videoAuthor = previewCard ? previewCard.querySelector('[data-video-author]') : null;

    const url = youtubeUrlInput.value.trim();
    const videoId = validateUrl(url) ? getVideoIdFromUrl(url) : null;

    if (!url) {
        initInputState(urlInput, previewCard);
        return;
    }

    if (!videoId || videoId.length !== 11 || !previewCard) {
        updateInputState(urlInput, previewCard, false);
        return;
    }

    const details = await fetchVideoDetails(videoId);

    if (!details) {
        updateInputState(urlInput, previewCard, false);
        return;
    }

    // Success case
    if (videoThumbnail) { videoThumbnail.src = details.thumbnail; }
    if (videoTitle) { videoTitle.textContent = details.title; }
    if (videoAuthor) { videoAuthor.innerHTML = `<a href="${details.author_url}" target="_blank">${details.author}</a>`; }
    updateInputState(urlInput, previewCard, true);
};