import { convertToTimestamp, attachTimestampClickHandlers } from './timestamps.js';

export async function sendData() {
    const tabLoading = document.querySelector(".tab-loading");
    const tabTimestamp = document.querySelector(".tab-timestamp");
    const timestampDisplayContent = document.getElementById('timestamp-display-content');
    const commentTabContent = document.getElementById('comment-tab-content');

    // Show loading state
    tabLoading.classList.remove('hidden');
    tabTimestamp.classList.add('hidden');
    timestampDisplayContent.innerHTML = '<p>Sending data to Flask...</p>';

    try {
        const youtubeUrlInput = document.querySelector('[data-youtube-url-input]');
        const additionalDetailsTextarea = document.querySelector('[data-additional-details]');
        const languageSelect = document.querySelector('[data-language-select]');

        const dataToSend = {
            url: youtubeUrlInput ? youtubeUrlInput.value.trim() : '',
            additional_instruction: additionalDetailsTextarea ? additionalDetailsTextarea.value : '',
            language: languageSelect ? languageSelect.value : 'auto'
        };

        const response = await fetch('/api/timestamp/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`);
        }

        const rawTimestamps = await response.text();

        const htmlContent = convertToTimestamp(rawTimestamps);
        commentTabContent.value = rawTimestamps;
        timestampDisplayContent.innerHTML = htmlContent;

        attachTimestampClickHandlers();
        tabLoading.classList.add('hidden');
        tabTimestamp.classList.remove("hidden");

    } catch (error) {
        timestampDisplayContent.innerHTML = `<p style="color: red;">❌ Operation Error: ${error.message}</p>`;
        console.error('Operation Error:', error);
        tabLoading.classList.add('hidden');
        tabTimestamp.classList.add("hidden");
    }
}