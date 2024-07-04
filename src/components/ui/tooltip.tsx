import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { TooltipTriggerContext } from "./tooltip-trigger-context";
import { isMobile } from "react-device-detect";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) => {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      delayDuration={isMobile ? 0 : props.delayDuration}
    >
      <TooltipTriggerContext.Provider value={{ open, setOpen }}>
        {children}
      </TooltipTriggerContext.Provider>
    </TooltipPrimitive.Root>
  );
};

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ children, ...props }, ref) => {
  const { setOpen } = React.useContext(TooltipTriggerContext);

  const handleClick = () => {
    if (isMobile) {
      setOpen((prevOpen) => !prevOpen);
    }
  };

  return (
    <TooltipPrimitive.Trigger ref={ref} onClick={handleClick} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
});

TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
