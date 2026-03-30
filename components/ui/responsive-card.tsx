// components/ui/responsive-card.tsx
import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ResponsiveCardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  action?: ReactNode
}

export function ResponsiveCard({
  title,
  description,
  children,
  className,
  contentClassName,
  action
}: ResponsiveCardProps) {
  return (
    <Card className={cn("overflow-hidden card-hover", className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-4 lg:p-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}