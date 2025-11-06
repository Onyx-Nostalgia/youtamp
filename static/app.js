// static/app.js

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero-section');
    const heroImage = document.getElementById('hero-image-container')
    const appViewSection = document.getElementById('app-view-section');
    const youtubeVideoPlayer = document.getElementById('youtube-video-player');
    const copyButtons = document.querySelectorAll('.copy-timestamp-btn');
    const currentYearSpan = document.getElementById('current-year');

    const appViewInputSection = document.getElementById('app-view-input-section');

    const tabLoading = document.querySelector(".tab-loading")
    const tabTimestamp = document.querySelector(".tab-timestamp")
    const timelineTab = document.getElementById('timeline-tab');
    const stickyTabBar = document.getElementById('sticky-tab-bar')
    const commentTabContent = document.getElementById('comment-tab-content');
    const timestampDisplayContent = document.getElementById('timestamp-display-content');

    const toggleClassPair = (element, classOnTrue, classOnFalse, condition) => {
        element.classList.toggle(classOnTrue, condition);
        element.classList.toggle(classOnFalse, !condition);
    };

    const setPreviewCardVisibility = (previewCardElement, isVisible) => {
        const showClasses = ['animate-fade-in-bounceup'];
        const hideClasses = ['animate-fade-up', 'animate-ease-in-out', 'animate-reverse', 'animate-fill-forwards'];
        // Default duration for tailwindcss-animated is 1s (1000ms)
        const animationDuration = 1000;

        if (previewCardElement) {
            // Clear any pending timeout to prevent race conditions
            if (previewCardElement.hideTimeout) {
                clearTimeout(previewCardElement.hideTimeout);
                previewCardElement.hideTimeout = null;
            }

            if (isVisible) {
                previewCardElement.classList.remove('hidden');
                previewCardElement.classList.remove(...hideClasses);
                previewCardElement.classList.add(...showClasses);
            } else {
                previewCardElement.classList.remove(...showClasses);
                previewCardElement.classList.add(...hideClasses);

                previewCardElement.hideTimeout = setTimeout(() => {
                    previewCardElement.classList.add('hidden');
                }, animationDuration);
            }
        }
    };

    if (heroImage) {
        heroImage.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });
    }

    // Set current year in footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;

        // Determine which section is currently visible
        const isHeroVisible = !heroSection.classList.contains('hidden');
        const isAppViewVisible = !appViewSection.classList.contains('hidden');

        let currentInputSection;
        if (isHeroVisible) {
            currentInputSection = heroSection.querySelector('[input-section]');
        } else if (isAppViewVisible) {
            currentInputSection = appViewSection.querySelector('[input-section]');
        } else {
            return; // No relevant section is visible
        }

        if (!currentInputSection) return;

        const generateButton = currentInputSection.querySelector('[data-generate-button]');
        const additionalDetailsTextarea = currentInputSection.querySelector('[data-additional-details]');

        if (document.activeElement !== additionalDetailsTextarea && document.activeElement !== commentTabContent) {
            e.preventDefault();
            if (generateButton) {
                generateButton.click();
            }
        }
    });


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

    const updateInputState = (urlInput, previewCard, isValid) => {
        toggleClassPair(urlInput, 'input-primary', 'input-error', isValid);
        urlInput.classList.toggle('animate-shake', !isValid);
        if (previewCard) {
            setPreviewCardVisibility(previewCard, isValid);
        }
    };

    const handleUrlChangeForSection = async (currentInputSection) => {
        const youtubeUrlInput = currentInputSection.querySelector('[data-youtube-url-input]');
        const urlInput = currentInputSection.querySelector('.url-input');
        const previewCard = currentInputSection.querySelector('.preview-card');
        const videoThumbnail = previewCard ? previewCard.querySelector('[data-video-thumbnail]') : null;
        const videoTitle = previewCard ? previewCard.querySelector('[data-video-title]') : null;
        const videoAuthor = previewCard ? previewCard.querySelector('[data-video-author]') : null;

        const url = youtubeUrlInput.value.trim();
        const videoId = validateUrl(url) ? getVideoIdFromUrl(url) : null;

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
            // Initial check in case there's a pre-filled URL
            handleUrlChangeForSection(inputSection);
        }

        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => {
                if (previewCard) {
                    setPreviewCardVisibility(previewCard, false);
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

                // Initialize the observer for the sticky tab bar now that the player is visible
                initializeStickyTabBarObserver();

                sendData();
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
            // If it's an empty line or a line without a timestamp and no previous timestamp, it's ignored.
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

            // Use the modified convertSecondsToTimestamp function
            const displayTimestamp = convertSecondsToTimestamp(secondsValue, hasHHMMSS);

            // const isFirst = (index === 0);
            // const isLast = (index === totalItems - 1);

            const previousColor = index % 2 === 0
                ? 'primary'
                : 'secondary';
            const mainColor = index % 2 === 0
                ? 'secondary'
                : 'primary';

            const topHr = index === 0 ? '' : `<hr class="bg-${previousColor}" />`;
            const bottomHr = index === totalItems - 1 ? '' : `<hr class="bg-${mainColor}" />`;

            let processedTextContent = text_content.replace(/\n/g, '<br>'); // Replace newlines with <br> for HTML rendering
            const inlineTimestampRegex = /\b(\d{1,2}:\d{2}(:\d{2})?)\b/g; // Global flag for multiple matches

            processedTextContent = processedTextContent.replace(inlineTimestampRegex, (match, timestampStr) => {
                const secondsValue = convertToSeconds(timestampStr);
                if (secondsValue === null) {
                    return match; // If invalid, don't change
                }

                // Apply the same formatting logic as for main timestamps
                const formattedTimestamp = convertSecondsToTimestamp(secondsValue, hasHHMMSS);

                // Return the HTML for the button
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

    async function sendData() {
        // Show loading state
        tabLoading.classList.remove('hidden');
        tabTimestamp.classList.add('hidden');
        timestampDisplayContent.innerHTML = '<p>กำลังส่งข้อมูลจริงไปยัง Flask...</p>'; // Keep this for initial feedback

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
                const errorText = await response.text(); // Get error message from backend
                throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`);
            }

            const rawTimestamps = await response.text(); // Backend returns plain text

            const htmlContent = convertToTimestamp(rawTimestamps);
            commentTabContent.value = rawTimestamps; // Store raw text for comment tab
            timestampDisplayContent.innerHTML = htmlContent;

            attachTimestampClickHandlers();
            tabLoading.classList.add('hidden');
            tabTimestamp.classList.remove("hidden");

        } catch (error) {
            timestampDisplayContent.innerHTML = `<p style="color: red;">❌ เกิดข้อผิดพลาดในการทำงาน: ${error.message}</p>`;
            console.error('Operation Error:', error);
            tabLoading.classList.add('hidden'); // Hide loading on error
            tabTimestamp.classList.add("hidden"); // Keep timestamp tab hidden on error
        }
    }

    function convertSecondsToTimestamp(totalSeconds, forceHHMMSS = false) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');

        if (forceHHMMSS || hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        } else {
            return `${pad(minutes)}:${pad(seconds)}`;
        }
    }

    // Helper to convert timeline HTML to plain text
    const convertTimelineToText = () => {
        const lines = [];
        const listItems = timestampDisplayContent.querySelectorAll('li');
        // Regex to find the inline buttons and capture their text content (the timestamp)
        const inlineButtonRegex = /<button[^>]*class="[^\"]*timestamp-link[^\"]*"[^>]*data-time="\d+"[^>]*>(\d{1,2}:\d{2}(:\d{2})?)<\/button>/g;

        listItems.forEach(li => {
            const timestampLink = li.querySelector('.timestamp-link'); // Main timestamp button
            const descriptionDiv = li.querySelector('.timeline-description'); // The new div for description

            if (timestampLink && descriptionDiv) {
                const mainTimestamp = timestampLink.textContent.trim(); // e.g., "00:01:30"
                let descriptionContent = descriptionDiv.innerHTML; // Get HTML content from the div

                // Convert inline buttons back to plain timestamps
                descriptionContent = descriptionContent.replace(inlineButtonRegex, (match, timestampStr) => {
                    return timestampStr; // Replace button HTML with just the timestamp string
                });

                // Replace <br> tags with newlines for plain text conversion
                descriptionContent = descriptionContent.replace(/<br\s*\/?>/gi, '\n');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = descriptionContent;
                const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

                lines.push(`${mainTimestamp} ${plainDescription.trim()}`);
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

    const activateTimelineTab = () => {
        const rawText = commentTabContent.value;
        const timeline = convertToTimestamp(rawText)
        timestampDisplayContent.innerHTML = timeline;
        attachTimestampClickHandlers(); // Re-attach handlers after content update
    };

    const activateCommentTab = () => {
        const timelineText = convertTimelineToText();
        commentTabContent.value = timelineText;
    };


    function handleDisplayChange(selectedValue) {

        switch (selectedValue) {
            case 'timeline':
                activateTimelineTab();
                break;
            case 'comment':
                activateCommentTab();
                break;
        }

    }

    copyButtons.forEach(copyBtn => {
        if (!copyBtn) {
            console.error('ValueError: not found copy button.')
            return;
        }
        copyBtn.addEventListener('click', () => {
            let textToCopy;
            const selectedTab = tabTimestamp.querySelector('input[name="display_tab"]:checked');
            if (!selectedTab) {
                console.error("ValueError: not found selected tab.");
                return;
            }
            switch (selectedTab.value) {
                case 'timeline':
                    textToCopy = convertTimelineToText();
                    break;
                case 'comment':
                    textToCopy = commentTabContent.value;
                    break;
                default:
                    textToCopy = '';
                    break;
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

    })

    // Smart Hide Navbar (Responsive)
    let lastScrollTop = 0;
    const navbar = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
            if (appViewInputSection) {
                appViewInputSection.style.transform = 'translateY(-100%)';
            }
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
            if (appViewInputSection) {
                appViewInputSection.style.transform = 'translateY(0)';
            }
        }
        lastScrollTop = scrollTop;
    });

    /**
     * เชื่อมโยงสถานะการเลือก (checked) ของ Radio Buttons หลายกลุ่ม
     * ที่ถูกระบุด้วย Class Name เดียวกัน ให้มีสถานะซิงค์กันเสมอ
     * * @param {string} radioClassName - ชื่อคลาส (Class Name) ของปุ่ม Radio ทั้งหมดที่ต้องการซิงค์
     * @param {function(string): void} [callback] - ฟังก์ชันเสริมที่จะถูกเรียกใช้เมื่อมีการเลือกใหม่ (ส่งค่า value ของปุ่มที่ถูกเลือกไปให้)
     */
    function syncRadioGroups(radioClassName, callback) {
        // 1. เลือกปุ่ม Radio ทั้งหมดที่มี Class ตรงกัน
        const allSyncRadios = document.querySelectorAll(`.${radioClassName}`);

        if (allSyncRadios.length === 0) {
            console.warn(`ไม่พบปุ่ม Radio ที่มีคลาส "${radioClassName}"`);
            return;
        }

        // 2. วนลูปและเพิ่ม Event Listener ให้กับทุกปุ่ม
        allSyncRadios.forEach(radio => {
            radio.addEventListener('change', function (event) {

                event.preventDefault();

                // ก. ดึงค่า (Value) ที่ถูกเลือกใหม่
                const newSelectedValue = event.target.value;

                // ข. ค้นหาปุ่ม Radio ทั้งหมดในหน้าเว็บที่มีค่า Value เดียวกัน
                const matchingRadios = document.querySelectorAll(`input[value="${newSelectedValue}"]`);

                // ค. อัปเดตสถานะของปุ่มที่ตรงกันทั้งหมดให้เป็น checked
                matchingRadios.forEach(matchRadio => {
                    matchRadio.checked = true;
                });

                // ง. เรียกใช้ Callback Function (ถ้ามี) เพื่อให้สามารถนำค่าไปใช้ต่อได้
                if (callback && typeof callback === 'function') {
                    callback(newSelectedValue);
                }
            });
        });

        // 3. จัดการสถานะเริ่มต้นเมื่อโหลดหน้า
        const initialChecked = document.querySelector(`.${radioClassName}:checked`);
        if (initialChecked && callback && typeof callback === 'function') {
            callback(initialChecked.value);
        }
    }

    syncRadioGroups('display-tab', handleDisplayChange);

    let stickyBarObserverInitialized = false;
    const initializeStickyTabBarObserver = () => {
        if (stickyBarObserverInitialized || !timelineTab || !stickyTabBar) {
            return;
        }
        stickyBarObserverInitialized = true;

        let observer;

        const setupObserver = () => {
            if (observer) {
                observer.disconnect();
            }

            // Use a small timeout to ensure the DOM has updated and dimensions are available
            setTimeout(() => {
                const isSmallScreen = window.innerWidth < 1024; // Tailwind's lg breakpoint
                let rootMarginTop = 0;

                if (isSmallScreen) {
                    const videoPlayerHeight = youtubeVideoPlayer.getBoundingClientRect().height;
                    rootMarginTop = videoPlayerHeight;
                }

                observer = new IntersectionObserver(
                    ([entry]) => {
                        // Show sticky bar when the original tabs scroll out of the observation area from the top.
                        // `entry.boundingClientRect.top < rootMarginTop` ensures we're scrolling up.
                        // On large screens, rootMarginTop is 0, so it's < 0.
                        // On small screens, it's < videoPlayerHeight, which is also correct.
                        if (!entry.isIntersecting && entry.boundingClientRect.top < rootMarginTop) {
                            stickyTabBar.classList.remove('hidden');
                            stickyTabBar.classList.add('flex');
                            youtubeVideoPlayer.classList.remove('rounded-xl');
                            youtubeVideoPlayer.classList.add('rounded-tr-xl');
                            youtubeVideoPlayer.classList.add('rounded-tl-xl');
                        } else {
                            stickyTabBar.classList.add('hidden');
                            stickyTabBar.classList.remove('flex');
                            youtubeVideoPlayer.classList.add('rounded-xl');
                            youtubeVideoPlayer.classList.remove('rounded-tr-xl');
                            youtubeVideoPlayer.classList.remove('rounded-tl-xl');
                        }
                    },
                    {
                        root: null, // observing intersections relative to the viewport
                        rootMargin: `-${rootMarginTop}px 0px 0px 0px`,
                        threshold: 0, // callback is executed when the target is even 1px in or out of view
                    }
                );

                observer.observe(timelineTab);
            }, 100); // Delay to allow rendering
        };

        // Initial setup
        setupObserver();

        // Re-setup on window resize to handle breakpoint changes and video player resize
        window.addEventListener('resize', debounce(setupObserver, 200));
    };

});