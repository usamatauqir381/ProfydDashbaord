"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  Eye, 
  EyeOff,
  LogIn,
  ArrowRight,
  Briefcase,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [generatedCode, setGeneratedCode] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError("")
  
  if (!email.trim()) {
    setError("Email is required")
    return
  }
  if (!password) {
    setError("Password is required")
    return
  }

  setLoading(true)

  try {
    await signIn(email.trim(), password)
    // ✅ Redirect to generic dashboard – middleware will forward to /dashboard/:department
    router.push("/dashboard")
  } catch (error: any) {
    console.error("Sign in error:", error)
    if (error.message.includes("Invalid login credentials")) {
      setError("Invalid email or password. Please try again.")
    } else if (error.message.includes("Email not confirmed")) {
      setError("Please verify your email address before signing in.")
    } else {
      setError(error.message || "Failed to sign in. Please try again.")
    }
  } finally {
    setLoading(false)
  }
}

  const handleSendResetCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError("")

    if (!resetEmail) {
      setResetError("Email is required")
      setResetLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      setResetError("Please enter a valid email address")
      setResetLoading(false)
      return
    }

    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedCode(code)
      
      // Store in localStorage for verification
      localStorage.setItem('reset_email', resetEmail)
      localStorage.setItem('reset_code', code)
      localStorage.setItem('reset_expires', (Date.now() + 15 * 60 * 1000).toString())
      
      // Show alert with code (in production, this would be emailed)
      alert(`Your verification code is: ${code}\n\n(This is a demo - in production this would be emailed to you)`)
      
      setResetStep('code')
      setCountdown(60)
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (error: any) {
      console.error("Reset password error:", error)
      setResetError(error.message || "Failed to send reset code. Please try again.")
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError("")

    if (resetCode.length !== 6) {
      setResetError("Please enter a valid 6-digit code")
      setResetLoading(false)
      return
    }

    const storedCode = localStorage.getItem('reset_code')
    const storedEmail = localStorage.getItem('reset_email')
    const storedExpires = localStorage.getItem('reset_expires')
    
    if (!storedCode || !storedEmail || !storedExpires) {
      setResetError("No reset request found. Please request a new code.")
      setResetStep('email')
      setResetLoading(false)
      return
    }
    
    if (Date.now() > parseInt(storedExpires)) {
      setResetError("Code has expired. Please request a new code.")
      setResetStep('email')
      setResetLoading(false)
      return
    }
    
    if (resetCode !== storedCode) {
      setResetError("Invalid code. Please try again.")
      setResetLoading(false)
      return
    }
    
    if (resetEmail !== storedEmail) {
      setResetError("Email mismatch. Please request a new code.")
      setResetStep('email')
      setResetLoading(false)
      return
    }
    
    setResetStep('password')
    setResetLoading(false)
  }

  const handleSetNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setResetLoading(true)
  setResetError("")

  if (newPassword !== confirmPassword) {
    setResetError("Passwords do not match")
    setResetLoading(false)
    return
  }

  if (newPassword.length < 8) {
    setResetError("Password must be at least 8 characters")
    setResetLoading(false)
    return
  }

  try {
    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: resetEmail,
        newPassword: newPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update password')
    }
    
    localStorage.removeItem('reset_email')
    localStorage.removeItem('reset_code')
    localStorage.removeItem('reset_expires')
    
    setResetSuccess(true)
    setTimeout(() => {
      setShowResetDialog(false)
      setResetStep('email')
      setResetEmail("")
      setResetCode("")
      setNewPassword("")
      setConfirmPassword("")
      setGeneratedCode("")
      setResetSuccess(false)
      router.push('/sign-in?passwordReset=true')
    }, 2000)
    
  } catch (error: any) {
    setResetError(error.message || "Failed to reset password. Please try again.")
  } finally {
    setResetLoading(false)
  }
}

  const resetDialog = () => {
    return (
      <Card className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            {resetStep === 'email' && 'Reset Password'}
            {resetStep === 'code' && 'Enter Verification Code'}
            {resetStep === 'password' && 'Create New Password'}
          </CardTitle>
          <CardDescription>
            {resetStep === 'email' && 'Enter your email to receive a reset code'}
            {resetStep === 'code' && `Enter the 6-digit code sent to ${resetEmail}`}
            {resetStep === 'password' && 'Enter your new password below'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetSuccess && resetStep === 'email' && (
            <Alert className="mb-4 bg-green-50 border-green-200 text-green-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Reset code sent! Check your email.
              </AlertDescription>
            </Alert>
          )}

          {resetError && (
            <Alert className="mb-4 bg-red-50 border-red-200 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{resetError}</AlertDescription>
            </Alert>
          )}

          {resetStep === 'email' && (
            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResetDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {resetLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </div>
            </form>
          )}

          {resetStep === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {generatedCode && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-600">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Your verification code:</strong> {generatedCode}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-code">Verification Code</Label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest h-12"
                  maxLength={6}
                  required
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Code sent to {resetEmail}
                  </p>
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-500">
                      Resend in {countdown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResetStep('email')}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetStep('email')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading || resetCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {resetLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </form>
          )}

          {resetStep === 'password' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetStep('code')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading || !newPassword || !confirmPassword}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Left Side - Brand/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm mb-8"
            >
              <Briefcase className="h-12 w-12" />
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-white/90 mb-8 max-w-md">
              Sign in to access your dashboard and manage your business operations
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-12">
              {[
                "Real-time Analytics",
                "Team Collaboration",
                "Task Management",
                "Secure Platform"
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-pattern)" />
          </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white hidden lg:block">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 hidden lg:block">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Alert className="bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowResetDialog(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-800 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="px-0 pt-6">
              <div className="text-sm text-center text-gray-500 dark:text-gray-400 w-full">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold">
                  Create account
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Reset Password Dialog */}
      {showResetDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowResetDialog(false)
            setResetStep('email')
            setResetError("")
            setResetSuccess(false)
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {resetDialog()}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}