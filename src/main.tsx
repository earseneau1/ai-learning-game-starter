import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { RoleProvider } from './hooks/useRole';
import './game-content/theme.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><RoleProvider><App /></RoleProvider></BrowserRouter></StrictMode>);
