"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  CreditCard, 
  ArrowUpDown, 
  PieChart, 
  Target, 
  Settings,
  FileText,
  Share2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    name: "Transfers",
    href: "/transfers", 
    icon: ArrowUpDown,
  },
  {
    name: "Insights",
    href: "/insights",
    icon: PieChart,
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: Target,
  },
  {
    name: "Import/Export",
    href: "/import-export",
    icon: FileText,
  },
  {
    name: "Sharing",
    href: "/sharing",
    icon: Share2,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo for mobile */}
      <div className="flex h-14 items-center border-b px-4 md:hidden">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="font-bold">Money Tracker</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-secondary"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Money Tracker v1.0
        </p>
      </div>
    </div>
  )
}