import { supabase } from './lib/supabase';
import { createRoot } from 'react-dom/client';
import './lib/theme'; // applies the saved light/dark theme before the first paint
import './style.css';
import App from './App';

// Kept from the original code: lets you inspect the Supabase client from the browser console while developing.
window.supabase = supabase;

createRoot(document.getElementById('root')).render(<App />);
