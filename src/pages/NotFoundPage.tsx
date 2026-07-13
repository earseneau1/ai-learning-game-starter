import { Link } from 'react-router-dom';
export function NotFoundPage() { return <main className="error-page"><p className="eyebrow">404</p><h1>This path is not part of the story.</h1><p>Return to the role selection screen and choose where to continue.</p><Link className="primary-button" to="/">Return home</Link></main>; }
