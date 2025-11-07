export const toggleClassPair = (element, classOnTrue, classOnFalse, condition) => {
    element.classList.toggle(classOnTrue, condition);
    element.classList.toggle(classOnFalse, !condition);
};

export const setPreviewCardVisibility = (previewCardElement, isVisible) => {
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

export const updateInputState = (urlInput, previewCard, isValid) => {
    toggleClassPair(urlInput, 'input-primary', 'input-error', isValid);
    urlInput.classList.toggle('animate-shake', !isValid);
    if (previewCard) {
        setPreviewCardVisibility(previewCard, isValid);
    }
};

export const initInputState = (urlInput, previewCard) => {
    toggleClassPair(urlInput, 'input-primary', 'input-error', true);
    urlInput.classList.toggle('animate-shake', false);
    if (previewCard) {
        previewCard.classList.add('hidden');
    }
};