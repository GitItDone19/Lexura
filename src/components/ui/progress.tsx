"use client"

import * as React from "react"
import { cn } from "@/functions"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, animated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-full items-center justify-start rounded-full bg-white/10 p-[5px]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-[30px] rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(255,255,255,1)] transition-all duration-300",
            animated && "animate-progress-load"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
