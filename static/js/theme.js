export const initializeThemeSwitcher = () => {
    const themeController = document.querySelector('.theme-controller');
    const htmlElement = document.documentElement;

    const applyTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        if (themeController) {
            themeController.checked = theme === themeController.value;
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'pastel';
    applyTheme(savedTheme);

    if (themeController) {
        themeController.addEventListener('change', () => {
            const theme = themeController.checked ? themeController.value : 'pastel';
            localStorage.setItem('theme', theme);
            applyTheme(theme);
        });
    }
};