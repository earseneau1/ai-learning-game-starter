import { useNavigate } from 'react-router-dom';
import { DemoNotice } from '../components/DemoNotice';
import { useRole } from '../hooks/useRole';

export function RoleSelectPage() {
  const navigate = useNavigate();
  const { selectRole } = useRole();
  const choose = async (role: 'player' | 'designer') => { await selectRole(role); navigate(role === 'player' ? '/play' : '/designer'); };
  return <main className="entry-page">
    <section className="entry-hero">
      <p className="eyebrow">AI Learning Game Starter</p>
      <h1>Learn by choosing<br /><span>what happens next.</span></h1>
      <p className="hero-copy">Step into a polished narrative game—or open the studio and reshape every character, choice, consequence, and ending.</p>
      <div className="role-options">
        <button className="role-card player-card" onClick={() => void choose('player')}>
          <span className="role-icon" aria-hidden="true">▶</span>
          <span><strong>Continue as Player</strong><small>Play Startup Sprint · 5–8 minutes</small></span><b aria-hidden="true">→</b>
        </button>
        <button className="role-card designer-card" onClick={() => void choose('designer')}>
          <span className="role-icon" aria-hidden="true">✦</span>
          <span><strong>Continue as Game Designer</strong><small>Edit content, preview paths, and reset the demo</small></span><b aria-hidden="true">→</b>
        </button>
      </div>
      <DemoNotice />
    </section>
    <aside className="entry-art" aria-label="Illustration of branching game paths">
      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
      <div className="story-node node-main"><span>START</span><strong>Your story</strong></div>
      <div className="story-node node-a"><span>CHOICE</span><strong>Ask why</strong></div>
      <div className="story-node node-b"><span>EVIDENCE</span><strong>Learn</strong></div>
      <div className="story-node node-c"><span>OUTCOME</span><strong>Decide</strong></div>
    </aside>
  </main>;
}
