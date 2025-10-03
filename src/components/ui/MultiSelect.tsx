import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Option = Record<"value" | "label", string>;

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Selecione...", className }: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    setInputValue("");
    onChange([...selected, value]);
  };

  return (
    <Command onKeyDown={(e) => { if (e.key === "Escape") inputRef.current?.blur(); }} className={className}>
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => {
            const label = options.find(opt => opt.value === value)?.label;
            return (
              <Badge key={value} variant="secondary">
                {label}
                <button className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2" onKeyDown={(e) => { if (e.key === "Enter") handleUnselect(value); }} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={() => handleUnselect(value)}>
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input ref={inputRef} value={inputValue} onValueChange={setInputValue} onBlur={() => setOpen(false)} onFocus={() => setOpen(true)} placeholder={placeholder} className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="relative mt-2">
        {open && options.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup>
                {options.filter(opt => !selected.includes(opt.value)).map((option) => (
                  <CommandItem key={option.value} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onSelect={() => handleSelect(option.value)} className={"cursor-pointer"}>
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  );
}