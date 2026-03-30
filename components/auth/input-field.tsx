"use client"

import { InputHTMLAttributes, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
  error?: string
}

export function InputField({ label, icon, error, type = "text", id, className, ...props }: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 dark:text-gray-300 font-medium">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={inputType}
          className={`pl-10 ${isPassword ? 'pr-10' : ''} h-12 bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl ${className || ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}