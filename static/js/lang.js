let translations = {};
let currentLanguage = localStorage.getItem('language') || 'th';

const fetchTranslations = async (lang) => {
    try {
        const response = await fetch(`/static/locales/${lang}.json`);
        if (!response.ok) {
            console.error(`Could not load ${lang}.json`);
            return {};
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${lang}.json:`, error);
        return {};
    }
};

const translatePage = () => {
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        if (translations[key]) {
            element.innerHTML = translations[key];
        }
    });
    document.querySelectorAll('[data-tip-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-tip-i18n-key');
        if (translations[key]) {
            element.setAttribute('data-tip', translations[key]);
        }
    });
    document.querySelectorAll('[placeholder-i18n-key]').forEach(element => {
        const key = element.getAttribute('placeholder-i18n-key');
        if (translations[key]) {
            element.setAttribute('placeholder', translations[key]);
        }
    });
};

export const switchLanguage = async (lang) => {
    if (lang === currentLanguage && Object.keys(translations).length > 0) return;

    const defaultTranslations = await fetchTranslations('en');
    let langTranslations = {};
    if (lang !== 'en') {
        langTranslations = await fetchTranslations(lang);
    }

    translations = { ...defaultTranslations, ...langTranslations };

    translatePage();
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);
    currentLanguage = lang;
    // Set the radio button to the current language
    const langRadioButton = document.querySelector(`input[name='lang-pick'][value='${lang}']`);
    if (langRadioButton) {
        langRadioButton.checked = true;
    }
};

export const initializeLanguageSwitcher = () => {
    document.querySelectorAll('input[name="lang-pick"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            switchLanguage(event.target.value);
        });
    });

    switchLanguage(currentLanguage);
};