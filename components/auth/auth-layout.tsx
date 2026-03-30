"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  leftContent?: {
    title: string
    description: string
    features?: string[]
    icon?: ReactNode
  }
}

export function AuthLayout({ children, title, subtitle, leftContent }: AuthLayoutProps) {
  const defaultFeatures = [
    "Real-time Analytics",
    "Team Collaboration",
    "Task Management",
    "Secure Platform"
  ]

  const features = leftContent?.features || defaultFeatures

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-100 via-purple-50 to-white dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950">
      {/* Left Side - Brand/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* World Map Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cpath fill='white' d='M400 50 L450 150 L550 150 L500 250 L550 350 L450 350 L400 450 L350 350 L250 350 L300 250 L250 150 L350 150 L400 50Z'/%3E%3C/svg%3E")`,
            backgroundSize: '400px',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Floating Avatars/Icons */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ x: -50, y: 100, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="absolute top-20 left-20 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-3xl">👤</span>
          </motion.div>
          <motion.div
            initial={{ x: 100, y: -50, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="absolute bottom-32 right-20 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-2xl">👥</span>
          </motion.div>
          <motion.div
            initial={{ x: -30, y: -80, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="absolute top-1/3 right-32 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-xl">⭐</span>
          </motion.div>
          <motion.div
            initial={{ x: 80, y: 50, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-40 left-32 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-2xl">📊</span>
          </motion.div>
          <motion.div
            initial={{ x: -60, y: -40, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 1 }}
            className="absolute top-40 right-40 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <span className="text-2xl">🎯</span>
          </motion.div>
        </div>
        
        {/* Content */}
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
              {leftContent?.icon || <span className="text-4xl">🚀</span>}
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-4">{leftContent?.title || title}</h1>
            <p className="text-xl text-white/90 mb-8 max-w-md">
              {leftContent?.description || subtitle}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-12">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
              {leftContent?.icon || <span className="text-2xl">🚀</span>}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="px-6 pt-8 pb-4">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white hidden lg:block">
                {title}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 hidden lg:block">
                {subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {children}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}