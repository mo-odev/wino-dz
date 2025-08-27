import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { algeriaWilayas } from "@/data/algeria-data";

interface WilayaSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onCommuneChange?: (commune: string) => void;
  placeholder?: string;
  className?: string;
}

const WilayaSelect = ({ 
  value, 
  onValueChange, 
  onCommuneChange, 
  placeholder = "اختر الولاية...",
  className 
}: WilayaSelectProps) => {
  const [open, setOpen] = useState(false);
  const [communeOpen, setCommuneOpen] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState("");

  const selectedWilaya = algeriaWilayas.find(wilaya => wilaya.name === value);

  const handleWilayaSelect = (wilayaName: string) => {
    onValueChange(wilayaName);
    setSelectedCommune("");
    onCommuneChange?.("");
    setOpen(false);
  };

  const handleCommuneSelect = (commune: string) => {
    setSelectedCommune(commune);
    onCommuneChange?.(commune);
    setCommuneOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-right"
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="ابحث عن الولاية..." className="text-right" />
            <CommandEmpty>لا توجد ولاية بهذا الاسم.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {algeriaWilayas.map((wilaya) => (
                <CommandItem
                  key={wilaya.code}
                  value={wilaya.name}
                  onSelect={() => handleWilayaSelect(wilaya.name)}
                  className="flex items-center justify-between text-right"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === wilaya.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {wilaya.name}
                  </div>
                  <span className="text-xs text-muted-foreground">{wilaya.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedWilaya && selectedWilaya.communes && (
        <Popover open={communeOpen} onOpenChange={setCommuneOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={communeOpen}
              className="w-full justify-between text-right"
            >
              {selectedCommune || "اختر البلدية..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="ابحث عن البلدية..." className="text-right" />
              <CommandEmpty>لا توجد بلدية بهذا الاسم.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {selectedWilaya.communes.map((commune) => (
                  <CommandItem
                    key={commune}
                    value={commune}
                    onSelect={() => handleCommuneSelect(commune)}
                    className="text-right"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCommune === commune ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {commune}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default WilayaSelect;