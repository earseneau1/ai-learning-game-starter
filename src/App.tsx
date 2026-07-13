import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { RoleSelectPage } from './pages/RoleSelectPage';
import { PlayerPage } from './pages/PlayerPage';
import { DesignerPage } from './designer/DesignerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useRole } from './hooks/useRole';

export default function App() {
  const location = useLocation(); const { role } = useRole();
  return <><a className="skip-link" href="#main-content">Skip to main content</a>{location.pathname !== '/' && <AppHeader />}<div id="main-content"><Routes><Route path="/" element={role ? <Navigate to={role === 'designer' ? '/designer' : '/play'} replace /> : <RoleSelectPage />} /><Route path="/play" element={<PlayerPage />} /><Route path="/designer" element={<DesignerPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></div></>;
}
