// static/app.js

document.addEventListener('DOMContentLoaded', () => {
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
                    videoTitle.setAttribute('data-tip', details.title);
                };
                if (videoAuthor) videoAuthor.textContent = details.author;
                toggleClassPair(urlInput, 'input-primary', 'input-error', true);
                toggleClassPair(previewCard, 'animate-fade-in-bounceup', 'animate-fade-out-down', true);
                urlInput.classList.toggle('animate-shake', false);

            } else if (previewCard) {
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

                if (timestampDisplayContent) {
                    sendData('mock');
                }
            });
        }
    });


    /**
 * ฟังก์ชันย่อย: แปลง Timestamp (MM:SS หรือ HH:MM:SS) ให้เป็นจำนวนวินาทีทั้งหมด
 * @param {string} customTimeString - เช่น '00:01:30'
 * @returns {number | null} - จำนวนวินาทีทั้งหมด เช่น 90 หรือ null ถ้าผิดพลาด
 */
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

    /**
     * ฟังก์ชันอ่านข้อมูลจากไฟล์ .txt ที่มี Timestamp พร้อมการสร้าง LI ที่มีเงื่อนไข
     * @returns {Promise<{status: string, html_list: string}>} Object ที่มี HTML String สำหรับแสดงผล
     */
    async function readMockData() {
        // ... ส่วน fetch และการแยก lines ...
        const url = '/static/timestamps.txt';

        try {
            const response = await fetch(url);
            if (!response.ok) { throw new Error(`ไม่พบไฟล์ Mock Data!`); }
            const rawText = await response.text();
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

                // HR Tailwind Styles (เปลี่ยนสีตามคู่/คี่)
                const previousColor = index % 2 === 0
                    ? 'primary'
                    : 'secondary';
                const mainColor = index % 2 === 0
                    ? 'secondary'
                    : 'primary';

                const delay = 50 + (index * 50);

                // HR ด้านบน: จะแสดงถ้าไม่ใช่รายการแรก
                const topHr = isFirst ? '' : `<hr class="bg-${previousColor}" />`;

                // HR ด้านล่าง: จะแสดงถ้าไม่ใช่รายการสุดท้าย
                const bottomHr = isLast ? '' : `<hr class="bg-${mainColor}" />`;

                const divContent = index % 2 === 0
                    ? `
<div class="timeline-middle">
    <div class="btn btn-${mainColor} btn-sm timestamp-link" data-time=${secondsValue}>${timestamp}</div>
</div>
<div class="timeline-end timeline-box p-0">
                <input type="text" placeholder="${text_content}" value="${text_content}"
                class="input input-ghost" style="field-sizing: content;" /></div>
                    `
                    : `
<div class="timeline-start timeline-box md:text-end p-0">
                <input type="text" placeholder="${text_content}" value="${text_content}"
                class="input input-ghost" style="field-sizing: content;" /></div>
        <div class="timeline-middle">
            <div class="btn btn-${mainColor} btn-sm timestamp-link" data-time=${secondsValue}>${timestamp}</div>
        </div>`;

                htmlContent += `
       <li class="animate-jump-in animate-once animate-ease-in-out animate-play animate-delay-${delay} motion-reduce:animate-none">
        ${topHr}
        ${divContent}
        ${bottomHr}
    </li>
    `;
            });

            // คืนค่า
            return {
                status: "success",
                message: "แสดงผลข้อมูล Timestamp จาก TXT สำเร็จ!",
                html_list: htmlContent
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
 * ฟังก์ชันหลักสำหรับส่งข้อมูล (รองรับ Live และ Mock)
 * มินเนี่ยนปรับให้ใช้ผลลัพธ์ที่มาจากการอ่านไฟล์ TXT
 * @param {'live' | 'mock'} mode กำหนดว่าจะส่งไป Flask จริง หรือใช้ Mock Data
 */
    async function sendData(mode) {
        if (!timestampDisplayContent) return; // ป้องกันการทำงานก่อน DOM โหลด

        try {
            let result;

            if (mode === 'mock') {
                // ใช้ข้อมูลจำลองจากไฟล์ .txt
                timestampDisplayContent.innerHTML = '<p>กำลังโหลด Mock Data...</p>';
                result = await readMockData();
            } else {
                // ส่งข้อมูลจริงไปยัง Flask
                timestampDisplayContent.innerHTML = '<p>กำลังส่งข้อมูลจริงไปยัง Flask...</p>';

                const dataToSend = {
                    // input_username: usernameInput.value.trim(),
                    // select_option: selectElement.value,
                    // text_area_notes: notesElement.value.trim()
                };

                const response = await fetch('/api/process_data', {
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
                timestampDisplayContent.innerHTML = result.html_list;
                    // Initial attachment of handlers
    attachTimestampClickHandlers();
            } else {
                timestampDisplayContent.innerHTML = `<p style="color: red;">❌ Error: ${result.message}</p>`;
            }

        } catch (error) {
            console.error('Operation Error:', error);
            timestampDisplayContent.innerHTML = `<p style="color: red;">เกิดข้อผิดพลาดในการทำงาน: ${error.message}</p>`;
        }
    }

    // Helper to convert timeline HTML to plain text
    const convertTimelineToPlainText = () => {
        let plainText = '';
        const timelineItems = timestampDisplayContent.querySelectorAll('.timeline > li');
        timelineItems.forEach(item => {
            const timeSpan = item.querySelector('.timeline-start .timestamp-link');
            const descriptionDiv = item.querySelector('.timeline-end');
            if (timeSpan && descriptionDiv) {
                const time = timeSpan.textContent.trim();
                const description = descriptionDiv.textContent.trim();
                plainText += `${time} - ${description}\n`;
            }
        });
        return plainText.trim(); // Remove trailing newline
    };

    // Timestamp Display/Edit Mode
    let isEditMode = false;

    const enterEditMode = () => {
        isEditMode = true;
        timestampDisplayContent.classList.add('hidden');
        timestampEditContent.value = convertTimelineToPlainText(); // Use the helper function
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
        const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(.*)/; // Regex to capture time and description
        const lines = text.split('\n').filter(line => line.trim() !== '');
        let timelineHtml = '<ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">';

        lines.forEach((line, index) => {
            const match = line.match(timestampRegex);
            if (match) {
                const timeString = match[1];
                const description = match[2].trim();
                const parts = timeString.split(':').map(Number);
                let seconds = 0;
                if (parts.length === 3) {
                    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                } else if (parts.length === 2) {
                    seconds = parts[0] * 60 + parts[1];
                }

                if (index % 2 === 0) { // Even index: content in timeline-start (left side)
                    timelineHtml += `
                        <li>
                            <div class="timeline-middle">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                            </div>
                            <div class="timeline-start mb-10 md:text-end">
                                <time class="font-mono italic">
                                    <span class="timestamp-link link link-primary cursor-pointer" data-time="${seconds}">${timeString}</span>
                                </time>
                                <div class="text-lg font-black">${description}</div>
                            </div>
                            ${index < lines.length - 1 ? '<hr/>' : ''}
                        </li>
                    `;
                } else { // Odd index: content in timeline-end (right side)
                    timelineHtml += `
                        <li>
                            <hr />
                            <div class="timeline-middle">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                            </div>
                            <div class="timeline-end md:mb-10">
                                <time class="font-mono italic">
                                    <span class="timestamp-link link link-primary cursor-pointer" data-time="${seconds}">${timeString}</span>
                                </time>
                                <div class="text-lg font-black">${description}</div>
                            </div>
                            ${index < lines.length - 1 ? '<hr/>' : ''}
                        </li>
                    `;
                }
            }
        });

        timelineHtml += '</ul>';
        return timelineHtml;
    };

    // Attach click handlers to timestamps
    const attachTimestampClickHandlers = () => {
        document.querySelectorAll('.timestamp-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = e.target.dataset.time;
                if (youtubeVideoPlayer && time !== undefined) {
                    const player = youtubeVideoPlayer.contentWindow;
                    player.postMessage(`{"event":"command","func":"seekTo","args":[${time},true]}`, '*');
                }
            });
        });
    };

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