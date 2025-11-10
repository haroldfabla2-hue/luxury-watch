// Simplified UI Components
import * as React from "react"
import { cn } from "@/lib/utils"

// Label Component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
)
Label.displayName = "Label"

// Textarea Component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// Switch Component
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div className={cn("relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer", className)}>
          <div className="absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-full peer-checked:border-white"></div>
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

// Progress Component
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

// Dialog Components
interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  )
}

export const DialogTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ asChild, children }) => {
  return <>{children}</>
}

export const DialogContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return <div className={cn("p-6", className)}>{children}</div>
}

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="mb-4">{children}</div>
}

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

// Select Components
interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  return <div>{children}</div>
}

export const SelectTrigger: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return <div className={cn("border rounded px-3 py-2", className)}>{children}</div>
}

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span className="text-muted-foreground">{placeholder}</span>
}

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="border rounded mt-1 bg-white shadow">{children}</div>
}

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  return <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{children}</div>
}

// Tabs Components
interface TabsProps {
  defaultValue?: string
  className?: string
  children: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, className, children }) => {
  return <div className={className}>{children}</div>
}

export const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return <div className={cn("flex space-x-1", className)}>{children}</div>
}

export const TabsTrigger: React.FC<{ value: string; className?: string; children: React.ReactNode }> = ({ value, className, children }) => {
  return (
    <button className={cn("px-4 py-2 text-sm font-medium rounded", className)}>
      {children}
    </button>
  )
}

export const TabsContent: React.FC<{ value: string; className?: string; children: React.ReactNode }> = ({ value, className, children }) => {
  return <div className={cn("mt-4", className)}>{children}</div>
}

// Dropdown Menu
interface DropdownMenuProps {
  children: React.ReactNode
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>
}

export const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ asChild, children }) => {
  return <>{children}</>
}

export const DropdownMenuContent: React.FC<{ align?: string; children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border">
      {children}
    </div>
  )
}

export const DropdownMenuItem: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return (
    <div className={cn("px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer", className)}>
      {children}
    </div>
  )
}

// Scroll Area
interface ScrollAreaProps {
  className?: string
  children: React.ReactNode
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ className, children }) => {
  return <div className={cn("overflow-auto", className)}>{children}</div>
}
