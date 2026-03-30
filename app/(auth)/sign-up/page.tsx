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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mail,
  Lock,
  User,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  Users,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { departments } from "@/lib/departments"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
    department: "",
    role: ""
  })

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  const validatePassword = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "password") {
      validatePassword(value)
    }
  }

  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length
  }

  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore()
    if (score <= 2) return "bg-red-500"
    if (score <= 4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }
    if (!formData.password) {
      setError("Password is required")
      return
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (getPasswordStrengthScore() < 3) {
      setError("Please choose a stronger password")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return
    }

    setLoading(true)

    try {
      await signUp({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        companyName: formData.companyName.trim(),
        department: formData.department as any,
        role: formData.role as any
      })
      
      setSuccess(true)
      setTimeout(() => {
        router.push("/sign-in?registered=true")
      }, 2000)
    } catch (error: any) {
      console.error("Sign up error:", error)
      
      if (error.message.includes("User already registered")) {
        setError("An account with this email already exists")
      } else {
        setError(error.message || "Failed to sign up. Please try again.")
      }
    } finally {
      setLoading(false)
    }
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
              <Users className="h-12 w-12" />
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4">Join Us Today</h1>
            <p className="text-xl text-white/90 mb-8 max-w-md">
              Create your account and start managing your business operations efficiently
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-12">
              {[
                "Free 14-day trial",
                "No credit card required",
                "Cancel anytime",
                "Enterprise features"
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join our platform today</p>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white hidden lg:block">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 hidden lg:block">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Alert className="bg-green-50 border-green-200 text-green-600 dark:bg-green-950/30">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Account created! Redirecting to sign in...
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300 font-medium">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="pl-10 h-11 border-gray-200 dark:border-gray-800 rounded-xl"
                        placeholder="John"
                        disabled={loading || success}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300 font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="h-11 border-gray-200 dark:border-gray-800 rounded-xl"
                      placeholder="Doe"
                      disabled={loading || success}
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-700 dark:text-gray-300 font-medium">
                    Company Name <span className="text-gray-400 text-sm">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      className="pl-10 h-11 border-gray-200 dark:border-gray-800 rounded-xl"
                      placeholder="Your Company"
                      disabled={loading || success}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10 h-11 border-gray-200 dark:border-gray-800 rounded-xl"
                      placeholder="name@company.com"
                      disabled={loading || success}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pl-10 pr-10 h-11 border-gray-200 dark:border-gray-800 rounded-xl"
                      placeholder="Create a strong password"
                      disabled={loading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1 h-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-full flex-1 rounded-full transition-colors ${
                              i < getPasswordStrengthScore() ? getPasswordStrengthColor() : "bg-gray-200 dark:bg-gray-800"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className={`${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                          ✓ 8+ chars
                        </span>
                        <span className={`${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                          ✓ Uppercase
                        </span>
                        <span className={`${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                          ✓ Lowercase
                        </span>
                        <span className={`${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                          ✓ Number
                        </span>
                        <span className={`${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                          ✓ Special
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 h-11 border-gray-200 dark:border-gray-800 rounded-xl"
                      placeholder="Confirm your password"
                      disabled={loading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Department & Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-gray-700 dark:text-gray-300 font-medium">
                      Department
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleChange("department", value)}
                      disabled={loading || success}
                    >
                      <SelectTrigger className="h-11 border-gray-200 dark:border-gray-800 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700 dark:text-gray-300 font-medium">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleChange("role", value)}
                      disabled={loading || success}
                    >
                      <SelectTrigger className="h-11 border-gray-200 dark:border-gray-800 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="team_lead">Team Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200"
                  disabled={loading || success}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="px-0 pt-6">
              <div className="text-sm text-center text-gray-500 dark:text-gray-400 w-full">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}