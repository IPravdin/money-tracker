import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function ResponsiveContainer({ 
  children, 
  className, 
  size = "lg" 
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full"
  }

  return (
    <div className={cn(
      "mx-auto w-full px-4 sm:px-6 lg:px-8",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, md: 2, lg: 3 }
}: ResponsiveGridProps) {
  const gridClasses = []
  
  if (cols.default) gridClasses.push(`grid-cols-${cols.default}`)
  if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`)

  return (
    <div className={cn(
      "grid gap-4",
      ...gridClasses,
      className
    )}>
      {children}
    </div>
  )
}