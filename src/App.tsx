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
  'CAATSA yaptırımları nedir?',
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
      const response = await fetch('/API/ask-turkish-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text.trim() })
      });

      const data = await response.json();
      console.log("Sunucudan gelen cevap:", data);

      if (data && data.text) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: data.text, time: now() }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: 'Sistemde ufak bir temassızlık oldu abi, tekrar dener misin?', time: now() }]);
      }
    } catch (error) {
      console.error("Hata:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: 'Bağlantı kurulamadı, interneti veya API anahtarını kontrol et.', time: now() }]);
    } finally {
      setLoading(false);
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
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"Outfit", "Nunito", "Segoe UI", system-ui, sans-serif', background: '#fff', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? '260px' : '0px', minWidth: sidebarOpen ? '260px' : '0px', height: '100%', background: 'linear-gradient(180deg, #B71C1C 0%, #C62828 18%, #E53935 42%, #EF9A9A 72%, #FFF5F5 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'min-width 0.28s ease, width 0.28s ease', position: 'relative', zIndex: 10 }}>
        <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', color: 'rgba(255,255,255,0.8)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GeminiStar size={22} />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '17px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Türkiş AI</span>
          </div>
        </div>

        <div style={{ padding: '0 12px 16px' }}>
          <button onClick={() => { setMessages([]); setActiveHistory(null) }} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', backdropFilter: 'blur(8px)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Yeni Sohbet
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {HISTORY.map(group => (
            <div key={group.id} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', padding: '0 4px' }}>{group.label}</div>
              {group.items.map(item => (
                <button key={item} onClick={() => { setActiveHistory(item); sendMessage(item); }} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '10px', border: 'none', background: activeHistory === item ? 'rgba(255,255,255,0.22)' : 'transparent', color: activeHistory === item ? '#fff' : 'rgba(255,255,255,0.82)', fontSize: '13.5px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '2px' }}>
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>K</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Kullanıcı</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11.5px' }}>Ücretsiz Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>
        <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', color: '#555' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          )}
          <span style={{ fontWeight: 800, fontSize: '17px', color: '#1a1a1a' }}>Türkiş AI</span>
          <div style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', background: 'linear-gradient(135deg, #FFCDD2, #EF9A9A)', fontSize: '12px', fontWeight: 600, color: '#B71C1C' }}>Türkiş AI · Pro</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          {isEmpty ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', padding: '0 24px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFCDD2 0%, #EF9A9A 60%, #E53935 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(198,40,40,0.2)' }}>
                <GeminiStar size={44} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>Merhaba! Ben Türkiş AI</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '520px' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{ padding: '10px 18px', borderRadius: '24px', border: '1.5px solid rgba(198,40,40,0.2)', background: 'rgba(255,205,210,0.18)', color: '#B71C1C', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '85%', padding: '13px 18px', borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '6px 20px 20px 20px', background: msg.role === 'user' ? 'linear-gradient(135deg, #C62828 0%, #E53935 100%)' : '#F8F9FA', color: msg.role === 'user' ? '#fff' : '#1a1a1a', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && <div style={{ color: '#888' }}>Türkiş AI yazıyor...</div>}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: '10px', background: '#F8F9FA', borderRadius: '20px', padding: '10px 18px' }}>
            <textarea ref={textareaRef} value={input} onChange={handleTextarea} onKeyDown={handleKey} placeholder="Soru sor..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontSize: '15px' }} />
            <button onClick={() => sendMessage(input)} style={{ background: '#C62828', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer' }}>Gönder</button>
          </div>
        </div>
      </div>
      
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>
    </div>
  )
}