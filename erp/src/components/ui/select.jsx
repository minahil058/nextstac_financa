import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectContext = createContext(null);

const Select = ({ children, onValueChange, defaultValue, value }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(value || defaultValue);

    const handleSelect = (val) => {
        setSelected(val);
        if (onValueChange) onValueChange(val);
        setOpen(false);
    };

    return (
        <SelectContext.Provider value={{ open, setOpen, selected, handleSelect }}>
            <div className="relative font-sans text-sm">{children}</div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = ({ className, children, ...props }) => {
    const { open, setOpen } = useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
};

const SelectValue = ({ placeholder }) => {
    const { selected } = useContext(SelectContext);
    return <span>{selected || placeholder}</span>;
};

const SelectContent = ({ className, children, position = "popper", ...props }) => {
    const { open, setOpen } = useContext(SelectContext);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setOpen]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                "top-[calc(100%+4px)] left-0 w-full",
                className
            )}
            {...props}
        >
            <div className="p-1">{children}</div>
        </div>
    );
};

const SelectItem = ({ className, children, value, ...props }) => {
    const { selected, handleSelect } = useContext(SelectContext);
    const isSelected = selected === value;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                handleSelect(value);
            }}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                isSelected && "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white",
                className
            )}
            {...props}
        >
            <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
