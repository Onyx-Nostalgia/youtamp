import { convertToSeconds, convertSecondsToTimestamp } from './utils.js';

export function convertToTimestamp(rawText) {
    const rawLines = rawText.split('\n');
    const parsedTimestamps = [];
    const timestampRegex = /^(\d{1,2}:\d{2}(:\d{2})?)\s*(.*)/; // Regex to capture timestamp and description

    rawLines.forEach(rawLine => {
        const trimmedLine = rawLine.trim();
        if (!trimmedLine) {
            return; // Skip empty lines
        }

        const match = trimmedLine.match(timestampRegex);

        if (match) {
            // This line starts with a timestamp
            const timestamp = match[1];
            const description = match[3] ? match[3].trim() : ''; // Capture the rest as description
            parsedTimestamps.push({ timestamp, description });
        } else if (parsedTimestamps.length > 0) {
            // This line does not start with a timestamp, append to the previous description
            parsedTimestamps[parsedTimestamps.length - 1].description += '\n' + trimmedLine;
        }
    });

    let hasHHMMSS = false;
    parsedTimestamps.forEach(item => {
        const seconds = convertToSeconds(item.timestamp);
        if (seconds !== null && seconds >= 3600) { // If hours are present
            hasHHMMSS = true;
        } else if (item.timestamp.length === 8) { // If it was explicitly HH:MM:SS
            hasHHMMSS = true;
        }
    });

    let htmlContent = '';
    const totalItems = parsedTimestamps.length;

    parsedTimestamps.forEach((item, index) => {
        const originalTimestamp = item.timestamp;
        const text_content = item.description;
        const secondsValue = convertToSeconds(originalTimestamp);

        if (secondsValue === null) {
            console.warn(`Skipping invalid timestamp format: ${originalTimestamp}`);
            return;
        }

        const displayTimestamp = convertSecondsToTimestamp(secondsValue, hasHHMMSS);

        const previousColor = index % 2 === 0
            ? 'primary'
            : 'secondary';
        const mainColor = index % 2 === 0
            ? 'secondary'
            : 'primary';

        const topHr = index === 0 ? '' : `<hr class="bg-${previousColor}" />`;
        const bottomHr = index === totalItems - 1 ? '' : `<hr class="bg-${mainColor}" />`;

        let processedTextContent = text_content.replace(/\n/g, '<br>');
        const inlineTimestampRegex = /\b(\d{1,2}:\d{2}(:\d{2})?)\b/g;

        processedTextContent = processedTextContent.replace(inlineTimestampRegex, (match, timestampStr) => {
            const secondsValue = convertToSeconds(timestampStr);
            if (secondsValue === null) {
                return match;
            }

            const formattedTimestamp = convertSecondsToTimestamp(secondsValue, hasHHMMSS);

            return `<button class="btn btn-xs btn-${mainColor} timestamp-link" data-time="${secondsValue}">${formattedTimestamp}</button>`;
        });

        htmlContent += `
            <li class="md:animate-appear motion-reduce:animate-none">
                ${topHr}
                <div class="timeline-middle">
                    <div class="btn btn-${mainColor} btn-sm timestamp-link shadow-md text-base" data-time=${secondsValue}>${displayTimestamp}</div>
                </div>
                <div class="timeline-end timeline-box">
                    <div class="timeline-description w-auto h-auto wrap-break-word text-base">${processedTextContent}</div>
                </div>
                ${bottomHr}
            </li>
        `;
    });
    return htmlContent;
}

export const convertTimelineToText = () => {
    const lines = [];
    const listItems = document.getElementById('timestamp-display-content').querySelectorAll('li');
    const inlineButtonRegex = /<button[^>]*class="[^\"]*timestamp-link[^\"]*"[^>]*data-time="\d+"[^>]*>(\d{1,2}:\d{2}(:\d{2})?)<\/button>/g;

    listItems.forEach(li => {
        const timestampLink = li.querySelector('.timestamp-link');
        const descriptionDiv = li.querySelector('.timeline-description');

        if (timestampLink && descriptionDiv) {
            const mainTimestamp = timestampLink.textContent.trim();
            let descriptionContent = descriptionDiv.innerHTML;

            descriptionContent = descriptionContent.replace(inlineButtonRegex, (match, timestampStr) => {
                return timestampStr;
            });

            descriptionContent = descriptionContent.replace(/<br\s*\/?>/gi, '\n');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = descriptionContent;
            const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

            lines.push(`${mainTimestamp} ${plainDescription.trim()}`);
        }
    });
    return lines.join('\n');
};

export const attachTimestampClickHandlers = () => {
    document.getElementById('timestamp-display-content').querySelectorAll('.timestamp-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const time = e.target.dataset.time;
            const youtubeVideoPlayer = document.getElementById('youtube-video-player');
            if (youtubeVideoPlayer && time !== undefined) {
                const player = youtubeVideoPlayer.contentWindow;
                player.postMessage(`{"event":"command","func":"seekTo","args":[${time},true]}`, '*');
            }
        });
    });
};

const activateTimelineTab = () => {
    const commentTabContent = document.getElementById('comment-tab-content');
    const timestampDisplayContent = document.getElementById('timestamp-display-content');
    const rawText = commentTabContent.value;
    const timeline = convertToTimestamp(rawText)
    timestampDisplayContent.innerHTML = timeline;
    attachTimestampClickHandlers();
};

const activateCommentTab = () => {
    const commentTabContent = document.getElementById('comment-tab-content');
    const timelineText = convertTimelineToText();
    commentTabContent.value = timelineText;
};

export function handleDisplayChange(selectedValue) {
    switch (selectedValue) {
        case 'timeline':
            activateTimelineTab();
            break;
        case 'comment':
            activateCommentTab();
            break;
    }
}