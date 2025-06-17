'use client'

import { useState, useEffect } from 'react'

interface ConnectionStatus {
  googledocs: 'ACTIVE' | 'INITIALIZING' | 'FAILED' | 'DISCONNECTED' | 'checking'
  googlecalendar: 'ACTIVE' | 'INITIALIZING' | 'FAILED' | 'DISCONNECTED' | 'checking'
}

interface ConnectionPanelProps {
  apiKey: string
}

export default function ConnectionPanel({ apiKey }: ConnectionPanelProps) {
  const [status, setStatus] = useState<ConnectionStatus>({
    googledocs: 'DISCONNECTED',
    googlecalendar: 'DISCONNECTED',
  })
  const [promptRefresh, setPromptRefresh] = useState<{ [k in keyof ConnectionStatus]?: boolean }>({})

  const handleConnect = async (service: keyof ConnectionStatus) => {
    if (!apiKey) {
      alert('Please enter your Composio API key first')
      return
    }
    setStatus(prev => ({ ...prev, [service]: 'INITIALIZING' }))
    setPromptRefresh(prev => ({ ...prev, [service]: true }))
    try {
      console.log(`Starting ${service} connection...`)
      const fetchStart = Date.now()
      const response = await fetch(`/api/connection/${service}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      })
      const fetchTime = Date.now() - fetchStart
      console.log(`${service} API call took ${fetchTime}ms`)
      const data = await response.json()
      if (data.redirectUrl) {
        console.log(`Opening ${service} OAuth window...`)
        const popup = window.open(data.redirectUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes')
        if (popup) {
          popup.focus()
        }
      } else if (data.error) {
        console.error(`${service} connection error:`, data.error)
        setStatus(prev => ({ ...prev, [service]: 'FAILED' }))
        alert(data.error)
      }
    } catch (error) {
      console.error(`Error connecting to ${service}:`, error)
      setStatus(prev => ({ ...prev, [service]: 'FAILED' }))
      alert(`Failed to connect to ${service}`)
    }
  }

  const handleCheckStatus = async (service: keyof ConnectionStatus) => {
    if (!apiKey) {
      alert('Please enter your Composio API key first')
      return
    }
    console.log(`Checking ${service} status...`)
    setStatus(prev => ({ ...prev, [service]: 'checking' }))
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      const response = await fetch(`/api/connection/${service}/status?apiKey=${encodeURIComponent(apiKey)}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      const data = await response.json()
      console.log(`${service} status response:`, data)
      if (data.error) {
        console.error(`${service} status error:`, data.error)
        setStatus(prev => ({ ...prev, [service]: 'FAILED' }))
        return
      }
      const newStatus = data.status || (data.connected ? 'ACTIVE' : 'DISCONNECTED')
      console.log(`Setting ${service} status to:`, newStatus)
      setStatus(prev => ({ 
        ...prev, 
        [service]: newStatus
      }))
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`${service} status check timed out`)
        setStatus(prev => ({ ...prev, [service]: 'FAILED' }))
      } else {
        console.error(`Error checking ${service} status:`, error)
        setStatus(prev => ({ ...prev, [service]: 'DISCONNECTED' }))
      }
    }
  }

  const ServiceIcon = ({ service, size = "w-5 h-5" }: { service: string, size?: string }) => {
    switch (service) {
      case 'googledocs':
        return (
          <svg className={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z" />
          </svg>
        )
      case 'googlecalendar':
        return (
          <svg className={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
          </svg>
        )
      default:
        return null
    }
  }

  const RefreshIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  )

  const services = [
    { key: 'googledocs', name: 'Google Docs' },
    { key: 'googlecalendar', name: 'Google Calendar' }
  ] as const

  return (
    <div className="w-full max-w-md mt-6">
      <div className="w-full border-b border-white/40 mb-6" />
      <div className="w-full flex flex-col gap-4">
        {services.map(({ key, name }, idx) => (
          <div key={key} className={`flex flex-col items-stretch gap-1 transition-all${key === 'googlecalendar' ? ' pb-6' : ''}`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleConnect(key)}
                className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-2xl font-medium transition-all duration-200 shadow-md bg-white/80 hover:bg-white/90 border border-white/40 text-[#0db2ff] hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0db2ff]/30 ${
                  status[key] === 'ACTIVE'
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:from-green-300 hover:to-green-700'
                    : status[key] === 'INITIALIZING'
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-800 shadow-lg'
                    : status[key] === 'checking'
                    ? 'bg-gradient-to-r from-blue-100 to-blue-300 text-blue-800 shadow-lg'
                    : status[key] === 'FAILED'
                    ? 'bg-gradient-to-r from-red-100 to-red-400 text-red-800 shadow-lg'
                    : ''
                }`}
                disabled={status[key] === 'INITIALIZING' || status[key] === 'checking'}
              >
                <ServiceIcon service={key} />
                <span className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  {status[key] === 'ACTIVE' ? `${name} Connected` :
                    status[key] === 'INITIALIZING' ? (
                      <>
                        Connecting...Click Refresh
                        <svg className="w-4 h-4 animate-spin text-yellow-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      </>
                    ) :
                    status[key] === 'checking' ? (
                      <>
                        Refreshing...
                        <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      </>
                    ) :
                    status[key] === 'FAILED' ? `${name} Failed` :
                    `Connect ${name}`}
                </span>
                {status[key] === 'ACTIVE' && (
                  <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse ml-2" />
                )}
              </button>
              <button
                onClick={() => handleCheckStatus(key)}
                disabled={status[key] === 'checking'}
                className="p-3 rounded-2xl transition-all duration-200 bg-white/70 hover:bg-white/90 border border-white/40 text-[#0db2ff] shadow-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0db2ff]/30"
              >
                <div className={status[key] === 'checking' ? 'animate-spin' : ''}>
                  <RefreshIcon />
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 