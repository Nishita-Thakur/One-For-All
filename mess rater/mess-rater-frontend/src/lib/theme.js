// Same storage key as Roommate Finder so the theme choice is shared.
export const THEME_KEY = 'roommate-theme';
export const initialTheme = localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
document.documentElement.dataset.theme = initialTheme;
