import { sendData } from './api.js';
import { initializeLanguageSwitcher } from './lang.js';
import { initializeThemeSwitcher } from './theme.js';
import { convertTimelineToText, handleDisplayChange } from './timestamps.js';
import { setPreviewCardVisibility } from './ui.js';
import { debounce } from './utils.js';
import { getVideoIdFromUrl, handleUrlChangeForSection, validateUrl } from './youtube.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeLanguageSwitcher();
    initializeThemeSwitcher();

    const heroSection = document.getElementById('hero-section');
    const appViewSection = document.getElementById('app-view-section');
    const youtubeVideoPlayer = document.getElementById('youtube-video-player');
    const copyButtons = document.querySelectorAll('.copy-timestamp-btn');
    const currentYearSpan = document.getElementById('current-year');
    const appViewInputSection = document.getElementById('app-view-input-section');
    const tabTimestamp = document.querySelector(".tab-timestamp");
    const commentTabContent = document.getElementById('comment-tab-content');
    const timelineTab = document.getElementById('timeline-tab');

    if (document.getElementById('hero-image-container')) {
        document.getElementById('hero-image-container').addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });
    }

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const homeButtons = document.querySelectorAll('#home-button, #footer-home-button');

    homeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.remove('app-view-active');
            location.reload();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;

        const isHeroVisible = !heroSection.classList.contains('hidden');
        const isAppViewVisible = !appViewSection.classList.contains('hidden');

        let currentInputSection;
        if (isHeroVisible) {
            currentInputSection = heroSection.querySelector('[input-section]');
        } else if (isAppViewVisible) {
            currentInputSection = appViewSection.querySelector('[input-section]');
        } else {
            return;
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

    let stickyBarObserverInitialized = false;
    const initializeStickyTabBarObserver = () => {
        if (stickyBarObserverInitialized || !timelineTab || !document.getElementById('sticky-tab-bar')) {
            return;
        }
        stickyBarObserverInitialized = true;

        let observer;

        const setupObserver = () => {
            if (observer) {
                observer.disconnect();
            }

            setTimeout(() => {
                const isSmallScreen = window.innerWidth < 1024;
                let rootMarginTop = 0;

                if (isSmallScreen) {
                    const videoPlayerHeight = youtubeVideoPlayer.getBoundingClientRect().height;
                    rootMarginTop = videoPlayerHeight;
                }

                observer = new IntersectionObserver(
                    ([entry]) => {
                        const stickyTabBar = document.getElementById('sticky-tab-bar');
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
                        root: null,
                        rootMargin: `-${rootMarginTop}px 0px 0px 0px`,
                        threshold: 0,
                    }
                );

                observer.observe(timelineTab);
            }, 100);
        };

        setupObserver();

        window.addEventListener('resize', debounce(setupObserver, 200));
    };

    document.querySelectorAll('[input-section]').forEach(inputSection => {
        const youtubeUrlInput = inputSection.querySelector('[data-youtube-url-input]');
        const urlInput = inputSection.querySelector('.url-input');
        const generateButton = inputSection.querySelector('[data-generate-button]');
        const previewCard = inputSection.querySelector('.preview-card');
        const closePreviewBtn = previewCard ? previewCard.querySelector('.btn-close') : null;
        const additionalDetailsTextarea = inputSection.querySelector('[data-additional-details]');
        const languageSelect = inputSection.querySelector('[data-language-select]');

        if (youtubeUrlInput) {
            youtubeUrlInput.addEventListener('input', debounce(() => handleUrlChangeForSection(inputSection), 500));
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
            generateButton.addEventListener('click', async () => {
                const url = youtubeUrlInput.value.trim();
                if (!validateUrl(url)) {
                    urlInput.classList.add('animate-shake');
                    setTimeout(() => {
                        urlInput.classList.remove('animate-shake');
                    }, 1000);
                    return;
                }

                const icon = generateButton.querySelector('span:not(.loading)');
                const spinner = generateButton.querySelector('.loading');

                generateButton.disabled = true;
                icon.classList.add('hidden');
                spinner.classList.remove('hidden');

                let appViewGenerateBtn;
                let appViewIcon;
                let appViewSpinner;
                try {
                    const videoId = getVideoIdFromUrl(url);
                    if (videoId) {
                        youtubeVideoPlayer.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                    }

                    const heroInputSection = heroSection.querySelector('[input-section]');
                    const appViewInputSection = appViewSection.querySelector('[input-section]');

                    if (inputSection === heroInputSection) {
                        const heroUrlValue = youtubeUrlInput.value;
                        const heroAdditionalDetailsValue = additionalDetailsTextarea ? additionalDetailsTextarea.value : '';
                        const heroLanguageSelectValue = languageSelect ? languageSelect.value : 'auto';

                        const appViewUrlInput = appViewInputSection.querySelector('[data-youtube-url-input]');
                        const appViewAdditionalDetailsTextarea = appViewInputSection.querySelector('[data-additional-details]');
                        const appViewLanguageSelect = appViewInputSection.querySelector('[data-language-select]');
                        appViewGenerateBtn = appViewInputSection.querySelector('[data-generate-button]');
                        appViewIcon = appViewGenerateBtn ? appViewGenerateBtn.querySelector('span:not(.loading)') : "";
                        appViewSpinner = appViewGenerateBtn ? appViewGenerateBtn.querySelector('.loading') : "";

                        if (appViewUrlInput) appViewUrlInput.value = heroUrlValue;
                        if (appViewAdditionalDetailsTextarea) appViewAdditionalDetailsTextarea.value = heroAdditionalDetailsValue;
                        if (appViewLanguageSelect) appViewLanguageSelect.value = heroLanguageSelectValue;
                        if (appViewGenerateBtn) {
                            appViewGenerateBtn.disabled = generateButton.disabled;
                            appViewIcon = icon;
                            appViewSpinner = spinner;
                        };

                        if (appViewUrlInput) {
                            handleUrlChangeForSection(appViewInputSection);
                        }
                    }

                    document.body.classList.add('app-view-active');

                    initializeStickyTabBarObserver();

                    await sendData();
                } finally {
                    generateButton.disabled = false;
                    icon.classList.remove('hidden');
                    spinner.classList.add('hidden');
                    if(appViewGenerateBtn){
                        appViewGenerateBtn.disabled = generateButton.disabled;
                        appViewIcon = icon;
                        appViewSpinner = spinner;
                    }
                }
            });
        }
    });

    copyButtons.forEach(copyBtn => {
        if (!copyBtn) {
            console.error('ValueError: not found copy button.');
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
            const button = copyBtn.querySelector(".btn");
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.innerHTML = `<span class="icon-[tabler--copy-check-filled] text-xl"></span>`;
                button.classList.remove("btn-primary");
                button.classList.add("btn-success");
                copyBtn.classList.add("tooltip-open");
                copyBtn.classList.add("tooltip-success");
                copyBtn.setAttribute("data-tip", "Copied!");
                setTimeout(() => {
                    button.innerHTML = `<span class="icon-[tabler--copy] text-xl"></span>`;
                    button.classList.add("btn-primary");
                    button.classList.remove("btn-success");
                    copyBtn.classList.remove("tooltip-open");
                    copyBtn.classList.remove("tooltip-success");
                    copyBtn.setAttribute("data-tip", "Copy!");
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy timestamps: ', err);
            });
        });
    });

    let lastScrollTop = 0;
    const navbar = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            navbar.style.transform = 'translateY(-100%)';
            if (appViewInputSection) {
                appViewInputSection.style.transform = 'translateY(-100%)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
            if (appViewInputSection) {
                appViewInputSection.style.transform = 'translateY(0)';
            }
        }
        lastScrollTop = scrollTop;
    });

    function syncRadioGroups(radioClassName, callback) {
        const allSyncRadios = document.querySelectorAll(`.${radioClassName}`);

        if (allSyncRadios.length === 0) {
            console.warn(`not found radio class name: "${radioClassName}"`);
            return;
        }

        allSyncRadios.forEach(radio => {
            radio.addEventListener('change', function (event) {
                event.preventDefault();
                const newSelectedValue = event.target.value;
                const matchingRadios = document.querySelectorAll(`input[value="${newSelectedValue}"]`);
                matchingRadios.forEach(matchRadio => {
                    matchRadio.checked = true;
                });
                if (callback && typeof callback === 'function') {
                    callback(newSelectedValue);
                }
            });
        });

        const initialChecked = document.querySelector(`.${radioClassName}:checked`);
        if (initialChecked && callback && typeof callback === 'function') {
            callback(initialChecked.value);
        }
    }

    syncRadioGroups('display-tab', handleDisplayChange);


});