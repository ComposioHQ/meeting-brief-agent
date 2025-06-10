'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  const handleClick = async () => {
    setLoading(true)
    setResult('')
    setShowReport(false)
    setError('')
    const res = await fetch('/api/meeting-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    })
    if (!res.ok) {
      setError('Please try again, there was an error')
      setLoading(false)
      return
    }
    const data = await res.json()
    setResult(data.report)
    setLoading(false)
    setTimeout(() => setShowReport(true), 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf8f2] font-sans" style={{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif'}}>
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="bg-gradient-to-b from-[#0db2ff] to-[#6dd5fa] rounded-3xl shadow-2xl px-10 py-14 w-full flex flex-col items-center relative" style={{backdropFilter: 'blur(0px)'}}>
          <h1 className="text-5xl font-semibold text-white mb-10 text-center tracking-tight drop-shadow-lg" style={{letterSpacing: '-0.02em'}}>Meeting Brief Agent, powered by Composio and Hubspot</h1>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your Composio API Key"
            className="mb-6 w-full max-w-md rounded-xl px-5 py-3 text-xl bg-white border border-[#0db2ff] focus:outline-none focus:ring-2 focus:ring-[#0db2ff] transition shadow placeholder:text-[#0db2ff]/80 placeholder:font-medium text-[#0db2ff]/80"
            autoComplete="off"
          />
          <button
            onClick={handleClick}
            className={`transition-all duration-200 bg-[#0db2ff] text-white text-2xl font-medium rounded-2xl py-4 px-14 shadow-xl hover:scale-105 hover:bg-[#009ee0] focus:outline-none focus:ring-4 focus:ring-[#a6e1fa]/40 active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={loading || !apiKey}
            style={{boxShadow: '0 8px 32px 0 rgba(13,178,255,0.18)'}}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></span>
                Generating Meeting Brief...
              </span>
            ) : (
              'Generate Meeting Brief'
            )}
          </button>
        </div>
        <div style={{ minHeight: 60 }}></div>
        {error && (
          <div className="w-full flex justify-center mb-6 animate-fadeinup" style={{animation: 'fadeinup 0.7s cubic-bezier(.23,1.01,.32,1)'}}>
            <div className="w-full max-w-2xl bg-red-100 border border-red-300 text-red-700 rounded-xl px-6 py-4 text-xl font-semibold text-center shadow">
              {error}
            </div>
          </div>
        )}
        {showReport && (
          <div
            className="w-full flex justify-center animate-fadeinup"
            style={{animation: 'fadeinup 0.7s cubic-bezier(.23,1.01,.32,1)'}}
          >
            <div
              className="glassmorphic-card w-full max-w-3xl p-12 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-xl bg-white/30 bg-clip-padding"
              style={{
                background: 'rgba(255,255,255,0.18)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                WebkitBackdropFilter: 'blur(18px)',
                backdropFilter: 'blur(18px)',
                marginTop: '-40px',
                marginBottom: '40px',
                transition: 'box-shadow 0.3s',
              }}
            >
              <div className="prose prose-2xl prose-blue max-w-none text-[#222]">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-6 text-[#0db2ff]" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-8 mb-4 text-[#0db2ff]" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-6 mb-3 text-[#0db2ff]" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-[#0db2ff] text-2xl" {...props} />,
                    li: ({node, ...props}) => <li className="mb-3 text-2xl leading-relaxed" {...props} />,
                    p: ({node, ...props}) => <p className="mb-5 leading-relaxed text-2xl" {...props} />,
                    code: ({node, ...props}) => <code className="bg-[#e0f7ff] px-2 py-1 rounded text-[#0db2ff] font-mono text-xl" {...props} />,
                    ul: ({node, ...props}) => <ul className="mb-5 pl-6" {...props} />,
                    ol: ({node, ...props}) => <ol className="mb-5 pl-6" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-2xl" {...props} />,
                    a: ({node, ...props}) => <a className="text-[#0db2ff] underline text-2xl hover:text-[#009ee0]" {...props} />,
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        <style jsx global>{`
          @keyframes fadeinup {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .glassmorphic-card {
            transition: box-shadow 0.3s, transform 0.3s;
          }
          .glassmorphic-card:hover {
            box-shadow: 0 12px 48px 0 rgba(13,178,255,0.25), 0 1.5px 8px 0 rgba(31,38,135,0.10);
            transform: translateY(-2px) scale(1.012);
          }
        `}</style>
      </div>
    </div>
  )
}
