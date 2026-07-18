import { useState, useRef, useEffect } from 'react'

function GeminiStar({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B59B6" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <path d="M28 4C28 4 30.5 20 44 28C30.5 36 28 52 28 52C28 52 25.5 36 12 28C25.5 20 28 4 28 4Z" fill="url(#g1)" />
    </svg>
  )
}

function GeminiStarSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 56 56" fill="none">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B59B6" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <path d="M28 4C28 4 30.5 20 44 28C30.5 36 28 52 28 52C28 52 25.5 36 12 28C25.5 20 28 4 28 4Z" fill="url(#g2)" />
    </svg>
  )
}

type Message = {
  id: number
  role: 'user' | 'ai'
  text: string
  time: string
}

const SUGGESTIONS = [
  'ABD-İran savaşı son durum?',
  'ipe un sermek deyimini açıkla',
  'CAATSA yaptırımları  nedir?',
  'LGS 2026 sınav sonuçları açıklandı mı?',
]

function now() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

const HISTORY = [
  { id: 1, label: 'Bugün', items: ['React hooks nasıl çalışır?', 'TypeScript generic tipler'] },
  { id: 2, label: 'Dün', items: ['Yapay zeka tarihi', 'CSS grid vs flexbox', 'Docker kurulumu'] },
  { id: 3, label: 'Bu Hafta', items: ['Python liste comprehension', 'REST API tasarımı'] },
]

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeHistory, setActiveHistory] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim(), time: now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const response = await fetch('/api/ask-turkish-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text.trim() })
      })
      const data = await response.json()
      
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        const aiReply = data.candidates[0].content.parts[0].text
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: aiReply, time: now() }])
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: 'Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?', time: now() }])
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: 'Bağlantı kurulamadı, interneti veya API anahtarını kontrol et.', time: now() }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const isEmpty = messages.length === 0

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: '"Outfit", "Nunito", "Segoe UI", system-ui, sans-serif',
      background: '#fff',
      overflow: 'hidden',
    }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '260px' : '0px',
        minWidth: sidebarOpen ? '260px' : '0px',
        height: '100%',
        background: 'linear-gradient(180deg, #B71C1C 0%, #C62828 18%, #E53935 42%, #EF9A9A 72%, #FFF5F5 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'min-width 0.28s ease, width 0.28s ease',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', color: 'rgba(255,255,255,0.8)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GeminiStar size={22} />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '17px', letterSpacing: '0.5px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Türkiş AI</span>
          </div>
        </div>

        {/* New chat button */}
        <div style={{ padding: '0 12px 16px' }}>
          <button
            onClick={() => { setMessages([]); setActiveHistory(null) }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1.5px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yeni Sohbet
          </button>
        </div>

        {/* History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {HISTORY.map(group => (
            <div key={group.id} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', padding: '0 4px', whiteSpace: 'nowrap' }}>
                {group.label}
              </div>
              {group.items.map(item => (
                <button
                  key={item}
                  onClick={() => { setActiveHistory(item); sendMessage(item); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeHistory === item ? 'rgba(255,255,255,0.22)' : 'transparent',
                    color: activeHistory === item ? '#fff' : 'rgba(255,255,255,0.82)',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    marginBottom: '2px',
                    transition: 'background 0.14s',
                  }}
                  onMouseOver={e => { if (activeHistory !== item) e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                  onMouseOut={e => { if (activeHistory !== item) e.currentTarget.style.background = 'transparent' }}
                >
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
              K
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Kullanıcı</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11.5px', whiteSpace: 'nowrap' }}>Ücretsiz Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          flexShrink: 0,
        }}>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', color: '#555' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!sidebarOpen && <GeminiStar size={22} />}
            <span style={{ fontWeight: 800, fontSize: '17px', color: '#1a1a1a', letterSpacing: '0.4px', textTransform: !sidebarOpen ? 'uppercase' : 'none' }}>
              {!sidebarOpen ? 'Türkiş AI' : 'Sohbet'}
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #FFCDD2, #EF9A9A)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#B71C1C',
            }}>
              Türkiş AI · Pro
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          {isEmpty ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', padding: '0 24px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '24px',
                background: 'linear-gradient(135deg, #FFCDD2 0%, #EF9A9A 60%, #E53935 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(198,40,40,0.2)',
              }}>
                <GeminiStar size={44} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  Merhaba! Ben Türkiş AI, size nasıl yardımcı olabilirim?
                </h2>
                <p style={{ color: '#888', fontSize: '15px', margin: 0 }}>
                  Bir şeyler sorun, deyimlerin anlamlarını eğlenceli örneklerle öğrenin.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '520px' }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '24px',
                      border: '1.5px solid rgba(198,40,40,0.2)',
                      background: 'rgba(255,205,210,0.18)',
                      color: '#B71C1C',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,205,210,0.38)'; e.currentTarget.style.borderColor = 'rgba(198,40,40,0.4)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,205,210,0.18)'; e.currentTarget.style.borderColor = 'rgba(198,40,40,0.2)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'ai' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFCDD2, #EF9A9A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GeminiStarSmall />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#B71C1C', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Türkiş AI</span>
                    </div>
                  )}
                  <div style={{
                    maxWidth: '85%',
                    padding: '13px 18px',
                    borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '6px 20px 20px 20px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #C62828 0%, #E53935 100%)'
                      : '#F8F9FA',
                    color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    boxShadow: msg.role === 'user' ? '0 4px 16px rgba(198,40,40,0.28)' : '0 1px 4px rgba(0,0,0,0.06)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '11px', color: '#bbb', padding: '0 4px' }}>{msg.time}</span>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFCDD2, #EF9A9A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GeminiStarSmall />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', padding: '12px 16px', background: '#F8F9FA', borderRadius: '6px 20px 20px 20px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#C62828',
                        animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
              background: '#F8F9FA',
              borderRadius: '20px',
              padding: '10px 12px 10px 18px',
              border: '1.5px solid rgba(0,0,0,0.09)',
              transition: 'border-color 0.18s, box-shadow 0.18s',
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextarea}
                onKeyDown={handleKey}
                placeholder="Türkiş AI'ya bir şey sorun..."
                rows={1}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  color: '#1a1a1a',
                  fontFamily: 'inherit',
                  resize: 'none',
                  lineHeight: 1.55,
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: 'none',
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #C62828, #E53935)'
                    : 'rgba(0,0,0,0.08)',
                  color: input.trim() && !loading ? '#fff' : '#aaa',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.18s',
                  boxShadow: input.trim() && !loading ? '0 4px 12px rgba(198,40,40,0.32)' : 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#bbb', marginTop: '10px', marginBottom: 0 }}>
              Türkiş AI yanıt verirken hata yapabilir. Önemli bilgileri doğrulayın.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
      `}</style>
    </div>
  )
}