import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

export function AppHeader() {
  const { role, clearRole } = useRole();
  const navigate = useNavigate();
  return <header className="app-header">
    <Link to={role === 'designer' ? '/designer' : '/play'} className="brand"><span className="brand-mark">A<span>I</span></span><span>Learning Game <em>Starter</em></span></Link>
    <div className="header-actions">
      {role && <span className="role-pill"><span className="status-dot" />{role === 'designer' ? 'Game Designer' : 'Player'}</span>}
      {role && <button className="text-button" onClick={() => { clearRole(); navigate('/'); }}>Switch role</button>}
    </div>
  </header>;
}
