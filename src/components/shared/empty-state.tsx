"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        {/* Icon container with outlined green border */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl border-2 border-primary/30 bg-primary/5 text-primary">
          <span className="w-10 h-10 flex items-center justify-center [&>svg]:w-10 [&>svg]:h-10">
            {icon}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-foreground">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Optional CTA */}
        {action && (
          <Button
            onClick={action.onClick}
            className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
