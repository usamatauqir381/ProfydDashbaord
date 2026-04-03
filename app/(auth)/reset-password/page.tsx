"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lock, AlertCircle, CheckCircle, Eye, EyeOff,
  KeyRound, Mail, ArrowLeft
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const validatePassword = (pass: string) => {
    setPasswordStrength({
      hasMinLength: pass.length >= 8,
      hasUpperCase: /[A-Z]/.test(pass),
      hasLowerCase: /[a-z]/.test(pass),
      hasNumber: /\d/.test(pass),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    });
  };

  const getPasswordStrengthScore = () => Object.values(passwordStrength).filter(Boolean).length;
  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };
  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  };

  async function safeFetch(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();

  let data: any = null;

  if (contentType.includes("application/json")) {
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Invalid JSON response from server");
    }
  } else {
    console.error("Non-JSON response from", url, rawText);
    throw new Error(`Server returned non-JSON response (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const data = await safeFetch("/api/auth/reset-password", { email });
      localStorage.setItem("reset_email", email);
      localStorage.setItem("reset_token", data.token);
      setStep("code");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (resetCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    const storedEmail = localStorage.getItem("reset_email");
    const token = localStorage.getItem("reset_token");

    if (!storedEmail || !token) {
      setError("No reset request found. Please request a new code.");
      setStep("email");
      setLoading(false);
      return;
    }

    try {
      const data = await safeFetch("/api/auth/verify-code", {
        email: storedEmail,
        code: resetCode,
        token
      });
      localStorage.setItem("reset_session_token", data.resetSessionToken);
      setStep("password");
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (getPasswordStrengthScore() < 3) {
      setError("Please choose a stronger password");
      return;
    }

    setLoading(true);
    const storedEmail = localStorage.getItem("reset_email");
    const resetSessionToken = localStorage.getItem("reset_session_token");

    if (!storedEmail || !resetSessionToken) {
      setError("Session expired. Please request a new reset.");
      setStep("email");
      setLoading(false);
      return;
    }

    try {
      await safeFetch("/api/auth/update-password", {
        email: storedEmail,
        newPassword: password,
        resetSessionToken
      });
      localStorage.removeItem("reset_email");
      localStorage.removeItem("reset_token");
      localStorage.removeItem("reset_session_token");
      setSuccess(true);
      setTimeout(() => router.push("/sign-in?passwordReset=true"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render functions (same as your existing, but using the above handlers)
  // I'll copy your existing JSX but ensure it uses these handlers
  // (Your existing renderStep is fine, just replace the handle functions with the ones above)

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendCode} className="space-y-5">
            {error && <AlertError message={error} />}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">We'll send a 6-digit verification code to this email</p>
            </div>
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        );
      case 'code':
        return (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            {error && <AlertError message={error} />}
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest h-12 rounded-xl"
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Code sent to {email}</p>
                {countdown > 0 ? (
                  <p className="text-xs text-gray-500">Resend in {countdown}s</p>
                ) : (
                  <button type="button" onClick={() => setStep('email')} className="text-xs text-indigo-600 hover:underline">
                    Resend Code
                  </button>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full h-12" disabled={loading || resetCode.length !== 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        );
      case 'password':
        return (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {error && <AlertError message={error} />}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10 h-12 rounded-xl"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Password strength:</span>
                    <span className={`font-medium ${getPasswordStrengthScore() <= 2 ? 'text-red-500' : getPasswordStrengthScore() <= 4 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1,2,3,4,5].map((level) => (
                      <div key={level} className={`h-full flex-1 rounded-full ${level <= getPasswordStrengthScore() ? getPasswordStrengthColor() : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}>✓ 8+ chars</span>
                    <span className={passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}>✓ Uppercase</span>
                    <span className={passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}>✓ Lowercase</span>
                    <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>✓ Number</span>
                    <span className={passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}>✓ Special</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10 h-12 rounded-xl"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-500">Passwords do not match</p>}
            </div>
            <Button type="submit" className="w-full h-12" disabled={loading || getPasswordStrengthScore() < 3 || password !== confirmPassword}>
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        );
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-8">
              <div className="p-3 bg-green-50 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Password Reset Successful!</h3>
              <p className="text-gray-500 mb-4">Redirecting to sign in...</p>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm mb-8">
              <KeyRound className="h-12 w-12" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4">Reset Password</h1>
            <p className="text-xl text-white/90 max-w-md">
              {step === 'email' && "Enter your email to receive a reset code"}
              {step === 'code' && "Enter the verification code sent to your email"}
              {step === 'password' && "Create a new strong password"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/sign-in" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sign In
            </Link>
          </div>
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">
              {step === 'email' && "Reset Password"}
              {step === 'code' && "Verify Code"}
              {step === 'password' && "New Password"}
            </h2>
          </div>
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-bold hidden lg:block">
                {step === 'email' && "Reset Password"}
                {step === 'code' && "Verify Code"}
                {step === 'password' && "New Password"}
              </CardTitle>
              <CardDescription className="hidden lg:block">
                {step === 'email' && "Enter your email to receive a reset code"}
                {step === 'code' && "Enter the 6-digit code sent to your email"}
                {step === 'password' && "Create a new secure password"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">{renderStep()}</CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function AlertError({ message }: { message: string }) {
  return (
    <Alert className="bg-red-50 border-red-200 text-red-600">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}