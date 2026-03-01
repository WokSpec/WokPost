'use client';

import { useState, useCallback, useRef } from 'react';
import { CATEGORIES } from '@/lib/feed/types';
import { IcoWrite, IcoEye, IcoLink, IcoImage, IcoCheck } from '@/components/Icons';

interface Props { author: string; authorId: string; }

interface EditPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  trigger_reason: string;
  methodology: string;
  sources_cited: string; // JSON array as textarea
  signals: string; // comma-separated labels
  slug?: string;
  views?: number;
  created_at?: string;
}

const BLANK: EditPost = {
  title: '', content: '', excerpt: '', cover_image: '',
  category: 'ai', tags: '', published: false, featured: false,
  trigger_reason: '', methodology: '', sources_cited: '', signals: '',
};

interface PostSummary {
  id: string; slug: string; title: string; category: string;
  published: number; featured: number; views: number; created_at: string;
}

export default function WriteClient({ author }: Props) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loadedPosts, setLoadedPosts] = useState(false);
  const [form, setForm] = useState<EditPost>(BLANK);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [view, setView] = useState<'list' | 'edit' | 'preview'>('list');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Insert HTML snippet at cursor in body textarea
  const insertHtml = useCallback((before: string, after = '') => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    const replacement = before + (selected || 'text') + after;
    const newVal = ta.value.slice(0, start) + replacement + ta.value.slice(end);
    setForm(f => ({ ...f, content: newVal }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + (selected || 'text').length;
    });
  }, []);

  const loadPosts = useCallback(async () => {
    const res = await fetch('/api/posts?author=1&limit=50');
    const data = await res.json() as { posts: PostSummary[] };
    setPosts(data.posts ?? []);
    setLoadedPosts(true);
  }, []);

  useState(() => { loadPosts(); });

  const save = async (publish?: boolean) => {
    setSaving(true); setMsg('');
    // Parse signals: "label:type, label2:type2" → [{label, type}]
    const signalsParsed = form.signals
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const idx = s.lastIndexOf(':');
        if (idx > 0) return { label: s.slice(0, idx).trim(), type: s.slice(idx + 1).trim() };
        return { label: s, type: 'trending' };
      });
    // Parse sources_cited: one per line, "name | url | note"
    const sourcesParsed = form.sources_cited
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const parts = s.split('|').map(p => p.trim());
        return { name: parts[0] ?? '', url: parts[1] || undefined, note: parts[2] || undefined };
      });
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published: publish ?? form.published,
      signals: signalsParsed,
      sources_cited: sourcesParsed,
    };
    try {
      if (form.id) {
        await fetch(`/api/posts/${form.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setMsg('Saved');
      } else {
        const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json() as { id?: string; slug?: string };
        setForm(f => ({ ...f, id: data.id, slug: data.slug, published: publish ?? f.published }));
        setMsg('Created');
      }
      loadPosts();
    } catch { setMsg('Error saving'); }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    loadPosts();
    if (form.id === id) { setForm(BLANK); setView('list'); }
  };

  const editPost = async (id: string) => {
    const res = await fetch(`/api/posts/${id}?edit=1`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as { post: any };
    const p = data.post;
    setForm({
      id: p.id, slug: p.slug, title: p.title, content: p.content,
      excerpt: p.excerpt, cover_image: p.cover_image ?? '',
      category: p.category, tags: Array.isArray(JSON.parse(p.tags || '[]')) ? JSON.parse(p.tags || '[]').join(', ') : '',
      published: p.published === 1, featured: p.featured === 1,
      trigger_reason: p.trigger_reason ?? '',
      methodology: p.methodology ?? '',
      sources_cited: (() => {
        try {
          const arr = JSON.parse(p.sources_cited || '[]');
          return arr.map((s: { name: string; url?: string; note?: string }) =>
            [s.name, s.url, s.note].filter(Boolean).join(' | ')
          ).join('\n');
        } catch { return ''; }
      })(),
      signals: (() => {
        try {
          const arr = JSON.parse(p.signals || '[]');
          return arr.map((s: { label: string; type: string }) => `${s.label}:${s.type}`).join(', ');
        } catch { return ''; }
      })(),
      views: p.views, created_at: p.created_at,
    });
    setView('edit');
  };

  // ── Editor view ──────────────────────────────────────────────────────────────
  if (view === 'edit' || view === 'preview') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
        {/* Editor toolbar */}
        <div style={{ position: 'sticky', top: 58, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => setView('list')}>← Back</button>
          <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {form.id ? `Editing: ${form.slug ?? form.id}` : 'New post'}
          </span>
          <button className="btn btn-ghost" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 5 }} onClick={() => setView(v => v === 'preview' ? 'edit' : 'preview')}>
            {view === 'preview' ? <><IcoWrite size={13} /> Edit</> : <><IcoEye size={13} /> Preview</>}
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.78rem' }} onClick={() => save(false)} disabled={saving}>
            Save draft
          </button>
          <button className="btn btn-primary" style={{ fontSize: '0.78rem' }} onClick={() => save(true)} disabled={saving}>
            {form.published ? 'Update & publish' : 'Publish'}
          </button>
          {msg && <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{msg}</span>}
        </div>

        {view === 'preview' ? (
          <div className="site-container" style={{ maxWidth: 760, paddingTop: '2rem', paddingBottom: '5rem' }}>
            {form.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.cover_image} alt="" style={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 14, marginBottom: '2rem' }} />
            )}
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem' }}>{form.title || 'Untitled'}</h1>
            {form.excerpt && <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>{form.excerpt}</p>}
            <div className="editorial-content prose-content" dangerouslySetInnerHTML={{ __html: form.content }} />
          </div>
        ) : (
          <div className="write-layout">
            {/* Left: settings */}
            <div className="write-sidebar">
              <div className="write-field">
                <label>Cover image URL</label>
                <input className="form-input" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://…" />
                {form.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.cover_image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                )}
              </div>
              <div className="write-field">
                <label>Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="write-field">
                <label>Tags (comma-separated)</label>
                <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="ai, research, opinion" />
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                  {['AI', 'tech', 'culture', 'health', 'business', 'climate', 'science', 'policy', 'media', 'society', 'education', 'opinion'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      style={{
                        fontSize: '0.62rem', padding: '2px 8px', cursor: 'pointer',
                        background: 'var(--surface-raised)', border: '1px solid var(--border)',
                        borderRadius: 4, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                      }}
                      onClick={() => {
                        const current = form.tags.split(',').map(t => t.trim()).filter(Boolean);
                        if (!current.includes(tag.toLowerCase())) {
                          setForm(f => ({ ...f, tags: [...current, tag.toLowerCase()].join(', ') }));
                        }
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="write-field">
                <label>Excerpt (shown in cards)</label>
                <textarea className="form-input" rows={3} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Brief description…" style={{ resize: 'vertical' }} />
                <div style={{ fontSize: '0.62rem', color: form.excerpt.length > 200 ? 'var(--red)' : 'var(--text-faint)', fontFamily: 'var(--font-mono)', textAlign: 'right', marginTop: 3 }}>
                  {form.excerpt.length}/200 chars
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                  Published
                </label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                  Featured (pinned to top)
                </label>
              </div>

              {/* Eral AI metadata fields */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#818cf8', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                  Eral metadata
                </div>
                <div className="write-field">
                  <label>Why Eral wrote this</label>
                  <textarea className="form-input" rows={2} value={form.trigger_reason} onChange={e => setForm(f => ({ ...f, trigger_reason: e.target.value }))} placeholder="Coverage of X spiked 3x in 12 hours across 7 sources…" style={{ resize: 'vertical', fontSize: '0.78rem' }} />
                </div>
                <div className="write-field">
                  <label>Methodology</label>
                  <textarea className="form-input" rows={2} value={form.methodology} onChange={e => setForm(f => ({ ...f, methodology: e.target.value }))} placeholder="Analyzed 14 sources, cross-referenced claims…" style={{ resize: 'vertical', fontSize: '0.78rem' }} />
                </div>
                <div className="write-field">
                  <label>Signals (label:type, …)</label>
                  <input className="form-input" value={form.signals} onChange={e => setForm(f => ({ ...f, signals: e.target.value }))} placeholder="Coverage spike:spike, Trending topic:trending" style={{ fontSize: '0.78rem' }} />
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>Types: trending, spike, pattern, editorial, source</div>
                </div>
                <div className="write-field">
                  <label>Sources cited (one per line: name | url | note)</label>
                  <textarea className="form-input" rows={4} value={form.sources_cited} onChange={e => setForm(f => ({ ...f, sources_cited: e.target.value }))} placeholder={'Reuters | https://reuters.com | Breaking coverage\nNature | https://nature.com | Research data'} style={{ resize: 'vertical', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }} />
                </div>
              </div>
              {form.id && (
                <button className="btn btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--error, #ef4444)', borderColor: 'var(--error, #ef4444)44', marginTop: '0.5rem' }} onClick={() => del(form.id!)}>
                  Delete post
                </button>
              )}
            </div>

            {/* Right: editor */}
            <div className="write-main">
              <input
                className="write-title-input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Post title…"
              />
              {/* Formatting toolbar */}
              <div className="write-toolbar">
                {[
                  { label: 'B', title: 'Bold', before: '<strong>', after: '</strong>' },
                  { label: 'I', title: 'Italic', before: '<em>', after: '</em>' },
                  { label: 'H2', title: 'Heading 2', before: '<h2>', after: '</h2>' },
                  { label: 'H3', title: 'Heading 3', before: '<h3>', after: '</h3>' },
                  { label: '¶', title: 'Paragraph', before: '<p>', after: '</p>' },
                  { label: '"', title: 'Blockquote', before: '<blockquote>', after: '</blockquote>' },
                  { label: '<>', title: 'Inline code', before: '<code>', after: '</code>' },
                  { label: '[ ]', title: 'Code block', before: '<pre><code>', after: '</code></pre>' },
                  { label: '—', title: 'Divider', before: '<hr />', after: '' },
                  { label: '🔗', title: 'Link', before: '<a href="URL">', after: '</a>', icon: <IcoLink size={12} /> },
                  { label: '🖼', title: 'Image', before: '<img src="URL" alt="', after: '" style="max-width:100%;border-radius:8px" />', icon: <IcoImage size={12} /> },
                  { label: 'UL', title: 'Bullet list', before: '<ul>\n  <li>', after: '</li>\n</ul>' },
                ].map(({ label, title, before, after, icon }: { label: string; title: string; before: string; after: string; icon?: React.ReactNode }) => (
                  <button
                    key={label}
                    type="button"
                    className="toolbar-btn"
                    title={title}
                    onMouseDown={e => { e.preventDefault(); insertHtml(before, after); }}
                  >
                    {icon ?? label}
                  </button>
                ))}
              </div>
              <textarea
                ref={bodyRef}
                className="write-body-input"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={`Write your post here. HTML is supported.\n\nTips:\n• Use the toolbar above for quick formatting\n• Ctrl/Cmd+B = Bold, Ctrl/Cmd+I = Italic, Ctrl/Cmd+K = Link\n• Use <h2> for section headings, <p> for paragraphs`}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                    if (e.key === 'b') { e.preventDefault(); insertHtml('<strong>', '</strong>'); }
                    if (e.key === 'i') { e.preventDefault(); insertHtml('<em>', '</em>'); }
                    if (e.key === 'k') { e.preventDefault(); insertHtml('<a href="URL">', '</a>'); }
                    if (e.key === 's') { e.preventDefault(); save(false); }
                  }
                }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', padding: '0.5rem 0', textAlign: 'right' }}>
                {form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} words · ~{Math.max(1, Math.ceil(form.content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200))} min read · By {author}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Post list view ────────────────────────────────────────────────────────────
  return (
    <div className="site-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
            Editorial
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
            Your posts, {author}
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(BLANK); setView('edit'); }}>
          + New post
        </button>
      </div>

      {!loadedPosts ? (
        <div style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Loading…</div>
      ) : posts.length === 0 ? (
        <div className="feed-empty">
          No posts yet. Hit <strong>New post</strong> to write your first article.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {posts.map(p => {
            const cat = CATEGORIES[p.category as keyof typeof CATEGORIES];
            return (
              <div key={p.id} className="write-post-row" onClick={() => editPost(p.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: cat?.color ?? 'var(--accent)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat?.label ?? p.category}</span>
                    <span style={{ fontSize: '0.62rem', background: p.published ? 'rgba(74,222,128,0.12)' : 'rgba(148,163,184,0.1)', color: p.published ? '#4ade80' : 'var(--text-faint)', border: `1px solid ${p.published ? 'rgba(74,222,128,0.25)' : 'var(--border)'}`, borderRadius: 4, padding: '1px 7px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                    {p.featured === 1 && <span className="tier1-badge">Featured</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {new Date(p.created_at).toLocaleDateString()} · {p.views} views
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {p.published === 1 && (
                    <a href={`/editorial/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: '0.72rem' }} onClick={e => e.stopPropagation()}>
                      View ↗
                    </a>
                  )}
                  <button className="btn btn-ghost" style={{ fontSize: '0.72rem' }} onClick={e => { e.stopPropagation(); del(p.id); }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
