'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

type Step = 'loading' | 'verify' | 'code' | 'password' | 'success' | 'error'

export default function ClaimPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  
  const [step, setStep] = useState<Step>('loading')
  const [operatorName, setOperatorName] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [error, setError] = useState('')
  
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Verify token on mount
  useEffect(() => {
    verifyToken()
  }, [token])

  async function verifyToken() {
    try {
      const res = await fetch('/api/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimToken: token }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error)
        setStep('error')
        return
      }
      
      setOperatorName(data.operator.business_name)
      setMaskedEmail(data.email || '')
      setStep('code')
    } catch (err) {
      setError('Failed to verify claim link')
      setStep('error')
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }
    setStep('password')
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/claim/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          claimToken: token,
          verificationCode: code,
          password,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }
      
      setStep('success')
      setTimeout(() => {
        router.push(data.redirect || '/dashboard')
      }, 2000)
    } catch (err) {
      setError('Failed to create account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Cast Off</h1>
          <p className="text-gray-600 mt-2">Claim your operator page</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying your claim link...</p>
            </div>
          )}
          
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Claim</h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Go Home
              </button>
            </div>
          )}
          
          {step === 'code' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-teal-500 text-5xl mb-4">✉️</div>
                <h2 className="text-xl font-semibold text-gray-800">Verify Your Identity</h2>
                <p className="text-gray-600 mt-2">
                  We sent a verification code to <strong>{maskedEmail}</strong>
                </p>
              </div>
              
              <form onSubmit={handleVerifyCode}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition"
                >
                  Verify Code
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={verifyToken}
                    className="text-teal-600 hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </form>
            </div>
          )}
          
          {step === 'password' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-teal-500 text-5xl mb-4">🔐</div>
                <h2 className="text-xl font-semibold text-gray-800">Create Your Account</h2>
                <p className="text-gray-600 mt-2">
                  Set a password for <strong>{operatorName}</strong>
                </p>
              </div>
              
              <form onSubmit={handleCreateAccount}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>
          )}
          
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome!</h2>
              <p className="text-gray-600">
                Your account has been created. Redirecting to dashboard...
              </p>
            </div>
          )}
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-teal-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}
