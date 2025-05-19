
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background", // Reduced from h-10 to h-9
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "appearance-none",
          className
        )}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'textfield'
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
