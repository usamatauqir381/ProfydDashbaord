"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl">
      <CardHeader className="px-6 pt-8 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-gray-500 dark:text-gray-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {children}
        {footer && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  )
}