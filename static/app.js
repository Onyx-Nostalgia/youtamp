// static/app.js

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero-section');
    const appViewSection = document.getElementById('app-view-section');
    const youtubeVideoPlayer = document.getElementById('youtube-video-player');
    const copyBtn = document.getElementById('copy-timestamp-btn');
    const timestampDisplayContent = document.getElementById('timestamp-display-content');
    const currentYearSpan = document.getElementById('current-year');

    const tabLoading = document.querySelector(".tab-loading")
    const tabTimestamp = document.querySelector(".tab-timestamp")
    const timelineTab = document.getElementById('timeline-tab');
    const commentTab = document.getElementById('comment-tab')
    const commentTabContent = document.getElementById('comment-tab-content');

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
                author: data.author_name,
                author_url: data.author_url
            };
        } catch (error) {
            return
        }
    };

    // Refactored handleUrlChange to accept an inputSection element
    const handleUrlChangeForSection = async (currentInputSection) => {
        const youtubeUrlInput = currentInputSection.querySelector('[data-youtube-url-input]');
        const urlInput = currentInputSection.querySelector('.url-input');
        const previewCard = currentInputSection.querySelector('.preview-card');
        const videoThumbnail = previewCard ? previewCard.querySelector('[data-video-thumbnail]') : null;
        const videoTitle = previewCard ? previewCard.querySelector('[data-video-title]') : null;
        const videoAuthor = previewCard ? previewCard.querySelector('[data-video-author]') : null;

        const url = youtubeUrlInput.value.trim();
        if (validateUrl(url)) {
            const videoId = getVideoIdFromUrl(url);

            if (videoId && videoId.length === 11 && previewCard) {
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
                };
                if (videoAuthor) videoAuthor.innerHTML = `<a href="${details.author_url}" target="_blank">${details.author}</a>`;
                toggleClassPair(urlInput, 'input-primary', 'input-error', true);
                toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', true);
                urlInput.classList.toggle('animate-shake', false);

            } else if (previewCard) {
                toggleClassPair(urlInput, 'input-primary', 'input-error', false);
                urlInput.classList.toggle('animate-shake', true);
                toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', false);
            }
        } else {
            if (previewCard) {
                toggleClassPair(urlInput, 'input-primary', 'input-error', false);
                urlInput.classList.toggle('animate-shake', true);
                toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', false);
            }
        }
    };


    // Handle URL input and preview card for all input sections
    document.querySelectorAll('[input-section]').forEach(inputSection => {
        const youtubeUrlInput = inputSection.querySelector('[data-youtube-url-input]');
        const generateButton = inputSection.querySelector('[data-generate-button]');
        const previewCard = inputSection.querySelector('.preview-card');
        const closePreviewBtn = previewCard ? previewCard.querySelector('.btn-close') : null;
        const additionalDetailsTextarea = inputSection.querySelector('[data-additional-details]');
        const languageSelect = inputSection.querySelector('[data-language-select]');


        if (youtubeUrlInput) {
            youtubeUrlInput.addEventListener('input', debounce(() => handleUrlChangeForSection(inputSection), 500)); // Debounce with 500ms delay
            youtubeUrlInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission
                    if (generateButton) {
                        generateButton.click(); // Simulate click on generate button
                    }
                }
            });
            // Initial check in case there's a pre-filled URL
            handleUrlChangeForSection(inputSection);
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

                // --- Synchronization Logic --- 
                // Get references to the specific input sections
                const heroInputSection = heroSection.querySelector('[input-section]');
                const appViewInputSection = appViewSection.querySelector('[input-section]');

                // Check if this is the hero section's generate button
                if (inputSection === heroInputSection) {
                    const heroUrlValue = youtubeUrlInput.value;
                    const heroAdditionalDetailsValue = additionalDetailsTextarea ? additionalDetailsTextarea.value : '';
                    const heroLanguageSelectValue = languageSelect ? languageSelect.value : 'auto';

                    const appViewUrlInput = appViewInputSection.querySelector('[data-youtube-url-input]');
                    const appViewAdditionalDetailsTextarea = appViewInputSection.querySelector('[data-additional-details]');
                    const appViewLanguageSelect = appViewInputSection.querySelector('[data-language-select]');

                    if (appViewUrlInput) appViewUrlInput.value = heroUrlValue;
                    if (appViewAdditionalDetailsTextarea) appViewAdditionalDetailsTextarea.value = heroAdditionalDetailsValue;
                    if (appViewLanguageSelect) appViewLanguageSelect.value = heroLanguageSelectValue;

                    // Trigger URL change handler for the app view section to update its preview card
                    if (appViewUrlInput) {
                        handleUrlChangeForSection(appViewInputSection);
                    }
                }
                // --- End Synchronization Logic ---

                // Transition to App View
                heroSection.classList.add('opacity-0');
                heroSection.classList.add('hidden');
                appViewSection.classList.remove('hidden');
                setTimeout(() => {
                    appViewSection.classList.remove('opacity-0');
                }, 50);

                sendData('mock');
            });
        }
    });

    function convertToSeconds(customTimeString) {
        const parts = customTimeString.split(':').map(p => parseInt(p.trim(), 10));

        let totalSeconds = 0;

        if (parts.length === 3) {
            // รูปแบบ HH:MM:SS
            const hours = parts[0];
            const minutes = parts[1];
            const seconds = parts[2];
            totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

        } else if (parts.length === 2) {
            // รูปแบบ MM:SS
            const minutes = parts[0];
            const seconds = parts[1];
            totalSeconds = (minutes * 60) + seconds;

        } else {
            // รูปแบบไม่ถูกต้อง
            console.error('Invalid time format:', customTimeString);
            return null;
        }

        return totalSeconds;
    }


    function convertToTimestamp(rawText) {
        const lines = rawText.split('\n').filter(line => line.trim() !== '');

        let htmlContent = '';
        const totalItems = lines.length; // จำนวนรายการทั้งหมด

        // 2. วนลูปเพื่อสร้าง HTML <li> ที่มีเงื่อนไข
        lines.forEach((line, index) => {

            // 2.1. แยก Timestamp และ Text Content (โค้ดเดิม)
            const firstSpaceIndex = line.indexOf(' ');
            if (firstSpaceIndex <= 0) return; // ข้ามบรรทัดที่ไม่ถูกต้อง

            const timestamp = line.substring(0, firstSpaceIndex).trim();
            const text_content = line.substring(firstSpaceIndex + 1).trim();
            const secondsValue = convertToSeconds(timestamp);

            // ตรวจสอบความถูกต้อง
            if (secondsValue === null) return;

            const isFirst = (index === 0);
            const isLast = (index === totalItems - 1);

            const previousColor = index % 2 === 0
                ? 'primary'
                : 'secondary';
            const mainColor = index % 2 === 0
                ? 'secondary'
                : 'primary';

            const delay = 50 + (index * 50);

            const topHr = isFirst ? '' : `<hr class="bg-${previousColor}" />`;
            const bottomHr = isLast ? '' : `<hr class="bg-${mainColor}" />`;
            // const position = index % 2 === 0 ? 'end': 'start';
            // const textStart = index % 2 === 0 ? '': 'text-right'; 

            htmlContent += `
       <li class="animate-jump-in animate-once animate-ease-in-out animate-play animate-delay-[${delay}ms] motion-reduce:animate-none">
        ${topHr}
        <div class="timeline-middle">
    <div class="btn btn-${mainColor} btn-sm timestamp-link" data-time=${secondsValue}>${timestamp}</div>
</div>
<div class="timeline-end timeline-box p-0">
    <textarea placeholder="${text_content}"
        class="textarea text-right textarea-${mainColor} w-auto h-auto rounded-2xl wrap-break-word" style="field-sizing: content;">${text_content}</textarea></div>
        ${bottomHr}
    </li>
    `;
        });
        return htmlContent;

    }


    async function readMockData() {
        // ... ส่วน fetch และการแยก lines ...
        const url = '/static/timestamps.txt';

        try {
            const response = await fetch(url);
            if (!response.ok) { throw new Error(`ไม่พบไฟล์ Mock Data!`); }

            const rawText = await response.text();

            return {
                status: "success",
                message: rawText
            };

        } catch (error) {
            console.error('Error reading mock data:', error);
            return {
                status: "error",
                message: `Mock Data Load Failed: ${error.message}`
            };
        }
    }

    /**
 * @param {'live' | 'mock'} mode กำหนดว่าจะส่งไป Flask จริง หรือใช้ Mock Data
 */
    async function sendData(mode) {
        try {
            let result;

            if (mode === 'mock') {
                // ใช้ข้อมูลจำลองจากไฟล์ .txt
                timestampDisplayContent.innerHTML = '<p>กำลังโหลด Mock Data...</p>';
                result = await readMockData();
            } else {

                timestampDisplayContent.innerHTML = '<p>กำลังส่งข้อมูลจริงไปยัง Flask...</p>';
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
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }
                result = await response.json();
            }

            // 5. แสดงผลลัพธ์ (ไม่ว่าจะมาจาก Live หรือ Mock)
            if (result.status === 'success') {
                const htmlContent = convertToTimestamp(result.message);
                commentTabContent.value = result.message
                timestampDisplayContent.innerHTML = htmlContent;

                // Initial attachment of handlers
                attachTimestampClickHandlers();
                tabLoading.classList.add('hidden')
                tabTimestamp.classList.remove("hidden")
            } else {
                timestampDisplayContent.innerHTML = `<p style="color: red;">❌ Error: ${result.message}</p>`;
                tabLoading.classList.remove('hidden')
                tabTimestamp.classList.add("hidden")
            }

        } catch (error) {
            timestampDisplayContent.innerHTML = `<p style="color: red;">เกิดข้อผิดพลาดในการทำงาน: ${error.message}</p>`;
            console.error('Operation Error:', error);
        }
    }

    function convertSecondsToTimestamp(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        } else {
            return `${pad(minutes)}:${pad(seconds)}`;
        }
    }

    // Helper to convert timeline HTML to plain text
    const convertTimelineToText = () => {
        const lines = [];
        const listItems = timestampDisplayContent.querySelectorAll('li');

        listItems.forEach(li => {
            const timestampLink = li.querySelector('.timestamp-link');
            const textarea = li.querySelector('textarea');

            if (timestampLink && textarea) {
                const timestamp = timestampLink.textContent.trim(); // e.g., "00:01:30"
                const textContent = textarea.value.trim(); // e.g., "Some text here"
                lines.push(`${timestamp} ${textContent}`);
            }
        });
        return lines.join('\n');
    };


    // Attach click handlers to timestamps
    const attachTimestampClickHandlers = () => {
        timestampDisplayContent.querySelectorAll('.timestamp-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = e.target.dataset.time;
                if (youtubeVideoPlayer && time !== undefined) {
                    const player = youtubeVideoPlayer.contentWindow;
                    player.postMessage(`{"event":"command","func":"seekTo","args":[${time},true]}`, '*');
                }
            });
        });
    };

    if (timelineTab) {
        timelineTab.addEventListener('click', () => {
            const rawText = commentTabContent.value;
            const timeline = convertToTimestamp(rawText)
            timestampDisplayContent.innerHTML = timeline;
        })
    }

    if (commentTab) {
        commentTab.addEventListener('click', () => {
            const timelineText = convertTimelineToText();
            commentTabContent.value = timelineText;
        })
    }

    // Copy Timestamp Button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            let textToCopy;
            const timelineRadio = timelineTab.querySelector('input[type="radio"]');
            const commentRadio = commentTab.querySelector('input[type="radio"]');

            if (timelineRadio.checked) {
                // If timeline tab is active, convert its HTML content to plain text
                textToCopy = convertTimelineToText();
            } else if (commentRadio.checked) {
                // If comment tab is active, use the text from commentTabContent (which is a textarea)
                textToCopy = commentTabContent.value;
            } else {
                // Fallback or default if neither is checked (shouldn't happen if one is always checked)
                textToCopy = ''; 
            }

            const button = copyBtn.querySelector(".btn")
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.innerHTML = `<span class="icon-[tabler--copy-check-filled] text-xl"></span>`;
                button.classList.remove("btn-info")
                button.classList.add("btn-success")
                copyBtn.classList.add("tooltip-open")
                copyBtn.classList.add("tooltip-success")
                copyBtn.setAttribute("data-tip", "Copied!")
                setTimeout(() => {
                    button.innerHTML = `<span class="icon-[tabler--copy] text-xl"></span>`;
                    button.classList.add("btn-info")
                    button.classList.remove("btn-success")
                    copyBtn.classList.remove("tooltip-open")
                    copyBtn.classList.remove("tooltip-success")
                    copyBtn.setAttribute("data-tip", "Copy!")
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