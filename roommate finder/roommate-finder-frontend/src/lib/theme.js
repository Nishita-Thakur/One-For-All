export const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = window.localStorage.getItem('roommate-theme');
  return savedTheme === 'light' ? 'light' : 'dark';
};

export const initialTheme = getInitialTheme();

document.documentElement.dataset.theme = initialTheme;
