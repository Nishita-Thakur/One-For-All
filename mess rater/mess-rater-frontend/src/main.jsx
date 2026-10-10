import { createRoot } from 'react-dom/client';
import './lib/theme'; // applies the saved theme before the first paint
import './style.css';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);
