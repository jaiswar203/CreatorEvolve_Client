// tooltip-trigger-context.tsx
"use client";

import { createContext, useState, Dispatch, SetStateAction } from "react";

type TooltipTriggerContextType = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export const TooltipTriggerContext = createContext<TooltipTriggerContextType>({
    open: false,
    setOpen: () => { }, // eslint-disable-line @typescript-eslint/no-empty-function
});
