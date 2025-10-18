import { Button } from "./button"
import { Card, CardContent } from "./card"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-6 text-muted-foreground">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}