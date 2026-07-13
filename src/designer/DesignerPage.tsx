import { useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { startupSprint } from '../game-content/game.config';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { api } from '../services/api';

type Section = 'settings' | 'characters' | 'chapters' | 'scenes' | 'dialogue' | 'decisions' | 'choices' | 'variables' | 'inventory' | 'endings';
interface DesignerRow { id: string; title: string; detail: string; meta: string; sortOrder: number; raw: Record<string, unknown> }
const stringFrom = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;

const labels: Record<Section, { title: string; singular: string; description: string }> = {
  settings: { title: 'Game settings', singular: 'Game', description: 'The promise, audience, setting, and opening of your learning experience.' },
  characters: { title: 'Characters', singular: 'Character', description: 'Give each voice a distinct role, motivation, and educational purpose.' },
  chapters: { title: 'Chapters', singular: 'Chapter', description: 'Group scenes into a clear learning journey.' },
  scenes: { title: 'Scenes', singular: 'Scene', description: 'Create the places, tension, and objectives that move the story.' },
  dialogue: { title: 'Dialogue', singular: 'Dialogue line', description: 'Shape what characters reveal before each decision.' },
  decisions: { title: 'Decisions', singular: 'Decision', description: 'Frame meaningful moments of uncertainty.' },
  choices: { title: 'Choices & consequences', singular: 'Choice', description: 'Show tradeoffs, resource effects, feedback, and what happens next.' },
  variables: { title: 'Game variables', singular: 'Variable', description: 'Track the resources and ideas that change through play.' },
  inventory: { title: 'Evidence & inventory', singular: 'Item', description: 'Create artifacts that prove what the player has learned or found.' },
  endings: { title: 'Endings', singular: 'Ending', description: 'Explain why a path ended here and invite reflection.' },
};

const sectionRows = (section: Section): DesignerRow[] => {
  const game = startupSprint;
  if (section === 'settings') return [{ id: game.id, title: game.title, detail: game.subtitle, meta: game.status, sortOrder: 1, raw: { title: game.title, subtitle: game.subtitle, description: game.description, learningObjective: game.learningObjective, targetLearner: game.targetLearner, setting: game.setting, playerRole: game.playerRole, openingStory: game.openingStory, instructions: game.instructions, estimatedPlayTime: game.estimatedPlayTime } }];
  if (section === 'characters') return game.characters.map((item) => ({ id: item.id, title: item.name, detail: item.role, meta: item.aiEnabled ? 'AI conversation enabled' : item.educationalPurpose, sortOrder: item.sortOrder, raw: { ...item } }));
  if (section === 'chapters') return game.chapters.map((item) => ({ id: item.id, title: item.title, detail: item.summary, meta: item.learningFocus, sortOrder: item.sortOrder, raw: { ...item } }));
  if (section === 'scenes') return game.scenes.map((item) => ({ id: item.id, title: item.title, detail: item.location, meta: item.learningFocus, sortOrder: item.sortOrder, raw: { ...item } }));
  if (section === 'dialogue') return game.scenes.flatMap((scene) => scene.dialogue.map((item) => ({ id: item.id, title: game.characters.find((character) => character.id === item.characterId)?.name ?? item.characterId, detail: item.text, meta: scene.title, sortOrder: item.sortOrder, raw: { ...item, sceneId: scene.id } })));
  if (section === 'decisions') return game.scenes.map((scene) => ({ id: scene.decision.id, title: scene.decision.prompt, detail: scene.decision.context, meta: scene.title, sortOrder: scene.sortOrder, raw: { ...scene.decision, sceneId: scene.id } }));
  if (section === 'choices') return game.scenes.flatMap((scene) => scene.decision.choices.map((item) => ({ id: item.id, title: item.label, detail: item.consequence, meta: scene.decision.prompt, sortOrder: item.sortOrder, raw: { ...item, decisionId: scene.decision.id } })));
  if (section === 'variables') return game.variables.map((item) => ({ id: item.id, title: item.label, detail: item.explanation, meta: `Starts at ${item.startingValue} · ${item.min}–${item.max}`, sortOrder: item.sortOrder, raw: { ...item } }));
  if (section === 'inventory') return game.inventory.map((item) => ({ id: item.id, title: item.name, detail: item.description, meta: item.type, sortOrder: item.sortOrder, raw: { ...item } }));
  return game.endings.map((item) => ({ id: item.id, title: item.title, detail: item.narrative, meta: `${item.tone} outcome · priority ${item.priority}`, sortOrder: item.sortOrder, raw: { ...item } }));
};

function EditorDialog({ section, row, onClose, onSave }: { section: Section; row: DesignerRow | null; onClose: () => void; onSave: (row: DesignerRow) => void }) {
  const info = labels[section];
  const [title, setTitle] = useState(row?.title ?? '');
  const [detail, setDetail] = useState(row?.detail ?? '');
  const [meta, setMeta] = useState(row?.meta ?? '');
  const parentFields = section === 'scenes' ? [['chapterId', 'Chapter ID', 'discover']] : section === 'dialogue' ? [['sceneId', 'Scene ID', 'big-idea'], ['characterId', 'Character ID', 'jordan']] : section === 'decisions' ? [['sceneId', 'Scene ID', '']] : section === 'choices' ? [['decisionId', 'Decision ID', 'first-move']] : [];
  const [parents, setParents] = useState<Record<string, string>>(() => Object.fromEntries(parentFields.map(([key, _label, fallback]) => [key, stringFrom(row?.raw[key], fallback)])));
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 2 || detail.trim().length < 3) { setError('Add a clear name and at least a short description.'); return; }
    const id = row?.id ?? `${section}-${crypto.randomUUID()}`;
    const base = { ...(row?.raw ?? {}), ...parents, id, title: title.trim(), name: title.trim(), description: detail.trim(), text: detail.trim() };
    const raw = section === 'characters' ? { ...base, name: title.trim(), description: detail.trim() }
      : section === 'chapters' ? { ...base, title: title.trim(), summary: detail.trim() }
      : section === 'scenes' ? { ...base, title: title.trim(), narrative: detail.trim() }
      : section === 'dialogue' ? { ...base, text: detail.trim() }
      : section === 'decisions' ? { ...base, prompt: title.trim(), context: detail.trim() }
      : section === 'choices' ? { ...base, label: title.trim(), consequence: detail.trim() }
      : section === 'variables' ? { ...base, label: title.trim(), explanation: detail.trim() }
      : section === 'inventory' ? { ...base, name: title.trim(), description: detail.trim() }
      : section === 'endings' ? { ...base, title: title.trim(), narrative: detail.trim() } : base;
    onSave({ id, title: title.trim(), detail: detail.trim(), meta: meta.trim(), sortOrder: row?.sortOrder ?? 999, raw });
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><header><div><p className="eyebrow">{row ? 'Edit' : 'Create'} {info.singular}</p><h2 id="editor-title">Make it clear to the player</h2></div><button aria-label="Close editor" onClick={onClose}>×</button></header><form onSubmit={submit}><label>{section === 'dialogue' ? 'Character or speaker' : `${info.singular} name`}<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>{section === 'choices' ? 'What happens after this choice?' : section === 'dialogue' ? 'What do they say?' : 'Description or narrative'}<textarea rows={6} value={detail} onChange={(event) => setDetail(event.target.value)} /></label>{parentFields.map(([key, label]) => <label key={key}>{label}<input required value={parents[key] ?? ''} onChange={(event) => setParents((current) => ({ ...current, [key]: event.target.value }))} /></label>)}<label>Learning note or friendly context<input value={meta} onChange={(event) => setMeta(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<p className="field-help">This focused editor covers the most common change. Advanced effects and branch conditions remain available in the content configuration.</p><footer><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">Save {info.singular.toLowerCase()}</button></footer></form></section></div>;
}

export function DesignerPage() {
  const { role, selectRole } = useRole();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('settings');
  const [rowsBySection, setRowsBySection] = useState<Record<Section, DesignerRow[]>>(() => Object.fromEntries((Object.keys(labels) as Section[]).map((key) => [key, sectionRows(key)])) as Record<Section, DesignerRow[]>);
  const [editor, setEditor] = useState<DesignerRow | null | 'new'>(null);
  const [toast, setToast] = useState('');
  const [resetting, setResetting] = useState(false);
  const rows = useMemo(() => [...rowsBySection[section]].sort((a, b) => a.sortOrder - b.sortOrder), [rowsBySection, section]);
  if (role !== 'designer') return <Navigate to={role === 'player' ? '/play' : '/'} replace />;
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3000); };
  const preview = async () => { await selectRole('player'); navigate('/play'); };
  const persist = async (method: 'POST' | 'PUT' | 'DELETE', payload: unknown) => { try { await api.mutateContent(section, method, payload); flash('Saved to the demonstration database.'); } catch { flash('Saved in this preview. Connect the database to persist it.'); } };
  const save = (row: DesignerRow) => {
    const exists = rowsBySection[section].some((item) => item.id === row.id);
    setRowsBySection((current) => ({ ...current, [section]: exists ? current[section].map((item) => item.id === row.id ? row : item) : [...current[section], row] }));
    setEditor(null); void persist(exists ? 'PUT' : 'POST', row.raw);
  };
  const remove = (row: DesignerRow) => {
    if (!window.confirm(`Delete “${row.title}”? This cannot be undone after it is saved.`)) return;
    setRowsBySection((current) => ({ ...current, [section]: current[section].filter((item) => item.id !== row.id) })); void persist('DELETE', { id: row.id });
  };
  const move = (row: DesignerRow, delta: number) => {
    const ordered = rows; const index = ordered.findIndex((item) => item.id === row.id); const swap = ordered[index + delta]; if (!swap) return;
    const next = ordered.map((item) => item.id === row.id ? { ...item, sortOrder: swap.sortOrder } : item.id === swap.id ? { ...item, sortOrder: row.sortOrder } : item);
    setRowsBySection((current) => ({ ...current, [section]: next })); void persist('PUT', { id: row.id, sortOrder: swap.sortOrder });
  };
  const reset = async () => {
    if (!window.confirm('Reset Startup Sprint? This removes demonstration play sessions and restores all original content.')) return;
    setResetting(true);
    try { await api.resetDemo(); flash('Startup Sprint has been restored.'); } catch { flash('The database is unavailable; original preview content was restored locally.'); }
    setRowsBySection(Object.fromEntries((Object.keys(labels) as Section[]).map((key) => [key, sectionRows(key)])) as Record<Section, DesignerRow[]>); setResetting(false);
  };
  const current = labels[section];
  return <main className="designer-shell"><aside className="designer-nav"><div><span className="studio-mark">✦</span><strong>Game Designer</strong><small>Startup Sprint</small></div><nav aria-label="Game content sections">{(Object.keys(labels) as Section[]).map((key) => <button key={key} className={section === key ? 'active' : ''} onClick={() => setSection(key)}><span>{({ settings: '⚙', characters: '◉', chapters: '▤', scenes: '▱', dialogue: '“', decisions: '◇', choices: '⇢', variables: '⌁', inventory: '▣', endings: '⚑' } as Record<Section, string>)[key]}</span>{labels[key].title}</button>)}</nav><div className="designer-nav-footer"><button onClick={() => void preview()}>Preview player experience ↗</button><button className="danger-link" onClick={() => void reset()} disabled={resetting}>{resetting ? 'Restoring…' : 'Reset Startup Sprint'}</button></div></aside><section className="designer-main"><header className="designer-top"><div><p className="eyebrow">Startup Sprint content</p><h1>{current.title}</h1><p>{current.description}</p></div><button className="secondary-button" onClick={() => void preview()}>▶ Preview game</button></header><div className="designer-toolbar"><div><strong>{rows.length}</strong> {rows.length === 1 ? current.singular.toLowerCase() : current.title.toLowerCase()}</div>{section !== 'settings' && <button className="primary-button" onClick={() => setEditor('new')}>＋ New {current.singular}</button>}</div>{rows.length === 0 ? <div className="empty-state"><span>✦</span><h2>No {current.title.toLowerCase()} yet</h2><p>Start with one clear learning purpose. You can build complexity later.</p><button className="primary-button" onClick={() => setEditor('new')}>Create the first one</button></div> : <div className="content-table" role="table" aria-label={current.title}>{rows.map((row, index) => <article className="content-row" key={row.id} role="row"><div className="reorder-controls"><button aria-label={`Move ${row.title} up`} disabled={index === 0} onClick={() => move(row, -1)}>↑</button><span>{index + 1}</span><button aria-label={`Move ${row.title} down`} disabled={index === rows.length - 1} onClick={() => move(row, 1)}>↓</button></div>{section === 'characters' && (() => { const character = startupSprint.characters.find((item) => item.id === row.id); return character ? <CharacterPortrait character={character} size="small" /> : null; })()}<div className="row-copy"><strong>{row.title}</strong><p>{row.detail}</p><small>{row.meta}</small></div><div className="row-actions"><button onClick={() => setEditor(row)}>Edit</button>{section !== 'settings' && <button className="delete-button" onClick={() => remove(row)}>Delete</button>}</div></article>)}</div>}<div className="designer-tip"><span>STUDENT TIP</span><p>Start with the learning objective, then make every scene, character, and consequence earn its place. The reusable engine stays separate in <code>src/game-engine</code>.</p></div></section>{editor && <EditorDialog section={section} row={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onSave={save} />}{toast && <div className="toast" role="status">✓ {toast}</div>}</main>;
}
