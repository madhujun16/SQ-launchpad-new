import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary brand actions - main CTAs (green theme)
        default: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200",
        primary: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200",
        
        // Secondary actions - supporting/general actions
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
        outline: "border border-gray-300 bg-background text-gray-700 hover:bg-gray-50 hover:border-gray-400",
        
        // Semantic actions based on UX best practices
        success: "bg-green-600 hover:bg-green-700 text-white shadow-md",
        approved: "bg-green-600 hover:bg-green-700 text-white shadow-md",
        
        // Destructive actions - critical operations
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md",
        reject: "bg-red-600 text-white hover:bg-red-700 shadow-md",
        delete: "bg-red-700 text-white hover:bg-red-800 shadow-md",
        
        // Warning/caution actions
        warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-md",
        pending: "bg-amber-500 hover:bg-amber-600 text-white shadow-md",
        
        // Information actions
        info: "bg-blue-500 hover:bg-blue-600 text-white shadow-md",
        
        // Subtle actions
        ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
        
        // Link style
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
        
        // Legacy variants for compatibility
        gradient: "bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200",
        "light-primary": "bg-[#1CB255] text-white hover:bg-[#18a64d] shadow-md hover:shadow-lg rounded-lg",
        "light-outline": "border border-[#1CB255] text-[#1CB255] bg-white hover:bg-[#eafaf1] rounded-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
