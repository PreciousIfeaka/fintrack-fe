import * as React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

export function MonthPicker({ value, onChange, className, id }: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (/^\d{4}-\d{2}$/.test(val)) {
      onChange(val)
    }
  }

  const currentYear = new Date().getFullYear();
  const initialYear = value ? parseInt(value.split('-')[0]) : currentYear;
  const [year, setYear] = React.useState(isNaN(initialYear) ? currentYear : initialYear)
  
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  const selectMonth = (idx: number) => {
    const m = String(idx + 1).padStart(2, '0')
    const newVal = `${year}-${m}`
    onChange(newVal)
    setInputValue(newVal)
    setOpen(false)
  }

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Input 
        id={id}
        type="text" 
        value={inputValue} 
        onChange={handleInputChange} 
        placeholder="YYYY-MM" 
        className="flex-1"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm">{year}</span>
            <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, i) => {
              const monthStr = String(i + 1).padStart(2, '0');
              const isSelected = value === `${year}-${monthStr}`;
              return (
                <Button 
                  key={m} 
                  variant={isSelected ? "default" : "outline"} 
                  size="sm"
                  onClick={() => selectMonth(i)}
                  className={isSelected ? "bg-primary text-primary-foreground" : ""}
                >
                  {m}
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
