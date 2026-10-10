// Dates are always worked out in Indian Standard Time so they match the database.
const istNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
export const todayDow = () => istNow().getDay() || 7; // 1 = Monday ... 7 = Sunday
export const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
export const fmt = n => (n == null ? '–' : Number(n).toFixed(1));
