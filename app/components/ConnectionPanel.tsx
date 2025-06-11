'use client'

import { useState } from 'react'

interface ConnectionStatus {
  hubspot: 'ACTIVE' | 'INITIALIZING' | 'FAILED' | 'DISCONNECTED' | 'checking'
  googlecalendar: 'ACTIVE' | 'INITIALIZING' | 'FAILED' | 'DISCONNECTED' | 'checking'
  apollo: 'ACTIVE' | 'INITIALIZING' | 'FAILED' | 'DISCONNECTED' | 'checking'
}

interface ConnectionPanelProps {
  apiKey: string
}

export default function ConnectionPanel({ apiKey }: ConnectionPanelProps) {
  const [status, setStatus] = useState<ConnectionStatus>({
    hubspot: 'DISCONNECTED',
    googlecalendar: 'DISCONNECTED',
    apollo: 'DISCONNECTED'
  })
  
  const [apolloApiKey, setApolloApiKey] = useState('')
  const [showApolloInput, setShowApolloInput] = useState(false)
  const [promptRefresh, setPromptRefresh] = useState<{ [k in keyof ConnectionStatus]?: boolean }>({})

  const handleConnect = async (service: keyof ConnectionStatus) => {
    if (service === 'apollo') {
      setShowApolloInput(true)
      return
    }
    
    if (!apiKey) {
      alert('Please enter your Composio API key first')
      return
    }
    
    setStatus(prev => ({ ...prev, [service]: 'INITIALIZING' }))
    setPromptRefresh(prev => ({ ...prev, [service]: true }))
    
    try {
      const response = await fetch(`/api/connection/${service}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      })
      const data = await response.json()
      
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank')
      } else if (data.error) {
        alert(data.error)
      }
    } catch (error) {
      console.error(`Error connecting to ${service}:`, error)
      alert(`Failed to connect to ${service}`)
    }
  }

  const handleCheckStatus = async (service: keyof ConnectionStatus) => {
    if (service === 'apollo') return
    if (!apiKey) {
      alert('Please enter your Composio API key first')
      return
    }
    
    console.log(`Checking ${service} status...`)
    setStatus(prev => ({ ...prev, [service]: 'checking' }))
    
    try {
      const response = await fetch(`/api/connection/${service}/status?apiKey=${encodeURIComponent(apiKey)}`)
      const data = await response.json()
      console.log(`${service} status response:`, data)
      
      const newStatus = data.status || (data.connected ? 'ACTIVE' : 'DISCONNECTED')
      console.log(`Setting ${service} status to:`, newStatus)
      
      setStatus(prev => ({ 
        ...prev, 
        [service]: newStatus
      }))
    } catch (error) {
      console.error(`Error checking ${service} status:`, error)
      setStatus(prev => ({ ...prev, [service]: 'DISCONNECTED' }))
    }
  }

  const handleApolloConnect = async () => {
    if (!apolloApiKey) {
      alert('Please enter your Apollo API key')
      return
    }

    if (!apiKey) {
      alert('Please enter your Composio API key first')
      return
    }

    try {
      setStatus(prev => ({ ...prev, apollo: 'INITIALIZING' }))
      
      const response = await fetch('/api/connection/apollo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          apiKey: apiKey,
          apolloApiKey: apolloApiKey 
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.status === 'connected') {
        setShowApolloInput(false)
        setApolloApiKey('')
        setStatus(prev => ({ ...prev, apollo: 'ACTIVE' }))
      } else {
        setStatus(prev => ({ ...prev, apollo: 'FAILED' }))
        alert(data.error || 'Failed to connect to Apollo')
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, apollo: 'FAILED' }))
      alert('Failed to connect to Apollo')
    }
  }

  const ServiceIcon = ({ service, size = "w-5 h-5" }: { service: string, size?: string }) => {
    switch (service) {
      case 'hubspot':
        return (
          <svg className={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.164 7.931V4.5a1.5 1.5 0 0 0-3 0v3.431a3.001 3.001 0 1 0 3 0zM12 14.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5-2.085V8.086a3.001 3.001 0 1 0-9 0v4.329a3.001 3.001 0 1 0 1.5 0V8.086a1.5 1.5 0 0 1 3 0v4.329a3.001 3.001 0 1 0 4.5 0z"/>
          </svg>
        )
      case 'googlecalendar':
        return (
          <svg className={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
          </svg>
        )
      case 'apollo':
        return (
          <svg className={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
    { key: 'hubspot', name: 'HubSpot' },
    { key: 'googlecalendar', name: 'Google Calendar' },
    { key: 'apollo', name: 'Apollo' }
  ] as const

  return (
    <div className="w-full max-w-md mt-6">
      {showApolloInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-white/20">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Connect Apollo</h3>
            <input
              type="password"
              value={apolloApiKey}
              onChange={(e) => setApolloApiKey(e.target.value)}
              placeholder="Enter your Apollo API Key"
              className="w-full rounded-xl px-4 py-3 text-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0db2ff] transition text-blue-600"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowApolloInput(false)}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApolloConnect}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-[#0db2ff] text-white hover:bg-[#009ee0] transition"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
        <div className="w-full border-b border-white/40 mb-6" />
        <div className="w-full flex flex-col gap-4">
          {services.map(({ key, name }, idx) => (
            <div key={key} className={`flex flex-col items-stretch gap-1 transition-all ${idx === 2 ? 'pb-8' : ''}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleConnect(key)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-2xl font-medium transition-all duration-200 shadow-md bg-white/80 hover:bg-white/90 border border-white/40 text-[#0db2ff] hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0db2ff]/30 ${
                    status[key] === 'ACTIVE'
                      ? 'bg-gradient-to-r from-[#a6e1fa] to-[#0db2ff] text-white shadow-lg hover:from-[#b8e6ff] hover:to-[#0db2ff]'
                      : status[key] === 'INITIALIZING'
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-800 shadow-lg'
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
                      status[key] === 'FAILED' ? `${name} Failed` :
                      `Connect ${name}`}
                  </span>
                  {status[key] === 'ACTIVE' && (
                    <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse ml-2" />
                  )}
                </button>
                <button
                  onClick={() => handleCheckStatus(key)}
                  disabled={status[key] === 'checking' || key === 'apollo'}
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