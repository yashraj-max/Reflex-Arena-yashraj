// Entry point: apply the theme, then render <App /> into <div id="root">.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import theme from './theme/index.js';
import { applyTheme } from './theme/applyTheme.js';
import './styles/global.css';

applyTheme(theme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
