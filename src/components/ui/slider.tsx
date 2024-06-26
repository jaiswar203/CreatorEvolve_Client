"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  defaultValue: number[]
  showTooltip?: boolean
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, defaultValue, showTooltip = false, onValueChange, ...props }, ref) => {
  const [value, setValue] = React.useState(defaultValue)
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false)

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  const handleMouseEnter = () => {
    if (showTooltip) {
      setIsTooltipVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
      value={value}
      onValueChange={handleValueChange}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
        {isTooltipVisible && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded">
            {value[0]}
          </div>
        )}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
