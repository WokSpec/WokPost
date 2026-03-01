'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function EralCompanion() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/eral/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          product: 'wokpost',
        }),
      });
      const data = await res.json() as { reply?: string; message?: string; error?: string };
      const reply = data.reply ?? data.message ?? (data.error ? `Error: ${data.error}` : 'No response received.');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to reach Eral. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickAction(action: 'write' | 'improve' | 'summarize') {
    if (!session) return;
    const prompts: Record<typeof action, string> = {
      write: 'Help me write a WokPost about: ',
      improve: 'Improve this post: ',
      summarize: 'Summarize this in 3 bullet points: ',
    };
    setInput(prompts[action]);
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open Eral AI assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#7c3aed',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(124,58,237,0.45)',
          zIndex: 9999,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 32px rgba(124,58,237,0.6)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(124,58,237,0.45)';
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" fill="white" stroke="none" />
            <path d="M19 15l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8L19 15z" fill="white" stroke="none" />
          </svg>
        )}
      </button>

      {/* Slide-up panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: '360px',
            height: '520px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
            zIndex: 9998,
            animation: 'eralSlideUp 0.2s ease-out',
          }}
        >
          <style>{`
            @keyframes eralSlideUp {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #1e1e1e',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
                  <path d="M19 15l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8L19 15z" />
                </svg>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', lineHeight: 1.2 }}>Eral</div>
                <div style={{ color: '#7c3aed', fontSize: '11px', lineHeight: 1.2 }}>WokSpec AI</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Eral"
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {status === 'unauthenticated' ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '10px',
                color: '#666',
                textAlign: 'center',
                fontSize: '14px',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Sign in to use Eral</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                color: '#555',
                textAlign: 'center',
                fontSize: '13px',
                padding: '20px',
              }}>
                <div style={{ color: '#7c3aed', fontSize: '28px', marginBottom: '4px' }}>✦</div>
                <div style={{ color: '#ccc', fontWeight: 500, fontSize: '14px' }}>
                  Hey{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
                </div>
                <div>Ask me anything or use a quick action below.</div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.role === 'user' ? '#7c3aed' : '#1a1a1a',
                  color: '#fff',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '9px 13px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  border: msg.role === 'assistant' ? '1px solid #252525' : 'none',
                }}>
                  {msg.content}
                </div>
              ))
            )}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#1a1a1a',
                border: '1px solid #252525',
                borderRadius: '14px 14px 14px 4px',
                padding: '10px 14px',
                display: 'flex',
                gap: '5px',
                alignItems: 'center',
              }}>
                {[0, 1, 2].map(n => (
                  <div key={n} style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#7c3aed',
                    animation: `eralPulse 1.2s ease-in-out ${n * 0.2}s infinite`,
                  }} />
                ))}
                <style>{`
                  @keyframes eralPulse {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1); }
                  }
                `}</style>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {status === 'authenticated' && (
            <div style={{
              display: 'flex',
              gap: '6px',
              padding: '6px 12px',
              borderTop: '1px solid #1a1a1a',
              flexShrink: 0,
              overflowX: 'auto',
            }}>
              {([
                { key: 'write', label: '✍️ Write post' },
                { key: 'improve', label: '✨ Improve' },
                { key: 'summarize', label: '📝 Summarize' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleQuickAction(key)}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '20px',
                    color: '#ccc',
                    fontSize: '11.5px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#7c3aed';
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a';
                    (e.currentTarget as HTMLButtonElement).style.color = '#ccc';
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div style={{
            padding: '10px 12px 12px',
            borderTop: '1px solid #1a1a1a',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && status === 'authenticated') {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={status === 'unauthenticated' ? 'Sign in to chat…' : 'Ask Eral anything…'}
              disabled={status !== 'authenticated' || loading}
              rows={1}
              style={{
                flex: 1,
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                padding: '9px 12px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.4',
                maxHeight: '96px',
                overflowY: 'auto',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={status !== 'authenticated' || loading || !input.trim()}
              aria-label="Send message"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: status === 'authenticated' && input.trim() ? '#7c3aed' : '#1a1a1a',
                border: '1px solid #2a2a2a',
                cursor: status === 'authenticated' && input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
